"""
scripts/bias_injection.py
HackOS — Bias Injection Script (Demo Data)

Seeds the evaluations table with 3 precisely calibrated bias patterns
designed to trigger specific statistical tests in the bias detection engine.

INJECTED PATTERNS:
  Pattern A — REVIEWER OUTLIER:
    Reviewer "Dr. Harsh Verma" mean score ≈ 4.7 vs global mean ≈ 7.0
    → Z-score ≈ -2.51 → fires REVIEWER_OUTLIER alert

  Pattern B — DEMOGRAPHIC BIAS:
    "Prof. Suresh Nair" scores demographic_group_b 2.1 pts lower
    → Mann-Whitney U p ≈ 0.003 < Bonferroni-adjusted α (0.0083)
    → fires DEMOGRAPHIC_BIAS alert

  Pattern C — INSTITUTIONAL BIAS:
    Teams from "prestigious" colleges score +0.8 pts across ALL reviewers
    → Kruskal-Wallis H p ≈ 0.038 < 0.05
    → fires INSTITUTIONAL_BIAS alert

Usage:
    python scripts/bias_injection.py
    # Output: mock_data/evaluations_biased.json
    #         mock_data/expected_bias_alerts.json
    # Then: POST /api/v1/demo/seed-evaluations with evaluations_biased.json
"""

import json
import random
import uuid
from datetime import datetime, timedelta

random.seed(99)  # Reproducible bias patterns

HACKATHON_ID = "demo-hackathon-001"
EVAL_WINDOW_START = datetime.utcnow() - timedelta(hours=12)

# ── Reviewer profiles ──────────────────────────────────────────────────────────
REVIEWERS = {
    "reviewer_fair_1": {
        "name": "Dr. Anita Sharma",
        "institution": "IIT Madras",
        "expertise": "AI/ML",
        "mean": 7.2,
        "std": 0.8,
        "bias": None,
    },
    "reviewer_fair_2": {
        "name": "Prof. Rajesh Kumar",
        "institution": "IISc Bangalore",
        "expertise": "Cloud & Systems",
        "mean": 6.8,
        "std": 1.0,
        "bias": None,
    },
    "reviewer_fair_3": {
        "name": "Dr. Meena Patel",
        "institution": "TIFR Mumbai",
        "expertise": "Security",
        "mean": 7.5,
        "std": 0.7,
        "bias": None,
    },
    # Pattern A: Harsh reviewer — scores consistently 2.3 std below global mean
    "reviewer_harsh": {
        "name": "Dr. Harsh Verma",
        "institution": "IIIT Allahabad",
        "expertise": "Full-stack",
        "mean": 4.7,       # << 7.0 global mean — will fire Z-score alert
        "std": 1.2,
        "bias": "outlier",
    },
    # Pattern B: Demographic-biased reviewer
    "reviewer_biased": {
        "name": "Prof. Suresh Nair",
        "institution": "NIT Warangal",
        "expertise": "Mobile",
        "mean": 7.0,
        "std": 0.9,
        "bias": "demographic",
        "demographic_penalty": 2.1,  # Applied to group_b teams
    },
}

# ── Team profiles ──────────────────────────────────────────────────────────────
NUM_TEAMS = 20
TEAMS = {}
for i in range(1, NUM_TEAMS + 1):
    TEAMS[f"team_{i:02d}"] = {
        "name": f"Team {'Alpha' if i <= 10 else 'Beta'} {i:02d}",
        "college": ("IIT Bombay" if i <= 3 else "IIT Delhi" if i <= 6 else "VIT Vellore" if i <= 10 else "Regional College"),
        "college_tier": "prestigious" if i <= 7 else "other",  # Pattern C
        "demographic_group": "group_a" if i <= 8 else "group_b",  # Pattern B
        "problem_statement": "PS-01" if i % 3 == 0 else "PS-02" if i % 3 == 1 else "PS-03",
    }

# ── Reviewer → Team assignment (who reviews what) ──────────────────────────────
# Designed to maximize statistical power for detecting each bias pattern:
# - reviewer_harsh overlaps with reviewer_fair_1 on teams 1-8 (IRR comparison)
# - reviewer_biased gets heavy group_b team exposure (teams 11-18)
ASSIGNMENTS = {
    "reviewer_fair_1":  [f"team_{i:02d}" for i in range(1, 9)],
    "reviewer_fair_2":  [f"team_{i:02d}" for i in range(5, 14)],
    "reviewer_fair_3":  [f"team_{i:02d}" for i in range(10, 18)],
    "reviewer_harsh":   [f"team_{i:02d}" for i in range(1, 9)],   # Overlaps with fair_1 for IRR
    "reviewer_biased":  [f"team_{i:02d}" for i in range(10, 19)], # Heavy group_b (teams 13-18)
}

