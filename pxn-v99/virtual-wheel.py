# /// script
# dependencies = [
#   "evdev",
# ]
# ///

from evdev import InputDevice, UInput, ecodes

# Use your actual path
phys_wheel = InputDevice('/dev/input/event13')

# Create a virtual KEYBOARD instead of a virtual wheel
# This avoids FFB conflicts entirely.
v_kb = UInput(name='Virtual PXN-V99 Keyboard')

print('Hybrid mode: Physical wheel handles FFB, script handles buttons.')

# DO NOT use phys_wheel.grab() here.
# This lets AC see the wheel for FFB while we 'eavesdrop' on buttons.
for event in phys_wheel.read_loop():
    if event.type == ecodes.EV_KEY:
        # map A to Enter
        if event.code == 288:
            v_kb.write(ecodes.EV_KEY, ecodes.KEY_ENTER, event.value)
            v_kb.syn()
        # map B to Esc
        elif event.code == 289:
            v_kb.write(ecodes.EV_KEY, ecodes.KEY_ESC, event.value)
            v_kb.syn()
