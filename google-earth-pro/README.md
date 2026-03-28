# Google Earth Pro

## Installation

AUR has a package to compile this:
- `pacman -S google-earth-pro`

## Run

- This app doesn't natively support wayland, run it with the env var:
    `QT_QPA_PLATFORM=xcb google-earth-pro`
- Create a .desktop entry with Exec:
    `Exec=env QT_QPA_PLATFORM=xcb /usr/bin/google-earth-pro `

## Reference

<https://wiki.archlinux.org/title/Google_Earth>

