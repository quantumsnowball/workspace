# Problem

## Drop down selection menu fail to render after v0.8.2 (commit 3273a0f)

Github issue: <https://github.com/Supreeeme/xwayland-satellite/issues/468>

Solution:

1. Install v0.8.1 using `pacman` or `paru`:

```sh
paru -U ~/xwayland-satellite-0.8.1-2-x86_64.pkg.tar.zst

```
backup this file to cloud drive if needed


2. Edit pacman config to pin the version to v0.8.1

```sh
sudo nvim /etc/pacman.conf
```

then add this line to disable updating `xwayland-satellite`

```ini
IgnorePkg   = xwayland-satellite xwayland-satellite-git
```
