from pathlib import Path

key = 'battlefield1'

env = dict(
    # sunshine streaming use mangohud 60fps limiter
    MANGOHUD_CONFIGFILE=f'{Path.home()}/.config/MangoHud/MangoHud-60fps.conf',
)
