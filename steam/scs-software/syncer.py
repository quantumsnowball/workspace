# /// script
# dependencies = [
#   "watchdog"
# ]
# ///

import hashlib
import logging
import shutil
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Literal, Protocol, Self, Sequence

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


STEAM_HEX_ID = (Path.home() / '.steam_hex_id').read_text().strip()


class Node(Protocol):
    files: Sequence[Path]
    sync_dirs: set[Path]


@dataclass(kw_only=True)
class GameNode(Node):
    game_name: str
    game_id: int
    runtime: Literal['native', 'proton']

    def __post_init__(self) -> None:
        self.base_dir = (
            Path.home()/f'.local/share/{self.game_name}' if self.runtime == 'native' else
            Path.home()/f'.local/share/Steam/steamapps/compatdata/{self.game_id}/pfx/drive_c/users/steamuser/Documents/{self.game_name}'
        )
        self.files = (
            self.base_dir/'config.cfg',
            self.base_dir/'steam_profiles'/STEAM_HEX_ID/'config_local.cfg',
            self.base_dir/'steam_profiles'/STEAM_HEX_ID/'controls_linux.sii',
        )
        self.sync_dirs = set(file.parent for file in self.files)


@dataclass(kw_only=True)
class ATSNode(GameNode):
    game_name: str = 'American Truck Simulator'
    game_id: int = 270880


@dataclass(kw_only=True)
class ETSNode(GameNode):
    game_name: str = 'Euro Truck Simulator 2'
    game_id: int = 227300


class MasterNode(Node):
    base_dir = Path.home()/f'.config/workspace/steam/scs_software'
    files = (
        base_dir/'config.cfg',
        base_dir/'config_local.cfg',
        base_dir/'controls_linux.sii',
    )
    sync_dirs = set(file.parent for file in files)


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
    nodes: list[Node] = [
        ATSNode(runtime='native'),
        ATSNode(runtime='proton'),
        ETSNode(runtime='native'),
        ETSNode(runtime='proton'),
        MasterNode(),
    ]

    with EventObserver(path=Path.cwd()) as observer:
        try:
            observer.run()
        except KeyboardInterrupt:
            logger.info('user signal KeyboardInterrupt')


if __name__ == '__main__':
    main()
