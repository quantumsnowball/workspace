# Tom Clancy's Division 2

## Low input latency mode

Enabled Nvidia Low Latency mode in game should feel input latency significant shorter:
- KDE Plasma:
    - The settings seems broken, for unknown reason, toggle on/off has no obvious difference.
        - Though the latency is acceptable but feels like slower than Win11 native.
- Niri
    - Direct Scanout is enabled by default
        - In general, playing in Niri with direct scanout has a lower input latency, much more responsive than KDE or Win11.
        - However, after going in and out of game menu or load screen on a matchmaking success, the direct scanout low latency may go broken.
            - Toggling fullscreen (super+F) can instantly restore the low latency.

## Process mismatch when launch from steam or cli directly

Probably due to some ghost process of ubisoft connect or the game itself, so:
- Make sure to kill all related ghost processes and start fresh. Run the shell script games.reset.division
