# Problem: Signal 9 - occasionally some process being killed by Android 

That consistency points directly to Android's OS-level process management. Since Android 12, Google enforces the Phantom Process Killer across all Android devices (phones, tablets, Meta Quest OS). It silently issues a SIGKILL (Signal 9) to Termux whenever background process count or CPU usage crosses system thresholds.
Here is how to stop Android from killing your Termux background sessions across your devices:

## Solution: Disable Child Process Restrictions (Android 14+)
If your phone, tablet, or Quest runs Android 14 or newer, you can disable this mechanism directly in system settings without needing a PC or ADB:
 * Go to Settings \rightarrow About Phone / Tablet / Device.
 * Tap Build Number 7 times to enable Developer Options.
 * Go to Settings \rightarrow System \rightarrow Developer Options.
 * Locate and enable Disable child process restrictions.
 * Reboot the device.

## Stress Test
To test whether the Phantom Process Killer is truly disabled, trigger the condition that originally caused Android to issue Signal 9.
By default, Android kills background apps if they exceed 32 child processes or if a background process consumes excessive CPU over time.
Step 1: Run the Process Limit Stress Test
Run this loop inside Termux to spawn 45 background processes (well over the default 32 limit):
```bash
for i in $(seq 45); do sha256sum /dev/zero & done
```

 * Run the command above in Termux.
 * Put Termux into the background (switch to another app or go to your Quest/Phone home screen).
 * Wait 3 mins.
 * Reopen Termux and check the terminal state.
Step 2: Evaluate the Result
 * SUCCESS (Fix is Working): The terminal prompt is still open, processes are still listed in top or ps -ef, and you do not see [Process completed (signal 9) - press Enter].
 * FAILURE (Kill Triggered): Termux closed or displayed [Process completed (signal 9) - press Enter].
Step 3: Clean Up Test Processes
After running the test, stop the background background tasks so they don't drain your battery or heat up the CPU:
```bash
killall sha256sum
```


