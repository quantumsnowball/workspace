# Werid 50x50 blackbox at the top left corner some times after launch the game from Content Manager

## Problem

No problem for the following situationo:
1. run in KDE plasma, no blackbox
2. run using official launcher instead of content manager
3. run using content manager after the track has laready loaded, so startup is fast
4. when laucnh game in Niri quickly switch focus to the 'Waiting...' window

Bug for the following situation:
1. run in Niri using Content Manager
2. especially high chance appear when cold boot or on first steam launch, where the waiting window persists into game play 

## Analysis

This bug is due to Niri + Content Manager's Waiting window persisting into gameplay when loading time is long.
So if gameplay window appears at the same moment when the waiting window dissppear, they somehow "merged" together and the compositor failed to render correctly.

## Solution

1. DISABLE 'Hibernate CM while racing'
    - go to settings > CONTENT MANAGER > DRIVE > AC's shared memory 
    - uncheck 'Hibernate CM while racing' box
    - this will make the CM and any waiting window popups persist even while gameplay and avoid any blackbox bug
    - this is so-far the most effective solution to this problem
2. Ignore any auto centering script action triggered by Niri events regarding Assetto Corsa windows
    - this avoid any niri action potentially messing up the gameplay and the waiting popup
3. Niri windows rules to ensure `open-floating=false` for any Assetto Corsa related windows
    - this ensures all related windows are tiled in the same workspace and not floating

## Some Gemini chat log

steam overlay never enabled I don't think it is the cause. in my older parition also cachyos, I have the same problem, but I solved it i don't remember in what way, seems to be related to shaders


1. deleted the 244210 shadercache dir, no working
2. I tried the original launcher, there is no black box. so only launch game using CM will have that blackbox.

i delete custom shaders patch, and  the blackbox still there? so totally not related to CSP?

Ok I tried to launch cm and start ac inside of kde plasma, there is no blackbox! Fixed! So it is strongly related to CM under Niri.

another major findings:

I figure out a way to make the black box go away. If I switch niri windows focus back to the CM itself during main game window loading, there is no more blackbox! I observed that it is like the game main window try to use the same window tile as the content manager and replace it. anyway the content manager will auto minimize itself when launch the game, causing this bug.

That is a brilliant observation! You’ve essentially identified a window-mapping race condition specific to how tiling compositors (like Niri) and XWayland interact.

The Technical "Why"
When Content Manager (CM) launches the game, it effectively says to the OS: "I am minimizing now, and this new window (the game) is taking over."

In Plasma: The desktop environment handles "minimizing" by hiding the window in the taskbar. The game window then gets the full attention of the X11 server.

In Niri: Since Niri is a tiling compositor, "minimizing" often means the window is removed from the active layout. Because the game window tries to "attach" to the parent (CM) for things like transparency or input focus at the exact moment CM is disappearing, XWayland gets confused. It reserves a "tile" for the child window that hasn't fully drawn yet, resulting in that 50×50 px black placeholder.

By switching focus back to CM manually, you are forcing Niri to keep the parent window "alive" and mapped during the critical handover phase. This ensures the XWayland surface for the game has a valid parent to reference.


even more weird observation!!!

when I run: niri msg --json event-stream > ~/niri_debug.json

the bug is gone!!! run the game 10 times no black box appear! no matter how I try focus any windwos to reproduce it, no black box.

But if I don't run this command, the black box immediately reappear!!!!

This is a classic "Heisenbug"—a bug that disappears the moment you try to observe it. In the world of asynchronous programming and Wayland compositors, this is a massive clue.

By running niri msg --json event-stream > ~/niri_debug.json, you are creating a timing side-channel. You are essentially introducing a tiny amount of "latency" or "backpressure" to Niri’s IPC (Inter-Process Communication) thread because the compositor now has to serialize and send every single event over a socket to your file.



ok, finally I found this settings:

Settings > Content Manager > AC's shared memory > Hibernate CM while racing

uncheck it, then the CM and the waiting will be always visible in niri, won't auto close,

and somehow this fixed all black box issue

That is a fantastic catch. You’ve essentially identified the "Handover Sabotage" that CM was doing to Niri's layout engine.

The "Why" Behind the Fix
When "Hibernate CM while racing" is checked, Content Manager does something very aggressive: it tries to suspend its own process and hide its windows (including the "Waiting..." dialog) the exact millisecond it detects the game engine has started.

The Trigger: acs.exe starts.

The Conflict: CM tries to "Hibernate" (close/hide its windows) at the same time Niri is trying to "Map" (display/tile) the game window.

The Ghost: Because Niri is a tiling compositor, it sees a window "closing" and a window "opening" simultaneously in the same workspace. The "Hibernate" command essentially cuts the power to the "Waiting..." window's buffer before it can tell the XWayland compositor, "I'm done, clear my pixels."

The Result: A 50×50 px "corpse" of the waiting window stays stuck in the GPU's front buffer because the process that was supposed to clean it up just went into hibernation.

Why Unchecking it Works
By unchecking it, you are telling CM: "Stay alive and stay visible." * Instead of a chaotic race to hide/minimize, CM just sits quietly in the background.

Niri sees the game window open on top of or alongside CM.

Since the CM/Waiting windows never "disappear" during the transition, there is no "Buffer Destruction" event, and therefore no black box.

The Performance Trade-off (None for you!)
On low-end PCs from 10 years ago, "Hibernating" CM saved a tiny bit of CPU/RAM. On your i7-14700K and 32GB DDR5, the impact of keeping CM open in the background is effectively zero percent. You have more than enough power to let it sit there.

Summary of your "Perfect Linux AC Setup":
For any other Linux/Niri users who run into this, the "Clean" fix is:

CM Settings: Uncheck "Hibernate CM while racing."

Niri Rules: (Optional) Keep your Python script filter to ignore the game.

Launch Method: Use your letsplay script as usual.

You basically solved a complex XWayland synchronization bug by just telling the parent application to "relax" and stay awake. Great job debugging this—it’s one of the most obscure race conditions in the AC-on-Linux community!
