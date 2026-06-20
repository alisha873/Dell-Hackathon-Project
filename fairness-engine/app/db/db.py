from datetime import datetime
import uuid

from sqlalchemy import (
    String,
    Text,
    Float,
    Integer,
    DateTime,
    JSON,
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


# ============================================================================
# REVIEWER STATISTICS
# ============================================================================
# Cached reviewer metrics used by normalization and fairness detection
# ============================================================================

class ReviewerStats(Base):
    __tablename__ = "reviewer_stats"

    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True
    )

    review_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )

    mean_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    median_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    score_std: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    score_mad: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    z_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    temporal_drift_rho: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    coefficient_variation: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# ============================================================================
# BIAS ALERTS
# ============================================================================
# Central storage for all fairness anomalies
# ============================================================================

class BiasAlert(Base):
    __tablename__ = "bias_alerts"

    alert_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    alert_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    p_value: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    effect_size: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="OPEN",
        nullable=False
    )

    group_a: Mapped[str | None] = mapped_column(
    String(255),
    nullable=True
    )

    group_b: Mapped[str | None] = mapped_column(
            String(255),
            nullable=True
        )
    
    test_name: Mapped[str | None] = mapped_column(
    String(100),
    nullable=True
    )
    
    reviewer_id: Mapped[uuid.UUID | None] = mapped_column(
    UUID(as_uuid=True),
    nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    



# ============================================================================
# NORMALIZED SCORES
# ============================================================================
# Reviewer-normalized scores used for ranking generation
# ============================================================================

class NormalizedScore(Base):
    __tablename__ = "normalized_scores"

    normalized_score_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    evaluation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False
    )

    raw_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    normalized_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    final_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    reviewer_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# ============================================================================
# RANKING CONFIDENCE
# ============================================================================
# Stores confidence and reliability metrics per idea
# ============================================================================

class RankingConfidence(Base):
    __tablename__ = "ranking_confidence"

    confidence_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4
    )

    idea_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False
    )

    agreement_score: Mapped[float] = mapped_column(
    Float,
    nullable=False
)

    review_coverage: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    confidence_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    confidence_level: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# ============================================================================
# AUDIT LOG
# ============================================================================
# Hash-chained audit trail for fairness and evaluation events
# ============================================================================

class AuditLog(Base):
    __tablename__ = "audit_log"

    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    event_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    event_payload: Mapped[dict] = mapped_column(
        JSON,
        nullable=False
    )

    previous_hash: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    current_hash: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

class Evaluation(Base):
    __tablename__ = "evaluations"

    evaluation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True
    )

    assignment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False
    )

    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False
    )

    idea_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False
    )

    score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    created_at: Mapped[datetime | None] = mapped_column(
    DateTime,
    nullable=True
    )

class FairnessReport(Base):
    __tablename__ = "fairness_reports"

    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    round_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    total_alerts: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    critical_alerts: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    average_confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    low_confidence_ideas: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    flagged_reviewers: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    publication_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    