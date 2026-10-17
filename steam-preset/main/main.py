import importlib
import os
import pkgutil
import sys
from typing import cast

import presets
from main.types import GamePreset

Registry = dict[str, GamePreset]


def discover_presets() -> Registry:
    #
    registry: Registry = {}

    # iterate through all python modules in the presets package
    for _, module_name, _ in pkgutil.iter_modules(presets.__path__):
        # resolve full name
        full_name = f'presets.{module_name}'

        # try import the module
        module = importlib.import_module(full_name)

        # register module by its APP_ID attribute if defined
        if hasattr(module, 'APP_ID'):
            preset = cast(GamePreset, module)
            registry[preset.APP_ID] = preset
    #
    return registry


# the main console script entry
def run() -> None:
    # ensure %command%
    if len(sys.argv) < 2:
        print('Error: No %command% detected. Use `steam-preset %command%` as launch options.')
        sys.exit(1)

    # extract %command%
    target_cmd = sys.argv[1:]

    # parse app_id
    app_id = os.environ.get('SteamAppId', 'default')

    # discover presets dynamically and pick by matching APP_ID
    registry = discover_presets()
    preset = registry.get(app_id)

    # overrides env and args
    env_overrides: dict[str, str] = {}
    extra_args: list[str] = []

    # run preset extra logics to filter or modify env and args
    if preset is not None:
        env_overrides = preset.ENV.copy()
        extra_args = preset.ARGS.copy()
        env_overrides, extra_args = preset.setup(env_overrides, extra_args)
    print(f'DEBUG: {env_overrides=}', flush=True)

    # construct the final version of cmd and env
    full_env = os.environ.copy()
    full_env.update(env_overrides)
    final_cmd = target_cmd + extra_args

    # exec
    os.execvpe(final_cmd[0], final_cmd, full_env)
