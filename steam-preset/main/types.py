from typing import Protocol, runtime_checkable

Env = dict[str, str]
Wrappers = list[str]
Args = list[str]
Cmd = list[str]


@runtime_checkable
class Preset(Protocol):
    # uniquely identify a Steam game
    app_id: int | str


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
    # function receives everything needed to understand the current launch environment
    # use these infos to construct the final env and cmd to run the game
    def config(
        self,
        steam_env: Env,
        steam_cmd: Cmd,
        preset_env: Env,
        preset_wrappers: Wrappers,
        preset_args: Args,
    ) -> tuple[Env, Cmd]:
        ...
