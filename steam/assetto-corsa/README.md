# Assetto Corsa


## Run the original launcher

- As of 2026-03-24, in CachyOS, directly press Play in Steam will launch the original game with no problem
- It will launch ProtonFixes itself and fix the broken things.


## Run Content Manager

- Install:
    * Choose the same compatibility option as the main game, e.g. cachyos-proton or Proton Experimental.
        Try a lower version if it doesn't work, e.g. GE-Proton9-20
    * Place `Content Manager.exe` inside the game directory
    * Create a symlink to steam's loginusers.vdf, target to the pfx's config dir:
        `ln -s ~/.steam/root/config/loginusers.vdf "$HOME/.local/share/Steam/steamapps/compatdata/244210/pfx/drive_c/Program Files (x86)/Steam/config/loginusers.vdf"`
    * Tell Steam how to launch Content Manger:
        * In Steam, create a non-steam game entry, pointing target to the url of `Content Manager.exe`. Beware of the space in path, need to double quote in steam settings.
        Then Set the launch option of Content Manager to use the same proton prefix as the original game:
        `STEAM_COMPAT_DATA_PATH=$HOME/.local/share/Steam/steamapps/compatdata/244210 %command%`
        * Or you can use the Assetto Corsa launcher with custom launch options:
        `c="%command%";sh -c "${c::-17}Content Manager Safe.exe'"`
        (note: don't miss the the single quote after .exe, it must exists to match the opening quote inside %command%)
    * Run winecfg, then install `dwrite`, `dinput8` for force feed back to work correctly
        `protontricks 244210 winecfg`
    * Launch the game, in the init window, the user should already showing your AC user name, set the game director to:
        `Z:\home\<username>\.local\share\Steam\steamapps\common\assettocorsa`

## Failsafe installation script from community

Source: <https://github.com/sihawido/assettocorsa-linux-setup>
This community script will use GE-Proton9-20 as of 2026-03-25 and will install successfully without the patch failure error
Tested to be successful, but need to use GE-Proton9-20, any other newer proton tested and failed to run.

## Proton version tests

* proton-cachyos-10.0.20260320 (steam linux runtime)
    - AC: runs normally (after auto ProtonFixes) 
    - CM: 
        - launch normally, but failed to patch Assetto Corsa
        - sometimes, it is successful! (but may be I created GE-Proton9-20 before, patched many things already); 
* proton-cachyos-10.0-20260320-slr-x86_64_v3
    - AC: runs normally (after auto ProtonFixes) 
    - CM: can be successful (I created GE-Proton9-20 before, may be patched many things already) 
        - ffb wheel work out of the box, may be this version comes with the correct dwrite and dinput8
        - caution: Render Stats does not work! CPU, GPU usage is always zero! broken
* Proton Hotfix (v10.1000-200)
    - AC: failed to launch, pid mismatch error
* Proton Experimental (v10.1000-200)
    - AC: failed to launch, pid mismatch error
* Proton9.0-4
    - AC: failed to launch, pid mismatch error
* GE-Proton10-34
    - AC: runs normally (after auto ProtonFixes) 
    - CM: launch normally, but failed to patch Assetto Corsa
* GE-Proton9-27
    - AC: failed to launch, pid mismatch error
* GE-Proton9-20
    - AC: runs normally (need to install missing fonts, segoeui.ttf)
    - CM: SUCCESS, as suggested by community, this is the only versiion that is guarantee to work perfectly for AC+CM
        - caution: DO NOT use mangohud on this version, CM will stuck at launch. If you need fps and usage monitor, use Render Stats app.

# Trouble Shoot

## having some weird exception, in Settings > Assetto Corsa > Audio, or when search settings

It is due to corrupted game files or when installing multiple copies of CSP into the extensions folder, corrupting some files.
Solution is to delete the extensions directory entirely. If not sure that will delete any game files, wipe the whole game and reinstall CSP.
You can just click the button in content manager, it will should be successful.

## Beware of mangohud, NEITHER enable globally using MANGOHUD=1, nor replacing steam with 'mangohud steam' globally

This will crash the working copy of the GE-Proton9-20 installation and failed to launch the gameplay window.
So always enable mangohud on a per-game basis is the safest way.

## If force feedback of wheel is not working

Run `protontricks 244210 winecfg`, then:
1. Check `dwrite` is enabled in Library, the mode should be 'native, builtin'. Usually will work, if not, then:
2. Check `dinput8` is enabled in Library, the mode should be 'native, builtin'

## More refs

<https://github.com/sihawido/assettocorsa-linux-setup/issues/15>
<https://github.com/ac-custom-shaders-patch/acc-extension-config/issues/316#issuecomment-2631129002>

# Resources

## Car packs

- World Drift Tour, WDT
- Tando Buddies

## Tracks

- Skidpad 0.5

## Apps

- KirbyCam
