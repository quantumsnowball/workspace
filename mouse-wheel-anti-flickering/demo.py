# /// script
# dependencies = [
#   "evdev",
# ]
# ///

import threading

import evdev
from evdev import UInput
from evdev.ecodes import EV_REL, REL_WHEEL, REL_WHEEL_HI_RES

# find you device using 'evtest'
MOUSE_PATH = "/dev/input/event5"  # gamepad
# MOUSE_PATH = "/dev/input/event16" # mouse


def just_grab():
    real_mouse = evdev.InputDevice(MOUSE_PATH)
    real_mouse.grab()
    fake_mouse = UInput.from_device(
        real_mouse,
        name="Smooth Wheel Mouse"
    )

    def delay_event(e):
        def worker(e):
            fake_mouse.write(e.type, e.code, e.value)
            fake_mouse.syn()
            print(f"{e.type=}, {e.code=}, {e.value=}")
        t = threading.Timer(1.0, worker, args=(e, ))
        t.start()

    for e in real_mouse.read_loop():
        # debug print
        # print(f"{e.type=}, {e.code=}, {e.value=}")

        # delay firing the wheel scrolling event by 1 secs
        if e.type == EV_REL and (e.code == REL_WHEEL or e.code == REL_WHEEL_HI_RES):
            delay_event(e)
            continue

        # passthrough all other irrelevant events
        fake_mouse.write(e.type, e.code, e.value)
        fake_mouse.syn()


if __name__ == "__main__":
    just_grab()
