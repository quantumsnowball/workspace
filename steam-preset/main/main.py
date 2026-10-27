import importlib
import logging
import os
import pkgutil
from typing import Annotated

import typer
from typer import Argument, Exit

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

app = typer.Typer(
    name='steam-preset',
    help='Intercept and modify Steam game launches with custom presets.',
)


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

        # register module by its key attribute if defined
        if isinstance(module, Preset):
            registry[str(module.key)] = module
            logger.info(f'Discovered {module}')
    #
    return registry


@app.command()
def main(
    steam_cmd: Annotated[list[str] | None, Argument(help="The target command vector passed by Steam's %command% expansion.",), ] = None,
) -> None:
    # extract %command%
    if steam_cmd is None:
        logger.error('No %command% detected. Use `steam-preset %command%` as launch options.')
        raise Exit(code=1)

    # parse key
    key = os.environ.get('SteamAppId', 'default')
    logger.debug(f'{key=}')

    # discover presets dynamically and pick by matching app_id
    registry = discover_presets()
    preset = registry.get(key)
    if preset is None:
        logger.warning('No preset is loaded, steam-preset has no effect')
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
