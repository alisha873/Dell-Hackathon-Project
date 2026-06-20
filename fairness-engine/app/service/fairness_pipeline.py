import time

from app.service.score_normalisation import normalize_round
from app.service.reviewer_outlier import run_outlier_detection
from app.service.temporal_drift import detect_temporal_drift
from app.service.criterion_inconsistency import (
    run_criterion_inconsistency
)
from app.service.institutional_bias import (
    detect_institutional_bias
)
from app.service.gender_bias import (
    detect_gender_bias
)
from app.service.technology_stack_bias import (
    detect_technology_stack_bias
)

from app.db.db import ReviewerStats

from app.service.ranking_confidence import (
    compute_ranking_confidence
)

from app.service.fairness_validation_report import (
    generate_fairness_report
)

from app.db.db import (
    BiasAlert,
    FairnessReport,
    RankingConfidence
)

from app.service.audit_service import (
    log_event
)

def run_fairness_pipeline(db, round_id):

    db.query(BiasAlert).delete()
    db.query(FairnessReport).delete()
    db.query(RankingConfidence).delete()
    db.commit()

    print(
        f"Starting fairness pipeline for round {round_id}"
    )

    log_event(
    db,
    "PIPELINE_STARTED",
    {
        "round_id": round_id
    })

    db.flush()

    normalize_round(db)

    run_outlier_detection(db)

    reviewers = db.query(
        ReviewerStats
    ).all()

    for reviewer in reviewers:

        reviewer_id = reviewer.reviewer_id

        detect_temporal_drift(
            db,
            reviewer_id
        )

        detect_gender_bias(
            db,
            reviewer_id
        )

        detect_institutional_bias(
            db,
            reviewer_id
        )

        detect_technology_stack_bias(
            db,
            reviewer_id
        )

    run_criterion_inconsistency(db)

    compute_ranking_confidence(db)

    db.flush()

    generate_fairness_report(
        db,
        round_id
    )

    log_event(
    db,
    "PIPELINE_COMPLETED",
    {
        "round_id": round_id
    })

    db.commit()

    print(
        f"Fairness pipeline complete "
        f"for round {round_id}"
    )