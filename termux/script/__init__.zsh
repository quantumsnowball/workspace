termux.config.restore-from-repo() {
    base=$XDG_CONFIG_HOME/workspace/termux/_/.termux
    cp $base/termux.properties.template $base/termux.properties
    termux-reload-settings
}

termux.keyboard() {
    if [[ -z "$1" ]]; then
        echo "Usage: termux.keyboard <layout_name>" >&2
        return 1
    fi
    local base="${XDG_CONFIG_HOME:-$HOME/.config}/workspace/termux"
    local layout_file="$base/script/$1.layout"
    if [[ ! -f "$layout_file" ]]; then
        echo "Error: Layout file not found: $layout_file" >&2
        return 1
    fi
    termux.config.restore-from-repo 
    cat "$layout_file" >> "$base/_/.termux/termux.properties"
    termux-reload-settings
}
termux.keyboard.mini() { termux.keyboard mini; }
termux.keyboard.full() { termux.keyboard full; }
termux.keyboard.quest2() { termux.keyboard quest2; }
