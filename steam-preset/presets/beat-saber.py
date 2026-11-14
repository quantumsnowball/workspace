from steam_preset import *

env = dict(
    MANGOHUD_CONFIGFILE=XDG_CONFIG_HOME/'MangoHud/MangoHud-120fps.conf',

    # this fix the menu UI not showing bug under WiVRn
    OXR_NO_TEXTURE_SOURCE_ALPHA=1,
)

wrapper = [
    'mangohud',
]
