# ExKeyMo

This app named ExKeyMo, it can generate a custom layout for physical keyboard, achieving key remapping capabilities or even key combos without root.

# Key Codes And Names
1. default key codes and names 
    - <https://android.googlesource.com/platform/frameworks/base/+/master/data/keyboards/Generic.kl>
    - or locally the `ref/Generic.kl`
2. default key mappings, as enforce by the first line `type OVERLAY`
    - <https://android.googlesource.com/platform/frameworks/base/+/master/data/keyboards/Generic.kcm>
    - or locally the `ref/Generic.kcm`

# Simple Usage

1. Simple setup

- go to <https://ris58h.github.io/exkeymo/simple.html> or host it locally using <https://github.com/ris58h/exkeymo> and navigate to simple.html
- then set the keymap you want
- generate and download the apk
- install in you Android device
- go to physical keyboard, Choose Gboard or Samsung Keyboard
- change the keyboard layout to `ExKeyMo Layout`

2. Complex setup

- go to <https://ris58h.github.io/exkeymo/complex.html> or host it locally using <https://github.com/ris58h/exkeymo> and navigate to complex.html
- paste in you predefined config file there
- click download the apk file
- the rest steps are the same as the simple setup

# Bug

The author actually provide the source code to build the apk, repo is here:
<https://github.com/ris58h/exkeymo>

However, the complex page download button doesn't work as of 2026-09-03, a pull request by some user has already issued but not being merged yet:
<https://github.com/ris58h/exkeymo/issues/1>

Only need to change one line to fix that bug, so I would fork the repo and fix that myself at <https://github.com/quantumsnowball/exkeymo>

## How ExKeyMo Works Under the Hood

Android handles physical keyboards differently than on-screen keyboards. When you press a hardware key, the keyboard controller sends a raw hardware identifier called a Scancode (for example, Caps Lock is scancode 58).
* Android's Key Character Map (.kcm): Android translates scancodes into software actions (like ESCAPE or CAPS_LOCK) using a text file called a Key Character Map (.kcm).  
* Without Root Access: Android doesn't let you directly edit system .kcm files unless you have root.
* The ExKeyMo Trick: Android does allow third-party apps to register and supply additional physical keyboard layouts to the system (similar to how language packs are added). ExKeyMo takes your custom mapping rules, compiles them into a tiny dummy APK containing a custom .kcm file, and registers it with Android's system services.  
* Hardware Driver Level: When you assign ExKeyMo Layout to your physical keyboard, Android interceptively converts scancode 58 into ESCAPE at the Linux/Android driver level before any app (Gboard, Termux, Neovim) receives the signal.  
* This is why it works completely in the background without needing accessibility services, extra RAM, or battery overhead.

