#!/usr/bin/env python

import asyncio
import json


async def center_visible_columns(delay: int = 1) -> None:
    await asyncio.sleep(delay)
    process = await asyncio.create_subprocess_exec(
        'niri', 'msg', 'action', 'center-visible-columns'
    )
    await process.wait()
    print('INFO: center-visible-columns DONE')


async def main() -> None:
    process = await asyncio.create_subprocess_exec(
        'niri', 'msg', '--json', 'event-stream',
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.DEVNULL,
    )

    assert process.stdout is not None
    while (line := await process.stdout.readline()):
        event_dict = json.loads(line)
        if 'WindowOpenedOrChanged' in event_dict:
            asyncio.create_task(center_visible_columns())


if __name__ == '__main__':
    asyncio.run(main())
