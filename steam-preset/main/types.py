from typing import Protocol, runtime_checkable


@runtime_checkable
class GamePreset(Protocol):
    # uniquely identify a Steam game
    APP_ID: str

    # env vars to be set, usually comes before %command%
    ENV: dict[str, str]

    # args to be set, usually comes after %command%
    ARGS: list[str]

    def setup(
        self,
        env: dict[str, str],
        args: list[str]
    ) -> tuple[dict[str, str], list[str]]:
        # extra processing for the env and args
        ...
