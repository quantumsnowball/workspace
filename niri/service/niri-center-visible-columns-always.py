#!/usr/bin/env python

import asyncio
import json
from typing import Callable, Coroutine


async def center_visible_columns() -> None:
    process = await asyncio.create_subprocess_exec(
        'niri', 'msg', 'action', 'center-visible-columns'
    )
    await process.wait()


async def try_to(action: Callable[[], Coroutine], *, delay: float | None = None) -> None:
    await action()
    if delay is not None:
        await asyncio.sleep(delay)
        await action()


async def main() -> None:
    process = await asyncio.create_subprocess_exec(
        'niri', 'msg', '--json', 'event-stream',
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.DEVNULL,
    )

    assert process.stdout is not None
    TRIGGER_EVENTS = {
        'WindowOpenedOrChanged',
        'WindowFocusChanged',
        'WindowLayoutsChanged',
        'WindowClosed',
    }
    while (line := await process.stdout.readline()):
        event_dict: dict[str, str] = json.loads(line)
        if any(key in TRIGGER_EVENTS for key in event_dict):
            asyncio.create_task(try_to(center_visible_columns))


if __name__ == '__main__':
    asyncio.run(main())
