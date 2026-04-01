# Atuin

# bug: import from ~/.histfile will result in reversed history order, a bug only in zsh
- issues for ref:
    - <https://github.com/atuinsh/atuin/issues/178>
    - <https://github.com/atuinsh/atuin/issues/1069>
- some pr for fix:
    - <https://github.com/atuinsh/atuin/pull/2370>
- local fix:
    - run `tac ~/.histfile > ~/.histfile_reversed`
    - wipe the database, then import again

