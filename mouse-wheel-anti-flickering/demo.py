# /// script
# dependencies = [
#   "typer",
#   "evdev",
# ]
# ///

import statistics
import threading
from collections import deque
from typing import Annotated, Iterator

import evdev
import typer
from evdev import InputDevice, UInput
from evdev.ecodes import EV_REL, REL_WHEEL, REL_WHEEL_HI_RES
from evdev.events import InputEvent
from typer import Argument, Option


class WheelBuffer:
    def __init__(
        self,
        dst_dev: InputDevice,
        *,
        delay: float,
        min_history_len: int,
        max_event_interval: float,
    ) -> None:
        self._dst_dev = dst_dev
        self._delay = delay
        self._history = {
            REL_WHEEL: deque[InputEvent](),
            REL_WHEEL_HI_RES: deque[InputEvent](),
        }
        self._min_history_len = min_history_len
        self._max_event_interval = max_event_interval

    def _fire(self, code: int) -> None:
        # pop value
        history = self._history[code]
        e = history.popleft()
        # write to dst dev
        self._dst_dev.write(EV_REL, code, e.value)
        self._dst_dev.syn()
        # debug
        typer.echo(f"dst_dev: {' |-' if e.value > 0 else '-| '}")

    def append(self, e: InputEvent) -> None:
        # choose your buffer
        history = self._history[e.code]
        # reject too frequent event as noise
        if len(history) > 0:
            prev_e = history[-1]
            if e.timestamp() - prev_e.timestamp() < self._max_event_interval:
                typer.echo("dropped: frequent noise signal")
                return
        # follow vote if already have enough history
        if len(history) > self._min_history_len:
            # modify the value of the event
            history_value = [e.value for e in history]
            e.value = statistics.mode(history_value)
        # append the event to history
        history.append(e)
        # timer schedule the event
        t = threading.Timer(self._delay, self._fire, (e.code, ))
        t.start()


class SmoothMouse:
    def __init__(
        self,
        id: int,
        *,
        delay: float,
        min_history_len: int,
        max_event_interval: float,
    ) -> None:
        self._src_dev = evdev.InputDevice(f"/dev/input/event{id}")
        self._src_dev_events: Iterator[InputEvent] = self._src_dev.read_loop()
        self._dst_dev = UInput.from_device(self._src_dev, name="Smooth Wheel Mouse")
        self._wheel_buffer = WheelBuffer(
            self._dst_dev,
            delay=delay,
            min_history_len=min_history_len,
            max_event_interval=max_event_interval,
        )

    def run(self) -> None:
        # intercept all src events
        self._src_dev.grab()
        # then process all src events
        for e in self._src_dev_events:
            # filter out wheel scroll relevant events
            if e.type == EV_REL and (e.code == REL_WHEEL or e.code == REL_WHEEL_HI_RES):
                self._wheel_buffer.append(e)
                # debug
                # print(f"src_dev: {' |-' if e.value > 0 else '-| '}")
                continue

            # passthrough all other irrelevant events
            self._dst_dev.write(e.type, e.code, e.value)
            self._dst_dev.syn()


def main(
    id: Annotated[int, Argument(help="The event ID from evtest, e.g., /dev/input/event3 → id=3")],
    delay: Annotated[float, Option(help="Delay (seconds) before re-firing events")] = 0.1,
    min_history_len: Annotated[int, Option(help="Minimum event count required in history to compute majority vote")] = 2,
    max_event_interval: Annotated[float, Option(help="Time interval (seconds) of events to be dropped (temporal debounce)")] = 0.025,
):
    """
    Anti-flicker mouse wheel filter for Linux.
    """
    mouse = SmoothMouse(
        id=id,
        delay=delay,
        min_history_len=min_history_len,
        max_event_interval=max_event_interval,
    )

    typer.echo(f"Starting SmoothMouse on event{id}...")
    try:
        mouse.run()
    except KeyboardInterrupt:
        typer.echo("\nStopped by user.")


if __name__ == "__main__":
    # find you device using 'evtest'
    # "/dev/input/event5"  # gamepad
    # "/dev/input/event16" # mouse
    typer.run(main)
