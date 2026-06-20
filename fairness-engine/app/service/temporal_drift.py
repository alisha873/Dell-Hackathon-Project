from scipy.stats import spearmanr
import math

from app.db.database import SessionLocal
from app.db.db import (
    BiasAlert,
    Evaluation,
    ReviewerStats
)

from app.service.severity_classifier import (
    classify_severity
)

from app.service.audit_service import (
    log_event
)

ALPHA = 0.0083
DRIFT_THRESHOLD = 0.40


def detect_temporal_drift(
    db,
    reviewer_id
):

    reviews = (
        db.query(Evaluation)
        .filter(
            Evaluation.reviewer_id == reviewer_id
        )
        .order_by(
            Evaluation.created_at
        )
        .all()
    )

    if len(reviews) < 5:
        return None

    scores = [
        float(r.score)
        for r in reviews
        if r.score is not None
    ]

    if len(scores) < 5:
        return None

    sequence = list(
        range(
            1,
            len(scores) + 1
        )
    )

    rho, p_value = spearmanr(
        sequence,
        scores
    )

    if (
        rho is None
        or math.isnan(rho)
    ):
        return None

    stats = db.get(
        ReviewerStats,
        reviewer_id
    )

    if stats:
        stats.temporal_drift_rho = float(rho)

    effect_size = abs(rho)

    severity = classify_severity(
        p_value,
        effect_size
    )

    if (
        p_value < ALPHA
        and abs(rho) > DRIFT_THRESHOLD
    ):

        direction = (
            "increasing"
            if rho > 0
            else "decreasing"
        )

        alert = BiasAlert(
            reviewer_id=reviewer_id,
            alert_type="TEMPORAL_DRIFT",
            severity=severity,
            p_value=float(p_value),
            effect_size=float(effect_size),
            description=(
                f"Reviewer scores show "
                f"{direction} trend over time "
                f"(Spearman rho={rho:.2f})"
            )
        )

        db.add(alert)

        log_event(
    db,
    "BIAS_ALERT_CREATED",
    {
        "alert_type": "TEMPORAL_DRIFT",
        "reviewer_id": str(reviewer_id),
        "severity": severity
    })
        db.flush()

        return alert

    db.flush()

    return None