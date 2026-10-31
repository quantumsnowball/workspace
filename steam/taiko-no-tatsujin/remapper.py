# /// script
# dependencies = ["evdev"]
# ///

import asyncio
import signal
import sys

from evdev import InputDevice, UInput, list_devices
from evdev import ecodes as e

target_device_name = 'Pure: kanata'

key_map = {
    # left
    e.KEY_X: e.KEY_Z,

    # right
    e.KEY_APOSTROPHE: e.KEY_K,
    e.KEY_DOT: e.KEY_J,
    e.KEY_SLASH: e.KEY_J,
}


def find_kanata_device() -> InputDevice | None:
    for path in list_devices():
        try:
            dev = InputDevice(path)
            if dev.name == target_device_name:
                return dev
        except (PermissionError, OSError):
            continue
    return None


def process_events(dev: InputDevice, ui: UInput, stop_event: asyncio.Event) -> None:
    dev.grab()
    print(f"[ grabbed ] '{dev.name}' for taiko remapping", file=sys.stderr)
    try:
        for event in dev.read_loop():
            if stop_event.is_set():
                break
            if event.type == e.EV_KEY:
                out_code = key_map.get(event.code, event.code)
                ui.write(e.EV_KEY, out_code, event.value)
                ui.write(e.EV_SYN, e.SYN_REPORT, 0)
            elif event.type == e.EV_MSC:
                ui.write(e.EV_MSC, event.code, event.value)
    finally:
        try:
            dev.ungrab()
            print(f"[ ungrabbed ] '{dev.name}' for taiko remapping", file=sys.stderr)
        except OSError:
            pass
        ui.close()
        print('remapper process terminated, device ungrabbed', file=sys.stderr)


async def main() -> None:
    dev = find_kanata_device()
    if not dev:
        print(f"error: device '{target_device_name}' not found", file=sys.stderr)
        sys.exit(1)

    ui = UInput.from_device(dev, name='taiko-no-tatsujin remapper')
    stop_event = asyncio.Event()

    def cleanup_and_exit(*_) -> None:
        stop_event.set()
        try:
            dev.ungrab()
            print(f"[ ungrabbed ] '{dev.name}' for taiko remapping", file=sys.stderr)
        except OSError:
            pass
        ui.close()
        print('remapper process terminated, device ungrabbed', file=sys.stderr)
        sys.exit(0)

    # register signal handlers in the main thread
    signal.signal(signal.SIGINT, cleanup_and_exit)
    signal.signal(signal.SIGTERM, cleanup_and_exit)

    try:
        await asyncio.to_thread(process_events, dev, ui, stop_event)
    except (KeyboardInterrupt, SystemExit):
        stop_event.set()


if __name__ == '__main__':
    asyncio.run(main())
