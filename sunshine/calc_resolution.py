def resolution(
    aspect_ratio: float,
    pixel_count: int = 2_764_800,
) -> tuple[int, int]:
    h = (pixel_count/aspect_ratio)**0.5
    w = h*aspect_ratio
    return round(w), round(h)


def main() -> None:
    width = 2560
    height = 1080
    pixel_count = width*height

    print(f'Main monitor is {width}x{height}')
    print(f'Total pixel count is {round(pixel_count):,.0f}')

    # aspect ratios
    aspect_ratios = [
        (1, 1),
        (4, 3),
        (3, 2),
        (16, 10),
        (16, 9),
        (2, 1),
        (21, 9),
        (21, 10),
        (22, 9),
        (22, 10),
        (64, 27),
    ]
    aspect_ratios.sort(key=lambda r: r[0]/r[1])
    print('\nResolution with the same pixel count:')
    for r_w, r_h in aspect_ratios:
        ratio = r_w/r_h
        res_h, res_w = resolution(ratio, pixel_count)
        # confirm the pixel count closely match the origianl pixel count
        assert abs(res_h*res_w/pixel_count-1) < 0.01
        # print result
        print(f'{r_w:2d}:{r_h:2d} ({round(ratio, 3):.3f}) {res_h}x{res_w}')


if __name__ == '__main__':
    main()
