import hashlib
import shutil
import time
from pathlib import Path

from watchdog.events import (
    FileModifiedEvent,
    FileMovedEvent,
    FileSystemEvent,
    FileSystemEventHandler,
)
from watchdog.observers import Observer

FILE_PATHS = {
    Path('file1.txt'),
    Path('file2.txt'),
    Path('file3.txt'),
}


class MyEventHandler(FileSystemEventHandler):
    def __init__(self) -> None:
        self._cooldown = set[Path]()

    def on_any_event(self, event: FileSystemEvent) -> None:
        # check the path of the event
        src_path = Path(str(event.src_path))
        dest_path = Path(str(event.dest_path))

        # only interested when file is modified or moved to
        if (is_modified := isinstance(event, FileModifiedEvent)) or isinstance(event, FileMovedEvent):
            # look at the related path
            active_path = src_path if is_modified else dest_path
            # check if the file is in defined list
            if active_path not in FILE_PATHS:
                return
            # ignore if it is derived action
            if active_path in self._cooldown:
                self._cooldown.remove(active_path)
                return
            # confirm is first hand action
            # calc other paths to copy to
            passive_paths = FILE_PATHS - {active_path}
            # for each other paths, put it on cooldown list, then copy source to destinatino
            active_digest = hashlib.md5(active_path.read_bytes()).hexdigest()
            for passive_path in passive_paths:
                passive_digest = hashlib.md5(passive_path.read_bytes()).hexdigest()
                if active_digest != passive_digest:
                    self._cooldown.add(passive_path)
                    shutil.copy2(active_path, passive_path)
                    print(f'{active_path} copied to {passive_path}')
                else:
                    print(f'{active_path=} same as {passive_path=}, skip')


event_handler = MyEventHandler()
observer = Observer()
observer.schedule(event_handler, '.', recursive=False)
observer.start()
try:
    while True:
        time.sleep(1)
finally:
    observer.stop()
    observer.join()
