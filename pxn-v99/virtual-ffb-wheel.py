# /// script
# dependencies = [
#   "evdev",
# ]
# ///

from evdev import InputDevice, UInput
from evdev.ecodes import EV_FF, EV_UINPUT, UI_FF_ERASE, UI_FF_UPLOAD

# 1. Replace with your actual device path (check /dev/input/by-id/)
physical_wheel = InputDevice('/dev/input/event31')

# 2. Create virtual device with identical capabilities
# We include 'events' to ensure FFB and specialized keys are copied
virtual_wheel = UInput.from_device(physical_wheel, name='Virtual PXN-V99')

print(f'Bridge active: {physical_wheel.name} -> {virtual_wheel.name}')
print("Check 'evtest' or launch Assetto Corsa. Ctrl+C to stop.")


effects = set()

try:
    physical_wheel.grab()  # Take exclusive control
    for event in physical_wheel.read_loop():
        # Handle ffb effect uploads
        # Handle the special uinput events
        if event.type == EV_UINPUT:

            if event.code == UI_FF_UPLOAD:
                upload = virtual_wheel.begin_upload(event.value)

                # Checks if this is a new effect
                if upload.effect.id not in effects:
                    effects.add(upload.effect.id)
                    # Setting id to 1 indicates that a new effect must be allocated
                    upload.effect.id = -1

                physical_wheel.upload_effect(upload.effect)
                upload.retval = 0
                virtual_wheel.end_upload(upload)

            elif event.code == UI_FF_ERASE:
                erase = virtual_wheel.begin_erase(event.value)
                erase.retval = 0
                physical_wheel.erase_effect(erase.effect_id)
                effects.remove(erase.effect_id)
                virtual_wheel.end_erase(erase)

        # Forward writes to actual rumble device.
        elif event.type == EV_FF:
            physical_wheel.write(event.type, event.code, event.value)

        # default pass through all other events
        virtual_wheel.write_event(event)
finally:
    physical_wheel.ungrab()
    virtual_wheel.close()
