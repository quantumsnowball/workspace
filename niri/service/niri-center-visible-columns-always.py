#!/usr/bin/env python

import json
import subprocess


def main() -> None:
    process = subprocess.Popen(
        ['niri', 'msg', '--json', 'event-stream'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    assert process.stdout is not None
    while (line := process.stdout.readline()):
        event_dict = json.loads(line)
        print(event_dict)


if __name__ == '__main__':
    main()
