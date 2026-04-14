# /// script
# dependencies = [
#   "typer",
#   "evdev",
# ]
# ///

import logging
import time
from collections import defaultdict
from typing import Annotated, Iterator

import evdev
import typer
from evdev import InputDevice, UInput
from evdev.ecodes import EV, EV_MSC, EV_SYN, bytype
from evdev.events import InputEvent
from typer import Argument, Option

logger = logging.getLogger('PureKeyboard')


class Package:
    def __init__(
        self,
        skip_list: tuple[int] = (EV_MSC,),
    ) -> None:
        self._skip_list = skip_list
        self._events = []

    def __getitem__(self, key) -> InputEvent:
        return self._events[key]

    def append(self, e: InputEvent) -> None:
        if e.type in self._skip_list:
            return
        self._events.append(e)

    def send(self, dev: UInput) -> None:
        for e in self._events:
            dev.write(e.type, e.code, e.value)
            logger.debug(f'SENT: {EV[e.type]}, {bytype[e.type][e.code]}, {e.value=}')
        dev.syn()


class PureKeyboard:
    def __init__(
        self,
        name: str,
        *,
        max_event_interval: float,
    ) -> None:
        self._max_event_interval = max_event_interval
        paths = {InputDevice(path).name: path for path in evdev.list_devices()}
        self._src_dev_path = paths[name]
        self._src_dev = InputDevice(self._src_dev_path)
        self._dst_dev = UInput.from_device(self._src_dev, name=f'Pure: {name}')
        self._last_timestamp: dict[int, dict[int, float]] = defaultdict(lambda: defaultdict(float))

    @property
    def _packages(self) -> Iterator[Package]:
        p = Package()
        for e in self._src_dev.read_loop():
            p.append(e)
            if e.type == EV_SYN:
                yield p
                p = Package()

    def run(self) -> None:
        logger.info(f'Starting Pure Keyboard on {self._src_dev_path} ...')
        # small delay befoe grab, avoid command Enter release being capped
        # NOTE: please press enter key quickly
        time.sleep(0.5)
        # intercept all src events
        logger.info(f'Grabbed {self._src_dev_path}')
        self._src_dev.grab()
        # then process all src events

        for p in self._packages:
            # use the first event as the comparison target
            e = p[0]

            # intercept for non EV_SYN keydown event
            if e.type != EV_SYN and e.value == 1:
                # calc the time interval from the last event with the same type and code
                interval = e.timestamp() - self._last_timestamp[e.type][e.code]
                # move the timestamp to new position
                self._last_timestamp[e.type][e.code] = e.timestamp()
                # if interval is too short, discard the packet
                if interval < self._max_event_interval:
                    logger.info(f'DROP: {EV[e.type]}, {bytype[e.type][e.code]}, {e.value=}')
                    continue

            # passthrough all other irrelevant events
            p.send(self._dst_dev)


def main(
    name: Annotated[str, Argument(help='The device name from evtest')],
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

    # device
    keyboard = PureKeyboard(name, max_event_interval=max_event_interval)

    # run
    try:
        keyboard.run()
    except KeyboardInterrupt:
        logger.info('\nPureKeyboard Stopped by user.')


if __name__ == '__main__':
    # find you device using 'evtest'
    # "/dev/input/event13" # keybaord
    typer.run(main)
