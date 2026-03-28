# Lada - the video restorer

Repos:
<https://codeberg.org/ladaapp/lada>
<https://github.com/ladaapp/lada/tree/main>

## Installation

- uv
    - install as a uv tool:
        -  `uv tool install -e ".[gui]"`
    - use wget to download the moodels into model_weights/ directory
    - running lada uv tool outside the repo dir cannot see the model weight, need to set this env var:
        - LADA_MODEL_WEIGHTS_DIR=$HOME/Repos/lada/model_weights
        - use the install script to install to ~/.config/environment.d/ to auto at system startup

# Trouble shoot

## ModuleNotFoundError: No module named 'gi'

Need to install optional dependencies for the ".[gui]"

`uv tool install "lada[gui]" --force`

the gui includes "pycairo", "PyGObject" and is needed to run the GUI

## AttributeError: 'NoneType' object has no attribute 'get_property'

```
lada/lada/gui/watch/gstreamer_pipeline_manager.py", line 265, in pipeline_add_video
    paintable: Gdk.Paintable = gtksink.get_property('paintable')
AttributeError: 'NoneType' object has no attribute 'get_property'
```

Run `gst-inspect-1.0 gtk4paintablesink` and see if it is installed.
If it says no such element or plugin, then install it by running:

`sudo pacman -S gst-plugin-gtk4
`

## TypeError: Argument 1 does not allow None as a value

```
lada/lada/gui/watch/gstreamer_pipeline_manager.py", line 229, in pipeline_add_audio
    self.pipeline.add(audio_sink)
    ~~~~~~~~~~~~~~~~~^^^^^^^^^^^^
TypeError: Argument 1 does not allow None as a value
```

Need to ensure these plugins are installed:

`sudo pacman -S gst-plugins-good gst-plugins-base
`
## AttributeError: 'NoneType' object has no attribute 'path'

```
lada/lada/gui/frame_restorer_provider.py", line 126, in get
    mosaic_restoration_model_path = ModelFiles.get_restoration_model_by_name(self.options.mosaic_restoration_model_name).path
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AttributeError: 'NoneType' object has no attribute 'path'
```

It is because the model_weights is not installed, follow the official guide to download the latest model weights using wget:

<https://github.com/ladaapp/lada/blob/main/docs/linux_install.md>

If you are installing lada as a uv tool, make sure to install it again to reflect the changes:

`uv tool install -e ".[gui]"`
