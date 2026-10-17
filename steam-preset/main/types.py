from typing import Callable, Protocol, runtime_checkable

Env = dict[str, str]
Wrappers = list[str]
Args = list[str]
SetupFn = Callable[
    [Env, Wrappers, Args],
    tuple[Env, Wrappers, Args],
]


@runtime_checkable
class GamePreset(Protocol):
    # uniquely identify a Steam game
    APP_ID: str

    # env vars to be set, usually comes before %command%
    ENV: dict[str, str]

    # wrappers to be set, usually comes before %command%
    WRAPPERS: list[str]

    # args to be set, usually comes after %command%
    ARGS: list[str]

    # optional setup function for extra processing
    setup: SetupFn | None = None
