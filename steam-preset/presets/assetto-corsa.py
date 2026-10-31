from steam_preset.types import *

key = 244210


def config(
    steam_env: Env,
    steam_cmd: Cmd,
    preset_env: Env,
    preset_wrapper: Wrapper,
    preset_arg: Arg,
) -> tuple[Env, Cmd]:

    # env
    env = steam_env | preset_env

    # cmd
    #   There are two ways to launcher the origianl launcher instead of Content Manager:
    #   1. use the flag --original-launcher (officially supported by Content Manager)
    #   2. set ASSETTO_CORSA_ORIGINAL_LAUNCHER=1 (but existing steam process may not have acces to this)
    if steam_env.get('ASSETTO_CORSA_ORIGINAL_LAUNCHER') == '1':
        cmd = preset_wrapper + steam_cmd + preset_arg
    else:
        content_manager_cmd = steam_cmd[:-1] + [steam_cmd[-1].replace('AssettoCorsa.exe', 'Content Manager Safe.exe'), ]
        cmd = preset_wrapper + content_manager_cmd + preset_arg

    #
    return env, cmd
