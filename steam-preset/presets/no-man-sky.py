'''
Runtime: Vulkan

2D:
[ steam-preset ]: INFO: cmd=[..., "$HOME/.local/share/Steam/steamapps/common/No Man's Sky/Binaries/NMS.exe"]

VR:
[ steam-preset ]: INFO: cmd=[..., "$HOME/.local/share/Steam/steamapps/common/No Man's Sky/Binaries/NMS.exe", '-HmdEnable', '1']
'''
from steam_preset import *

key = 275850

env = dict(
    # sunshine streaming use mangohud 60fps limiter is a bit smoother than the in-game fps limite
    MANGOHUD_CONFIGFILE=XDG_CONFIG_HOME/'MangoHud/MangoHud-60fps.conf',
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
