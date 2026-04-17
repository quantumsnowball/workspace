#!/usr/bin/env python

import json
import subprocess
import time


def center_visible_columns(delay: int = 1) -> None:
    time.sleep(delay)
    subprocess.run(['niri', 'msg', 'action', 'center-visible-columns'], check=False)
    print('INFO: center-visible-columns DONE')


def main() -> None:
    process = subprocess.Popen(
        ['niri', 'msg', '--json', 'event-stream'],
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True
    )

    assert process.stdout is not None
    while (line := process.stdout.readline()):
        event_dict = json.loads(line)
        if 'WindowOpenedOrChanged' in event_dict:
            center_visible_columns()


if __name__ == '__main__':
    main()
