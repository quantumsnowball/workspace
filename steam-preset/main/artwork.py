import os
import subprocess as sh
from pathlib import Path


def download_if_necessary(app_id: str | None) -> None:
    shortcut_id = os.environ.get('SteamAppId', None)
    if not shortcut_id or not app_id:
        return

    sh.Popen([
        'uv', 'run',
        Path.home()/'.config/zshrc/utils/steam/download-artwork.py',
        '--app-id', app_id,
        '--shortcut-id', shortcut_id,
    ])
