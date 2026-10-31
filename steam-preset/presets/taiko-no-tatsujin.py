from evdev import ecodes as e

key = 'taiko-no-tatsujin'

key_mapper = dict(
    source='Pure: kanata',
    key_map={
        # left
        e.KEY_X: e.KEY_Z,

        # right
        e.KEY_APOSTROPHE: e.KEY_K,
        e.KEY_DOT: e.KEY_J,
        e.KEY_SLASH: e.KEY_J,
    }
)
