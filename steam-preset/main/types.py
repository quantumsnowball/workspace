from typing import Protocol, runtime_checkable

Env = dict[str, str]
Wrappers = list[str]
Args = list[str]


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


@runtime_checkable
class PresetConfigurable(Preset, Protocol):
    def config(
        self,
        env: Env,
        wrappers: Wrappers,
        args: Args,
    ) -> tuple[Env, Wrappers, Args]:
        ...
