# /// script
# dependencies = [
#   "evdev",
# ]
# ///

from evdev import InputDevice, UInput

# 1. Replace with your actual device path (check /dev/input/by-id/)
physical_wheel = InputDevice('/dev/input/event13')

# 2. Create virtual device with identical capabilities
# We include 'events' to ensure FFB and specialized keys are copied
virtual_wheel = UInput.from_device(physical_wheel, name='Virtual PXN-V99')

print(f'Bridge active: {physical_wheel.name} -> {virtual_wheel.name}')
print("Check 'evtest' or launch Assetto Corsa. Ctrl+C to stop.")

try:
    physical_wheel.grab()  # Take exclusive control
    for event in physical_wheel.read_loop():
        virtual_wheel.write_event(event)
finally:
    physical_wheel.ungrab()
    virtual_wheel.close()
