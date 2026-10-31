import os
import sys
from threading import Thread

from evdev import InputDevice, UInput, list_devices
from evdev import ecodes as e

from main.types import KeyMap, KeyMapper


def _worker(
    source: str,
    target: str,
    key_map: KeyMap,
) -> None:
    # find source device
    def find_source_device(source: str) -> InputDevice | None:
        for path in list_devices():
            try:
                dev = InputDevice(path)
                if dev.name == source:
                    return dev
            except (PermissionError, OSError):
                continue
        return None
    if not (source_dev := find_source_device(source)):
        print(f"error: device '{source}' not found", file=sys.stderr)
        sys.exit(1)

    # create target device
    target_dev = UInput.from_device(source_dev, name=target)

    # grab the source device
    source_dev.grab()
    print(f"[ grabbed ] '{source_dev.name}' for taiko remapping", file=sys.stderr)

    # rewrite source device key events to target device if it is defined in key_map
    try:
        for event in source_dev.read_loop():
            if event.type == e.EV_KEY:
                out_code = key_map.get(event.code, event.code)
                target_dev.write(e.EV_KEY, out_code, event.value)
                target_dev.write(e.EV_SYN, e.SYN_REPORT, 0)
            elif event.type == e.EV_MSC:
                target_dev.write(e.EV_MSC, event.code, event.value)
    finally:
        try:
            source_dev.ungrab()
            print(f"[ ungrabbed ] '{source_dev.name}' for taiko remapping", file=sys.stderr)
        except OSError:
            pass
        target_dev.close()
        print('remapper process terminated, device ungrabbed', file=sys.stderr)


def remap(key_mapper: KeyMapper) -> None:
    source = key_mapper['source']
    key_map = key_mapper['key_map']
    app_id = os.environ.get('SteamAppId', 'default')
    target = key_mapper.get('target', f'steam-preset-{app_id}')
    Thread(target=_worker, args=(source, target, key_map), daemon=True).start()
