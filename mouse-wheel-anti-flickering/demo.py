# /// script
# dependencies = [
#   "evdev",
# ]
# ///

import evdev
from evdev import UInput

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

    for e in real_mouse.read_loop():
        # debug print
        print(f"{e.type=}, {e.code=}, {e.value=}")

        # passthrough all other irrelevant events
        fake_mouse.write(e.type, e.code, e.value)
        fake_mouse.syn()


if __name__ == "__main__":
    just_grab()
