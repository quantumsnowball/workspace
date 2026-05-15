# how to install chinese input method in Linux

1. install `fcitx5-im`
    - this is the core imput method interface for other lang interface
    - after installation, you should see a new fcitx tray icon where you can config
    - now if you install `fcitx5-table-extra` there will be a basic version of cangjie available, but that is legacy, suggest you skip it
2. install `fcitx5-rime`
    - this is the fcitx5 wrapper to enable rime input methods which are way more advanced
    - after installation, you should see a new Available Input Method call `Rime`, add it to the left
3. switch to the input method, press ctrl+` should be able to change among rime input methods
    - a better version of cangjie is available, you can already type chinese
4. install `rime-cantonese`
    - this is a rime version of jyutping, support very smart features
    - docs at <https://jyutping.net/>
5. may need to custom the yaml config to make `rime-cantonese` selectable
    - just run the install script to stow the the `default.custom.yaml`
    - then restart fcitx and also click deploy and sync in rime to take effect
    - the rime should only show cangjie and jyutping now
