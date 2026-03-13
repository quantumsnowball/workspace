# 
# this is the env activate.d template to setup cudnn in conda
# location: ~/miniconda3/envs/<env-name>/etc/conda/activate.d/env_vars.sh
# 
# use the original libs if possible
# (avoid 'no version information' problem)
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH/usr/lib:/usr/lib/wsl/lib
# then load conda libs
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$CONDA_PREFIX/lib/
# add cuda libs
# CUDNN_PATH=$(dirname $(python -c "import nvidia.cudnn;print(nvidia.cudnn.__file__)"))
# export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$CUDNN_PATH/lib

