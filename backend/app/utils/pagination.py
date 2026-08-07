"""Cursor-based pagination utility.

Uses created_at + id as a composite cursor for deterministic ordering.
Cursor format: "{created_at_iso}|{id}"
"""
from datetime import datetime
import base64


def encode_cursor(created_at: datetime, item_id: int) -> str:
    """Encode a cursor from timestamp + id."""
    raw = f"{created_at.isoformat()}|{item_id}"
    return base64.urlsafe_b64encode(raw.encode()).decode()


def decode_cursor(cursor: str) -> tuple[datetime, int]:
    """Decode a cursor back to (created_at, id)."""
    try:
        raw = base64.urlsafe_b64decode(cursor.encode()).decode()
        parts = raw.split("|", 1)
        created_at = datetime.fromisoformat(parts[0])
        item_id = int(parts[1])
        return created_at, item_id
    except (ValueError, IndexError) as e:
        raise ValueError(f"Invalid cursor format: {e}")
