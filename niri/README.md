# Installation

## noctalia shell
```
paru -S noctalia-shell
```

Noctalia uses specific fork of quickshell, which is like a minified version called `quickshell-qs`.

## dms shell
```
sudo pacman -Syu niri xwayland-satellite xdg-desktop-portal-gnome xdg-desktop-portal-gtk alacritty
paru -S dms-shell-bin matugen cava qt6-multimedia-ffmpeg
systemctl --user add-wants niri.service dms
```

DMS must use the official quickshell, cannot not share the same quickshell with noctalia which is a minified version.

## startup time

If startup time is slow, it is likely because it has to load the network related service.
The is a `NetworkManager-wait-online.service` file in the systemd system.
You may wanna disable it so that noctalia-shell doesn't wait for it to launch.
The startup time will likely much faster on cold boot.
