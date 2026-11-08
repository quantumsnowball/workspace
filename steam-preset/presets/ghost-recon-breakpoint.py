from steam_preset import *

key = 2231380

env = dict(
    PROTON_ENABLE_WAYLAND=0,

    # sunshine streaming use mangohud 60fps limiter is a bit smoother than the in-game fps limite
    MANGOHUD_CONFIGFILE=XDG_CONFIG_HOME/'MangoHud/MangoHud-60fps.conf',
)
