# Forza Horizon 6

## Bypass xbox account login on linux
- run `protontricks <app_id> regedit` to edit the steam pfx
- go to the path `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\GamingServices`
- add dword `ForceUseInprocGameSaves` and set value to `1`
- launch the game, try to go into settings, it will loading for a whole
- then it say sync fail, and then prompt for Offline mode, click it and it will create an offline profile
- you can then freely restore any other offline save files into the `ContainersRoot` dir
- if save file are created using the same dummy account, it will decrypt it without problem

## About the ffb wheel not working well on Linux bug
Half years after launch, the linux community has a new `universal-pidff` driver.
Tested out it is supporting the ffb effect no problem anymore.
No need to dual boot to win11 just to play this game!

## Linux launch crash fixes

- use <https://github.com/csmoke66/FH6-Cachy/tree/main>
- rename `steam_appid.txt` to `steam_appid.txt.bak`
- Under /home/ak/.local/share/Steam/steamapps/compatdata/3998992597/pfx/drive_c/users/steamuser/AppData/Local/ForzaHorizon6/LocalStorage_Shared/ForzaUserConfigSelections/UserConfigSelections
    - set <option id="REFLEXMode" value="0"/>, this has to be disabled, otherwise crash on launch

## Wheel buttons unbind hack

- The game force use some wheel button to be binded as essencials, can't disable wheel buttons
- To use keyboard as button, keep only wheel axis, need to hack the key binds file at
    - `<steam prefix dir>/pfx/drive_c/users/steamuser/AppData/Local/ForzaHorizon6/PlayFabSaveStorage_901FB6499E567/ContainersRoot/InputTranslationManager_xxxxxxxxxxxxx/Profiles`
- search and replace `InputType="Button"`
- for each entry, set `Index="99"` or just any dummy value is okay, essencially unbind them all
