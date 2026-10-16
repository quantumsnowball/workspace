

class Screen:
    def __init__(self, width: int, height: int) -> None:
        self.width = width
        self.height = height
        self.pixel_count = width*height
        self.aspect_ratio = width/height
        self.resolution = f'{self.width:>4d}x{self.height:<4d}'

    def __str__(self) -> str:
        return f'{self.resolution} = {self.pixel_count:,d} px'

    def scale_by(self, factor: float) -> Screen:
        return Screen(round(self.width*factor), round(self.height*factor))

    def scale_to(self, target_pixel_count: int) -> float:
        pixel_count_factor = target_pixel_count / self.pixel_count
        length_factor = pixel_count_factor ** 0.5
        return length_factor


class UltrawideMonitor(Screen):
    WIDTH = 2560
    HEIGHT = 1080

    def __init__(self) -> None:
        super().__init__(self.WIDTH, self.HEIGHT)


class Quest2(Screen):
    WIDTH = 1832*2
    HEIGHT = 1920

    def __init__(self) -> None:
        super().__init__(self.WIDTH, self.HEIGHT)
        self.left_screen = Screen(self.WIDTH//2, self.HEIGHT)
        self.right_screen = Screen(self.WIDTH//2, self.HEIGHT)
        self.screens = (self.left_screen, self.right_screen)


def main():
    monitor = UltrawideMonitor()
    print(f'\nUltrawideMonitor    {monitor}')
    headset = Quest2()
    print(f'\nQuest 2 (per eye)   {headset.left_screen}')
    print('\nVR scale factor:')
    for factor in range(100, 40, -10):
        print(f'Quest 2 ({factor:>5.1f}%)    {headset.scale_by(factor/100)}')
    # target to scale down VR render to monitor pixel count
    target_factor = headset.scale_to(monitor.pixel_count)
    print(f'\nTarget VR scale factor to achieve the same pixel count of main monitor: {target_factor:.3%}')
    print(f'\nQuest 2 ({target_factor:6.1%})    {headset.scale_by(target_factor)}\n')


if __name__ == '__main__':
    main()
