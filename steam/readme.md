# Wiki

## How to prevent non-steam game to link to a steam game?

It usually appear when running the non-steam game, it will show the steam version of it, and display a `PURCHASE` button there.

Solution:

Look at the game directory, see if you find a `steam_appid.txt` file containing the native steam id of the game.
If you find this file, rename or delete it, and steam will no-longer auto link to the non-steam game.
