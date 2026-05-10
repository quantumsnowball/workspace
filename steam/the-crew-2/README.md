# The Crew 2

## How to play on linux

Can't directly launch in linux because the BattleEye anti cheat failed to launch in linux.
But it is required to launch game before I can select to play even in offline mode.
Real solution is for ubisoft to allow BattleEye to be able to launch on Linux.
But It looks like ubisoft is not really working on a fix on this, and probably will stay this way for long time.

So right now the only solution is actually to pirate the game.
This is the only way to bypass BattleEye and launch the game in offline mode.

Steps:
1. Install the legit copy of the game in Steam.
2. Find a pirated version torrent of the game. (I download from <gamepcfull.com>)
3. Don't need to download the full pirated game, just need the _crack/ folder. 
4. copy the _crack/ content into the original game directory. I have copied these files:
    1. BattlEye/BEClient_x64.dll
    2. d3dgear64.dll
    3. RUNE.ini
    4. TheCrew2_BE.exe
    5. uplay_r1_loader64.dll
    6. uplay_r1_loader64.rne
5. Then need to open up RUNE.ini and edit the username you want.
6. add the following launch option to steam:
    `WINEDLLOVERRIDES="uplay_r1_loader64=n,b;d3dgear64=d" %command%`
7. first time to launch the game without the offline save, the game will start from the beginning.
8. can also import an existing save file to `Documents/The Crew 2/Save/<AccountId>/` in the proton prefix.
9. anyways, this can only play the offline version, and cannot sync back the progress to online version anyways.
9. well, unless ubisoft is willing to fix the BattleEye on Linux, otherwise its just better to play the pirated version instead.

## Why steering axis not detected?

Using PXN-V99 steering wheel in x-input mode, it is just a normal x-box 360 gamepad device.
However, even I was able to select the axis of steering using the device,
on gameplay the steering axis was not working.

Solution was actually to toggle the physical button between 270 degrees and 900 degrees mode.
When toggle to 270 degrees, need to move the wheel to allow some signal to be picked up by the game.
Then toggle back to 900 degrees mode should finally activate the wheel axis being detected.
Right now I don't know the cause of this bug, for sure this only happen on Linux not on Windows.
May be it is x-input driver problems. Later I should find a better driver like the d-input device.
