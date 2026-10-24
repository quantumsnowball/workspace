from pathlib import Path

app_id = 2231380

env = dict(
    PROTON_ENABLE_WAYLAND=0,

    # sunshine streaming use mangohud 60fps limiter is a bit smoother than the in-game fps limite
    MANGOHUD_CONFIGFILE=f'{Path.home()}/.config/MangoHud/MangoHud-60fps.conf',
)
