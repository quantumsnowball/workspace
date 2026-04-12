# /// script
# dependencies = [
#   "typer",
#   "evdev",
# ]
# ///

import logging
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

logger = logging.getLogger('SmoothMouse')


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
            REL_WHEEL: deque[int](),
            REL_WHEEL_HI_RES: deque[int](),
        }
        self._last_timestamp = {
            REL_WHEEL: 0.0,
            REL_WHEEL_HI_RES: 0.0
        }
        self._min_history_len = min_history_len
        self._max_event_interval = max_event_interval

    def _fire(self, code: int) -> None:
        # pop value
        history = self._history[code]
        value = history.popleft()
        # write to dst dev
        self._dst_dev.write(EV_REL, code, value)
        self._dst_dev.syn()
        # debug
        logger.debug(f"{'     |---->' if value > 0 else '<----|     '}")

    def append(self, e: InputEvent) -> None:
        # choose your history
        history = self._history[e.code]
        # reject too frequent event as noise
        interval = e.timestamp() - self._last_timestamp[e.code]
        self._last_timestamp[e.code] = e.timestamp()
        if interval < self._max_event_interval:
            logger.debug('     X     ')
            return
        # follow vote if already have enough history
        if len(history) > self._min_history_len:
            # modify the value of the event
            e.value = statistics.mode(history)
        # append the event to history
        history.append(e.value)
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
        self._src_dev = evdev.InputDevice(f'/dev/input/event{id}')
        self._src_dev_events: Iterator[InputEvent] = self._src_dev.read_loop()
        self._dst_dev = UInput.from_device(self._src_dev, name='Smooth Wheel Mouse')
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
    id: Annotated[int, Argument(help='The event ID from evtest, e.g., /dev/input/event3 → id=3')],
    delay: Annotated[float, Option(help='Delay (seconds) before re-firing events')] = 0.075,
    min_history_len: Annotated[int, Option(help='Minimum event count required in history to compute majority vote')] = 2,
    max_event_interval: Annotated[float, Option(help='Time interval (seconds) of events to be dropped (temporal debounce)')] = 0.01,
    debug: Annotated[bool, Option(help='Enable debug mode verbose output')] = False,
):
    '''
    Anti-flicker mouse wheel filter for Linux.
    '''
    # logger
    logging.basicConfig(
        level=logging.DEBUG if debug else logging.INFO,
        format='%(levelname)s: %(message)s'
    )

    # app
    mouse = SmoothMouse(
        id=id,
        delay=delay,
        min_history_len=min_history_len,
        max_event_interval=max_event_interval,
    )

    # run
    logger.info(f'Starting SmoothMouse on event{id}...')
    try:
        mouse.run()
    except KeyboardInterrupt:
        logger.info('\nSmoothMouse Stopped by user.')


if __name__ == '__main__':
    # find you device using 'evtest'
    # "/dev/input/event5"  # gamepad
    # "/dev/input/event16" # mouse
    typer.run(main)
