APP_ID = '2889220'

ENV = {
    'MANGOHUD': '1',
}

ARGS = [
]


def setup(
    env: dict[str, str],
    args: list[str]
) -> tuple[dict[str, str], list[str]]:
    #
    # extra modifying or filtering logics
    #
    return env, args
