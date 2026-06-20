import hashlib
import json

from app.db.db import AuditLog


def generate_hash(
    event_type,
    payload,
    previous_hash
):

    record = {
        "event_type": event_type,
        "payload": payload,
        "previous_hash": previous_hash
    }

    serialized = json.dumps(
        record,
        sort_keys=True
    )

    return hashlib.sha256(
        serialized.encode()
    ).hexdigest()


def log_event(
    db,
    event_type,
    payload
):

    previous_event = (
        db.query(AuditLog)
        .order_by(
            AuditLog.created_at.desc()
        )
        .first()
    )

    previous_hash = (
        previous_event.current_hash
        if previous_event
        else None
    )

    current_hash = generate_hash(
        event_type,
        payload,
        previous_hash
    )

    event = AuditLog(
        event_type=event_type,
        event_payload=payload,
        previous_hash=previous_hash,
        current_hash=current_hash
    )

    db.add(event)

    return event


def verify_audit_chain(db):

    events = (
        db.query(AuditLog)
        .order_by(
            AuditLog.created_at.asc()
        )
        .all()
    )

    for i in range(len(events)):

        event = events[i]

        expected_hash = generate_hash(
            event.event_type,
            event.event_payload,
            event.previous_hash
        )

        if expected_hash != event.current_hash:
            return False

        if i > 0:

            previous_event = events[i - 1]

            if (
                event.previous_hash
                != previous_event.current_hash
            ):
                return False

    return True