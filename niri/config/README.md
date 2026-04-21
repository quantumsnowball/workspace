# Niri Config

## Trouble shooting

### KDE plasma cannot be launch, stuck in the splash screen, and finally land on black screen with a cursor

Problem:

When login into Niri, then logout, and try to login to KDE plasma, it will crash and stuck there with a cursor.
Even TTY may not work at all. But running `dbus-run-session startplasma-wayland` will work, showing there is no problem with KDE config.
Found that it is about the plasmalogin crashing after the login, related logs from plasmalogin.service is as follows:

```

Apr 21 22:22:32 CachyOS plasmalogin-helper[1308]: Starting Wayland user session: "/usr/share/plasmalogin/scripts/wayland-session" "/usr/lib/plasma-dbus-run-session-if-needed /usr/bin/startplasma-wayland"
Apr 21 22:22:32 CachyOS plasmalogin[1172]: Session started true
Apr 21 22:22:38 CachyOS plasmalogin[1172]: Greeter stopping...
Apr 21 22:22:38 CachyOS plasmalogin[1172]: Auth: plasmalogin-helper exited with 255
Apr 21 22:22:38 CachyOS plasmalogin[1172]: Greeter stopped. PLASMALOGIN::Auth::HelperExitStatus(255)
Apr 21 22:22:52 CachyOS plasmalogin[1172]: Authentication error: PLASMALOGIN::Auth::ERROR_INTERNAL "Process crashed"
Apr 21 22:22:52 CachyOS plasmalogin[1172]: Auth: plasmalogin-helper (--socket /tmp/plasmalogin-auth-b48e4a8a-9fb5-4932-b9be-a6fa9e3831b9 --id 1 --start /usr/lib/plasma-dbus-run-session-if-needed /usr/bin/startplasma-wayland --user $USER) crashed (>
Apr 21 22:22:52 CachyOS plasmalogin[1172]: Authentication error: PLASMALOGIN::Auth::ERROR_INTERNAL "Process crashed"
Apr 21 22:22:52 CachyOS plasmalogin[1172]: Auth: plasmalogin-helper exited with 1
Apr 21 22:22:52 CachyOS systemd[1]: Stopping Plasma Login Manager...
░░ Subject: A stop job for unit plasmalogin.service has begun execution
░░ Defined-By: systemd
░░ Support: https://lists.freedesktop.org/mailman/listinfo/systemd-devel
░░
░░ A stop job for unit plasmalogin.service has begun execution.
░░
░░ The job identifier is 3426.
Apr 21 22:22:52 CachyOS plasmalogin[1172]: Signal received: SIGTERM
Apr 21 22:22:52 CachyOS plasmalogin[1172]: Socket server stopping...
Apr 21 22:22:52 CachyOS plasmalogin[1172]: Socket server stopped.
```

Solution:

End up I found that it is the `niri-xembedsniproxy.service` that I made earlier being the root of problem.
Solution was to put it back to `spwan-at-startup` and let Niri handle its life cycle.
Otherwise if xembedsniproxy refuses to die even niri is dead, it will hold up the `DBUS_SESSION_BUS_ADDRESS`.

Also, later I found that the service `niri-center-visible-columns` is also causing the same problem.
Especially the WantedBy='niri.service' settigns seems to cause conflict to `DBUS_SESSION_BUS_ADDRESS`.
Until now I don't find a better systemd unit settings that can guarantee its birth and death with niri.service.
So I will just make another `spwan-at-startup` and point directly to execute this python script with shebang.

Analysis:

plasmalogin tried to run this command:

```
/usr/share/plasmalogin/scripts/wayland-session /usr/lib/plasma-dbus-run-session-if-needed /usr/bin/startplasma-wayland
```

`wayland-session` and `plasma-dbus-run-session-if-needed` are just shell scripts that do some checking.
`startplasma-wayland` is the real binary to start KDE plasma.
Go checkout wayland-session, it is not the problem, it just decided what you default shell is and use the correct syntax to launch.
But plasma-dbus-run-session-if-needed is the one who matter.
Go check it out and it is as follows:

```
❯ cat /usr/lib/plasma-dbus-run-session-if-needed
#!/bin/sh
# Usage: plasma-dbus-run-session-if-needed PROGRAM [ARGUMENTS]
# If the session bus is not available it is spawned and wrapper round our program
# Otherwise we spawn our program directly
drs=
if [ -z "${DBUS_SESSION_BUS_ADDRESS}" ]
then
    drs=dbus-run-session
fi
exec ${drs} "$@"
```

As you can see, it check on DBUS_SESSION_BUS_ADDRESS, try to reuse it if it exists by calling `dbus-run-session`.
But if this check failed for some reason, such as when niri-xembedsniproxy.service was holding it.
Then the procress will fail and KDE plasma failed to launch.
By disabling this service, KDE plasma can login normally.
Also any other service that call WantedBy or BindsTo niri.service may also cause problem.
Disable these services will solve the problem.

