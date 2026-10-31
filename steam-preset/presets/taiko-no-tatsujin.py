import subprocess as sh
from pathlib import Path

key = 'taiko-no-tatsujin'


def init() -> None:
    sh.Popen([
        'uv', 'run',
        f'{Path.home()}/.config/workspace/steam/taiko-no-tatsujin/remapper.py'
    ])
