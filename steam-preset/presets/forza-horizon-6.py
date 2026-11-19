from steam_preset import *

env = dict(
    MANGOHUD_CONFIGFILE=XDG_CONFIG_HOME/'MangoHud/MangoHud-60fps.conf',

    WINEDLLOVERRIDES='version=n,b',
)

wrapper = (
    [
        'mangohud',
    ]
    if (s := focused_output()).model == 'LG ULTRAWIDE' else
    [
        'gamescope',
        '-W', s.width, '-H', s.height,
        '-w', s.width, '-h', s.height,
        # '--borderless',
        '--fullscreen',
        '--',
        'mangohud',
    ]
)
