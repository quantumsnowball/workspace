# Mangohud

## Install the config

Run the install script to create the symlinks

## Enable globally

Problems:

Settings MANGOHUD=1 doesn't always enable for some games, so the previous solutions were archived.

Instead, prefix the launch or game binary with `mangohud` will always work.

Solution: 

Therefore, the better solution is to edit the launcher shortcut to prefix with `mangohud`.

1. If launching from terminal, create some shell function to do this in zshrc

2. Also edit the steam.desktop in /usr/share/applications/, or create one in ~/.local/share/applications/, edit the main Exec= tag and prefix it with `mangohud`

