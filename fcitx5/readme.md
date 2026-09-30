# Trouble Shooting

## Black box appearing when niri and dms shell start

The black box is actually the fcitx5 tray icon. If it start faster than niri or dms shell,
it is render as an ugly blackbox. Solution is to delay a bit the launch:

1. add config overrides for the fcitx systemd service unit:

    ```bash
    systemctl --user edit app-org.fcitx.Fcitx5@autostart.service
    ```

2. add the following lines in the overrides files and save:

    ```ini
    [Service]
    ExecStartPre=/usr/bin/sleep 2
    ```
