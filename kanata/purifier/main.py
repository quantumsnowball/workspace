# /// script
# dependencies = [
#   "typer",
#   "evdev",
# ]
# ///

import logging
import time
from typing import Annotated, Iterator

import evdev
import typer
from evdev import UInput
from evdev.ecodes import EV, EV_KEY, EV_SYN, bytype
from evdev.events import InputEvent
from typer import Argument, Option

logger = logging.getLogger('PureKeyboard')


class Package:
    def __init__(self) -> None:
        self._events = []

    def __getitem__(self, key) -> InputEvent:
        return self._events[key]

    def append(self, e: InputEvent) -> None:
        self._events.append(e)

    def send(self, dev: UInput) -> None:
        for e in self._events:
            dev.write(e.type, e.code, e.value)
            logger.info(f'SENT: {EV[e.type]}, {bytype[e.type][e.code]}, {e.value=}')
        dev.syn()


class PureKeyboard:
    def __init__(
        self,
        id: int,
        *,
        max_event_interval: float,
    ) -> None:
        self._max_event_interval = max_event_interval
        self._src_dev_path = f'/dev/input/event{id}'
        self._src_dev = evdev.InputDevice(self._src_dev_path)
        self._dst_dev = UInput.from_device(self._src_dev, name='Pure Keyboard')
        self._last_timestamp = 0.0

    @property
    def _packages(self) -> Iterator[Package]:
        p = Package()
        for e in self._src_dev.read_loop():
            p.append(e)
            if e.type == EV_SYN:
                yield p
                p = Package()

    def run(self) -> None:
        # small delay befoe grab, avoid command Enter release being capped
        time.sleep(1.0)
        # intercept all src events
        logger.info(f'Grabbed {self._src_dev_path}')
        self._src_dev.grab()
        # then process all src events

        for p in self._packages:
            # TODO: detect bouncing event here and drop
            e = p[0]
            # interval = e.timestamp() - self._last_timestamp
            # self._last_timestamp = e.timestamp()
            # if interval < self._max_event_interval:
            #     logger.info(f'DROP: {EV[e.type]}, {bytype[e.type][e.code]}, {e.value=}')
            #     continue

            # passthrough all other irrelevant events
            p.send(self._dst_dev)


def main(
    id: Annotated[int, Argument(help='The event ID from evtest, e.g., /dev/input/event3 → id=3')],
    max_event_interval: Annotated[float, Option(help='Time interval (seconds) of events to be dropped (temporal debounce)')] = 0.01,
    debug: Annotated[bool, Option(help='Enable debug mode verbose output')] = False,
):
    '''
    Anti-bouncing keyboard filter for Linux.
    '''
    # logger
    logging.basicConfig(
        level=logging.DEBUG if debug else logging.INFO,
        format='%(levelname)s: %(message)s'
    )

    # app
    keyboard = PureKeyboard(
        id=id,
        max_event_interval=max_event_interval,
    )

    # run
    logger.info(f'Starting PureKeyboard on event{id}...')
    try:
        keyboard.run()
    except KeyboardInterrupt:
        logger.info('\nPureKeyboard Stopped by user.')


if __name__ == '__main__':
    # find you device using 'evtest'
    # "/dev/input/event13" # keybaord
    typer.run(main)
