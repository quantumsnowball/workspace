# EDID Virtual Monitor

KMS operates at the Linux kernel DRM level (/dev/dri/card1).
It grabs framebuffers directly off a hardware display engine's CRTC
(Cathode Ray Tube Controller / hardware display pipeline).
The EDID-forced output (DP-1) is backed by a real physical hardware CRTC pipeline
on your dGPU. Sunshine can directly tap into that pipeline via DMA-BUF without
bothering Niri's render loop.

# How to create a EDID virtual monitor

1. create and download an EDID binary file using an online tool:
    * <https://edid.build/>
    * <https://edidcraft.com/>
    * <https://thyge.github.io/edid-editor/>
    Then save it as `dp-1.bin`
2. copy the file into the firmware directory:
    ```
    sudo cp ~/Downloads/dp-1.bin /usr/lib/firmware/edid/dp-1.bin
    sudo chmod 644 /usr/lib/firmware/edid/dp-1.bin
    ```
3. update initramfs image
    - Ensure /etc/mkinitcpio.conf contains the binary path in FILES:
    ```
    FILES=(/usr/lib/firmware/edid/dp-1.bin)
    ```
4. add bootloader kernel parameters
    - in /etc/default/limine, find the kernel command line that looks like this
    ```
    KERNEL_CMDLINE[default]+="......"
    ```
    - append `drm.edid_firmware=DP-1:edid/dp-1.bin video=DP-1:e` to the end of the value, so it becomes
    ```
    KERNEL_CMDLINE[default]+="...... drm.edid_firmware=DP-1:edid/dp-1.bin video=DP-1:e"
    ```
5. regenerate initramfs:
    ```
    limine-mkinitcpio
    # or
    sudo mkinitcpio -P
    ```
6. view `/boot/limine.conf` and confirm the new entry is added into the config file
    ```
    sudo cat /boot/limine.conf
    ```
    confirm the linux boot entry, the cmdline value has been appended
7. reboot, and confirm the virtual monitor exists
    ```
    niri msg outputs
    ```

# Supported Resolution

- s7
    - 1920x1200 120hz
    - 2560x1600 120hz
- quest2
    - 1859x1487 120hz
    - 1920x1440 120hz
    - 2217x1247 120hz
