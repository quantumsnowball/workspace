#!/bin/sh


# Iterate through each argument and run them using `niri msg action`, break on non 0 exit
for cmd in "$@"; do
    niri msg action "$cmd" || break
done
