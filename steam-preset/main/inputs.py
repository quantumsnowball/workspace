import asyncio
import os
import signal
import sys

from evdev import InputDevice, UInput, list_devices
from evdev import ecodes as e

from main.types import KeyMap, KeyMapper


def find_kanata_device(source: str) -> InputDevice | None:
    for path in list_devices():
        try:
            dev = InputDevice(path)
            if dev.name == source:
                return dev
        except (PermissionError, OSError):
            continue
    return None


def process_events(
    source_dev: InputDevice,
    target_dev: UInput,
    key_map: KeyMap,
    stop_event: asyncio.Event,
) -> None:
    source_dev.grab()
    print(f"[ grabbed ] '{source_dev.name}' for taiko remapping", file=sys.stderr)
    try:
        for event in source_dev.read_loop():
            if stop_event.is_set():
                break
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


async def worker(
    source: str,
    target: str,
    key_map: KeyMap,
) -> None:
    source_dev = find_kanata_device(source)
    if not source_dev:
        print(f"error: device '{source}' not found", file=sys.stderr)
        sys.exit(1)

    target_dev = UInput.from_device(source_dev, name=target)
    stop_event = asyncio.Event()

    def cleanup_and_exit(*_) -> None:
        stop_event.set()
        try:
            source_dev.ungrab()
            print(f"[ ungrabbed ] '{source_dev.name}' for taiko remapping", file=sys.stderr)
        except OSError:
            pass
        target_dev.close()
        print('remapper process terminated, device ungrabbed', file=sys.stderr)
        sys.exit(0)

    # register signal handlers in the main thread
    signal.signal(signal.SIGINT, cleanup_and_exit)
    signal.signal(signal.SIGTERM, cleanup_and_exit)

    try:
        await asyncio.to_thread(process_events, source_dev, target_dev, key_map, stop_event)
    except (KeyboardInterrupt, SystemExit):
        stop_event.set()


def remap(key_mapper: KeyMapper) -> None:
    source = key_mapper['source']
    key_map = key_mapper['key_map']
    app_id = os.environ.get('SteamAppId', 'default')
    target = key_mapper.get('target', f'steam-preset-{app_id}')
    asyncio.run(worker(source, target, key_map))
