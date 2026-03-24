# Assetto Corsa


## Run the original launcher

- As of 2026-03-24, in CachyOS, directly press Play in Steam will launch the original game with no problem
- It will launch ProtonFixes itself and fix the broken things.


## Run Content Manager

- Install:
    1. Place `Content Manager.exe` inside the game directory
    2. Create a symlink to steam's loginusers.vdf, target to the pfx's config dir:
        `ln -s ~/.steam/root/config/loginusers.vdf "$HOME/.local/share/Steam/steamapps/compatdata/244210/pfx/drive_c/Program Files (x86)/Steam/config/loginusers.vdf"`
    3. Run winecfg, then install `dwrite` for force feed back to work correctly
        `protontricks 244210 winecfg`
    4. In Steam, create a non-steam game entry, pointing target to the url of `Content Manager.exe`. Beware of the space in path, need to double quote in steam settings.
    5. Set the launch option of Content Manager to use the same proton prefix as the original game:
        `STEAM_COMPAT_DATA_PATH=$HOME/.local/share/Steam/steamapps/compatdata/244210 %command%`
    6. Choose the same compatibility option as the main game, e.g. cachyos-proton or Proton Experimental.


# Trouble Shoot

## having some weird exception, in Settings > Assetto Corsa > Audio, or when search settings

It is due to corrupted game files or when installing multiple copies of CSP into the extensions folder, corrupting some files.
Solution is to delete the extensions directory entirely. If not sure that will delete any game files, wipe the whole game and reinstall CSP.
You can just click the button in content manager, it will should be successful.

