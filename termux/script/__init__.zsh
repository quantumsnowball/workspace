termux.config.restore-from-repo() {
    base=$XDG_CONFIG_HOME/workspace/termux/_/.termux
    cp $base/termux.properties.template $base/termux.properties
    termux-reload-settings
}

