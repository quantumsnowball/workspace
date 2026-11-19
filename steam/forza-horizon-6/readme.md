# Forza Horizon 6

## About the ffb wheel not working well on Linux bug
Half years after launch, the linux community has a new `universal-pidff` driver.
Tested out it is supporting the ffb effect no problem anymore.
No need to dual boot to win11 just to play this game!

## Linux launch crash fixes

- use <https://github.com/csmoke66/FH6-Cachy/tree/main>
- rename `steam_appid.txt` to `steam_appid.txt.bak`
- Under /home/ak/.local/share/Steam/steamapps/compatdata/3998992597/pfx/drive_c/users/steamuser/AppData/Local/ForzaHorizon6/LocalStorage_Shared/ForzaUserConfigSelections/UserConfigSelections
    - set <option id="REFLEXMode" value="0"/>, this has to be disabled, otherwise crash on launch
