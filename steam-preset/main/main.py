import importlib
import logging
import os
import pkgutil
import sys

import presets
from main.types import (
    Args,
    Env,
    Preset,
    PresetConfigurable,
    PresetWithArgs,
    PresetWithEnv,
    PresetWithWrappers,
    Wrappers,
)

Registry = dict[str, Preset]

logging.basicConfig(level=logging.INFO, format='[ %(name)s ]: %(levelname)s: %(message)s')
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

        # register module by its app_id attribute if defined
        if isinstance(module, Preset):
            registry[str(module.app_id)] = module
            logger.info(f'Discovered {module}')
    #
    return registry


# the main console script entry
def run() -> None:
    # extract %command%
    target_cmd = sys.argv[1:]
    if not len(sys.argv) > 1:
        logger.error('No %command% detected. Use `steam-preset %command%` as launch options.')
        sys.exit(1)

    # parse app_id
    app_id = os.environ.get('SteamAppId', 'default')
    logger.debug(f'{app_id=}')

    # discover presets dynamically and pick by matching app_id
    registry = discover_presets()
    preset = registry.get(app_id)
    if preset is None:
        logger.warning(f'No preset is loaded, steam-preset has no effect')
    else:
        logger.debug(f'Preset loaded from registry: {preset=}')

    # run preset extra logics to filter or modify env and args
    extra_env: Env = preset.env.copy() if isinstance(preset, PresetWithEnv) else {}
    extra_wrappers: Wrappers = preset.wrappers.copy() if isinstance(preset, PresetWithWrappers) else []
    extra_args: Args = preset.args.copy() if isinstance(preset, PresetWithArgs) else []
    if isinstance(preset, PresetConfigurable):
        extra_env, extra_wrappers, extra_args = preset.config(extra_env, extra_wrappers, extra_args)
    logger.info(f'{extra_env=}')
    logger.info(f'{extra_wrappers=}')
    logger.info(f'{extra_args=}')

    # construct the final version of cmd and env
    full_env = os.environ.copy()
    full_env.update(extra_env)
    full_cmd = extra_wrappers + target_cmd + extra_args
    logger.debug(f'{full_env=}')
    logger.info(f'{full_cmd=}')

    # exec
    os.execvpe(full_cmd[0], full_cmd, full_env)
