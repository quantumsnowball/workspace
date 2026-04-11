# /// script
# dependencies = [
#   "evdev",
# ]
# ///

import evdev
from evdev import ecodes

# find you device using 'evtest'
MOUSE_PATH = "/dev/input/event16"


def test_mouse_flow():
    try:
        # Create the device object
        device = evdev.InputDevice(MOUSE_PATH)
        print(f"Successfully connected to: {device.name}")
        print("Listening for events (Ctrl+C to stop)...")
        print("-" * 50)

        # We do NOT use device.grab() here so your mouse still works
        # normally while we watch the output.

        for event in device.read_loop():
            # Filter for specific events to avoid spamming the console
            # EV_REL = Relative movement (Mouse move, Scroll)
            # EV_KEY = Buttons
            if event.type == ecodes.EV_REL:
                if event.code == ecodes.REL_WHEEL:
                    print(f"[SCROLL] Value: {event.value}")
                elif event.code == ecodes.REL_HWHEEL:
                    print(f"[HORIZ-SCROLL] Value: {event.value}")
                # Uncomment the line below if you want to see raw X/Y movement
                # else: print(f"[MOVE] Code: {event.code} Value: {event.value}")

            elif event.type == ecodes.EV_KEY:
                state = "PRESSED" if event.value == 1 else "RELEASED"
                print(f"[BUTTON] Code: {event.code} State: {state}")

    except PermissionError:
        print("Error: Permission denied. Try running with 'sudo' or check your user groups.")
    except FileNotFoundError:
        print(f"Error: Device {MOUSE_PATH} not found.")
    except KeyboardInterrupt:
        print("\nTest stopped.")


if __name__ == "__main__":
    test_mouse_flow()
