function fish_prompt --description 'Write out the prompt'
    set -l last_status $status
    set -l normal (set_color normal)
    set -l status_color (set_color brgreen)
    set -l vcs_color (set_color brpurple)
    set -l user_color (set_color brred)
    set -l host_color (set_color brblue)
    set -l path_color (set_color bryellow)
    set -l venv_color (set_color white)
    set -l prompt_status ""

    # Since we display the prompt on a new line allow the directory names to be longer.
    set -q fish_prompt_pwd_dir_length
    or set -lx fish_prompt_pwd_dir_length 0

    # Color the prompt differently when we're root
    set -l suffix '❯'
    if functions -q fish_is_root_user; and fish_is_root_user
        set user_color (set_color brred) # Bold/Bright red for root
        set suffix '#'
    end

    # Color the prompt in red on error
    if test $last_status -ne 0
        set status_color (set_color $fish_color_error)
        set prompt_status $status_color "[" $last_status "]" $normal
    end

    # Check for virtualenv
    set -l venv_prompt ""
    if set -q VIRTUAL_ENV
        set venv_prompt " " $venv_color "(" (basename "$VIRTUAL_ENV") ")" $normal
    end

    # --- Construct the First Line ---
    echo -n -s $user_color $USER $normal "@" $host_color (prompt_hostname) $normal ' '
    echo -s $path_color (prompt_pwd) $vcs_color (fish_vcs_prompt) $venv_prompt $normal ' ' $prompt_status

    # --- Second Line ---
    echo -n -s $status_color $suffix ' ' $normal
end
