# /// script
# dependencies = [
#   "evdev",
# ]
# ///

import statistics
import threading
from collections import deque
from typing import Iterator, cast

import evdev
from evdev import InputDevice, UInput
from evdev.ecodes import EV_REL, REL_WHEEL, REL_WHEEL_HI_RES
from evdev.events import InputEvent

# find you device using 'evtest'
MOUSE_PATH = "/dev/input/event5"  # gamepad
# MOUSE_PATH = "/dev/input/event16" # mouse


class WheelBuffer:
    def __init__(
        self,
        dst_dev: InputDevice,
        *,
        delay: float,
        min_history_len: int,
    ) -> None:
        self._dst_dev = dst_dev
        self._delay = delay
        self._history = {
            REL_WHEEL: deque[int](),
            REL_WHEEL_HI_RES: deque[int](),
        }
        self._min_history_len = min_history_len

    def _fire(self, code: int) -> None:
        # pop value
        history = self._history[code]
        val = history.popleft()
        # write to dst dev
        self._dst_dev.write(EV_REL, code, val)
        self._dst_dev.syn()
        # debug
        print(f"dst_dev: {' |-' if val > 0 else '-| '}")

    def append(self, e: InputEvent) -> None:
        # choose your buffer
        history = self._history[e.code]
        # follow vote if already have enough history
        val = statistics.mode(history) if len(history) > self._min_history_len else e.value
        self._history[e.code].append(val)
        # timer schedule the event
        t = threading.Timer(self._delay, self._fire, (e.code, ))
        t.start()


class SmoothMouse:
    def __init__(
        self,
        *,
        delay: float = 0.1,
        min_history_len: int = 2,
    ) -> None:
        self._src_dev = evdev.InputDevice(MOUSE_PATH)
        self._src_dev_events: Iterator[InputEvent] = self._src_dev.read_loop()
        self._dst_dev = UInput.from_device(self._src_dev, name="Smooth Wheel Mouse")
        self._wheel_buffer = WheelBuffer(self._dst_dev, delay=delay, min_history_len=min_history_len)

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


if __name__ == "__main__":
    mouse = SmoothMouse()
    mouse.run()
