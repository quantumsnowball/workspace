# google-chrome-kwallet as a wrapper fix to ensure google chrome can recognize kwallet as password store

1. Create any login session in KDE Plasma session

2. Run the install script to inject google-chrome-kwallet script into /opt/google/chrome/

3. In zshrc, create alias google-chrome-kwallet pointing to this script, so if need to run chrome in the terminal, type google-chrome-kwallet instead of google-chrome or google-chrome-stable

4. Change any application shortcut in ~/.local/share/applications/, edit all .desktop files to use /opt/google/chrome/google-chrome-kwallet, just suffix with -kwallet is enough for most PWA installed.
