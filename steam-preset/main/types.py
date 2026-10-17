from typing import Callable, Protocol, runtime_checkable

Env = dict[str, str]
Wrappers = list[str]
Args = list[str]
SetupFn = Callable[
    [Env, Wrappers, Args],
    tuple[Env, Wrappers, Args],
]


@runtime_checkable
class Preset(Protocol):
    # uniquely identify a Steam game
    APP_ID: str

    # env vars to be set, usually comes before %command%
    ENV: Env

    # wrappers to be set, usually comes before %command%
    WRAPPERS: Wrappers

    # args to be set, usually comes after %command%
    ARGS: Args

    # optional setup function for extra processing
    setup: SetupFn | None = None
