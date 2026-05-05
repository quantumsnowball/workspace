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


class Nodes:
    def __init__(self, *nodes: Node) -> None:
        self.items = nodes
        self.master_node = next(node for node in nodes if isinstance(node, MasterNode))
        self.other_nodes = tuple(node for node in nodes if not isinstance(node, MasterNode))


class File:
    def __init__(self, event: FileSystemEvent) -> None:
        self._event = event
        self.is_modified = isinstance(event, FileModifiedEvent)
        self.is_moved = isinstance(event, FileMovedEvent)
        self.has_changed = self.is_modified or self.is_moved
        self.path = Path(str(event.src_path)) if self.is_modified else Path(str(event.dest_path))

    @property
    def is_in_master_node(self) -> bool:
        return self.path.is_relative_to(MasterNode.base_dir)

    def update(self, master_node: MasterNode) -> None:
        pass

    def broadcast(self, other_nodes: Sequence[Node]) -> None:
        pass


class NodeEventHandler(FileSystemEventHandler):
    def __init__(self, nodes: Nodes) -> None:
        self._nodes = nodes
        self._files = set(file for node in nodes.items for file in node.files)
        self._cooldown = set[Path]()

    def _handle_file(self, file: File) -> None:
        # action only when the file has changed and file is in a node
        if file.has_changed and file.path in self._files:
            # action base of node type
            if file.is_in_master_node:
                file.broadcast(self._nodes.other_nodes)
            else:
                file.update(self._nodes.master_node)

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


class NodeObserver:
    def __init__(self, nodes: Nodes) -> None:
        self._nodes = nodes
        self._observer = Observer()
        self._event_handler = NodeEventHandler(nodes)

    def __enter__(self) -> Self:
        for node in self._nodes.items:
            for dir in node.sync_dirs:
                print(dir)
        # self._observer.schedule(self._event_handler, str(self._path), recursive=False)
        self._observer.start()
        return self

    def __exit__(self, *_) -> None:
        self._observer.stop()
        self._observer.join()

    def run(self) -> None:
        while True:
            time.sleep(1)


def main() -> None:
    nodes = Nodes(
        ATSNode(runtime='native'),
        ATSNode(runtime='proton'),
        ETSNode(runtime='native'),
        ETSNode(runtime='proton'),
        MasterNode(),
    )

    with NodeObserver(nodes) as observer:
        try:
            observer.run()
        except KeyboardInterrupt:
            logger.info('user signal KeyboardInterrupt')


if __name__ == '__main__':
    main()
