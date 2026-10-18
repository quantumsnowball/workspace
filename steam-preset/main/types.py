from typing import Protocol, runtime_checkable

Env = dict[str, str]
Wrapper = list[str]
Arg = list[str]
Cmd = list[str]

__all__ = ['Env', 'Wrapper', 'Arg', 'Cmd', ]


@runtime_checkable
class Preset(Protocol):
    # uniquely identify a Steam game
    app_id: int | str


@runtime_checkable
class PresetWithEnv(Preset, Protocol):
    # env to be set, usually comes before %command%
    env: Env


@runtime_checkable
class PresetWithWrapper(Preset, Protocol):
    # wrapper to be set, usually comes before %command%
    wrapper: Wrapper


@runtime_checkable
class PresetWithArg(Preset, Protocol):
    # arg to be set, usually comes after %command%
    arg: Arg


@runtime_checkable
class PresetConfigurable(Preset, Protocol):
    # function receives everything needed to understand the current launch environment
    # use these infos to construct the final env and cmd to run the game
    def config(
        self,
        steam_env: Env,
        steam_cmd: Cmd,
        preset_env: Env,
        preset_wrapper: Wrapper,
        preset_arg: Arg,
    ) -> tuple[Env, Cmd]:
        ...
