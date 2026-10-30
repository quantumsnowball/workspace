# /// script
# dependencies = ["evdev"]
# ///

import asyncio
import signal
import sys

from evdev import InputDevice, UInput, list_devices
from evdev import ecodes as e

# target virtual device created by kanata
TARGET_DEVICE_NAME = 'Pure: kanata'

# physical key to target output key map
KEY_MAP = {
    e.KEY_APOSTROPHE: e.KEY_F,  # ' -> f
    e.KEY_SLASH: e.KEY_J,       # / -> j
}


def find_kanata_device():
    for path in list_devices():
        try:
            dev = InputDevice(path)
            if dev.name == TARGET_DEVICE_NAME:
                return dev
        except (PermissionError, OSError):
            continue
    return None


async def remap_loop(dev, ui):
    loop = asyncio.get_running_loop()

    # grab exclusive access to intercept kanata output
    dev.grab()
    print(f"intercepting '{dev.name}' for taiko remapping...", file=sys.stderr)

    def on_read():
        for event in dev.read():
            if event.type == e.EV_KEY:
                # remap target key or pass through untouched
                out_code = KEY_MAP.get(event.code, event.code)
                ui.write(e.EV_KEY, out_code, event.value)
                ui.write(e.EV_SYN, e.SYN_REPORT, 0)
            elif event.type == e.EV_MSC:
                # pass scan codes along
                ui.write(e.EV_MSC, event.code, event.value)

    loop.add_reader(dev.fd, on_read)

    # suspend task until process termination signal
    stop_event = asyncio.Event()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, stop_event.set)
    await stop_event.wait()

    # cleanup device state on exit
    loop.remove_reader(dev.fd)
    try:
        dev.ungrab()
    except OSError:
        pass
    ui.close()
    print('remapper process terminated, device ungrabbed', file=sys.stderr)


def main():
    dev = find_kanata_device()
    if not dev:
        print(f"error: device '{TARGET_DEVICE_NAME}' not found", file=sys.stderr)
        sys.exit(1)

    # create temporary uinput device for game
    ui = UInput.from_device(dev, name='taiko-no-tatsujin remapper')
    try:
        asyncio.run(remap_loop(dev, ui))
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    main()
