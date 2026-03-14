# Google Chrome on Linux

## BUG: google chrome failed to get Chrome Safe Store from kwalletd6

Solution:
1. must tell google to use kwallet6, run:

`google-chrome-stable --password-store=kwallet6`

2. create user desktop override for google-chrome-stable

```
mkdir -p ~/.local/share/applications
cp /usr/share/applications/google-chrome.desktop ~/.local/share/applications/
```

Find all lines starting with Exec= and append your flag before the %U or other arguments.

Change: `Exec=/usr/bin/google-chrome-stable %U`
To: `Exec=/usr/bin/google-chrome-stable --password-store=kwallet6 %U`

(Note: There are usually three Exec= lines in the file; update all of them.)
