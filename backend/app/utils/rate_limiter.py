"""In-memory rate limiter and account lockout protection against brute-force attacks."""

import time
from datetime import datetime, timezone
from fastapi import Request


class LoginRateLimiter:
    """Tracks failed login attempts and applies temporary lockouts."""

    def __init__(self, max_attempts: int = 5, lockout_minutes: int = 15):
        self.max_attempts = max_attempts
        self.lockout_seconds = lockout_minutes * 60
        # Storage: {key: {"attempts": int, "locked_until": float, "last_attempt": float}}
        self._records: dict[str, dict] = {}

    def _cleanup_expired(self):
        """Removes records that have passed lockout and have been idle for over 1 hour."""
        now = time.time()
        keys_to_delete = [
            k for k, v in self._records.items()
            if now > v.get("locked_until", 0) and (now - v.get("last_attempt", 0)) > 3600
        ]
        for k in keys_to_delete:
            del self._records[k]

    def get_key(self, request: Request, email: str) -> str:
        """Constructs a composite identifier from client IP and sanitized email."""
        client_ip = "unknown"
        if request.client and request.client.host:
            client_ip = request.client.host
        # Also check X-Forwarded-For in case behind proxy / load balancer
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()

        sanitized_email = email.strip().lower()
        return f"{sanitized_email}:{client_ip}"

    def check_lockout(self, key: str) -> tuple[bool, int]:
        """
        Checks if the key is currently locked out.
        Returns:
            (is_locked: bool, remaining_lockout_seconds: int)
        """
        self._cleanup_expired()
        record = self._records.get(key)
        if not record:
            return False, 0

        now = time.time()
        locked_until = record.get("locked_until", 0)
        if now < locked_until:
            remaining = int(locked_until - now)
            return True, max(remaining, 1)

        # If lockout duration expired, reset attempts
        if locked_until > 0 and now >= locked_until:
            self.reset_attempts(key)

        return False, 0

    def record_failure(self, key: str) -> tuple[int, int, bool]:
        """
        Records a failed attempt.
        Returns:
            (current_attempts: int, remaining_attempts: int, is_now_locked: bool)
        """
        self._cleanup_expired()
        now = time.time()
        record = self._records.setdefault(key, {"attempts": 0, "locked_until": 0, "last_attempt": now})
        
        record["attempts"] += 1
        record["last_attempt"] = now

        if record["attempts"] >= self.max_attempts:
            record["locked_until"] = now + self.lockout_seconds
            return record["attempts"], 0, True

        remaining = self.max_attempts - record["attempts"]
        return record["attempts"], remaining, False

    def reset_attempts(self, key: str) -> None:
        """Clears failed attempts upon successful authentication."""
        if key in self._records:
            del self._records[key]


# Global rate limiter singleton instance
login_rate_limiter = LoginRateLimiter(max_attempts=5, lockout_minutes=15)