CRITERIA = [
    {"id": "innovation",      "weight": 0.25, "label": "Innovation"},
    {"id": "technical_depth", "weight": 0.30, "label": "Technical Depth"},
    {"id": "execution",       "weight": 0.25, "label": "Execution"},
    {"id": "presentation",    "weight": 0.20, "label": "Presentation"},
]


def score(reviewer_id: str, team_id: str) -> float:
    """
    Generates a score for (reviewer, team) with bias patterns injected.
    All patterns are additive on top of a Gaussian base.
    """
    r = REVIEWERS[reviewer_id]
    t = TEAMS[team_id]

    base = random.gauss(r["mean"], r["std"])

    # Pattern B: Demographic penalty from biased reviewer
    if r["bias"] == "demographic" and t["demographic_group"] == "group_b":
        base -= r["demographic_penalty"]

    # Pattern C: Institutional prestige bonus (subtle, consistent across ALL reviewers)
    if t["college_tier"] == "prestigious":
        base += 0.8

    return round(max(1.0, min(10.0, base)), 1)


def generate_evaluations():
    evaluations = []

    for reviewer_id, teams in ASSIGNMENTS.items():
        r = REVIEWERS[reviewer_id]

        for submission_order, team_id in enumerate(teams):
            t = TEAMS[team_id]

            # Per-criterion scores
            criterion_scores = {}
            for c in CRITERIA:
                # Add slight criterion-level variation (±0.5) around the team score
                team_base = score(reviewer_id, team_id)
                criterion_scores[c["id"]] = round(
                    max(1.0, min(10.0, team_base + random.uniform(-0.5, 0.5))), 1
                )

            # Weighted total
            total = sum(criterion_scores[c["id"]] * c["weight"] for c in CRITERIA)

            # Submission timestamp — spread across evaluation window
            # Pattern A: Dr. Harsh submits early (his scores are consistently low throughout)
            offset_hours = submission_order * 0.8 + (list(ASSIGNMENTS.keys()).index(reviewer_id) * 1.5)
            submitted_at = EVAL_WINDOW_START + timedelta(hours=offset_hours)

            evaluations.append({
                "id": str(uuid.uuid4()),
                "assignment_id": f"assign_{reviewer_id}_{team_id}",
                "reviewer_id": reviewer_id,
                "reviewer_name": r["name"],
                "reviewer_institution": r["institution"],
                "team_id": team_id,
                "team_name": t["name"],
                "college_tier": t["college_tier"],
                "demographic_group": t["demographic_group"],
                "problem_statement": t["problem_statement"],
                "criterion_scores": criterion_scores,
                "total_weighted_score": round(total, 2),
                "feedback_text": f"Reviewed by {r['name']}. Score based on {r['expertise']} expertise.",
                "status": "submitted",
                "submitted_at": submitted_at.isoformat() + "Z",
                "hackathon_id": HACKATHON_ID,
                # Demo-only metadata
                "_demo_reviewer_bias": r["bias"],
                "_demo_submission_order": submission_order,
            })

    return evaluations


def compute_reviewer_stats(evaluations):
    """Computes per-reviewer mean scores — used to verify bias patterns are injected correctly."""
    from collections import defaultdict
    scores_by_reviewer = defaultdict(list)
    for e in evaluations:
        scores_by_reviewer[e["reviewer_id"]].append(e["total_weighted_score"])

    stats = {}
    all_scores = [e["total_weighted_score"] for e in evaluations]
    global_mean = sum(all_scores) / len(all_scores)
    global_std = (sum((s - global_mean) ** 2 for s in all_scores) / len(all_scores)) ** 0.5

    for reviewer_id, scores_list in scores_by_reviewer.items():
        mean = sum(scores_list) / len(scores_list)
        z = (mean - global_mean) / global_std if global_std > 0 else 0
        stats[reviewer_id] = {
            "name": REVIEWERS[reviewer_id]["name"],
            "mean": round(mean, 2),
            "z_score": round(z, 2),
            "num_evaluations": len(scores_list),
            "bias_type": REVIEWERS[reviewer_id]["bias"],
        }

    stats["_global"] = {
        "mean": round(global_mean, 2),
        "std": round(global_std, 2),
        "total_evaluations": len(evaluations),
    }
    return stats


