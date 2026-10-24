import importlib
import logging
import os
import pkgutil
import sys

import presets
from main.types import (
    Arg,
    Arg_,
    Env,
    Env_,
    Preset,
    PresetConfigurable,
    PresetWithArg,
    PresetWithEnv,
    PresetWithWrapper,
    Wrapper,
    Wrapper_,
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
    steam_cmd = sys.argv[1:]
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

    # load preset extras
    preset_env_: Env_ = preset.env.copy() if isinstance(preset, PresetWithEnv) else presets.default.env
    preset_env: Env = {str(k): str(v) for k, v in preset_env_.items()}
    preset_wrapper_: Wrapper_ = preset.wrapper.copy() if isinstance(preset, PresetWithWrapper) else presets.default.wrapper
    preset_wrapper: Wrapper = [str(v) for v in preset_wrapper_]
    preset_arg_: Arg_ = preset.arg.copy() if isinstance(preset, PresetWithArg) else presets.default.arg
    preset_arg: Arg = [str(v) for v in preset_arg_]
    logger.info(f'{preset_env=}')
    logger.info(f'{preset_wrapper=}')
    logger.info(f'{preset_arg=}')

    # construct the final version of cmd and env
    if isinstance(preset, PresetConfigurable):
        steam_env = os.environ.copy()
        env, cmd = preset.config(steam_env, steam_cmd, preset_env, preset_wrapper, preset_arg)
    else:
        env = os.environ | preset_env
        cmd = preset_wrapper + steam_cmd + preset_arg
    logger.debug(f'{env=}')
    logger.info(f'{cmd=}')

    # run the game
    os.execvpe(cmd[0], cmd, env)
