# OBS-Studio

## Intel QuickSync (QSV) cannot start recording
Error:
```
23:56:22.783: >>> app not on intel GPU, fall back to old qsv encoder
23:56:22.783: [qsv encoder: 'advanced_video_recording'] settings:
...
23:56:22.783: [qsv encoder: 'advanced_video_recording'] debug info:
23:56:22.795: 	surf:           SysMem
23:56:22.807: [qsv encoder: 'msdk_impl'] Hardware device returned unexpected errors (MFX_ERR_DEVICE_FAILED)
23:56:22.807: [qsv encoder: 'advanced_video_recording'] qsv failed to load
23:56:22.807: 	major:          1
23:56:22.807: 	minor:          35
23:57:07.637: [pipewire] Stream 0x5652d8f78c30 state: "paused" (error: none)
```

Solution:
- install `vpl-gpu-rt` via pacman or paru from intel official repo
- <https://github.com/intel/vpl-gpu-rt>