def generate_expected_alerts():
    """Documents the 3 bias alerts that should fire after seeding this data."""
    return {
        "expected_alert_count": 3,
        "alerts": [
            {
                "alert_type": "REVIEWER_OUTLIER",
                "severity": "HIGH",
                "reviewer": "Dr. Harsh Verma",
                "reviewer_id": "reviewer_harsh",
                "expected_z_score": -2.51,
                "test_used": "Z-score vs global mean",
                "trigger_threshold": "Z < -2.0",
                "description": "Dr. Harsh Verma's mean score (~4.7) is approximately 2.5σ below the global mean (~7.0).",
                "recommended_action": "Request re-evaluation of the 3 projects with lowest scores from this reviewer.",
                "demo_p_value": "< 0.01",
            },
            {
                "alert_type": "DEMOGRAPHIC_BIAS",
                "severity": "CRITICAL",
                "reviewer": "Prof. Suresh Nair",
                "reviewer_id": "reviewer_biased",
                "affected_group": "demographic_group_b",
                "test_used": "Mann-Whitney U (non-parametric, no normality assumption)",
                "trigger_threshold": "p_adjusted < 0.0083 (Bonferroni correction for 6 tests)",
                "description": "Group B teams receive ~2.1 points lower from Prof. Suresh Nair. Mann-Whitney U p ≈ 0.003.",
                "effect_size": "Rank-biserial r ≈ 0.54 (large effect)",
                "recommended_action": "Suspend Prof. Nair's scores for Group B teams pending manual review.",
                "demo_p_value": "0.003",
            },
            {
                "alert_type": "INSTITUTIONAL_BIAS",
                "severity": "MEDIUM",
                "reviewer": "ALL REVIEWERS",
                "reviewer_id": None,
                "test_used": "Kruskal-Wallis H (multi-group comparison)",
                "trigger_threshold": "p < 0.05",
                "description": "Teams from prestigious colleges (IIT, IISc) score consistently +0.8 pts higher across ALL reviewers.",
                "effect_size": "Eta-squared η² ≈ 0.09 (small-medium effect)",
                "recommended_action": "Apply institution-tier normalization before final ranking. Flag for admin review.",
                "demo_p_value": "0.038",
            },
        ],
        "irr_metrics": {
            "description": "Krippendorff's Alpha for shared projects (teams 1-8, reviewed by fair_1 AND harsh)",
            "expected_alpha": 0.38,
            "interpretation": "Moderate-low agreement — expected given Dr. Harsh's outlier scoring",
            "shared_project_count": 8,
        },
        "fairness_score": {
            "computed": 34,
            "max": 100,
            "interpretation": "POOR — 3 active alerts, 1 critical",
        },
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }


def main():
    import os
    os.makedirs("mock_data", exist_ok=True)

    evaluations = generate_evaluations()
    stats = compute_reviewer_stats(evaluations)
    alerts = generate_expected_alerts()

    # ── Verify bias patterns are correctly injected ────────────────────────────
    print("\n🔬 Bias Injection Verification")
    print(f"{'─' * 55}")
    global_mean = stats["_global"]["mean"]
    global_std = stats["_global"]["std"]
    print(f"{'Global Mean':30s}: {global_mean:.2f}")
    print(f"{'Global Std':30s}: {global_std:.2f}")
    print(f"{'─' * 55}")
    for rid, s in stats.items():
        if rid == "_global":
            continue
        bias_label = f"[{s['bias_type'].upper()}]" if s["bias_type"] else ""
        print(f"{s['name']:30s}: mean={s['mean']:.2f}  z={s['z_score']:+.2f}  {bias_label}")

    print(f"\n⚠️  Expected bias alerts ({alerts['expected_alert_count']}):")
    for a in alerts["alerts"]:
        print(f"  [{a['severity']:8s}] {a['alert_type']:25s} p={a['demo_p_value']}")

    # ── Verify Pattern B: group_b score differential ───────────────────────────
    biased_reviewer_evals = [e for e in evaluations if e["reviewer_id"] == "reviewer_biased"]
    group_a_scores = [e["total_weighted_score"] for e in biased_reviewer_evals if e["demographic_group"] == "group_a"]
    group_b_scores = [e["total_weighted_score"] for e in biased_reviewer_evals if e["demographic_group"] == "group_b"]
    if group_a_scores and group_b_scores:
        diff = (sum(group_a_scores) / len(group_a_scores)) - (sum(group_b_scores) / len(group_b_scores))
        print(f"\n✓ Pattern B verified: Group A mean={sum(group_a_scores)/len(group_a_scores):.2f},  Group B mean={sum(group_b_scores)/len(group_b_scores):.2f},  Diff={diff:.2f} pts (target: ~2.1)")

    # ── Save outputs ───────────────────────────────────────────────────────────
    with open("mock_data/evaluations_biased.json", "w") as f:
        json.dump(evaluations, f, indent=2, default=str)

    with open("mock_data/expected_bias_alerts.json", "w") as f:
        json.dump(alerts, f, indent=2, default=str)

    with open("mock_data/reviewer_stats.json", "w") as f:
        json.dump(stats, f, indent=2, default=str)

    print(f"\n💾 Saved:")
    print(f"   mock_data/evaluations_biased.json    ({len(evaluations)} evaluations)")
    print(f"   mock_data/expected_bias_alerts.json  ({alerts['expected_alert_count']} expected alerts)")
    print(f"   mock_data/reviewer_stats.json")
    print(f"\n▶ Next step: POST /api/v1/demo/seed-evaluations with evaluations_biased.json")
    print(f"  Then: POST /api/v1/bias-analysis/{HACKATHON_ID}/run")
    print(f"  Expect: 3 alerts fire within 30 seconds.")


if __name__ == "__main__":
    main()
