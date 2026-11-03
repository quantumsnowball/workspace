# Kanata on Windows

## how to target specific device by hardware ID

- Go to <https://github.com/oblitum/Interception> and download the intercept driver
- unzip and then run the installer using a root powershell terminal
- reboot
- copy the x64 version of the `interception.dll` along side with the windows kanata binaries
- add an empty `windows-interception-keyboard-hwids` inside `defcfg`
- from now on, run the intercept version of the windows binary to load the config
- press the device and the terminal should print out a long string of hwid in digit format
- use that as the id in the `windows-interception-keyboard-hwids` field
- unplug and replug the USB device to confirm kanata can specifically target your device

