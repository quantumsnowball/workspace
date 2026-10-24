from pathlib import Path

app_id = 2221490

env = dict(
    # division 2 in-game fps limiter is unclean, setting to 60 fps limit gives unstable 61-62 fps
    # setting DXVK_FRAME_RATE=60 or VKD3D_FRAME_RATE=60 enforce a clean 60 stable fps limiter
    # if both are provided, VKD3D_FRAME_RATE takes precedence
    # VKD3D_FRAME_RATE=60,
    # sunshine streaming use mangohud 60fps limiter
    MANGOHUD_CONFIGFILE=f'{Path.home()}/.config/MangoHud/MangoHud-60fps.conf',
)
