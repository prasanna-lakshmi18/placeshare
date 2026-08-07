"""In-memory TTL cache layer.

Provides a simple caching mechanism for hot data (experience counts, user lookups).
Single-worker safe. For multi-worker production, swap to Redis.
"""
import logging
from typing import Any
from cachetools import TTLCache
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class CacheService:
    """Thread-safe TTL-based in-memory cache."""

    def __init__(self, maxsize: int | None = None, ttl: int | None = None):
        self._cache = TTLCache(
            maxsize=maxsize or settings.CACHE_MAX_SIZE,
            ttl=ttl or settings.CACHE_TTL_SECONDS,
        )

    def get(self, key: str) -> Any | None:
        value = self._cache.get(key)
        if value is not None:
            logger.debug(f"Cache HIT: {key}")
        else:
            logger.debug(f"Cache MISS: {key}")
        return value

    def set(self, key: str, value: Any) -> None:
        self._cache[key] = value
        logger.debug(f"Cache SET: {key}")

    def delete(self, key: str) -> None:
        self._cache.pop(key, None)
        logger.debug(f"Cache DELETE: {key}")

    def invalidate_pattern(self, prefix: str) -> None:
        """Remove all keys starting with prefix."""
        keys_to_remove = [k for k in self._cache if k.startswith(prefix)]
        for key in keys_to_remove:
            self._cache.pop(key, None)
        logger.debug(f"Cache INVALIDATE pattern '{prefix}': {len(keys_to_remove)} keys removed")

    def clear(self) -> None:
        self._cache.clear()
        logger.debug("Cache CLEARED")

    @property
    def stats(self) -> dict:
        return {
            "size": len(self._cache),
            "maxsize": self._cache.maxsize,
            "ttl": self._cache.ttl,
        }


# Global cache instance — singleton
cache = CacheService()
