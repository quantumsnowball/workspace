# Wiki

## Playing youtube video is lagging under wayland

- problem
    - on cachyos i use the chrome browser (the youtube pwa) to watch 1440p60 fps recorded by myself. It sometimes feel laggy. but the video is not laggy by itself, when I play it using local player it is smooth. also when I play the video on my tablet or phone it is also full 60 fps smooth. fix?                                       
- solution
    - go to `chrome://flags`, search for `wayland`
    - enable the following item: 
    Wayland session management
    Enable Wayland's xx/xdg-session-management-v1 experimental support. – Linux
    #wayland-session-management
    - usually this is the only item need, if there is any other item applicable, enable them as well


