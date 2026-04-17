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
        event_dict: dict[str, str] = json.loads(line)
        key = next((k for k in event_dict.keys()))
        if key in ['WindowOpenedOrChanged', ]:
            asyncio.create_task(center_visible_columns(1))


if __name__ == '__main__':
    asyncio.run(main())
