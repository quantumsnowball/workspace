import importlib
import logging
import os
import pkgutil
import sys
from typing import cast

import presets
from main.types import GamePreset

Registry = dict[str, GamePreset]

logging.basicConfig(level=logging.DEBUG, format='%(name)s: %(levelname)s: %(message)s')
logger = logging.getLogger('steam-preset')


def discover_presets() -> Registry:
    #
    registry: Registry = {}

    # iterate through all python modules in the presets package
    for _, module_name, _ in pkgutil.iter_modules(presets.__path__):
        # resolve full name
        full_name = f'presets.{module_name}'

        # try import the module
        module = importlib.import_module(full_name)
        logger.debug(f'Imported {module}')

        # register module by its APP_ID attribute if defined
        if isinstance(module, GamePreset):
            preset = cast(GamePreset, module)
            registry[preset.APP_ID] = preset
            logger.info(f'Discovered {preset}')
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
    logger.debug(f'{app_id=}')

    # discover presets dynamically and pick by matching APP_ID
    registry = discover_presets()
    preset = registry.get(app_id)
    logger.debug(f'Fetched from registry: {preset=}')

    # run preset extra logics to filter or modify env and args
    env_overrides: dict[str, str] = {}
    extra_args: list[str] = []
    if preset is not None:
        env_overrides = preset.ENV.copy()
        extra_args = preset.ARGS.copy()
        env_overrides, extra_args = preset.setup(env_overrides, extra_args)
        logger.info(f'{env_overrides=}')
        logger.info(f'{extra_args=}')

    # construct the final version of cmd and env
    full_env = os.environ.copy()
    full_env.update(env_overrides)
    final_cmd = target_cmd + extra_args
    logger.debug(f'{full_env=}')
    logger.info(f'{final_cmd=}')

    # exec
    os.execvpe(final_cmd[0], final_cmd, full_env)
