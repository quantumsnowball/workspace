#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "typer",
# ]
# ///

import typer


def main(
    width: int,
    height: int,
    pixel_clock_mhz: float,
    h_blanking: int,
    v_blanking: int,
) -> None:
    # compute exact vertical refresh rate from edid timing totals
    h_total = width + h_blanking
    v_total = height + v_blanking
    pixel_clock = pixel_clock_mhz * 1_000_000
    refresh_rate = pixel_clock / (h_total * v_total)
    print(f'{refresh_rate=:.6f}')


if __name__ == '__main__':
    typer.run(main)
