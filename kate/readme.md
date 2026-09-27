# Kate

The KDE texxt editor.

## How to use it as a draft pad?

- Settings -> Configure Kate -> Session:
    - Session Management tab, select:
        - Load last used session
    - Application Startup/Shutdown Behavior tab, check:
        - Newly-created unsaved files
        - Files with unsaved changes
- Sessions -> New Session:
    - Save Session, pick a name, e.g. 'Draft'
    - type anything on the empty document
    - close the Kate window, it should not prompt for save or discard
    - open Kate again, your text should be restored
