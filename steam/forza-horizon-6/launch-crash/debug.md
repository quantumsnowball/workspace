# Success Case

- Lutris
    - steps
        - starts with installer or ISO extractor
            - if GD version, the torrent directory is useable immediately, move it into you game dir
            - if RUNE version, apply updates, overwrite with RUNE folder content
        - add game normally using Lutris
        - add the version file into bin directory as from this repo <https://github.com/csmoke66/FH6-Cachy/tree/main>
            - delete amd_ags_x64.dll, rename amd_ags_x64_rne.dll to amd_ags_x64.dll
            - delete xgameruntime.dll, rename xgameruntime.rne to xgameruntime.dll
        - add DLL overrides `version=n,b`
    - results
        - can go into game successfully
        - without the xgameruntime.dll replacement, will get stuck in E:0-0 error
        - finally will ask for xbox account signin
    - debug
        - if PROTON_ENABLE_WAYLAND=1 it start with a black screen on niri, you have to switch to the window on the right to see the game window
    - video crash
        - when first enter gameplay will have video crash FHC00 within few seconds
            - both GE-proton and cachyos-proton-slr having the same problem
            - PROTON_VKD3D_HEAP=1 don't help at all
            - VKD3D_CONFIG=descriptor_heap,enable_experimental_features cause black screen with no gameplay graphic but only HUD showing
            - tune down video settings also not helpful, crashing at medium settings and DLSS off
            - setting `PROTON_VKD3D_HEAP=1 VKD3D_CONFIG=enable_experimental_features,descriptor_heap %command%`
                - can get you passing first two races, but crash again in the sakura scene
        - temp solution
            - use `Low` profile without DLSS to launch a new game, it can finally get pass the initial races
            - then after creating the character, you can tune back to High settings and enable DLSS, no crash from now on
                

# Partial Success Cases

- Steam with app_id_480 method
    - steps
        - starts with GD version from GameDrive
        - add it as a non steam game
        - change the stead_id.txt into 480
        - launch option:
            PROTON_MEDIA_USE_GST=1 PROTON_VKD3D_HEAP=1 VKD3D_CONFIG=enable_experimental_features,descriptor_heap %command%
        - must close steam window before launch
    - results
        - can go into game successfully
        - stuck in E:0-0 error, can't load any save file

- Heroic launcher
    - steps
        - disable steam runtime
        - disable umu
        - set `WINEDLLOVERRIDES=amd_ags_x64=n,b`
    - results
        - can get to the first FH6 popup to show
        - stuck in Game Crash error popup, code: FHE01, Context 190000


# Ultimate solution

There is already a github issue about this bug, and devs said nvidia is aware and working on hotkey-overlay-title

<https://github.com/HansKristian-Work/vkd3d-proton/issues/3053>

So the best solution is to wait for a newer nvidia proprietary driver.
