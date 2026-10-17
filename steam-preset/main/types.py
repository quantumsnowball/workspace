from typing import Protocol, runtime_checkable

Env = dict[str, str]
Wrappers = list[str]
Args = list[str]


@runtime_checkable
class Preset(Protocol):
    # uniquely identify a Steam game
    app_id: str


@runtime_checkable
class PresetWithEnv(Preset, Protocol):
    # env vars to be set, usually comes before %command%
    env: Env


@runtime_checkable
class PresetWithWrappers(Preset, Protocol):
    # wrappers to be set, usually comes before %command%
    wrappers: Wrappers


@runtime_checkable
class PresetWithArgs(Preset, Protocol):
    # args to be set, usually comes after %command%
    args: Args


@runtime_checkable
class PresetConfigurable(Preset, Protocol):
    def config(
        self,
        env: Env,
        wrappers: Wrappers,
        args: Args,
    ) -> tuple[Env, Wrappers, Args]:
        ...
