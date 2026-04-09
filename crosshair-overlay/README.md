# Crosshair

Attempt to draw pixel on the overlay-layer of Niri.\
As from the niri docs, only the overlay layer will show up on top of full-screen windows.\

## Dependencies

Install `gtk4-layer-shell` lib first from the AUR.
This is a standard python wrapper to draw on the overlay layer.

## Run

The python script can draw some pixel in the overlay layer, which is perfect for crosshair. \
May need to run with LD_PRELOAD env vars:\
`LD_PRELOAD=/usr/lib/libgtk4-layer-shell.so python dot.py`
