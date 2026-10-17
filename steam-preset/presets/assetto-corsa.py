from main.types import *

app_id = 244210

wrappers = ['mangohud', ]


def config(
    steam_env: Env,
    steam_cmd: Cmd,
    preset_env: Env,
    preset_wrappers: Wrappers,
    preset_args: Args,
) -> tuple[Env, Cmd]:

    # env
    env = steam_env | preset_env

    # cmd
    if steam_env.get('ASSETTO_CORSA_ORIGINAL_LAUNCHER') == '1':
        cmd = preset_wrappers + steam_cmd + preset_args
    else:
        content_manager_cmd = steam_cmd[:-1] + [steam_cmd[-1].replace('AssettoCorsa.exe', 'Content Manager Safe.exe'), ]
        cmd = preset_wrappers + content_manager_cmd + preset_args

    #
    return env, cmd
