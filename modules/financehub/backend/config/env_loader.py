"""
Environment loader for Aevorex FinBot backend.
Loads env.local exactly once and sets a flag so subsequent calls are no-ops.
"""
import os
import logging
from dotenv import load_dotenv, find_dotenv

_LOGGER = logging.getLogger("aevorex_finbot.env_loader")
_FLAG_NAME = "_AEVOREX_ENV_LOADED"

def load_environment_once() -> None:
    """Load env.local (or .env) only once across the entire process."""
    if os.environ.get(_FLAG_NAME):
        return

    env_path = find_dotenv("env.local")
    if env_path:
        load_dotenv(env_path, override=False)
        _LOGGER.info("✅ Environment loaded from %s", env_path)
    else:
        _LOGGER.warning("⚠️ env.local not found – relying on system environment variables.")

    os.environ[_FLAG_NAME] = "1" 