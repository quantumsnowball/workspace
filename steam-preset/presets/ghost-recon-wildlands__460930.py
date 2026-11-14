from steam_preset import *

env = dict(
    PROTON_ENABLE_WAYLAND=0,

    MANGOHUD_CONFIGFILE=XDG_CONFIG_HOME/'MangoHud/MangoHud-60fps.conf',
)

wrapper = [
    'mangohud',
]
