from steam_preset import *

env = dict(
    MANGOHUD_CONFIGFILE=XDG_CONFIG_HOME/'MangoHud/MangoHud-120fps.conf',

    PRESSURE_VESSEL_IMPORT_OPENXR_1_RUNTIMES=1,

    # this fix the menu UI not showing bug under WiVRn
    OXR_NO_TEXTURE_SOURCE_ALPHA=1,
)

wrapper = [
    'mangohud',
]
