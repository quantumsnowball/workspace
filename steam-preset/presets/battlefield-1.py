# runtime: DXVK

from steam_preset import *

key = 'battlefield1'

env = dict(
    # sunshine streaming use mangohud 60fps limiter
    MANGOHUD_CONFIGFILE=XDG_CONFIG_HOME/'MangoHud/MangoHud-60fps.conf',
)
