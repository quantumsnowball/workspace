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

## White little box when launching ubisoft connect


Just add this line to the niri conf, and it is fixed:

`spawn-at-startup "xembedsniproxy"`

That little white box was actually the ubisoft connect, but it is a x11 tray icon app.
Using xembedsniproxy as suggest by the other answer, will solve this problem entirely.
If you are also running KDE plasma alongside, you don't even need to install it.
This module is already merged into part of KDE plasma so you just need to ensure it is already running when Niri starts.
After that I can see the ubisoft conect tray icon, clickable and open up the app as usual.

ref: <https://github.com/davidedmundson/xembed-sni-proxy>
