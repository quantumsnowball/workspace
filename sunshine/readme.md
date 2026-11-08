# Sunshine

Sunshine is a self-hosted game stream host for Moonlight.

# Virtual Monitor

## niri virtual output + wlroots streaming

While this way works easily on the fly, the fps is not smooth at all.
Use CPU schedule tracing can see that it cause niri thread to Uninterruptable Sleep often.
This cause a lot of micro stutter in the gameplay.
Most likely cause by vram locking and waiting.

## EDID virtual display + KMS

Sunshine requests the kernel to copy or export the frame buffer currently sitting on the
GPU's Display Engine CRTC output directly into NVENC hardware memory via DMA-BUF.
It has lowest possible overhead. Bypasses the Wayland compositor's event loop and
rendering pass entirely.
