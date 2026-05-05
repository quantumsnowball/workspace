# /// script
# dependencies = [
#   "watchdog"
# ]
# ///

import hashlib
import logging
import shutil
import time
from pathlib import Path
from typing import Self

from watchdog.events import (
    FileModifiedEvent,
    FileMovedEvent,
    FileSystemEvent,
    FileSystemEventHandler,
)
from watchdog.observers import Observer

logger = logging.getLogger(__file__)

logging.basicConfig(level=logging.INFO, format='%(message)s')


FILE_PATHS = {
    Path('file1.txt').absolute(),
    Path('file2.txt').absolute(),
    Path('file3.txt').absolute(),
}


class EventHandler(FileSystemEventHandler):
    def __init__(self) -> None:
        self._cooldown = set[Path]()

    def on_any_event(self, event: FileSystemEvent) -> None:
        # check the path of the event
        src_path = Path(str(event.src_path)).absolute()
        dest_path = Path(str(event.dest_path)).absolute()

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
                    logger.info(f'copied {active_path} to {passive_path}')
                else:
                    logger.debug(f'hash for {active_path=} is the same as {passive_path=}, skipped copying')


class EventObserver:
    def __init__(self, path: Path) -> None:
        self._path = path
        self._observer = Observer()
        self._event_handler = EventHandler()

    def __enter__(self) -> Self:
        self._observer.schedule(self._event_handler, str(self._path), recursive=False)
        self._observer.start()
        return self

    def __exit__(self, *_) -> None:
        self._observer.stop()
        self._observer.join()

    def run(self) -> None:
        while True:
            time.sleep(1)


def main() -> None:
    with EventObserver(path=Path.cwd()) as observer:
        try:
            observer.run()
        except KeyboardInterrupt:
            logger.info('user signal KeyboardInterrupt')


if __name__ == '__main__':
    main()
