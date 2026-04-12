# /// script
# dependencies = [
#   "evdev",
# ]
# ///

import threading
from collections import deque
from typing import cast

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
        self._history = deque[InputEvent]()

    def _fire(self) -> None:
        e = self._history.popleft()
        self._dst_dev.write(e.type, e.code, e.value)
        self._dst_dev.syn()
        print(f"{e.type=}, {e.code=}, {e.value=}")

    def append(self, e: InputEvent) -> None:
        self._history.append(e)
        t = threading.Timer(self._delay, self._fire)
        t.start()


class SmoothMouse:
    def __init__(self) -> None:
        self._src_dev = evdev.InputDevice(MOUSE_PATH)
        self._dst_dev = UInput.from_device(self._src_dev, name="Smooth Wheel Mouse")
        self._wheel_buffer = WheelBuffer(self._dst_dev, delay=1.0)

    def run(self) -> None:
        self._src_dev.grab()
        for e in self._src_dev.read_loop():
            e = cast(InputEvent, e)
            # print(f"{e.type=}, {e.code=}, {e.value=}")

            # delay firing the wheel scrolling event by 1 secs
            if e.type == EV_REL and (e.code == REL_WHEEL or e.code == REL_WHEEL_HI_RES):
                self._wheel_buffer.append(e)
                continue

            # passthrough all other irrelevant events
            self._dst_dev.write(e.type, e.code, e.value)
            self._dst_dev.syn()


if __name__ == "__main__":
    mouse = SmoothMouse()
    mouse.run()
