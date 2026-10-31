from typing import NotRequired, Protocol, TypedDict, runtime_checkable

Env_ = dict[str, str | int]
Env = dict[str, str]
Wrapper_ = list[str | int]
Wrapper = list[str]
Arg_ = list[str | int]
Arg = list[str]
Cmd = list[str]
KeyMap = dict[int, int]


class KeyMapper(TypedDict):
    source: str
    target: NotRequired[str]
    key_map: KeyMap


__all__ = ['Env_', 'Env', 'Wrapper_', 'Wrapper', 'Arg_', 'Arg', 'Cmd', 'KeyMapper',]


@runtime_checkable
class Preset(Protocol):
    # uniquely identify a Steam game
    # could be provided via the --key flag, or fall back to steam app id
    key: int | str


@runtime_checkable
class PresetWithEnv(Preset, Protocol):
    # env to be set, usually comes before %command%
    env: Env_


@runtime_checkable
class PresetWithWrapper(Preset, Protocol):
    # wrapper to be set, usually comes before %command%
    wrapper: Wrapper_


@runtime_checkable
class PresetWithArg(Preset, Protocol):
    # arg to be set, usually comes after %command%
    arg: Arg_


@runtime_checkable
class PresetWithKeyMapper(Preset, Protocol):
    key_mapper: KeyMapper


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


@runtime_checkable
class PresetInitializable(Preset, Protocol):
    def init(self) -> None:
        ...
