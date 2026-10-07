# WiVRn

A open source replacement for SteamVR. Very good performance on linux, while SteamVR is totally as of March 2026.

## Installatin

- `pacman -S wivrn-dashboard`
- `pacman -S pri xrizer`
- `pacman -S android-tools`

## Trouble Shooting

### Xrizer crash

What the Logs Show
```
Unsupported Color Format Swapchain Fallback:

xrizer::openxr_data: Requested to init swapchain with unsupported format 6408 - instead using 32859
```

Google Earth VR requests an OpenGL format (6408 = GL_RGBA) that the OpenXR compositor (WiVRn) does not support natively, forcing xrizer to fall back to 32859 (GL_SRGB8_ALPHA8).

Session Reset & Focus Cycles:
```
xrizer::compositor: Received game texture, restarted session with new data
When Google Earth VR passes its texture, xrizer destroys and recreates the session/swapchain to match.
```

Fatal Panic:
```
xrizer ThreadId(1): panicked at library/core/src/panicking.rs:225:5: panic in a function that cannot unwind
During focus transitions or swapchain reconstruction, xrizer hit a Rust unwrap/assertion panic. Because xrizer runs embedded as an OpenVR wrapper inside Steam/Proton process trees, a panic across C/FFI boundaries forces an unrecoverable immediate abort.
```

Solution:
use the following launch options in Steam:
```
PRESSURE_VESSEL_IMPORT_OPENXR_1_RUNTIMES=1 %command%
```
