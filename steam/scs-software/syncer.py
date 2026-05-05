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
    FileCreatedEvent,
    FileModifiedEvent,
    FileMovedEvent,
    FileSystemEvent,
    FileSystemEventHandler,
)
from watchdog.observers import Observer

logger = logging.getLogger(__file__)

logging.basicConfig(level=logging.INFO, format='%(message)s')


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
        self.is_created = isinstance(event, FileCreatedEvent)
        self.is_modified = isinstance(event, FileModifiedEvent)
        self.is_moved = isinstance(event, FileMovedEvent)
        self.has_changed = self.is_created or self.is_modified or self.is_moved
        self.path = Path(str(event.dest_path)) if self.is_moved else Path(str(event.src_path))

    @property
    def is_in_master_node(self) -> bool:
        return self.path.is_relative_to(MasterNode.base_dir)

    def _digest_of(self, file: Path) -> str:
        try:
            return hashlib.md5(file.read_bytes()).hexdigest()
        except Exception:
            return ''

    def update(self, master_node: MasterNode) -> None:
        dest_path = next(p for p in master_node.files if p.name == self.path.name)
        if self._digest_of(self.path) != self._digest_of(dest_path):
            shutil.copy2(self.path, dest_path)
            logger.info(f'{self.path} copied to {dest_path}')
        else:
            logger.info('same digest, skipped')

    def broadcast(self, other_nodes: Sequence[Node]) -> None:
        dest_paths = tuple(p for node in other_nodes for p in node.files if p.name == self.path.name)
        for dest_path in dest_paths:
            if self._digest_of(self.path) != self._digest_of(dest_path):
                shutil.copy2(self.path, dest_path)
                logger.info(f'{self.path} copied to {dest_path}')
            else:
                logger.info('same digest, skipped')


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
        self._handle_file(File(event))


class NodeObserver:
    def __init__(self, nodes: Nodes) -> None:
        self._nodes = nodes
        self._observer = Observer()
        self._event_handler = NodeEventHandler(nodes)

    def __enter__(self) -> Self:
        for node in self._nodes.items:
            for dir in node.sync_dirs:
                self._observer.schedule(self._event_handler, str(dir), recursive=False)
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
