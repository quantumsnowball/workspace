import sys


def main() -> None:
    _, width, height, pixel_clock_mhz, h_blanking, v_blanking = sys.argv
    h_total = int(width) + int(h_blanking)
    v_total = int(height) + int(v_blanking)
    pixel_clock = float(pixel_clock_mhz) * 1_000_000
    refresh_rate = pixel_clock / (h_total * v_total)
    print(f'{refresh_rate=:.6f}')


if __name__ == '__main__':
    main()
