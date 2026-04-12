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
    def __init__(self, dst_dev: InputDevice, *, delay: float) -> None:
        self._dst_dev = dst_dev
        self._delay = delay
        self._history = {
            REL_WHEEL: deque[int](),
            REL_WHEEL_HI_RES: deque[int](),
        }

    def _fire(self, code: int) -> None:
        history = self._history[code]
        # convert myself to majority vote here
        mode_val = statistics.mode(history)
        org_val = history.popleft()
        # pick the desired value
        val = mode_val
        if mode_val != org_val:
            print(f"{mode_val=}, {org_val=}")
        # write to dst dev
        self._dst_dev.write(EV_REL, code, val)
        self._dst_dev.syn()
        # print(f"{len(self._history[code])=}, {EV_REL=}, {code=}, {val=}")

    def append(self, e: InputEvent) -> None:
        self._history[e.code].append(e.value)
        t = threading.Timer(self._delay, self._fire, (e.code, ))
        t.start()


class SmoothMouse:
    def __init__(self) -> None:
        self._src_dev = evdev.InputDevice(MOUSE_PATH)
        self._src_dev_events: Iterator[InputEvent] = self._src_dev.read_loop()
        self._dst_dev = UInput.from_device(self._src_dev, name="Smooth Wheel Mouse")
        self._wheel_buffer = WheelBuffer(self._dst_dev, delay=0.1)

    def run(self) -> None:
        # intercept all src events
        self._src_dev.grab()
        # then process all src events
        for e in self._src_dev_events:
            # print(f"{e.type=}, {e.code=}, {e.value=}")
            # filter out wheel scroll relevant events
            if e.type == EV_REL and (e.code == REL_WHEEL or e.code == REL_WHEEL_HI_RES):
                self._wheel_buffer.append(e)
                continue

            # passthrough all other irrelevant events
            self._dst_dev.write(e.type, e.code, e.value)
            self._dst_dev.syn()


if __name__ == "__main__":
    mouse = SmoothMouse()
    mouse.run()
