# Installation

## noctalia shell
```
paru -S noctalia-shell
```

## dms shell
```
sudo pacman -Syu niri xwayland-satellite xdg-desktop-portal-gnome xdg-desktop-portal-gtk alacritty
paru -S dms-shell-bin matugen cava qt6-multimedia-ffmpeg
systemctl --user add-wants niri.service dms
```

## startup time

If startup time is slow, it is likely because it has to load the network related service.
The is a `NetworkManager-wait-online.service` file in the systemd system.
You may wanna disable it so that noctalia-shell doesn't wait for it to launch.
The startup time will likely much faster on cold boot.
