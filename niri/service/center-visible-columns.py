#!/usr/bin/env python

import asyncio
import json
import logging
import re
from typing import Callable, Coroutine

logger = logging.getLogger(__file__)

Event = dict[str, dict[str, dict[str, str]]]


# defined trigger events
TRIGGER_EVENTS = {
    'WindowOpenedOrChanged',
    'WindowFocusChanged',
    'WindowLayoutsChanged',
    'WindowClosed',
}
# define ignore window regex patterns
IGNORED_WINDOWS = {(re.compile(entry[0]), re.compile(entry[1])) for entry in {
    (r'^Waiting', r'steam_app_244210'),
    (r'Assetto Corsa', r'steam_app_244210'),
}}


def is_a_trigger_event(event: Event) -> bool:
    try:
        (name, _),  = event.items()
        if name in TRIGGER_EVENTS:
            logger.info(f'Trigger event: {name=}')
            return True
    except Exception as e:
        logger.error(e)
    # default
    return False


def is_an_ignored_window_opened_or_changed(event: Event) -> bool:
    try:
        (name, details),  = event.items()
        if name != 'WindowOpenedOrChanged':
            return False
        window = details['window']
        title, app_id = window['title'], window['app_id']
        # if both title and app_id match, then the window is ignored
        for title_pattern, app_id_pattern in IGNORED_WINDOWS:
            if title_pattern.search(title) and app_id_pattern.search(app_id):
                logger.info(f'Ignored window: {title=}, {app_id=}')
                return True
    except KeyError:
        pass
    except Exception as e:
        logger.error(e)
    # default
    return False


async def center_visible_columns() -> None:
    process = await asyncio.create_subprocess_exec(
        'niri', 'msg', 'action', 'center-visible-columns'
    )
    await process.wait()
    logging.debug('center-visible-columns')


async def try_to(action: Callable[[], Coroutine], *, delay: float | None = None) -> None:
    await action()
    if delay is not None:
        await asyncio.sleep(delay)
        await action()


async def main() -> None:
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

    process = await asyncio.create_subprocess_exec(
        'niri', 'msg', '--json', 'event-stream',
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.DEVNULL,
    )

    assert process.stdout is not None
    while (line := await process.stdout.readline()):
        # extract each event name and detail data
        event: Event = json.loads(line)
        # only interested if event is on the trigger list
        if is_a_trigger_event(event):
            # skip if it is a trouble making window
            if is_an_ignored_window_opened_or_changed(event):
                continue
            # do center-visible-columns
            asyncio.create_task(try_to(center_visible_columns))


if __name__ == '__main__':
    asyncio.run(main())
