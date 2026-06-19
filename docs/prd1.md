# HACKOS — REVIEWER MATCHING + ASSIGNMENT + BIAS DETECTION + RESULTS ENGINE
## Complete 10-Phase Engineering Implementation PRD

> **SUBSYSTEM ASSUMPTION DECLARED.** No subsystem was specified across 4 message attempts. Proceeding with `REVIEWER MATCHING + ASSIGNMENT + BIAS DETECTION + RESULTS ENGINE`. Rationale: covers R12–R22, R25, R27, R29, R32, R34 — directly responsible for the highest judging score density (~40% Technical weight) and the most statistically sophisticated differentiation from competing teams.

---

---

# PHASE 1: REQUIREMENT AUDIT

For each applicable requirement: Requirement ID, Description, Current PRD Coverage, Strengths, Weaknesses, Missing Edge Cases, Technical/Scalability/Security/GDPR/Demo/Judging Risks, and Recommended Improvement.

---

## R12 — Reviewer Expertise Matching (90%+)

**Current PRD Solution:** all-MiniLM-L6-v2 cosine similarity between project description and reviewer bio. Multi-objective cost matrix. `scipy.optimize.linear_sum_assignment`.

**Strengths:**
- Semantic matching is architecturally correct; keyword overlap fails on "ML" vs "machine learning"
- Multi-objective cost function (expertise 40%, workload 30%, conflict 20%, diversity 10%) is principled
- Side-by-side vs. random assignment is an excellent demo moment

**Weaknesses:**

1. **Critical algorithmic error in 1:K assignment.** `linear_sum_assignment` is a 1:1 bipartite solver. This subsystem needs K reviews per project (K=2-3). The PRD's cost matrix of shape `(N_projects × N_reviewers)` gives each reviewer at most one project. For K reviews per project, you must replicate project rows: cost matrix shape = `(N_projects × K, N_reviewers)`, padded to square. The PRD does not specify this construction.

2. **"90% accuracy" is unmeasurable.** No ground-truth dataset exists. Judges will ask: "90% accuracy compared to what?" This will fail under scrutiny.

3. **Reviewer embedding quality is low.** Free-text expertise input ("AI/ML", "Artificial Intelligence", "Machine Learning", "deep learning") maps to high cosine similarity but "security and distributed systems" maps poorly against an AI project even if the reviewer is expert.

4. **Diversity bonus is undefined.** "Reward assigning diverse domain pairs" — diverse by what measure? The cost matrix formula references this but the computation is never specified.

5. **No pre-assignment capacity check.** If total_review_slots > reviewer_capacity, some projects get zero reviewers. The PRD has no guard for this.

**Missing Edge Cases:**
- All reviewers have institution conflicts with teams from one dominant college → entire college unreviewed
- A reviewer's expertise spans 3 unrelated domains → embedding averages them → mediocre match for all
- Total projects × K > sum of reviewer capacities → assignment impossible
- Reviewer expertise field is left blank at profile creation → empty string embedding → random assignment effectively

**Technical Risk:** O(n³) for n = max(N_projects×K, N_reviewers). For 100 projects, K=2, 20 reviewers: cost matrix is 200×20 padded to 200×200. `linear_sum_assignment` on 200×200: ~8ms. Safe for MVP.

**Scalability Risk:** For N=500 projects, K=3, 30 reviewers: 1500×1500 matrix. `linear_sum_assignment`: ~6 seconds. Must run as async Celery task (already planned).

**Demo Risk:** Claiming "90% accuracy" with no methodology will fail. Replace with: "AI assignment achieves mean cosine expertise score of 0.78 vs. random baseline of 0.49 — 59% relative improvement, measured on our 50-project demo dataset."

**Judging Risk:** Judges with ML backgrounds will ask how you measure 90%. "We compare AI assignment cosine score to random assignment cosine score" is defensible. "90% accuracy" without a confusion matrix is not.

**Recommended Implementation:**
```python
import numpy as np
from scipy.optimize import linear_sum_assignment
import math

def build_1_to_k_cost_matrix(
    projects: list,
    reviewers: list,
    K: int,  # reviews_per_project
    compute_cost_fn: callable
) -> np.ndarray:
    """
    Returns padded square cost matrix for 1:K assignment.
    Rows = project review slots (N_projects * K)
    Cols = reviewers
    """
    n_slots = len(projects) * K
    n_reviewers = len(reviewers)
    dim = max(n_slots, n_reviewers)

    # Fill with high cost (1.0 = worst possible match)
    matrix = np.ones((dim, dim))

    for slot in range(n_slots):
        project = projects[slot // K]
        for r_idx, reviewer in enumerate(reviewers):
            matrix[slot][r_idx] = compute_cost_fn(reviewer, project)

    return matrix

def run_assignment(
    projects: list,
    reviewers: list,
    K: int = 2
) -> tuple[list[dict], dict]:
    """
    Returns:
      assignments: [{project_id, reviewer_id, expertise_score, cost}]
      metrics: {ai_mean_cosine, random_mean_cosine, improvement_pct, workload_distribution}
    """
    # Pre-check capacity
    total_slots = len(projects) * K
    max_capacity = len(reviewers) * math.ceil(total_slots / len(reviewers)) if reviewers else 0
    if total_slots > max_capacity:
        raise AssignmentImpossibleError(
            f"Need {total_slots} review slots but max reviewer capacity is {max_capacity}"
        )

    cost_matrix = build_1_to_k_cost_matrix(projects, reviewers, K, compute_match_cost)
    row_ind, col_ind = linear_sum_assignment(cost_matrix)

    # Extract valid assignments (exclude padding rows/cols)
    n_slots = len(projects) * K
    n_reviewers = len(reviewers)
    assignments = []
    for slot, r_idx in zip(row_ind, col_ind):
        if slot < n_slots and r_idx < n_reviewers:
            project = projects[slot // K]
            reviewer = reviewers[r_idx]
            expertise_sim = 1.0 - cost_matrix[slot][r_idx]  # invert cost
            assignments.append({
                "project_id": project.id,
                "reviewer_id": reviewer.id,
                "expertise_score": round(expertise_sim, 4),
                "cost": round(cost_matrix[slot][r_idx], 4)
            })

    # Compute random baseline for demo metrics
    random_assignments = _random_baseline(projects, reviewers, K)
    ai_mean = np.mean([a["expertise_score"] for a in assignments])
    random_mean = np.mean([a["expertise_score"] for a in random_assignments])

    metrics = {
        "ai_mean_cosine": round(ai_mean, 4),
        "random_mean_cosine": round(random_mean, 4),
        "improvement_pct": round((ai_mean - random_mean) / random_mean * 100, 1),
        "workload_distribution": _compute_workload_distribution(assignments, reviewers)
    }

    return assignments, metrics


def compute_match_cost(reviewer, project) -> float:
    """
    cost = 1 - match_score
    match_score = 0.40*expertise + 0.30*(1-workload_penalty) + 0.20*(1-conflict) + 0.10*diversity
    """
    expertise = cosine_similarity(reviewer.embedding, project.embedding)

    # workload_penalty: sigmoid-shaped, rises sharply beyond target assignments
    target = _get_target_assignments(reviewer.hackathon_id)
    current = reviewer.current_assignment_count
    ratio = current / target if target > 0 else 0
    workload_penalty = 1 / (1 + math.exp(-5 * (ratio - 1.0)))

    # conflict: 1.0 = hard conflict (cost -> 1.0, effectively excluded)
    conflict = _detect_conflict(reviewer, project)
    if conflict >= 1.0:
        return 1.0  # hard exclude

    # diversity: reward reviewer being assigned to diverse domains
    diversity_bonus = _compute_diversity_bonus(reviewer, project)

    match_score = (
        0.40 * expertise
        + 0.30 * (1 - workload_penalty)
        + 0.20 * (1 - conflict)
        + 0.10 * diversity_bonus
    )
    return 1.0 - match_score
```

---

## R13 — Workload Balance ±10% Variance

**Current:** workload_penalty in cost matrix + post-assignment greedy swap.

**Weaknesses:**
1. `workload_penalty(i)` referenced but never mathematically defined.
2. "Swap lowest-priority assignment" is underdefined — swap which assignment? By what criterion? This can violate expertise optimality without bounded cost.
3. When `total_slots % n_reviewers ≠ 0`, floor/ceil divergence creates inherent ±variance that must be explicitly computed.

**Technical Risk:** Post-assignment swap is a local greedy search. For severe imbalances (one reviewer gets 2× their share), multiple swaps may be needed, and each can degrade expertise quality.

**Recommended Implementation:**
```python
def verify_and_rebalance(
    assignments: list[dict],
    reviewers: list,
    max_variance_pct: float = 0.10
) -> tuple[list[dict], dict]:
    """
    Verifies ±10% workload constraint.
    If violated, performs targeted swap: move assignment from overloaded
    reviewer to underloaded reviewer with best next-available expertise score.
    Returns rebalanced assignments + balance report.
    """
    total_slots = len(assignments)
    n_reviewers = len(reviewers)
    target = total_slots / n_reviewers  # can be fractional

    counts = Counter(a["reviewer_id"] for a in assignments)
    violations = []

    for reviewer in reviewers:
        count = counts.get(reviewer.id, 0)
        variance = abs(count - target) / target if target > 0 else 0
        if variance > max_variance_pct:
            violations.append({
                "reviewer_id": reviewer.id,
                "count": count,
                "target": target,
                "variance_pct": round(variance * 100, 1),
                "direction": "over" if count > target else "under"
            })

    # Attempt rebalancing via targeted swaps
    max_swap_attempts = 20
    for _ in range(max_swap_attempts):
        counts = Counter(a["reviewer_id"] for a in assignments)
        overloaded = max(reviewers, key=lambda r: counts.get(r.id, 0) - target)
        underloaded = min(reviewers, key=lambda r: counts.get(r.id, 0) - target)

        over_variance = (counts.get(overloaded.id, 0) - target) / target
        under_variance = (target - counts.get(underloaded.id, 0)) / target

        if over_variance <= max_variance_pct and under_variance <= max_variance_pct:
            break

        # Find lowest-expertise assignment from overloaded reviewer
        over_assignments = [a for a in assignments if a["reviewer_id"] == overloaded.id]
        candidate = min(over_assignments, key=lambda a: a["expertise_score"])

        # Check if underloaded reviewer has no conflict with this project
        conflict = _detect_conflict(underloaded, candidate["project_id"])
        if conflict < 1.0:
            # Execute swap — log quality delta
            old_score = candidate["expertise_score"]
            new_score = 1.0 - compute_match_cost(underloaded, candidate["project_id"])
            candidate["reviewer_id"] = underloaded.id
            candidate["expertise_score"] = round(new_score, 4)
            candidate["swap_delta"] = round(new_score - old_score, 4)

    balance_report = {
        "balanced": len(violations) == 0,
        "violations_before_rebalancing": violations,
        "final_distribution": {
            r.id: counts.get(r.id, 0) for r in reviewers
        }
    }
    return assignments, balance_report
```

---

## R14 — Conflict of Interest Detection

**Critical Weakness: IP Subnet /24 is a False Positive Factory.**

University campus networks (VIT, IIT, NIT) place thousands of users on the same /24 subnet. Flagging every reviewer sharing a /24 with any student would exclude nearly all co-located reviewers — destroying the assignment for on-site hackathons.

**Additional Weaknesses:**
1. No reviewer self-declaration UI at profile creation time.
2. No mechanism for reviewer to declare conflict AFTER assignment (post-assignment discovery).
3. Alumni conflict not handled (reviewer graduated from same college as team member).

**Recommended Conflict Detection Signals (Revised):**

| Signal | conflict_score | Action |
|---|---|---|
| Same current institution (college/employer) | 1.0 | Hard exclude from assignment |
| Reviewer self-declared conflict with team | 1.0 | Hard exclude |
| Reviewer co-authored paper with team member (GitHub collaborators) | 0.8 | Hard exclude |
| Alumni of same college (grad year ≥3 years ago) | 0.4 | Soft flag, admin reviews |
| Shared /16 subnet | 0.2 | Log only, no action |

**Remove:** /24 subnet conflict detection.

**New Table Required:**
```sql
CREATE TABLE conflict_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id),
    conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN (
        'same_institution', 'personal_relationship', 'prior_mentorship',
        'co_authored', 'other'
    )),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('team', 'participant', 'submission')),
    entity_id UUID NOT NULL,
    declared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    UNIQUE(reviewer_id, hackathon_id, entity_id)
);
CREATE INDEX idx_conflict_declarations_reviewer ON conflict_declarations(reviewer_id, hackathon_id);
CREATE INDEX idx_conflict_declarations_entity ON conflict_declarations(entity_id);
```

---

## R15 — Dynamic Reassignment on No-Show

**Weaknesses:**
1. Celery beat at 30-minute intervals: if evaluation deadline is at T+15min from last beat run, T-0 check executes 15 minutes AFTER deadline. Evaluations missed.
2. "Greedy fallback" is not algorithmically defined.
3. Partial evaluation state: reviewer submits 5 of 8 projects then disappears. PRD has no handling for in-progress work.
4. Only T-6h and T-0 checkpoints defined. Should add T-24h and T-2h.

**Recommended Implementation:**
```python
def schedule_reviewer_deadline_checks(hackathon_id: str, evaluation_deadline: datetime):
    """
    Use Celery ETA for precision scheduling — NOT Celery beat periodic polling.
    """
    for delta_hours, checkpoint_label in [(24, "T-24h"), (6, "T-6h"), (2, "T-2h"), (0, "T-0")]:
        eta = evaluation_deadline - timedelta(hours=delta_hours)
        check_reviewer_no_shows.apply_async(
            args=[hackathon_id, checkpoint_label],
            eta=eta,
            queue="ai_low"
        )

@celery.task(queue="ai_low", max_retries=2, default_retry_delay=30)
def check_reviewer_no_shows(hackathon_id: str, checkpoint: str):
    assignments = db.query("""
        SELECT ra.*, 
               COUNT(e.id) as submitted_count,
               ra.projects_assigned as total_count
        FROM reviewer_assignments ra
        LEFT JOIN evaluations e ON e.reviewer_assignment_id = ra.id AND e.status = 'submitted'
        WHERE ra.hackathon_id = :hackathon_id AND ra.status = 'accepted'
        GROUP BY ra.id
        HAVING COUNT(e.id) < ra.projects_assigned
    """, hackathon_id=hackathon_id)

    for assignment in assignments:
        completion_rate = assignment.submitted_count / assignment.total_count
        if checkpoint == "T-0" and completion_rate < 1.0:
            # Hard deadline: auto-reassign incomplete projects
            _auto_reassign_incomplete(assignment, hackathon_id)
        elif checkpoint in ("T-6h", "T-2h") and completion_rate < 0.5:
            # Alert admin + send urgent reminder
            _alert_admin_no_show(assignment, checkpoint)
            _send_urgent_reminder(assignment.reviewer_id)

def _auto_reassign_incomplete(assignment, hackathon_id):
    """Greedy reassignment: best available reviewer by (expertise × (1-conflict)) / (1+load)."""
    incomplete_projects = db.get_incomplete_projects(assignment.reviewer_assignment_id)
    
    for project_id in incomplete_projects:
        best_reviewer_id = _find_best_available_reviewer(
            project_id=project_id,
            hackathon_id=hackathon_id,
            excluded_reviewer_ids=[assignment.reviewer_id],
            completed_partial_work=db.get_partial_evaluation(assignment.reviewer_assignment_id, project_id)
        )
        if best_reviewer_id:
            new_assignment_id = db.create_reviewer_assignment(
                hackathon_id=hackathon_id,
                reviewer_id=best_reviewer_id,
                submission_id=project_id,
                is_reassignment=True,
                original_assignment_id=assignment.id
            )
            audit_log.write("REVIEWER_REASSIGNED", system_actor_id, "reviewer_assignment", new_assignment_id, {
                "reason": "no_show",
                "original_reviewer": assignment.reviewer_id,
                "checkpoint": "T-0"
            })
            notify_reviewer_of_new_assignment(best_reviewer_id, project_id)
        else:
            # No reviewer available — flag for admin
            create_admin_task("NO_REVIEWER_AVAILABLE", project_id, hackathon_id)
```

---

## R16 — Bias Detection (90% Accuracy — PARTIAL)

**This is the highest-risk requirement in the entire PRD. Six separate statistical weaknesses.**

### Statistical Weakness 1: Multiple Comparison Problem

Running 6 simultaneous hypothesis tests at α=0.05 gives family-wise error rate of `1-(0.95)^6 = 26%`. One in four hackathons will generate at least one false positive bias alert even with no actual bias.

**Fix:** Apply Bonferroni correction: `α_adjusted = 0.05 / 6 = 0.0083`.

### Statistical Weakness 2: Minimum Sample Size Not Enforced

- Mann-Whitney U requires n≥8 per group for reliable p-values. With 50 participants and optional demographics, groups of size 2-3 are common.
- Z-score for reviewer outlier requires ≥3 reviewers with ≥2 evaluations each to compute std of reviewer means.
- Krippendorff's alpha requires shared projects (≥2 reviewers per project); if reviewers have non-overlapping assignments, alpha is undefined.

**Fix:** Guard ALL tests with minimum sample size checks. Skip test and log "INSUFFICIENT_DATA" instead of running on tiny samples.

### Statistical Weakness 3: Krippendorff's Alpha Not in scipy

`scipy.stats` does not implement Krippendorff's alpha. The PRD references it without noting this. Must use `pip install krippendorff` or implement from scratch. The `krippendorff` package works but adding pip dependencies in a hackathon has risk.

**Fix:** Custom 50-line numpy implementation (included in Phase 4).

### Statistical Weakness 4: Division by Zero in Z-Score

If all reviewers give identical scores (common in calibrated judges), `std(all_reviewer_means) = 0`. Division by zero crash.

**Fix:** Guard with `if global_std < 1e-9: return []`.

### Statistical Weakness 5: "90% Accuracy" Is Unmeasurable

Without a labeled dataset of "known biased / known fair" evaluations, accuracy cannot be computed. This claim under judge scrutiny is "how did you measure 90%?" → no answer.

**Fix:** Reframe completely: "Our bias detection achieves statistically significant detection (p<0.0083 Bonferroni-corrected) of injected bias patterns in our demo dataset. We inject 3 known bias patterns and demonstrate all 3 are flagged."

### Statistical Weakness 6: Effect Size Not Computed for All Tests

p-values alone are insufficient. A statistically significant result with negligible effect size (d=0.01) is not actionable. Must compute effect size for every test.

| Test | Effect Size Metric | Threshold |
|---|---|---|
| Mann-Whitney U (gender, institutional) | Rank-biserial correlation r | r > 0.3 = medium, > 0.5 = large |
| Kruskal-Wallis (geographic, tech stack) | η² (eta squared) | η² > 0.06 = medium |
| Reviewer z-score | Cohen's d (reviewer mean vs global) | |d| > 0.5 = medium |
| Spearman temporal drift | ρ | |ρ| > 0.4 = moderate |

**Judging Impact of Getting This Right:** Judges with statistics backgrounds (common in AI/ML hackathons) will be genuinely impressed by Bonferroni correction, rank-biserial effect size, and Krippendorff's alpha. These are not commonly implemented. This is your highest differentiation point.

---

## R17 — Transparent Audit Trails

**Critical Technical Risk 1: BIGSERIAL Gaps Break Chain.**

BIGSERIAL is not gap-free. If transaction rolls back AFTER sequence allocation, sequence_num has a gap (1→2→4). Chain verifier sees a gap and incorrectly reports tampering.

**Fix:** Do not use BIGSERIAL for sequence_num. Use a counter-based approach with `SELECT ... FOR UPDATE` on the last audit_log entry. Sequence_num is computed as `prev_seq + 1` within the locked transaction.

**Critical Technical Risk 2: Concurrent Inserts Fork the Chain.**

Two concurrent transactions both read `prev_hash = hash_of_entry_99`, both compute `SHA256(hash_of_entry_99 + different_payload)`, both try to insert as entry 100. One will violate the UNIQUE constraint on `current_hash`. But both will violate the chain — two entries claiming to follow entry 99.

**Fix:** Use `pg_advisory_xact_lock(hashtext('audit_log_insert'))` inside the insert function. This serializes ALL audit log inserts across all connections.

**Critical Technical Risk 3: Payload Is Undefined.**

PRD says `SHA256(prev_hash + payload)` without defining `payload`. If `payload` is computed differently on verify vs. insert, chain verification always fails.

**Fix:** Canonical payload string (deterministic, sort_keys=True for JSON):
```
payload = f"{seq_num}|{action}|{actor_id}|{entity_type}|{entity_id}|{timestamp_iso}|{json.dumps(metadata, sort_keys=True, separators=(',', ':'))}"
```

---

## R18 — Score Normalization

**Bug 1:** `std(raw[r]) == 0` when reviewer gives same score to all projects → division by zero.
**Bug 2:** `len(raw[r]) == 1` → std is undefined (ddof=1) or 0 (ddof=0) → cannot normalize.
**Bug 3:** `global_std` and `global_mean` — computed from what? PRD says "global" without specifying the universe.

**Recommended:** `global_mean` and `global_std` computed from ALL raw scores across ALL reviewers BEFORE normalization. This is the reference distribution for rescaling.

**Bug 4:** `confidence = (ci_upper - ci_lower) / final_score` — PRD labels this "confidence_score" but lower values mean MORE confident. Counterintuitive and will confuse judges.

**Fix:** Display confidence as `1 - (ci_width / max_possible_score_range)` so 100% = maximum confidence.

---

## R19 — Configurable Evaluation Criteria

**Missing:**
1. No enforcement that weights sum to 100% at save time — only mentioned as requirement.
2. No rubric lock after first evaluation submitted — admin could change weights mid-evaluation, invalidating prior scores.
3. No `score_min`/`score_max` per criterion — default range not specified.

---

## R20 — Results in <2 Minutes

**The Gemini Bottleneck:** Free tier = 15 RPM. 50 teams = 50 feedback calls. 50/15 = 3.3 minutes. **This requirement is violated by the current design.**

**Fix:** Decouple computation (<30s, pure numpy/scipy, no Gemini) from feedback generation (async, Gemini, non-blocking to results display).

---

## R21 — Confidence Scores (Krippendorff's Alpha)

**Not in scipy.** Requires custom implementation or `krippendorff` package.
**Alpha interpretation not specified:** α > 0.80 = strong reliability, 0.67-0.80 = acceptable, < 0.67 = questionable.
**Fallback undefined:** If no shared projects exist (different reviewers assigned to different projects), alpha is undefined. Need coefficient of variation as fallback.

---

## R22 — Personalized Feedback

**GDPR Risk:** Reviewer `feedback_text` passed directly to Gemini API may contain participant names, team identifiers, or personal observations. This is a data transfer to third-party API of personal data without specific consent.

**Fix:** Anonymize reviewer comments before Gemini call. Strip proper nouns, reviewer identifiers, team member names. Pass only themes/observations, not verbatim text.

---

## R25 — 1000+ Concurrent Users (PARTIAL)

**For this subsystem:** 20 reviewers submitting evaluations simultaneously triggers 20 concurrent bias analysis executions. Each bias analysis queries ALL evaluations for the hackathon, runs scipy statistics, and potentially writes a bias alert. Under concurrent load, this causes:
1. 20× database load spike
2. Race conditions on bias alert creation (duplicate alerts for same bias)
3. Reviewer API response latency spikes

**Fix:** Move bias analysis entirely to Celery queue with `countdown=5` (5-second batch window). Return 201 immediately. Use Redis atomic counter to deduplicate bias alerts.

---

## R27 — RBAC

**Reviewer-specific access patterns not fully specified:**
- Reviewers MUST NOT see other reviewers' raw scores (prevents anchoring bias)
- Reviewers MUST NOT see final rankings until published
- Reviewers CAN see their own reliability/consistency score
- Bias alert data MUST NOT be visible to reviewers (admin-only)

All of these require RLS policies in Supabase.

---

## R29 — Background Job Processing

**For this subsystem:** Three distinct Celery tasks with different SLAs:
- `run_reviewer_assignment`: `ai_low` queue, SLA 60s
- `run_bias_analysis`: `ai_low` queue, SLA 30s, deduplication required
- `compute_results`: `ai_low` queue, SLA 30s (ranking only, not feedback)
- `generate_feedback`: `ai_low` queue, SLA 3-5min, Gemini-dependent

---

## R32 — Comprehensive Bias Dimensions

**Gap:** Geographic bias test uses Kruskal-Wallis but geographic data (state/country) is NOT in the current `registrations` schema. The schema has `college` (institution) but not geographic region.

**Fix:** Add `state` and `country` optional fields to registrations, OR derive geographic region from college name using a lookup table.

**Tech stack bias:** Exists in `idea_submissions.tech_stack` as free text. Must normalize: "React, Node.js" and "nodejs, reactjs" are the same stack. Normalize using Gemini or a predefined taxonomy.

---

## R34 — Hash-Chain Audit Trail

**See R17 above.** The BIGSERIAL gap problem, concurrent insert fork risk, and undefined payload are the three critical implementation bugs.

---

---

# PHASE 2: REQUIREMENT TRACEABILITY MATRIX

| Req ID | Feature | DB Tables | Services | APIs | Frontend | Background Jobs | WebSocket Events | Demo Evidence |
|---|---|---|---|---|---|---|---|---|
| R12 | Reviewer Assignment Engine | reviewer_profiles, reviewer_assignments, participant_embeddings, idea_submissions | ReviewService, AIService | POST /reviews/assign/{id}, GET /reviews/assignment-plan/{id} | Admin: Assignment Panel | run_reviewer_assignment | WS /ws/assignment/{hackathon_id}: stage updates | Side-by-side AI vs random cosine scores table |
| R13 | Workload Balance ±10% | reviewer_assignments | ReviewService | GET /reviews/assignment-plan/{id} | Admin: Workload Distribution Chart | run_reviewer_assignment (post-verify step) | — | Bar chart: assignments per reviewer, target line ±10% bands |
| R14 | Conflict Detection | conflict_declarations, reviewer_profiles, registrations | ConflictService | POST /reviews/conflicts/declare, GET /reviews/conflicts/{hackathon_id} | Admin: Conflict Graph Preview | run_reviewer_assignment (conflict matrix step) | — | Conflict graph: nodes=reviewers+teams, edges=conflicts |
| R15 | Dynamic Reassignment | reviewer_assignments, evaluations | ReviewService | PATCH /reviews/{assignment_id}/reassign | Admin: No-show Alert Banner | check_reviewer_no_shows (ETA-scheduled) | WS /ws/evaluation-live/{id}: REVIEWER_NO_SHOW | Timeline: original assignment → T-6h alert → T-0 auto-reassign |
| R16 | Bias Detection | evaluations, bias_alerts, evaluation_scores | BiasService | GET /bias-analysis/{hackathon_id}, POST /bias-alerts/{id}/acknowledge | Admin: Bias Monitoring Dashboard | run_bias_analysis | WS /ws/evaluation-live/{id}: BIAS_ALERT | Inject 3 bias patterns, show all 3 detected with p-values |
| R17 | Audit Trail | audit_log | AuditService | GET /audit/{hackathon_id}/trail, POST /audit/{hackathon_id}/verify | Admin: Audit Trail Viewer + Verify Chain Button | — | — | Before/after tamper demo: modify row → verify → chain break detected |
| R18 | Score Normalization | evaluations, evaluation_scores, final_results | ResultsService | GET /results/{hackathon_id}/normalized-scores | Admin: Score Distribution Per Reviewer | compute_results | — | Box plot: raw vs normalized per reviewer |
| R19 | Configurable Rubric | evaluation_criteria, hackathons | HackathonService | POST /hackathons/{id}/criteria, DELETE /hackathons/{id}/criteria/{cid} | Admin: Rubric Builder | — | — | Show admin building rubric, weight validation preventing >100% |
| R20 | Results <2 Min | final_results | ResultsService | POST /results/{id}/compute, GET /results/{id}/rankings | Admin: Results Panel with timer | compute_results, generate_feedback | WS /ws/results/{id}: RANKINGS_READY, FEEDBACK_READY | Timer shown: "Rankings computed in 18s" |
| R21 | Confidence Scores | final_results | ResultsService | GET /results/{id}/rankings | Admin+Participant: Rankings with CI | compute_results | — | Rankings table with CI bars, Krippendorff α score shown |
| R22 | Personalized Feedback | team_feedback | ResultsService | GET /results/{id}/feedback/{team_id} | Participant: Feedback Card | generate_feedback | WS /ws/results/{id}: FEEDBACK_READY | Show 3 different teams' Gemini feedback side-by-side |
| R25 | Concurrent Users | evaluations | All services | All evaluation endpoints | — | run_bias_analysis (async, no blocking) | — | Locust load test screenshot: 20 concurrent submissions, all <500ms |
| R27 | RBAC | users | AuthService | All endpoints (RBAC middleware) | Role-differentiated UIs | — | — | Reviewer login: bias alerts not visible; admin login: all visible |
| R29 | Background Jobs | celery task state (Redis) | CeleryWorker | GET /jobs/{job_id}/status | Loading spinners | All Celery tasks | Stage progress events | Live task progress bar during assignment computation |
| R32 | Bias Dimensions | evaluations, registrations | BiasService | GET /bias-analysis/{id} | Admin: Bias Dimensions Breakdown | run_bias_analysis | WS BIAS_ALERT with dimension | Dashboard: 6 bias dimensions with individual p-values and effect sizes |
| R34 | Hash Chain | audit_log | AuditService | GET /audit/{id}/verify | Admin: Chain Integrity Status | — | — | Show hash chain: prev_hash→current_hash linkage, tamper detection |

---

---

# PHASE 3: COVERAGE IMPROVEMENT PLAN

## R16 — Bias Detection: Achieving Maximum Coverage

**Current Design:** 6 bias tests, no sample guards, no multiple comparison correction, no effect sizes, "90% accuracy" claim unmeasurable.

**Why Coverage Is Partial:** The claim "90% accuracy" is impossible to demonstrate in a 3-day hackathon without a pre-labeled bias dataset. The statistical tests are correct but will silently fail on small samples.

**What Is Missing:**
1. Bonferroni correction on all demographic tests
2. Minimum sample size guards on all tests
3. Effect size computation for every alert
4. Krippendorff's alpha custom implementation
5. Fallback metrics when insufficient demographic data
6. Demo strategy: injected bias patterns in mock data

**Improved Design:**
- Replace "90% accuracy" with measurable "detection sensitivity on 3 known injected bias patterns in demo data: 3/3 detected at p<0.0083"
- Inject 3 specific bias patterns in seed data:
  1. Reviewer A gives scores 2σ below mean (harsh outlier) → z-score alert fires
  2. Team from College X receives systematically lower scores → institutional bias alert fires
  3. Teams using React score 0.8 points lower than teams using Python → tech stack bias alert fires
- Show all 3 alerts on admin dashboard with exact p-values and effect sizes

**Additional Tables:**
```sql
CREATE TABLE bias_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO','WARNING','ALERT','CRITICAL')),
    reviewer_id UUID REFERENCES users(id),
    demographic_group VARCHAR(100),
    p_value FLOAT,
    p_value_adjusted FLOAT,
    effect_size FLOAT,
    effect_size_metric VARCHAR(50),
    sample_size_group1 INT,
    sample_size_group2 INT,
    statistical_detail JSONB NOT NULL,
    affected_project_ids UUID[],
    is_active BOOLEAN DEFAULT TRUE,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES users(id),
    admin_action VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bias_alerts_hackathon_active ON bias_alerts(hackathon_id, is_active);
CREATE INDEX idx_bias_alerts_type ON bias_alerts(hackathon_id, alert_type, created_at DESC);
```

**Additional APIs:**
```
POST /bias-alerts/{alert_id}/acknowledge    → Admin acknowledges alert
POST /bias-alerts/{alert_id}/renormalize   → Trigger re-normalization
GET  /bias-analysis/{hackathon_id}/fairness-score → Composite fairness score
GET  /bias-analysis/{hackathon_id}/history → Timeline of all alerts
```

**Additional Dashboard Metrics:**
- Fairness Score gauge (0-100): `100 * (1 - max(|effect_sizes|))`
- Per-reviewer bias heatmap: x=reviewer, y=bias_dimension, color=severity
- Alert timeline: chronological list with severity badges, p-values, effect sizes

**Demo Evidence:**
- Before bias injection: 0 alerts, Fairness Score = 97
- Inject Reviewer A's scores: Z-score alert fires within 30s
- Show: alert type, z-score value (-2.7), direction ("harsh"), affected projects
- Show admin acknowledges → audit log entry created → alert cleared → Fairness Score = 84

---

## R25 — Concurrent Users: Achieving Closer Coverage

**Current Design:** Bias analysis runs synchronously in evaluation submit handler.

**What Is Missing:** The submit handler must return within <500ms regardless of bias analysis complexity.

**Improved Design:**
```
POST /reviews/{assignment_id}/submit
 → Write evaluation to DB (sync, <50ms)
 → Write audit log (sync, <50ms)
 → Enqueue run_bias_analysis.apply_async(countdown=5) (async, <1ms)
 → Return 201 (total: <150ms)

[5 seconds later — batch window]
 → Celery picks up bias analysis
 → Runs all 6 tests
 → Publishes alerts to Redis pub/sub → Admin WebSocket
```

**Redis Deduplication for Concurrent Submissions:**
```python
def run_bias_analysis_with_dedup(hackathon_id: str):
    lock_key = f"bias_analysis_lock:{hackathon_id}"
    # Only one bias analysis runs at a time per hackathon
    acquired = redis.set(lock_key, "1", nx=True, ex=30)  # 30s lock
    if not acquired:
        return  # Another worker is already analyzing
    try:
        _run_all_bias_tests(hackathon_id)
    finally:
        redis.delete(lock_key)
```

**Load Test Target for Demo:**
- Simulate 20 concurrent evaluation submissions using Python `asyncio`
- Show all 20 return 201 within 500ms
- Bias analysis fires once (not 20 times) due to deduplication

---

---

# PHASE 4: COMPLETE IMPLEMENTATION PRD

## 4.1 Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)                 │
│   AdminBiasPanel  │  ReviewerDashboard  │  ResultsLeaderboard        │
│   AssignmentPanel │  EvaluationForm     │  AuditTrailViewer          │
└────────────────────────────┬────────────────────────────────────────-┘
                             │ REST + Supabase Realtime
┌────────────────────────────▼─────────────────────────────────────────┐
│                    SUPABASE LAYER                                      │
│   Auth (JWT)  │  PostgreSQL + pgvector  │  Realtime (CDC)            │
│   Storage     │  RLS Policies           │  Edge Functions (lightweight)│
└────────────────────────────┬─────────────────────────────────────────┘
                             │ Internal API calls
┌────────────────────────────▼─────────────────────────────────────────┐
│              PYTHON AI MICROSERVICE (FastAPI)                         │
│                                                                       │
│  ReviewService    BiasService    ResultsService    AuditService       │
│  ConflictService  NLGService     NotificationService                  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                    CELERY WORKERS                            │     │
│  │  worker-high (4)    │  worker-notif (2)                     │     │
│  │  queues: ai_low,    │  queues: notifications                │     │
│  │  registration_high  │                                       │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  Dependencies: scipy, numpy, sentence-transformers, krippendorff(*)   │
│  (*) or custom implementation — see Phase 4.5                         │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                      REDIS (7.x)                                      │
│  Queues: ai_low, registration_high, notifications, analytics          │
│  Pub/Sub: evaluation-live:{id}, results:{id}, dashboard:{id}         │
│  Cache: reviewer_embeddings, project_embeddings, bias_results         │
│  Locks: audit_log_insert (per-hackathon), bias_analysis:{id}         │
└──────────────────────────────────────────────────────────────────────┘
```

**Why Python Microservice for Heavy AI Work (not Supabase Edge Functions):**
Edge Functions run on Deno, which does not support: `scipy`, `numpy`, `sentence-transformers`, or `krippendorff`. All heavy computation must run in the Python microservice. Edge Functions are used only for lightweight triggers (e.g., sending a notification payload to the microservice).

---

## 4.2 Complete Database Schema

### New / Modified Tables for This Subsystem

```sql
-- ───────────────────────────────────────────────────
-- REVIEWER PROFILES
-- ───────────────────────────────────────────────────
CREATE TABLE reviewer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hackathon_id UUID NOT NULL REFERENCES hackathons(id),
    expertise_text TEXT NOT NULL,          -- Free text: "AI/ML, Computer Vision, NLP"
    institution VARCHAR(255) NOT NULL,     -- Current employer/college
    bio TEXT,
    availability_start TIMESTAMPTZ,       -- When they're available to review
    availability_end TIMESTAMPTZ,
    max_assignments INT DEFAULT 10,        -- Self-declared capacity
    embedding vector(384),                 -- Encoded from expertise_text + bio
    embedding_updated_at TIMESTAMPTZ,
    reliability_score FLOAT DEFAULT 1.0,   -- Updated after each evaluation window
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, hackathon_id)
);
CREATE INDEX idx_reviewer_profiles_hackathon ON reviewer_profiles(hackathon_id);
CREATE INDEX idx_reviewer_profiles_embedding ON reviewer_profiles 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- ───────────────────────────────────────────────────
-- CONFLICT DECLARATIONS
-- ───────────────────────────────────────────────────
CREATE TABLE conflict_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id),
    conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN (
        'same_institution', 'personal_relationship', 'prior_mentorship', 'co_authored', 'other'
    )),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('team', 'participant', 'submission')),
    entity_id UUID NOT NULL,
    conflict_score FLOAT NOT NULL DEFAULT 1.0 CHECK (conflict_score BETWEEN 0 AND 1),
    declared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);
CREATE INDEX idx_conflict_declarations_reviewer ON conflict_declarations(reviewer_id, hackathon_id);
CREATE INDEX idx_conflict_declarations_entity ON conflict_declarations(entity_id);

-- ───────────────────────────────────────────────────
-- REVIEWER ASSIGNMENTS
-- ───────────────────────────────────────────────────
CREATE TABLE reviewer_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    submission_id UUID NOT NULL REFERENCES idea_submissions(id),
    assignment_run_id UUID NOT NULL,        -- Groups all assignments from one run
    expertise_score FLOAT NOT NULL,         -- Cosine similarity at assignment time
    cost FLOAT NOT NULL,                    -- Multi-objective cost at assignment time
    conflict_flag BOOLEAN DEFAULT FALSE,
    conflict_score FLOAT DEFAULT 0.0,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'accepted', 'declined', 'completed', 'no_show', 'reassigned'
    )),
    is_reassignment BOOLEAN DEFAULT FALSE,
    original_assignment_id UUID REFERENCES reviewer_assignments(id),
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    no_show_detected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reviewer_assignments_hackathon ON reviewer_assignments(hackathon_id, status);
CREATE INDEX idx_reviewer_assignments_reviewer ON reviewer_assignments(reviewer_id, hackathon_id);
CREATE INDEX idx_reviewer_assignments_submission ON reviewer_assignments(submission_id);
CREATE INDEX idx_reviewer_assignments_run ON reviewer_assignments(assignment_run_id);

-- ───────────────────────────────────────────────────
-- ASSIGNMENT RUNS (for audit + comparison)
-- ───────────────────────────────────────────────────
CREATE TABLE assignment_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id),
    triggered_by UUID NOT NULL REFERENCES users(id),
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    n_projects INT,
    n_reviewers INT,
    k_reviews_per_project INT DEFAULT 2,
    ai_mean_cosine FLOAT,
    random_mean_cosine FLOAT,
    improvement_pct FLOAT,
    workload_distribution JSONB,            -- {reviewer_id: assignment_count}
    balance_violations_before JSONB,       -- Violations before rebalancing
    balance_violations_after JSONB,        -- Violations after rebalancing
    algorithm_used VARCHAR(50) DEFAULT 'hungarian_1_to_k',
    error_message TEXT
);

-- ───────────────────────────────────────────────────
-- EVALUATION CRITERIA
-- ───────────────────────────────────────────────────
CREATE TABLE evaluation_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    weight FLOAT NOT NULL CHECK (weight > 0 AND weight <= 100),
    score_min FLOAT NOT NULL DEFAULT 0,
    score_max FLOAT NOT NULL DEFAULT 10,
    display_order SMALLINT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,      -- Soft delete only
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Partial index: only count non-deleted criteria for weight sum
CREATE UNIQUE INDEX idx_criteria_hackathon_name ON evaluation_criteria(hackathon_id, name) 
    WHERE NOT is_deleted;

-- ───────────────────────────────────────────────────
-- EVALUATIONS
-- ───────────────────────────────────────────────────
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_assignment_id UUID NOT NULL REFERENCES reviewer_assignments(id),
    submission_id UUID NOT NULL REFERENCES idea_submissions(id),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id),
    total_raw_score FLOAT,
    normalized_score FLOAT,
    reliability_weight FLOAT DEFAULT 1.0,
    feedback_text TEXT,
    status VARCHAR(30) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted')),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_evaluations_submission ON evaluations(submission_id, status);
CREATE INDEX idx_evaluations_hackathon ON evaluations(hackathon_id, status);
CREATE INDEX idx_evaluations_reviewer_assignment ON evaluations(reviewer_assignment_id);

-- ───────────────────────────────────────────────────
-- EVALUATION SCORES (per criterion)
-- ───────────────────────────────────────────────────
CREATE TABLE evaluation_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    criteria_id UUID NOT NULL REFERENCES evaluation_criteria(id),
    raw_score FLOAT NOT NULL,
    normalized_score FLOAT,
    UNIQUE(evaluation_id, criteria_id)
);
CREATE INDEX idx_eval_scores_evaluation ON evaluation_scores(evaluation_id);
CREATE INDEX idx_eval_scores_criteria ON evaluation_scores(criteria_id);

-- ───────────────────────────────────────────────────
-- BIAS ALERTS
-- ───────────────────────────────────────────────────
CREATE TABLE bias_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id),
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
        'REVIEWER_OUTLIER', 'GENDER_BIAS', 'GEOGRAPHIC_BIAS',
        'INSTITUTIONAL_BIAS', 'TECH_STACK_BIAS', 'TEMPORAL_DRIFT',
        'CRITERION_INCONSISTENCY', 'INSUFFICIENT_DATA'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'ALERT')),
    reviewer_id UUID REFERENCES users(id),
    demographic_group VARCHAR(200),
    p_value FLOAT,
    p_value_adjusted FLOAT,              -- Bonferroni-corrected
    alpha_threshold FLOAT DEFAULT 0.0083, -- 0.05 / 6 tests
    effect_size FLOAT,
    effect_size_metric VARCHAR(50),
    effect_size_interpretation VARCHAR(20), -- small/medium/large
    sample_size_group1 INT,
    sample_size_group2 INT,
    statistical_detail JSONB NOT NULL,
    affected_submission_ids UUID[],
    is_active BOOLEAN DEFAULT TRUE,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES users(id),
    admin_action VARCHAR(50) CHECK (admin_action IN (
        'acknowledge', 'renormalize', 'request_reevaluation', NULL
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bias_alerts_hackathon_active ON bias_alerts(hackathon_id, is_active);
CREATE INDEX idx_bias_alerts_type_created ON bias_alerts(hackathon_id, alert_type, created_at DESC);
CREATE INDEX idx_bias_alerts_reviewer ON bias_alerts(reviewer_id, hackathon_id);

-- ───────────────────────────────────────────────────
-- FINAL RESULTS
-- ───────────────────────────────────────────────────
CREATE TABLE final_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id),
    team_id UUID NOT NULL REFERENCES teams(id),
    submission_id UUID NOT NULL REFERENCES idea_submissions(id),
    rank INT,
    final_score FLOAT,
    ci_lower FLOAT,
    ci_upper FLOAT,
    ci_width FLOAT,
    display_confidence_pct FLOAT,         -- 100*(1 - ci_width/score_range)
    krippendorff_alpha FLOAT,             -- Reliability of scores for this team
    n_evaluations INT,                    -- How many evaluations contributed
    score_breakdown JSONB,                -- {criteria_id: {raw, normalized, weight}}
    hackathon_avg_breakdown JSONB,        -- Benchmark for feedback generation
    is_outlier_removed BOOLEAN DEFAULT FALSE,
    outlier_note TEXT,
    tiebreak_level INT DEFAULT 0,         -- 0=no tiebreak needed, 1-4=level used
    admin_rank_override INT,
    admin_override_justification TEXT,
    version INT DEFAULT 1,               -- Increments if results recomputed
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_final_results_hackathon_team ON final_results(hackathon_id, team_id, version);
CREATE INDEX idx_final_results_rank ON final_results(hackathon_id, rank) WHERE version = (
    SELECT MAX(version) FROM final_results fr2 WHERE fr2.hackathon_id = final_results.hackathon_id
);

-- ───────────────────────────────────────────────────
-- TEAM FEEDBACK
-- ───────────────────────────────────────────────────
CREATE TABLE team_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id),
    team_id UUID NOT NULL REFERENCES teams(id),
    feedback_text TEXT NOT NULL,
    generation_model VARCHAR(100) DEFAULT 'gemini-1.5-flash',
    generation_method VARCHAR(20) DEFAULT 'gemini' CHECK (
        generation_method IN ('gemini', 'template_fallback', 'cached')
    ),
    prompt_hash CHAR(64),                 -- SHA-256 of input prompt for cache key
    version INT DEFAULT 1,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(hackathon_id, team_id, version)
);

-- ───────────────────────────────────────────────────
-- AUDIT LOG (Insert-Only with Advisory Lock)
-- ───────────────────────────────────────────────────
CREATE TABLE audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    sequence_num BIGINT NOT NULL,
    previous_hash CHAR(64) NOT NULL,
    current_hash CHAR(64) NOT NULL,
    hash_algorithm VARCHAR(20) NOT NULL DEFAULT 'SHA-256',
    canonical_payload TEXT NOT NULL,     -- The exact string that was hashed
    action VARCHAR(100) NOT NULL,
    actor_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- No UPDATE, no DELETE ever
ALTER TABLE audit_log ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);
ALTER TABLE audit_log ADD CONSTRAINT audit_log_seq_unique UNIQUE (sequence_num);
ALTER TABLE audit_log ADD CONSTRAINT audit_log_hash_unique UNIQUE (current_hash);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id, timestamp DESC);
CREATE INDEX idx_audit_log_hackathon ON audit_log((metadata->>'hackathon_id'));
CREATE INDEX idx_audit_log_sequence ON audit_log(sequence_num);

-- Prevent modification
CREATE RULE audit_log_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE RULE audit_log_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;

-- Serialized insert function with advisory lock
CREATE OR REPLACE FUNCTION insert_audit_log(
    p_action VARCHAR, p_actor_id UUID, p_entity_type VARCHAR,
    p_entity_id UUID, p_metadata JSONB
) RETURNS UUID AS $$
DECLARE
    v_seq BIGINT; v_prev_hash CHAR(64); v_payload TEXT;
    v_current_hash CHAR(64); v_id UUID; v_ts TIMESTAMPTZ;
BEGIN
    -- Serialize: only one insert at a time across all connections
    PERFORM pg_advisory_xact_lock(hashtext('audit_log_insert'));

    SELECT sequence_num, current_hash INTO v_seq, v_prev_hash
    FROM audit_log ORDER BY sequence_num DESC LIMIT 1;

    IF v_seq IS NULL THEN
        v_seq := 0; v_prev_hash := repeat('0', 64);
    END IF;

    v_seq := v_seq + 1;
    v_ts := clock_timestamp();  -- Use clock_timestamp() not now() for precision
    v_id := gen_random_uuid();

    -- Canonical payload: deterministic string
    v_payload := v_seq::TEXT || '|' ||
                 p_action || '|' ||
                 p_actor_id::TEXT || '|' ||
                 p_entity_type || '|' ||
                 p_entity_id::TEXT || '|' ||
                 to_char(v_ts AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') || '|' ||
                 p_metadata::TEXT;

    v_current_hash := encode(sha256((v_prev_hash || v_payload)::bytea), 'hex');

    INSERT INTO audit_log
        (id, sequence_num, previous_hash, current_hash, hash_algorithm,
         canonical_payload, action, actor_id, entity_type, entity_id, metadata, timestamp)
    VALUES
        (v_id, v_seq, v_prev_hash, v_current_hash, 'SHA-256',
         v_payload, p_action, p_actor_id, p_entity_type, p_entity_id, p_metadata, v_ts);

    RETURN v_id;
END;
$$ LANGUAGE plpgsql;
```

### Modified Tables

```sql
-- Add to hackathons
ALTER TABLE hackathons ADD COLUMN rubric_locked_at TIMESTAMPTZ;
ALTER TABLE hackathons ADD COLUMN results_published_at TIMESTAMPTZ;
ALTER TABLE hackathons ADD COLUMN results_version INT DEFAULT 0;

-- Add to registrations (for geographic bias)
ALTER TABLE registrations ADD COLUMN state VARCHAR(100);
ALTER TABLE registrations ADD COLUMN country VARCHAR(100) DEFAULT 'India';
ALTER TABLE registrations ADD COLUMN gender VARCHAR(20) 
    CHECK (gender IN ('male','female','non_binary','prefer_not_to_say',NULL));
ALTER TABLE registrations ADD COLUMN demographic_consent_at TIMESTAMPTZ;
```

---

## 4.3 Complete API Specifications

### Reviewer Profile

```
POST /api/v1/hackathons/{hackathon_id}/reviewers/profile
Auth: Reviewer JWT
Content-Type: application/json

Request:
{
    "expertise_text": "Machine learning, computer vision, deep learning, NLP. 
                        Expert in PyTorch, TensorFlow. Industry experience at Google AI.",
    "institution": "Google India",
    "bio": "5 years in ML research. Published at NeurIPS 2023.",
    "availability_start": "2024-03-15T09:00:00Z",
    "availability_end": "2024-03-17T18:00:00Z",
    "max_assignments": 8
}

Response 201:
{
    "reviewer_profile_id": "uuid",
    "expertise_embedding_generated": true,
    "expertise_confidence": 0.87,  // cosine sim of embedding to domain centroid
    "declared_conflict_count": 0,
    "next_steps": "Declare any conflicts at POST /reviewers/conflicts/declare"
}

Response 422:
{
    "error": "INVALID_EXPERTISE_TEXT",
    "detail": "expertise_text must be at least 20 characters",
    "min_length": 20,
    "provided_length": 5
}
```

```
POST /api/v1/hackathons/{hackathon_id}/reviewers/conflicts/declare
Auth: Reviewer JWT

Request:
{
    "conflicts": [
        {
            "conflict_type": "same_institution",
            "entity_type": "team",
            "entity_id": "team-uuid-1",
            "notes": "I am the faculty advisor for this team"
        },
        {
            "conflict_type": "personal_relationship",
            "entity_type": "participant",
            "entity_id": "user-uuid-2",
            "notes": "Former student"
        }
    ]
}

Response 201:
{
    "conflicts_declared": 2,
    "conflicts": [
        {"id": "uuid", "entity_id": "team-uuid-1", "conflict_score": 1.0, "action": "HARD_EXCLUDE"},
        {"id": "uuid", "entity_id": "user-uuid-2", "conflict_score": 1.0, "action": "HARD_EXCLUDE"}
    ]
}
```

### Assignment Engine

```
POST /api/v1/reviews/assign/{hackathon_id}
Auth: Admin JWT

Request:
{
    "k_reviews_per_project": 2,
    "objective_weights": {
        "expertise": 0.40,
        "workload": 0.30,
        "conflict": 0.20,
        "diversity": 0.10
    },
    "dry_run": false
}

Response 202:
{
    "job_id": "celery-task-uuid",
    "assignment_run_id": "uuid",
    "ws_channel": "/ws/assignment/{hackathon_id}",
    "estimated_completion_seconds": 45,
    "n_projects": 15,
    "n_reviewers": 8,
    "total_review_slots": 30,
    "capacity_check": {
        "max_capacity": 40,
        "feasible": true
    }
}

Response 409 (if already running):
{
    "error": "ASSIGNMENT_IN_PROGRESS",
    "existing_job_id": "celery-task-uuid",
    "detail": "An assignment run is already in progress"
}

Response 422 (infeasible):
{
    "error": "ASSIGNMENT_INFEASIBLE",
    "detail": "Need 30 review slots but max reviewer capacity is 16",
    "resolution": "Add more reviewers or reduce k_reviews_per_project to 1"
}
```

```
GET /api/v1/reviews/assignment-plan/{hackathon_id}
Auth: Admin JWT

Response 200:
{
    "assignment_run": {
        "id": "uuid",
        "status": "completed",
        "triggered_at": "2024-03-15T10:00:00Z",
        "completed_at": "2024-03-15T10:00:38Z",
        "duration_seconds": 38
    },
    "metrics": {
        "ai_mean_cosine_score": 0.782,
        "random_baseline_cosine_score": 0.491,
        "improvement_pct": 59.3,
        "workload_balanced": true,
        "workload_variance_pct": 7.2,
        "unresolvable_conflicts": 0
    },
    "assignments": [
        {
            "reviewer_id": "uuid",
            "reviewer_name": "Dr. Anita Sharma",
            "reviewer_institution": "Google India",
            "submission_id": "uuid",
            "submission_title": "AI-Powered Crop Disease Detection",
            "expertise_score": 0.91,
            "conflict_flag": false,
            "is_reassignment": false,
            "status": "pending"
        }
    ],
    "workload_distribution": {
        "reviewer-uuid-1": 4,
        "reviewer-uuid-2": 3,
        "reviewer-uuid-3": 4,
        "target": 3.75
    },
    "conflict_graph": {
        "nodes": [...],
        "edges": [{"reviewer_id": "uuid", "team_id": "uuid", "conflict_type": "same_institution"}]
    }
}
```

### Evaluation Submission

```
POST /api/v1/reviews/{assignment_id}/submit
Auth: Reviewer JWT

Request:
{
    "scores": [
        {"criteria_id": "uuid-innovation", "score": 8.5},
        {"criteria_id": "uuid-technical",  "score": 9.0},
        {"criteria_id": "uuid-execution",  "score": 7.5},
        {"criteria_id": "uuid-presentation", "score": 8.0}
    ],
    "feedback_text": "Strong technical implementation with clear problem framing. 
                      The team demonstrated solid understanding of the domain...",
    "is_final": true
}

Response 201:
{
    "evaluation_id": "uuid",
    "total_raw_score": 8.25,
    "scores_recorded": 4,
    "bias_analysis_queued": true,
    "audit_log_id": "uuid",
    "status": "submitted"
}

Response 403 (wrong reviewer):
{
    "error": "ASSIGNMENT_NOT_OWNED",
    "detail": "This assignment belongs to a different reviewer"
}

Response 409 (already submitted):
{
    "error": "EVALUATION_ALREADY_SUBMITTED",
    "evaluation_id": "existing-uuid",
    "submitted_at": "2024-03-15T11:30:00Z"
}

Response 422 (score out of range):
{
    "error": "SCORE_OUT_OF_RANGE",
    "violations": [
        {
            "criteria_id": "uuid-innovation",
            "criteria_name": "Innovation",
            "provided": 11.5,
            "min": 0,
            "max": 10
        }
    ]
}
```

### Bias Analysis

```
GET /api/v1/bias-analysis/{hackathon_id}
Auth: Admin JWT

Response 200:
{
    "summary": {
        "total_alerts": 3,
        "active_alerts": 2,
        "alert_by_severity": {"WARNING": 1, "ALERT": 2, "INFO": 0},
        "fairness_score": 74.3,
        "last_analyzed_at": "2024-03-15T11:45:00Z",
        "n_evaluations_analyzed": 28
    },
    "alerts": [
        {
            "id": "uuid",
            "alert_type": "REVIEWER_OUTLIER",
            "severity": "ALERT",
            "reviewer_id": "uuid",
            "reviewer_display": "Reviewer #3",  // anonymized for display
            "statistical_detail": {
                "z_score": -2.71,
                "reviewer_mean": 4.2,
                "global_mean": 6.8,
                "direction": "harsh",
                "n_evaluations": 6
            },
            "p_value": null,           // z-test, not p-value based
            "effect_size": 2.71,
            "effect_size_metric": "z_score",
            "effect_size_interpretation": "large",
            "affected_submission_ids": ["uuid1", "uuid2", "uuid3", "uuid4", "uuid5", "uuid6"],
            "recommended_action": "Re-evaluate affected submissions or apply z-score normalization",
            "is_active": true,
            "created_at": "2024-03-15T11:45:00Z"
        },
        {
            "id": "uuid2",
            "alert_type": "INSTITUTIONAL_BIAS",
            "severity": "ALERT",
            "demographic_group": "VIT Vellore (n=6) vs Others (n=22)",
            "statistical_detail": {
                "test": "Mann-Whitney U",
                "U_statistic": 34.0,
                "p_value_raw": 0.003,
                "p_value_bonferroni": 0.018,
                "alpha_bonferroni": 0.0083,
                "group_means": {"VIT Vellore": 5.1, "Others": 7.4}
            },
            "p_value": 0.003,
            "p_value_adjusted": 0.018,
            "effect_size": 0.61,
            "effect_size_metric": "rank_biserial_r",
            "effect_size_interpretation": "large",
            "sample_size_group1": 6,
            "sample_size_group2": 22,
            "is_active": true
        }
    ],
    "reviewer_heatmap": [
        {
            "reviewer_id": "uuid",
            "display_label": "Reviewer #1",
            "z_score": 0.3,
            "n_evaluations": 8,
            "mean_score": 7.1,
            "consistency_cv": 0.18
        }
    ]
}
```

```
POST /api/v1/bias-alerts/{alert_id}/acknowledge
Auth: Admin JWT

Request:
{
    "action": "renormalize",  // "acknowledge" | "renormalize" | "request_reevaluation"
    "justification": "Reviewer was calibrating early; scores later aligned with peers"
}

Response 200:
{
    "alert_id": "uuid",
    "acknowledged_at": "2024-03-15T12:00:00Z",
    "action_taken": "renormalize",
    "audit_log_id": "uuid",
    "effect": "Z-score normalization weight reduced for this reviewer's scores"
}
```

```
GET /api/v1/bias-analysis/{hackathon_id}/fairness-score
Auth: Admin JWT

Response 200:
{
    "fairness_score": 74.3,
    "score_interpretation": "Moderate — active bias alerts detected",
    "components": {
        "reviewer_outlier_penalty": 15.2,
        "institutional_bias_penalty": 10.5,
        "gender_bias_penalty": 0.0,
        "tech_stack_bias_penalty": 0.0,
        "temporal_drift_penalty": 0.0
    },
    "krippendorff_alpha": 0.73,
    "alpha_interpretation": "Acceptable inter-rater reliability",
    "n_shared_project_evaluations": 12
}
```

### Results Engine

```
POST /api/v1/results/{hackathon_id}/compute
Auth: Admin JWT

Response 202:
{
    "job_id": "celery-task-uuid",
    "ws_channel": "/ws/results/{hackathon_id}",
    "stages": [
        "LOADING_EVALUATIONS",
        "NORMALIZING_SCORES",
        "COMPUTING_BOOTSTRAP_CI",
        "RANKING_TEAMS",
        "PERSISTING_RANKINGS",
        "TRIGGERING_FEEDBACK_GENERATION"
    ],
    "estimated_ranking_seconds": 25,
    "estimated_feedback_minutes": "3-5 (async, Gemini rate-limited)"
}
```

```
GET /api/v1/results/{hackathon_id}/rankings
Auth: Admin JWT (before publish) / Any authenticated (after publish)

Response 200:
{
    "hackathon_id": "uuid",
    "computed_at": "2024-03-15T14:00:00Z",
    "version": 1,
    "published": false,
    "normalization_method": "per_reviewer_z_score_rescaled",
    "rankings": [
        {
            "rank": 1,
            "team_id": "uuid",
            "team_name": "NeuralNomads",
            "submission_title": "AI-Powered Crop Disease Detection",
            "final_score": 8.91,
            "ci_lower": 8.43,
            "ci_upper": 9.39,
            "ci_width": 0.96,
            "display_confidence_pct": 90.4,
            "krippendorff_alpha": 0.84,
            "n_evaluations": 3,
            "score_breakdown": {
                "Innovation": {"raw_avg": 9.0, "normalized_avg": 9.1, "weight": 0.25, "hackathon_avg": 7.2},
                "Technical":  {"raw_avg": 8.8, "normalized_avg": 8.9, "weight": 0.30, "hackathon_avg": 6.8},
                "Execution":  {"raw_avg": 8.5, "normalized_avg": 8.7, "weight": 0.25, "hackathon_avg": 6.5},
                "Presentation": {"raw_avg": 9.0, "normalized_avg": 8.95, "weight": 0.20, "hackathon_avg": 7.0}
            },
            "tiebreak_level": 0,
            "feedback_status": "ready",
            "is_outlier_removed": false
        }
    ],
    "ci_overlapping_pairs": [],   // Pairs whose CIs overlap (flagged for admin review)
    "global_stats": {
        "overall_mean": 6.82,
        "overall_std": 1.24,
        "krippendorff_alpha_overall": 0.73,
        "n_evaluations_total": 45,
        "n_outlier_evaluations_removed": 2
    }
}
```

```
GET /api/v1/results/{hackathon_id}/feedback/{team_id}
Auth: Team member JWT (own team) or Admin JWT

Response 200:
{
    "team_id": "uuid",
    "team_name": "NeuralNomads",
    "feedback": "Your team's project on AI-powered crop disease detection stood out as 
                 one of the strongest technical implementations in the hackathon...",
    "generation_method": "gemini",
    "model": "gemini-1.5-flash",
    "generated_at": "2024-03-15T14:05:32Z",
    "version": 1
}

Response 202 (feedback still generating):
{
    "status": "generating",
    "estimated_wait_seconds": 45,
    "ws_channel": "/ws/results/{hackathon_id}"
}
```

### Audit Trail

```
GET /api/v1/audit/{hackathon_id}/trail
Auth: Admin JWT

Query Params:
  entity_type: registration|team|review|bias_alert
  entity_id: uuid (optional, filter to one entity)
  limit: int (default 50, max 200)
  offset: int

Response 200:
{
    "total_entries": 847,
    "chain_length": 847,
    "entries": [
        {
            "sequence_num": 847,
            "action": "EVALUATION_SUBMITTED",
            "actor_id": "uuid",
            "entity_type": "evaluation",
            "entity_id": "uuid",
            "timestamp": "2024-03-15T11:30:00Z",
            "current_hash": "a3f2b1...",
            "previous_hash": "8c4d5e...",
            "metadata": {
                "hackathon_id": "uuid",
                "submission_id": "uuid",
                "total_raw_score": 8.25
            }
        }
    ]
}
```

```
POST /api/v1/audit/{hackathon_id}/verify
Auth: Admin JWT

Response 200 (intact):
{
    "verified": true,
    "chain_length": 847,
    "genesis_sequence_num": 1,
    "latest_sequence_num": 847,
    "verification_completed_at": "2024-03-15T14:30:00Z",
    "verification_duration_ms": 234
}

Response 200 (tampered):
{
    "verified": false,
    "first_broken_link": {
        "sequence_num": 412,
        "stored_hash": "a3f2b1...",
        "computed_hash": "9d1e4f...",
        "detail": "Hash mismatch — entry may have been modified"
    },
    "entries_checked_before_failure": 411
}
```

---

## 4.4 Celery Task Specifications

```python
# ─────────────────────────────────────────────────────────
# TASK 1: Reviewer Assignment
# ─────────────────────────────────────────────────────────
@celery.task(
    name="tasks.run_reviewer_assignment",
    queue="ai_low",
    max_retries=2,
    default_retry_delay=30,
    acks_late=True,
    reject_on_worker_lost=True
)
def run_reviewer_assignment(
    hackathon_id: str,
    assignment_run_id: str,
    k_reviews_per_project: int,
    objective_weights: dict
):
    """
    Stages:
    1. LOADING_DATA       → Load reviewer profiles + project embeddings from DB
    2. COMPUTING_CONFLICTS → Build conflict adjacency matrix
    3. BUILDING_MATRIX    → Compute (N*K × M) cost matrix
    4. OPTIMIZING         → scipy linear_sum_assignment on padded square matrix
    5. VERIFYING_BALANCE  → Check ±10% workload; rebalance if needed
    6. COMPUTING_BASELINE → Run random assignment for comparison metric
    7. PERSISTING         → Save reviewer_assignments rows
    8. NOTIFYING          → WS broadcast + email notifications
    """
    channel = f"assignment:{hackathon_id}"
    
    try:
        db.update_assignment_run(assignment_run_id, status="running")
        
        # Stage 1
        redis.publish(channel, json.dumps({"stage": "LOADING_DATA", "pct": 10}))
        projects = db.get_submissions_for_assignment(hackathon_id)
        reviewers = db.get_reviewer_profiles(hackathon_id)
        
        if len(projects) == 0:
            raise AssignmentError("No submissions available for assignment")
        if len(reviewers) == 0:
            raise AssignmentError("No reviewers available")
        
        # Stage 2
        redis.publish(channel, json.dumps({"stage": "COMPUTING_CONFLICTS", "pct": 25}))
        conflict_matrix = build_conflict_matrix(projects, reviewers, hackathon_id)
        
        # Stage 3
        redis.publish(channel, json.dumps({"stage": "BUILDING_MATRIX", "pct": 40}))
        cost_matrix = build_1_to_k_cost_matrix(
            projects, reviewers, k_reviews_per_project,
            lambda r, p: compute_match_cost(r, p, conflict_matrix, objective_weights)
        )
        
        # Stage 4
        redis.publish(channel, json.dumps({"stage": "OPTIMIZING", "pct": 55}))
        n_slots = len(projects) * k_reviews_per_project
        padded_dim = max(n_slots, len(reviewers))
        row_ind, col_ind = linear_sum_assignment(cost_matrix[:padded_dim, :padded_dim])
        
        assignments = []
        for slot, r_idx in zip(row_ind, col_ind):
            if slot < n_slots and r_idx < len(reviewers):
                project = projects[slot // k_reviews_per_project]
                reviewer = reviewers[r_idx]
                assignments.append({
                    "project_id": project.id,
                    "reviewer_id": reviewer.id,
                    "expertise_score": round(1.0 - cost_matrix[slot][r_idx], 4),
                    "cost": round(cost_matrix[slot][r_idx], 4),
                    "conflict_flag": conflict_matrix[r_idx][slot // k_reviews_per_project] >= 1.0
                })
        
        # Stage 5
        redis.publish(channel, json.dumps({"stage": "VERIFYING_BALANCE", "pct": 70}))
        assignments, balance_report = verify_and_rebalance(assignments, reviewers)
        
        # Stage 6 — Random baseline for demo
        redis.publish(channel, json.dumps({"stage": "COMPUTING_BASELINE", "pct": 80}))
        random_assignments = _random_baseline_assignment(projects, reviewers, k_reviews_per_project)
        ai_mean = np.mean([a["expertise_score"] for a in assignments])
        random_mean = np.mean([a["expertise_score"] for a in random_assignments])
        
        # Stage 7
        redis.publish(channel, json.dumps({"stage": "PERSISTING", "pct": 90}))
        db.bulk_create_reviewer_assignments(assignment_run_id, assignments)
        db.update_assignment_run(assignment_run_id, status="completed", metrics={
            "ai_mean_cosine": round(ai_mean, 4),
            "random_mean_cosine": round(random_mean, 4),
            "improvement_pct": round((ai_mean - random_mean) / random_mean * 100, 1),
            "workload_distribution": balance_report["final_distribution"]
        })
        
        # Write audit log
        audit_service.write(
            action="REVIEWER_ASSIGNMENT_COMPLETED",
            actor_id=system_actor_id,
            entity_type="assignment_run",
            entity_id=assignment_run_id,
            metadata={
                "hackathon_id": hackathon_id,
                "n_assignments": len(assignments),
                "ai_mean_cosine": round(ai_mean, 4),
                "improvement_vs_random_pct": round((ai_mean - random_mean) / random_mean * 100, 1)
            }
        )
        
        # Stage 8 — Notify reviewers
        redis.publish(channel, json.dumps({
            "stage": "COMPLETE",
            "pct": 100,
            "assignment_run_id": assignment_run_id,
            "metrics": {
                "ai_mean_cosine": round(ai_mean, 4),
                "random_mean_cosine": round(random_mean, 4),
                "improvement_pct": round((ai_mean - random_mean) / random_mean * 100, 1),
                "balanced": balance_report["balanced"]
            }
        }))
        
        # Enqueue reviewer notifications
        for assignment in assignments:
            send_reviewer_assignment_notification.apply_async(
                args=[assignment["reviewer_id"], assignment["project_id"], hackathon_id],
                queue="notifications"
            )
        
        # Schedule deadline checks
        hackathon = db.get_hackathon(hackathon_id)
        schedule_reviewer_deadline_checks(hackathon_id, hackathon.evaluation_deadline)
        
    except AssignmentImpossibleError as e:
        db.update_assignment_run(assignment_run_id, status="failed", error_message=str(e))
        redis.publish(channel, json.dumps({"stage": "FAILED", "error": str(e)}))
        raise
    except Exception as e:
        db.update_assignment_run(assignment_run_id, status="failed", error_message=str(e))
        redis.publish(channel, json.dumps({"stage": "FAILED", "error": "Internal error"}))
        raise self.retry(exc=e)


# ─────────────────────────────────────────────────────────
# TASK 2: Bias Analysis (with deduplication lock)
# ─────────────────────────────────────────────────────────
@celery.task(
    name="tasks.run_bias_analysis",
    queue="ai_low",
    max_retries=0,   # No retry; next eval submission will re-trigger
    acks_late=True
)
def run_bias_analysis(hackathon_id: str):
    lock_key = f"bias_analysis_lock:{hackathon_id}"
    lock_acquired = redis.set(lock_key, "1", nx=True, ex=60)
    if not lock_acquired:
        return  # Another worker is running analysis for this hackathon
    
    channel = f"evaluation-live:{hackathon_id}"
    
    try:
        service = BiasDetectionService()
        alerts = service.analyze(hackathon_id)
        
        # Deduplicate: don't create duplicate alerts for same bias type within 5 minutes
        existing_active = db.get_active_bias_alerts(hackathon_id)
        existing_types = {a.alert_type for a in existing_active}
        
        new_alerts = [a for a in alerts if a["alert_type"] not in existing_types
                      or _alert_is_significantly_different(a, existing_active)]
        
        if new_alerts:
            created = db.bulk_create_bias_alerts(hackathon_id, new_alerts)
            for alert in created:
                audit_service.write("BIAS_ALERT_CREATED", system_actor_id, "bias_alert", 
                                   alert.id, {"alert_type": alert.alert_type, "severity": alert.severity})
                redis.publish(channel, json.dumps({
                    "type": "BIAS_ALERT",
                    "alert": {
                        "id": str(alert.id),
                        "alert_type": alert.alert_type,
                        "severity": alert.severity,
                        "statistical_detail": alert.statistical_detail,
                        "created_at": alert.created_at.isoformat()
                    }
                }))
        
        # Always update fairness score
        fairness_score = _compute_fairness_score(hackathon_id)
        redis.publish(channel, json.dumps({
            "type": "FAIRNESS_SCORE_UPDATED",
            "fairness_score": fairness_score,
            "active_alert_count": len(db.get_active_bias_alerts(hackathon_id))
        }))
    finally:
        redis.delete(lock_key)


# ─────────────────────────────────────────────────────────
# TASK 3: Results Computation (Phase 1 — fast, no Gemini)
# ─────────────────────────────────────────────────────────
@celery.task(
    name="tasks.compute_results",
    queue="ai_low",
    max_retries=1,
    acks_late=True
)
def compute_results(hackathon_id: str):
    channel = f"results:{hackathon_id}"
    
    stages = ["LOADING_EVALUATIONS", "NORMALIZING_SCORES", 
              "COMPUTING_BOOTSTRAP_CI", "RANKING_TEAMS", 
              "PERSISTING_RANKINGS", "TRIGGERING_FEEDBACK"]
    
    redis.publish(channel, json.dumps({"stage": "LOADING_EVALUATIONS", "pct": 10}))
    evaluations = db.get_all_submitted_evaluations(hackathon_id)
    
    if len(evaluations) == 0:
        raise ResultsError("No submitted evaluations found")
    
    redis.publish(channel, json.dumps({"stage": "NORMALIZING_SCORES", "pct": 25}))
    
    # Build raw scores matrix: {reviewer_id: {project_id: total_score}}
    raw_scores = _build_raw_scores_matrix(evaluations)
    normalized_scores = normalize_reviewer_scores(raw_scores, rubric_weights=db.get_rubric_weights(hackathon_id))
    
    # Write normalized scores back to evaluation records
    db.bulk_update_normalized_scores(hackathon_id, normalized_scores)
    
    redis.publish(channel, json.dumps({"stage": "COMPUTING_BOOTSTRAP_CI", "pct": 50}))
    
    # Bootstrap CI: 1000 resamples per team
    rng = np.random.default_rng(seed=42)  # Reproducible seed stored with results
    project_rankings = []
    
    for project_id in set(pid for r_scores in raw_scores.values() for pid in r_scores):
        project_reviewer_scores = [
            normalized_scores[r_id][project_id]
            for r_id in normalized_scores
            if project_id in normalized_scores.get(r_id, {})
        ]
        
        if len(project_reviewer_scores) == 0:
            continue
        
        # Bootstrap CI
        bootstrap_samples = [
            np.mean(rng.choice(project_reviewer_scores, size=len(project_reviewer_scores), replace=True))
            for _ in range(1000)
        ]
        
        final_score = np.mean(bootstrap_samples)
        ci_lower, ci_upper = np.percentile(bootstrap_samples, [2.5, 97.5])
        ci_width = ci_upper - ci_lower
        display_confidence = max(0.0, 100.0 * (1.0 - ci_width / 10.0))  # 10 = max score range
        
        # Krippendorff's alpha for this project's evaluations
        alpha = _compute_krippendorff_alpha_for_project(project_id, evaluations)
        
        project_rankings.append({
            "project_id": project_id,
            "final_score": round(final_score, 4),
            "ci_lower": round(ci_lower, 4),
            "ci_upper": round(ci_upper, 4),
            "ci_width": round(ci_width, 4),
            "display_confidence_pct": round(display_confidence, 1),
            "krippendorff_alpha": round(alpha, 4) if alpha is not None else None,
            "n_evaluations": len(project_reviewer_scores)
        })
    
    redis.publish(channel, json.dumps({"stage": "RANKING_TEAMS", "pct": 70}))
    
    # Sort by final_score DESC, then tiebreak cascade
    project_rankings.sort(key=lambda x: _tiebreak_key(x, evaluations), reverse=True)
    for i, pr in enumerate(project_rankings):
        pr["rank"] = i + 1
    
    redis.publish(channel, json.dumps({"stage": "PERSISTING_RANKINGS", "pct": 85}))
    
    version = db.get_next_results_version(hackathon_id)
    db.bulk_create_final_results(hackathon_id, project_rankings, version)
    db.update_hackathon(hackathon_id, status="results_computing", results_version=version)
    
    audit_service.write("RESULTS_COMPUTED", system_actor_id, "hackathon", hackathon_id, {
        "version": version,
        "n_teams_ranked": len(project_rankings),
        "top_team": project_rankings[0]["project_id"] if project_rankings else None,
        "global_krippendorff_alpha": _compute_global_krippendorff_alpha(hackathon_id, evaluations)
    })
    
    # Rankings published immediately — feedback generation is async
    redis.publish(channel, json.dumps({
        "stage": "RANKINGS_READY",
        "pct": 90,
        "n_teams": len(project_rankings),
        "feedback_status": "generating"
    }))
    
    # Enqueue feedback generation (separate task, non-blocking)
    redis.publish(channel, json.dumps({"stage": "TRIGGERING_FEEDBACK", "pct": 95}))
    generate_feedback.apply_async(args=[hackathon_id, version], queue="ai_low")


# ─────────────────────────────────────────────────────────
# TASK 4: Feedback Generation (Phase 2 — Gemini, async)
# ─────────────────────────────────────────────────────────
@celery.task(
    name="tasks.generate_feedback",
    queue="ai_low",
    max_retries=3,
    default_retry_delay=60,  # 60s between retries (Gemini rate limit recovery)
    acks_late=True
)
def generate_feedback(hackathon_id: str, results_version: int):
    channel = f"results:{hackathon_id}"
    teams = db.get_teams_with_results(hackathon_id, results_version)
    
    for team in teams:
        cache_key = f"feedback:{hackathon_id}:{team.id}:{_score_hash(team)}"
        cached = redis.get(cache_key)
        
        if cached:
            feedback_text = cached.decode()
            generation_method = "cached"
        else:
            try:
                prompt = build_feedback_prompt(team)
                feedback_text = call_gemini_with_exponential_backoff(
                    prompt=prompt,
                    max_retries=3,
                    initial_delay=4,  # 15 RPM = one every 4 seconds
                    timeout=30
                )
                redis.setex(cache_key, 86400, feedback_text)  # 24h TTL
                generation_method = "gemini"
            except GeminiRateLimitError:
                feedback_text = _template_fallback_feedback(team)
                generation_method = "template_fallback"
            except GeminiTimeoutError:
                feedback_text = _template_fallback_feedback(team)
                generation_method = "template_fallback"
        
        db.upsert_team_feedback(
            hackathon_id=hackathon_id,
            team_id=team.id,
            feedback_text=feedback_text,
            generation_method=generation_method,
            version=results_version,
            prompt_hash=hashlib.sha256(build_feedback_prompt(team).encode()).hexdigest()
        )
        
        redis.publish(channel, json.dumps({
            "type": "FEEDBACK_READY",
            "team_id": str(team.id),
            "generation_method": generation_method
        }))
    
    redis.publish(channel, json.dumps({
        "type": "ALL_FEEDBACK_READY",
        "n_teams": len(teams)
    }))
    
    audit_service.write("FEEDBACK_GENERATED", system_actor_id, "hackathon", hackathon_id, {
        "version": results_version,
        "n_teams": len(teams),
        "gemini_generated": sum(1 for t in teams if t.feedback_method == "gemini"),
        "template_fallback": sum(1 for t in teams if t.feedback_method == "template_fallback")
    })
```

---

## 4.5 Krippendorff's Alpha — Custom Implementation

```python
import numpy as np
from collections import Counter

def krippendorff_alpha_ordinal(
    ratings: dict  # {unit_id: {coder_id: numeric_value}}
) -> float | None:
    """
    Computes Krippendorff's alpha for ordinal data.
    Returns float in [-1, 1]:
      1.0  = perfect agreement
      0.0  = agreement expected by chance
     <0.0  = systematic disagreement (worse than chance)
    Returns None if insufficient data (< 2 coders, < 2 units).
    """
    # Collect all coders and units
    all_coders = sorted({c for unit in ratings.values() for c in unit.keys()})
    all_units = sorted(ratings.keys())

    if len(all_coders) < 2 or len(all_units) < 2:
        return None

    # Build matrix (units × coders), NaN for missing
    matrix = np.full((len(all_units), len(all_coders)), np.nan)
    for u_idx, unit in enumerate(all_units):
        for c_idx, coder in enumerate(all_coders):
            if coder in ratings[unit]:
                matrix[u_idx][c_idx] = ratings[unit][coder]

    # Count valid (non-NaN) values per unit
    valid_per_unit = np.sum(~np.isnan(matrix), axis=1)
    eligible_units = np.sum(valid_per_unit >= 2)
    if eligible_units == 0:
        return None  # No unit has ≥2 raters

    # All valid values for expected disagreement
    all_values = matrix[~np.isnan(matrix)]
    n = len(all_values)
    if n < 4:
        return None

    # For ordinal: d(v_k, v_l)^2 = (v_k - v_l)^2
    # Expected disagreement (D_e): computed from value distribution
    D_e = 0.0
    for i in range(len(all_values)):
        for j in range(len(all_values)):
            if i != j:
                D_e += (all_values[i] - all_values[j]) ** 2
    D_e /= (n * (n - 1))

    if abs(D_e) < 1e-9:
        return 1.0  # All values identical → perfect agreement

    # Observed disagreement (D_o): computed from paired ratings within units
    D_o = 0.0
    n_pairs = 0
    for u_idx in range(len(all_units)):
        row = matrix[u_idx]
        valid_scores = row[~np.isnan(row)]
        n_u = len(valid_scores)
        if n_u < 2:
            continue
        for i in range(n_u):
            for j in range(i + 1, n_u):
                D_o += (valid_scores[i] - valid_scores[j]) ** 2
                n_pairs += 1

    if n_pairs == 0:
        return None

    D_o /= n_pairs
    alpha = 1.0 - D_o / D_e
    return round(float(alpha), 4)


def build_krippendorff_input_from_evaluations(
    evaluations: list,
    project_ids: list
) -> dict:
    """
    Builds ratings dict from evaluations list.
    Only includes projects with ≥2 reviewer evaluations (shared projects).
    """
    from collections import defaultdict
    ratings = defaultdict(dict)

    for eval in evaluations:
        if eval.submission_id in project_ids and eval.status == 'submitted':
            ratings[eval.submission_id][eval.reviewer_id] = eval.normalized_score or eval.total_raw_score

    # Filter to shared projects only
    return {
        project_id: rater_scores
        for project_id, rater_scores in ratings.items()
        if len(rater_scores) >= 2
    }
```

---

## 4.6 Bias Detection — Complete Implementation

```python
from scipy import stats
import numpy as np
from collections import defaultdict

N_TESTS = 6
ALPHA_BASE = 0.05
ALPHA_BONFERRONI = ALPHA_BASE / N_TESTS  # = 0.008333...

class BiasDetectionService:

    def analyze(self, hackathon_id: str) -> list[dict]:
        evaluations = db.get_submitted_evaluations(hackathon_id)
        if len(evaluations) < 3:
            return [{"alert_type": "INSUFFICIENT_DATA", "severity": "INFO",
                     "statistical_detail": {"n_evaluations": len(evaluations), "minimum_required": 3}}]

        alerts = []
        alerts.extend(self._reviewer_outlier_zscore(evaluations))
        alerts.extend(self._gender_bias_test(evaluations, hackathon_id))
        alerts.extend(self._institutional_bias_test(evaluations, hackathon_id))
        alerts.extend(self._tech_stack_bias_test(evaluations, hackathon_id))
        alerts.extend(self._temporal_drift_test(evaluations))
        alerts.extend(self._criterion_consistency_test(evaluations))
        return alerts

    def _reviewer_outlier_zscore(self, evaluations) -> list[dict]:
        # Group by reviewer
        reviewer_scores = defaultdict(list)
        for e in evaluations:
            reviewer_scores[e.reviewer_id].append(e.total_raw_score)

        # Need ≥3 reviewers with ≥2 evaluations each
        eligible = {r_id: scores for r_id, scores in reviewer_scores.items() if len(scores) >= 2}
        if len(eligible) < 3:
            return []

        reviewer_means = {r_id: np.mean(scores) for r_id, scores in eligible.items()}
        all_means = list(reviewer_means.values())
        global_mean = np.mean(all_means)
        global_std = np.std(all_means, ddof=1)

        if global_std < 1e-9:
            return []  # All reviewers identical — no outlier possible

        alerts = []
        for r_id, r_mean in reviewer_means.items():
            z = (r_mean - global_mean) / global_std
            if abs(z) >= 2.0:
                severity = "ALERT" if abs(z) >= 3.0 else "WARNING"
                alerts.append({
                    "alert_type": "REVIEWER_OUTLIER",
                    "severity": severity,
                    "reviewer_id": r_id,
                    "p_value": None,
                    "p_value_adjusted": None,
                    "effect_size": round(abs(z), 4),
                    "effect_size_metric": "z_score",
                    "effect_size_interpretation": "large" if abs(z) >= 3.0 else "medium",
                    "sample_size_group1": len(reviewer_scores[r_id]),
                    "sample_size_group2": None,
                    "statistical_detail": {
                        "z_score": round(z, 4),
                        "reviewer_mean": round(r_mean, 2),
                        "global_mean": round(global_mean, 2),
                        "global_std": round(global_std, 2),
                        "direction": "lenient" if z > 0 else "harsh",
                        "n_reviewer_evaluations": len(reviewer_scores[r_id]),
                        "n_reviewers_in_analysis": len(eligible)
                    },
                    "affected_submission_ids": [
                        e.submission_id for e in evaluations if e.reviewer_id == r_id
                    ]
                })
        return alerts

    def _gender_bias_test(self, evaluations, hackathon_id) -> list[dict]:
        # Get gender data (only for participants with demographic consent)
        gender_scores = defaultdict(list)
        for e in evaluations:
            team = db.get_team_by_submission(e.submission_id)
            for member in team.members:
                reg = db.get_registration(member.user_id, hackathon_id)
                if reg.demographic_consent_at and reg.gender in ('male', 'female'):
                    gender_scores[reg.gender].append(e.total_raw_score)
                    break  # Use team captain's gender as representative

        groups = list(gender_scores.values())
        if len(groups) != 2:
            return []  # Need exactly 2 groups for Mann-Whitney U
        
        g1, g2 = groups
        if len(g1) < 8 or len(g2) < 8:
            return []  # Insufficient sample size

        stat, p = stats.mannwhitneyu(g1, g2, alternative='two-sided')
        r = self._rank_biserial(g1, g2, stat)
        
        return self._build_demographic_alert(
            alert_type="GENDER_BIAS",
            p_raw=p,
            effect_size=r,
            effect_metric="rank_biserial_r",
            group_labels=list(gender_scores.keys()),
            group_sizes=[len(g1), len(g2)],
            group_means=[np.mean(g1), np.mean(g2)],
            test_name="Mann-Whitney U",
            u_stat=stat
        )

    def _institutional_bias_test(self, evaluations, hackathon_id) -> list[dict]:
        # Group scores by team's institution (college)
        inst_scores = defaultdict(list)
        for e in evaluations:
            team = db.get_team_by_submission(e.submission_id)
            # Use majority institution of team members
            inst = _get_team_majority_institution(team, hackathon_id)
            if inst:
                inst_scores[inst].append(e.total_raw_score)

        eligible_groups = [scores for scores in inst_scores.values() if len(scores) >= 5]
        if len(eligible_groups) < 2:
            return []

        if len(eligible_groups) == 2:
            # Mann-Whitney U for 2 groups
            stat, p = stats.mannwhitneyu(*eligible_groups, alternative='two-sided')
            r = self._rank_biserial(eligible_groups[0], eligible_groups[1], stat)
            effect_metric = "rank_biserial_r"
        else:
            # Kruskal-Wallis for >2 groups
            stat, p = stats.kruskal(*eligible_groups)
            r = _compute_eta_squared(stat, sum(len(g) for g in eligible_groups), len(eligible_groups))
            effect_metric = "eta_squared"

        return self._build_demographic_alert(
            alert_type="INSTITUTIONAL_BIAS",
            p_raw=p,
            effect_size=r,
            effect_metric=effect_metric,
            group_labels=list(inst_scores.keys())[:5],  # top 5 institutions
            group_sizes=[len(g) for g in eligible_groups],
            group_means=[np.mean(g) for g in eligible_groups],
            test_name="Kruskal-Wallis" if len(eligible_groups) > 2 else "Mann-Whitney U",
            u_stat=stat
        )

    def _temporal_drift_test(self, evaluations) -> list[dict]:
        """Detect reviewer fatigue: scores correlating with evaluation sequence."""
        reviewer_scores_by_order = defaultdict(list)
        
        # Sort evaluations per reviewer by submitted_at
        by_reviewer = defaultdict(list)
        for e in evaluations:
            by_reviewer[e.reviewer_id].append(e)
        
        alerts = []
        for r_id, r_evals in by_reviewer.items():
            if len(r_evals) < 5:
                continue
            ordered = sorted(r_evals, key=lambda e: e.submitted_at)
            seq = np.arange(len(ordered))
            scores = np.array([e.total_raw_score for e in ordered])
            
            rho, p = stats.spearmanr(seq, scores)
            
            if abs(rho) > 0.4:
                severity = "ALERT" if abs(rho) > 0.6 else "WARNING"
                alerts.append({
                    "alert_type": "TEMPORAL_DRIFT",
                    "severity": severity,
                    "reviewer_id": r_id,
                    "p_value": round(p, 4),
                    "p_value_adjusted": round(p * N_TESTS, 4),  # Bonferroni
                    "effect_size": round(abs(rho), 4),
                    "effect_size_metric": "spearman_rho",
                    "effect_size_interpretation": "large" if abs(rho) > 0.6 else "medium",
                    "sample_size_group1": len(r_evals),
                    "statistical_detail": {
                        "spearman_rho": round(rho, 4),
                        "direction": "fatigue (declining)" if rho < 0 else "inflation (increasing)",
                        "n_evaluations": len(r_evals),
                        "alpha_bonferroni": ALPHA_BONFERRONI
                    },
                    "affected_submission_ids": [e.submission_id for e in ordered]
                })
        return alerts

    def _criterion_consistency_test(self, evaluations) -> list[dict]:
        """Detect reviewers who use criteria inconsistently (CV > 0.5)."""
        alerts = []
        
        # Group by reviewer × criteria
        by_reviewer_criteria = defaultdict(lambda: defaultdict(list))
        for e in evaluations:
            for score in e.criterion_scores:
                by_reviewer_criteria[e.reviewer_id][score.criteria_id].append(score.raw_score)
        
        for r_id, criteria_scores in by_reviewer_criteria.items():
            for c_id, scores in criteria_scores.items():
                if len(scores) < 4:
                    continue
                mean = np.mean(scores)
                std = np.std(scores, ddof=1)
                cv = std / mean if abs(mean) > 1e-9 else 0
                
                if cv > 0.5:
                    alerts.append({
                        "alert_type": "CRITERION_INCONSISTENCY",
                        "severity": "WARNING",
                        "reviewer_id": r_id,
                        "statistical_detail": {
                            "criteria_id": str(c_id),
                            "cv": round(cv, 4),
                            "mean_score": round(mean, 2),
                            "std_score": round(std, 2),
                            "n_scores": len(scores),
                            "threshold_cv": 0.5
                        }
                    })
        return alerts

    def _rank_biserial(self, g1, g2, U_stat) -> float:
        n1, n2 = len(g1), len(g2)
        return round(float(1 - (2 * U_stat) / (n1 * n2)), 4)

    def _build_demographic_alert(self, alert_type, p_raw, effect_size, effect_metric,
                                  group_labels, group_sizes, group_means, test_name, u_stat) -> list[dict]:
        p_adj = p_raw * N_TESTS  # Bonferroni
        
        if p_adj < ALPHA_BONFERRONI:
            severity = "ALERT"
        elif p_raw < ALPHA_BASE:
            severity = "WARNING"
        else:
            return []  # Not significant even uncorrected
        
        interp = "large" if abs(effect_size) > 0.5 else ("medium" if abs(effect_size) > 0.3 else "small")
        
        return [{
            "alert_type": alert_type,
            "severity": severity,
            "p_value": round(p_raw, 6),
            "p_value_adjusted": round(p_adj, 6),
            "effect_size": round(abs(effect_size), 4),
            "effect_size_metric": effect_metric,
            "effect_size_interpretation": interp,
            "sample_size_group1": group_sizes[0] if group_sizes else None,
            "sample_size_group2": group_sizes[1] if len(group_sizes) > 1 else None,
            "statistical_detail": {
                "test": test_name,
                "groups": [
                    {"label": l, "n": n, "mean": round(m, 2)}
                    for l, n, m in zip(group_labels, group_sizes, group_means)
                ],
                "alpha_bonferroni": ALPHA_BONFERRONI,
                "alpha_uncorrected": ALPHA_BASE,
                "significant_after_correction": p_adj < ALPHA_BONFERRONI
            }
        }]
```

---

## 4.7 Redis Usage

| Key Pattern | Type | TTL | Purpose |
|---|---|---|---|
| `reviewer_embedding:{reviewer_id}:{hackathon_id}` | String (bytes) | 24h | Cached reviewer embedding (invalidate on profile update) |
| `project_embedding:{submission_id}` | String (bytes) | 7d | Project embedding (stable after submission) |
| `assignment_lock:{hackathon_id}` | String | 120s | Prevent concurrent assignment runs |
| `bias_analysis_lock:{hackathon_id}` | String | 60s | Deduplicate concurrent bias analysis |
| `feedback:{hackathon_id}:{team_id}:{score_hash}` | String | 24h | Gemini feedback cache |
| `assignment_result:{assignment_run_id}` | Hash | 1h | Cached assignment plan for frontend retrieval |
| `fairness_score:{hackathon_id}` | String | 5m | Cached fairness score |

**Pub/Sub Channels:**

| Channel | Publisher | Subscriber |
|---|---|---|
| `assignment:{hackathon_id}` | run_reviewer_assignment task | Admin WebSocket handler |
| `evaluation-live:{hackathon_id}` | run_bias_analysis task | Admin WebSocket handler |
| `results:{hackathon_id}` | compute_results + generate_feedback | Admin + Participant WebSocket handler |

---

## 4.8 WebSocket Events

All WS channels bridged via Redis pub/sub → FastAPI WebSocket handlers.

### WS /ws/assignment/{hackathon_id}

```json
// Stage progress
{"type": "STAGE_UPDATE", "stage": "BUILDING_MATRIX", "pct": 40, "detail": "Building 200×20 cost matrix"}

// Complete
{
  "type": "ASSIGNMENT_COMPLETE",
  "stage": "COMPLETE",
  "pct": 100,
  "assignment_run_id": "uuid",
  "metrics": {
    "ai_mean_cosine": 0.782,
    "random_mean_cosine": 0.491,
    "improvement_pct": 59.3,
    "balanced": true,
    "n_assignments": 30
  }
}

// Failure
{"type": "ASSIGNMENT_FAILED", "stage": "FAILED", "error": "Assignment infeasible: insufficient reviewer capacity"}
```

### WS /ws/evaluation-live/{hackathon_id}

```json
// Bias alert
{
  "type": "BIAS_ALERT",
  "alert": {
    "id": "uuid",
    "alert_type": "REVIEWER_OUTLIER",
    "severity": "ALERT",
    "statistical_detail": {"z_score": -2.71, "direction": "harsh"},
    "created_at": "2024-03-15T11:45:00Z"
  }
}

// Fairness score update (every bias analysis run)
{"type": "FAIRNESS_SCORE_UPDATED", "fairness_score": 74.3, "active_alert_count": 2}

// Reviewer no-show
{"type": "REVIEWER_NO_SHOW", "reviewer_id": "uuid", "checkpoint": "T-6h", "n_incomplete": 3}
```

### WS /ws/results/{hackathon_id}

```json
// Rankings ready (fast, <30s)
{"type": "RANKINGS_READY", "n_teams": 15, "feedback_status": "generating"}

// Per-team feedback ready (as each Gemini call completes)
{"type": "FEEDBACK_READY", "team_id": "uuid", "generation_method": "gemini"}

// All feedback done
{"type": "ALL_FEEDBACK_READY", "n_teams": 15}

// Results published
{"type": "RESULTS_PUBLISHED", "hackathon_id": "uuid", "published_at": "2024-03-15T14:30:00Z"}
```

---

## 4.9 State Machines

### Reviewer Assignment State

```
PENDING ──(accept)──▶ ACCEPTED ──(submit all)──▶ COMPLETED
   │                     │
   │(decline)            │(T-0 with incomplete work)
   ▼                     ▼
DECLINED             NO_SHOW ──(admin rebalance)──▶ REASSIGNED
```

### Hackathon Status (Evaluation Phase)

```
PUBLISHED ──(assign reviewers)──▶ ACTIVE ──(submit deadline)──▶ EVALUATION
   │                                                                  │
   │                                                          (all submitted)
   │                                                                  ▼
   │                                                        RESULTS_COMPUTING
   │                                                                  │
   │                                                        (compute_results done)
   │                                                                  ▼
   │                                                          RESULTS_READY
   │                                                                  │
   │                                                          (admin publish)
   │                                                                  ▼
   └─────────────────────────────────────────────────────▶        CLOSED
```

### Bias Alert State

```
ACTIVE ──(admin acknowledge)──▶ ACKNOWLEDGED
   │
   │(admin triggers renormalization)
   ▼
ACTIVE + re_normalization_triggered ──(results recomputed)──▶ ACKNOWLEDGED
```

---

## 4.10 Security Design

### RBAC per Endpoint

| Endpoint | Admin | Reviewer | Participant | Notes |
|---|---|---|---|---|
| POST /reviews/assign/{id} | ✅ | ❌ | ❌ | Assignment trigger |
| GET /reviews/assignment-plan/{id} | ✅ | ❌ | ❌ | Full plan with metrics |
| GET /reviews/my-assignments | ❌ | ✅ (own only) | ❌ | Own assignments only |
| POST /reviews/{id}/submit | ❌ | ✅ (own only) | ❌ | Must own assignment |
| GET /bias-analysis/{id} | ✅ | ❌ | ❌ | Bias data admin-only |
| POST /bias-alerts/{id}/acknowledge | ✅ | ❌ | ❌ | |
| POST /results/{id}/compute | ✅ | ❌ | ❌ | |
| GET /results/{id}/rankings | ✅ | ✅ (after publish) | ✅ (after publish) | |
| GET /results/{id}/feedback/{team_id} | ✅ | ❌ | ✅ (own team) | |
| GET /audit/{id}/trail | ✅ | ❌ | ❌ | |

### RLS Policies (Supabase)

```sql
-- Reviewer sees only their own assignments
CREATE POLICY "reviewer_own_assignments_select" ON reviewer_assignments
    FOR SELECT USING (
        reviewer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Evaluations: reviewer sees own, admin sees all, others see nothing
CREATE POLICY "evaluation_select" ON evaluations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reviewer_assignments ra
            WHERE ra.id = reviewer_assignment_id AND ra.reviewer_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Bias alerts: admin only
CREATE POLICY "bias_alerts_admin_only" ON bias_alerts
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Final results: visible after publication, teams see their own
CREATE POLICY "final_results_select" ON final_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hackathons h WHERE h.id = hackathon_id AND h.results_published_at IS NOT NULL
        )
        AND (
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'reviewer'))
            OR EXISTS (
                SELECT 1 FROM team_members tm WHERE tm.team_id = final_results.team_id AND tm.user_id = auth.uid()
            )
        )
    );
```

### Prompt Injection Defense (Gemini Feedback)

```python
def build_feedback_prompt(team) -> str:
    # Structure data access prevents injection via scores (numeric) and score_breakdown (numeric)
    # Only team_name and ps_title are string-interpolated — sanitize these
    safe_name = re.sub(r'[^\w\s\-]', '', team.name)[:100]
    safe_ps = re.sub(r'[^\w\s\-,.]', '', team.problem_statement_title)[:200]
    
    # Reviewer comments: anonymized, never raw
    safe_comments = _extract_anonymized_themes(team.evaluations)

    # Critical: put user-controlled content in a separate "data" section, 
    # never mixed with instructions
    return f"""SYSTEM: You are a hackathon feedback generator. Follow the FORMAT below strictly.

DATA:
Team: {safe_name}
Problem: {safe_ps}
Scores: {json.dumps(team.score_breakdown)}
Hackathon averages: {json.dumps(team.hackathon_averages)}
Evaluator observations: {safe_comments}

FORMAT: Generate exactly 4 paragraphs. No markdown. No headers. No bullet points.
P1: Overall performance vs field.
P2: 2 strongest aspects with score evidence.
P3: 2 improvement areas with actionable steps.
P4: Encouragement. Do not use phrases like 'good effort' or 'well done'.

OUTPUT:"""
```

---

## 4.11 GDPR Design

| Data Element | Legal Basis | Retention | GDPR Risk | Mitigation |
|---|---|---|---|---|
| Reviewer profile (expertise, bio, institution) | Contract (hackathon participation) | 90 days post-event | Low (professional, not sensitive) | Deletion endpoint for reviewer data |
| Conflict declarations | Legitimate interest (fair evaluation) | 90 days post-event | Low | Cascade delete with reviewer data |
| Evaluation scores + feedback_text | Legitimate interest | 2 years (anonymized aggregate) | Medium (feedback_text may contain PII) | Anonymize actor_id in audit log on erasure request |
| Demographic data (gender, state) | Explicit consent | Until consent withdrawn | High (sensitive category) | Separate consent checkbox; opt-in only; deleted on consent withdrawal |
| Audit log entries | Legal obligation | 7 years | Medium (contains actor_id) | On erasure request: NULL actor_id, replace with "ANONYMIZED_USER" |
| Reviewer feedback_text → Gemini | Third-party processing | 0s (not stored by Gemini) | Medium (PII transfer) | Anonymize before sending; no names; no team identifiers |

**GDPR Reviewer Erasure Flow:**
```python
async def reviewer_gdpr_erasure(reviewer_id: UUID, hackathon_id: UUID):
    # 1. Anonymize evaluation feedback_text
    db.execute("""
        UPDATE evaluations SET feedback_text = '[DELETED]'
        WHERE reviewer_assignment_id IN (
            SELECT id FROM reviewer_assignments 
            WHERE reviewer_id = :reviewer_id AND hackathon_id = :hackathon_id
        )
    """, reviewer_id=reviewer_id, hackathon_id=hackathon_id)
    
    # 2. Anonymize audit log actor references (cannot delete — immutable chain)
    db.execute("""
        UPDATE audit_log SET actor_id = '00000000-0000-0000-0000-000000000000'
        WHERE actor_id = :reviewer_id
        AND (metadata->>'hackathon_id')::UUID = :hackathon_id
    """, reviewer_id=reviewer_id, hackathon_id=hackathon_id)
    
    # 3. Delete reviewer profile (cascade deletes conflict_declarations)
    db.execute("DELETE FROM reviewer_profiles WHERE user_id = :reviewer_id AND hackathon_id = :hackathon_id",
               reviewer_id=reviewer_id, hackathon_id=hackathon_id)
    
    # 4. Delete reviewer embeddings
    db.execute("DELETE FROM participant_embeddings WHERE user_id = :reviewer_id AND hackathon_id = :hackathon_id",
               reviewer_id=reviewer_id, hackathon_id=hackathon_id)
    
    # 5. Record erasure in audit log (actor = system, not the erased reviewer)
    audit_service.write("REVIEWER_DATA_ERASED", system_actor_id, "user", reviewer_id, {
        "hackathon_id": str(hackathon_id),
        "erased_tables": ["evaluations.feedback_text", "reviewer_profiles", "participant_embeddings"],
        "audit_log_anonymized": True
    })
```

---

---

# PHASE 5: EDGE CASE ANALYSIS

## Reviewer Assignment Edge Cases

### User Errors

| Edge Case | Detection | Recovery | Fallback | User Experience |
|---|---|---|---|---|
| Reviewer submits profile with empty expertise_text | Pydantic validation: `min_length=20` | Return 422 with clear message | N/A | "Expertise description must be at least 20 characters. Describe your domains, experience, and tools." |
| Admin triggers assignment before any submissions exist | Pre-check at API handler: `if n_submissions == 0` | Return 422 | N/A | "No submissions available for assignment. Wait until the submission deadline." |
| Admin triggers assignment before any reviewers have profiles | Pre-check: `if n_reviewers == 0` | Return 422 | N/A | "No reviewers have completed their profiles." |
| Reviewer declares conflict with non-existent team_id | FK constraint violation in conflict_declarations | Return 422 with "Entity not found" | N/A | "Team not found in this hackathon." |
| Reviewer accepts assignment but never submits | T-6h Celery ETA task detects incomplete | Admin alerted, urgent reminder sent | If T-0: auto-reassign | Reviewer sees deadline banner: "You have 6h remaining. X of Y evaluations complete." |

### System Errors

| Edge Case | Detection | Recovery | Fallback |
|---|---|---|---|
| Celery worker crashes mid-assignment | `acks_late=True, reject_on_worker_lost=True` → task requeued | Task retries from start (idempotent: delete prior reviewer_assignments for this run_id before reinserting) | After 2 retries: mark run as failed, alert admin |
| Redis unavailable during assignment | `redis.publish()` raises ConnectionError | Catch exception, log error, continue without WS updates | HTTP polling fallback: frontend polls `GET /jobs/{job_id}/status` every 5s |
| pgvector index missing/corrupt | ANN query returns error | Fall back to exact cosine search (slower, ~1-2s) | Log warning, continue assignment |
| scipy import fails (dependency issue) | ImportError at startup | Celery worker fails to start | Alert ops: "AI worker failed to start. Check scipy installation." |

### Race Conditions

| Edge Case | Detection | Recovery |
|---|---|---|
| Admin clicks "Run Assignment" twice in rapid succession | `SET NX assignment_lock:{hackathon_id}` with 120s TTL | Second request gets 409 "Assignment already in progress" |
| Two reviewers submit evaluations at the exact same millisecond → two concurrent bias analyses | `SET NX bias_analysis_lock:{hackathon_id}` with 60s TTL | Second analysis silently exits; first completes |
| Admin publishes results while generate_feedback task is running | `results_published_at` timestamp set; feedback generation continues, appends to published results | Participants see results immediately, feedback appears as it completes |
| Reviewer submits evaluation after admin triggers result computation | Check `hackathon.status == 'evaluation'` in submit handler; return 409 if status is `results_computing` or later | Reviewer sees "Evaluation window has closed" |

### Database Failures

| Edge Case | Detection | Recovery |
|---|---|---|
| audit_log INSERT fails (advisory lock timeout) | `pg_advisory_xact_lock` times out after 5s | Retry 3 times with exponential backoff; if still failing, log CRITICAL but do NOT fail the parent action (audit failure must not block business logic) |
| DB connection pool exhausted during evaluation rush | asyncpg pool raises `TooManyConnectionsError` | Request queued, exponential retry; if >5s: return 503 with Retry-After header |
| final_results INSERT fails for one team | Transaction per team, not bulk | Failed team logged; other teams' results persist; admin alerted |

### AI Failures

| Edge Case | Detection | Recovery | Fallback |
|---|---|---|---|
| Gemini rate limit during feedback generation (429) | `GeminiRateLimitError` caught in generate_feedback task | Exponential backoff: 4s, 8s, 16s, 32s | After 3 retries: template_fallback_feedback() |
| Gemini timeout (>30s response) | `asyncio.wait_for()` with 30s timeout | Retry once | Template fallback |
| Gemini returns malformed JSON for skill vector (different task, same concern) | `json.loads()` in try/except | Retry with explicit schema enforcement in prompt | Return error, flag for manual review |
| sentence-transformers model fails to load on cold start | ImportError or file-not-found | Worker startup script pre-warms model: `model.encode(["test"])` before accepting jobs | Alert ops; worker rejects assignment jobs until healthy |
| All reviewer embeddings are zero vectors (empty expertise_text slipped validation) | Cosine similarity = NaN or undefined | Filter out zero-vector reviewers from assignment matrix; alert admin | Assignment runs with remaining reviewers |

### WebSocket Failures

| Edge Case | Detection | Recovery | User Experience |
|---|---|---|---|
| Admin WS connection drops during bias alert | Frontend detects `WebSocket.onclose` | Auto-reconnect with exponential backoff: 1s, 2s, 4s, 8s, max 30s | "Reconnecting..." spinner; after reconnect, poll `GET /bias-analysis/{id}` to get missed alerts |
| Redis pub/sub connection drops in FastAPI WS handler | `PubSubError` exception | Restart Redis subscription in handler; re-subscribe | Log warning; no message loss if Redis itself is up |
| WS message dropped (no delivery guarantee) | N/A (fire-and-forget) | Frontend polls `GET /bias-analysis/{id}` every 30s as fallback | "Live updates may be delayed. Data is current as of {timestamp}." |

---

## Bias Detection Edge Cases

| Edge Case | Detection | Recovery |
|---|---|---|
| Only 1 reviewer submits → z-score impossible | `len(eligible_reviewers) < 3` guard | Return INFO alert "Insufficient reviewers for outlier detection" |
| All reviewers give identical scores → std=0 | `if global_std < 1e-9: return []` | No outlier alert (correct: no outlier possible) |
| Demographic fields all blank → Mann-Whitney impossible | `len(eligible_groups) < 2` or `min(group_sizes) < 8` | Return INFO "Insufficient demographic data for bias testing" |
| Bonferroni-corrected threshold → no alerts even though uncorrected test was significant | Expected behavior | Log both p_value_raw and p_value_adjusted in alert for transparency |
| Alpha=NaN from Krippendorff (no shared projects) | `None` return from function | Return INFO "No shared project evaluations for inter-rater reliability analysis"; use CV fallback |

---

## Results Engine Edge Cases

| Edge Case | Detection | Recovery |
|---|---|---|
| Project with only 1 reviewer → bootstrap CI very wide | `len(scores) == 1` | Still compute (bootstrap on 1 value = same value, CI width = 0); flag `low_reliability: True` |
| Two projects with overlapping CIs | `ci_overlap_check()` after ranking | Flag in `ci_overlapping_pairs`; admin sees "These rankings are not statistically distinct" |
| Gemini returns feedback in wrong language | Post-processing: detect language with `langdetect` | Re-request with explicit "Respond in English" suffix | Template fallback |
| Admin triggers results computation twice | `if hackathon.status == 'results_computing': return 409` | Second request rejected |
| Bootstrap resampling seed not stored → different results on re-run | `seed=42` stored in `final_results.metadata` | Reproducible: same inputs + same seed = same CI |

---

## Audit Trail Edge Cases

| Edge Case | Detection | Recovery |
|---|---|---|
| Advisory lock wait times out | `pg_advisory_xact_lock` timeout (default 5s) | Retry 3x; if fails: log CRITICAL, continue without audit entry (business logic must not block) |
| Audit log entry for GDPR erasure ironically creates a new audit entry with erased user | New entry actor_id = system_actor_id, not erased_user_id | Correct by design |
| Chain verification during active writes | Some entries may be committed between verify start and verify end | Verifier reads up to sequence_num N at start; verifies only entries ≤N; new entries ≥N+1 not checked |

---

---

# PHASE 6: FRONTEND SPECIFICATION

## Page: Admin — Reviewer Assignment Panel

**Purpose:** Trigger assignment, visualize results, compare AI vs random, confirm and dispatch.

**User Role:** Admin only

**State (Zustand store):**
```typescript
interface AssignmentState {
  assignmentRunId: string | null;
  jobStatus: 'idle' | 'running' | 'complete' | 'failed';
  progress: { stage: string; pct: number; detail?: string };
  plan: AssignmentPlan | null;
  error: string | null;
}
```

**Components:**

1. **AssignmentTriggerCard:**
   - K selector (1-3 reviews per project), default=2
   - "Run Assignment" button — disabled if `jobStatus == 'running'`
   - POST `/api/v1/reviews/assign/{hackathon_id}` on click
   - Opens WebSocket to `/ws/assignment/{hackathon_id}`
   - Shows progress bar + stage label while running

2. **AssignmentMetricsPanel** (shown after completion):
   ```
   ┌─────────────────────────────────────────────────────┐
   │  AI Assignment Score: 0.782    Random: 0.491        │
   │  ██████████████████████████░░░░░░░░░░░░░░░░░░  78%  │
   │                              Improvement: +59.3%    │
   │  Workload Balance: ✅ Within ±10%                   │
   │  Unresolvable Conflicts: 0                          │
   └─────────────────────────────────────────────────────┘
   ```

3. **AssignmentTable:**
   - Columns: Reviewer Name | Project Title | Expertise Score | Conflict Flag | Status
   - Sortable by expertise_score DESC
   - Color coding: green (>0.8), yellow (0.6-0.8), red (<0.6)
   - Conflict rows highlighted in orange with tooltip: "Institution conflict"
   - Actions: Manual Override button per row (opens reassignment modal)

4. **WorkloadDistributionChart (Recharts BarChart):**
   - X: Reviewer names, Y: Assignment count
   - Reference line at target (total/n_reviewers)
   - ±10% band shown as shaded area
   - Color: red if outside band

5. **ConflictGraphPanel:**
   - Simple force-directed graph using react-force-graph-2d
   - Nodes: reviewers (blue) + teams (green)
   - Edges: conflict links (red) with conflict_type tooltip
   - Only shown if conflicts exist

**Loading States:**
- Assignment running: skeleton loader for AssignmentTable, spinning progress ring
- No plan exists: empty state with "Run assignment to see results"

**Error States:**
- ASSIGNMENT_INFEASIBLE: "❌ Assignment is not possible. Need 30 review slots but reviewer capacity is only 16. Add more reviewers or reduce reviews per project."
- ASSIGNMENT_IN_PROGRESS: "A previous assignment is still running. Check back in {estimated_seconds}s."

**API Calls:**
```typescript
// Trigger assignment
const triggerAssignment = async (config: AssignmentConfig) => {
  const res = await fetch(`/api/v1/reviews/assign/${hackathonId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (res.status === 409) throw new AssignmentInProgressError();
  if (res.status === 422) throw new AssignmentInfeasibleError(await res.json());
  return res.json(); // { job_id, assignment_run_id, ws_channel }
};

// Fetch plan after completion
const fetchPlan = () => fetch(`/api/v1/reviews/assignment-plan/${hackathonId}`, {
  headers: { Authorization: `Bearer ${jwt}` }
}).then(r => r.json());

// Confirm assignment (send notifications to reviewers)
const confirmAssignment = () => fetch(`/api/v1/reviews/assignment-plan/${runId}/confirm`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${jwt}` }
}).then(r => r.json());
```

---

## Page: Admin — Bias Monitoring Dashboard

**Purpose:** Real-time bias detection monitoring. This is the highest-differentiation judging moment.

**Components:**

1. **FairnessScoreGauge:**
   - Radial gauge, 0-100, color: green(>85), yellow(65-85), red(<65)
   - Label: "Fairness Score" with interpretation text
   - Updates via WebSocket FAIRNESS_SCORE_UPDATED event

2. **BiasAlertFeed:**
   - Timeline list, newest first
   - Each alert shows: severity badge | type | p-value | effect size | affected projects count
   - Expandable row: full statistical_detail JSON rendered as readable table
   - Action buttons: "Acknowledge", "Renormalize", "Request Re-evaluation"
   - Unread alerts pulse red

3. **ReviewerOutlierHeatmap:**
   - Table: rows=reviewers, columns=["Mean Score", "Z-Score", "N Evaluations", "CV"]
   - Color cells by z-score (green/yellow/red)
   - "No alerts" empty state when all reviewers within ±2σ

4. **BiasAlertToast (real-time):**
   - Triggered on BIAS_ALERT WebSocket event
   - Toast notification: "⚠️ INSTITUTIONAL BIAS DETECTED — p=0.003"
   - Click to navigate to full alert

**State:**
```typescript
interface BiasState {
  alerts: BiasAlert[];
  fairnessScore: number;
  reviewerHeatmapData: ReviewerBiasData[];
  wsConnected: boolean;
  lastAnalyzedAt: Date | null;
}
```

**WebSocket Hook:**
```typescript
const useBiasMonitor = (hackathonId: string) => {
  const [state, dispatch] = useReducer(biasReducer, initialBiasState);
  
  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE}/ws/evaluation-live/${hackathonId}`);
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case 'BIAS_ALERT':
          dispatch({ type: 'ADD_ALERT', payload: msg.alert });
          toast.warning(`${msg.alert.alert_type} detected — p=${msg.alert.statistical_detail?.p_value_adjusted}`);
          break;
        case 'FAIRNESS_SCORE_UPDATED':
          dispatch({ type: 'UPDATE_FAIRNESS', payload: msg.fairness_score });
          break;
        case 'REVIEWER_NO_SHOW':
          toast.error(`Reviewer no-show detected at ${msg.checkpoint}`);
          break;
      }
    };
    
    ws.onclose = () => {
      // Reconnect with exponential backoff
      const delay = Math.min(1000 * 2 ** reconnectAttempt, 30000);
      setTimeout(() => reconnect(), delay);
    };
    
    return () => ws.close();
  }, [hackathonId]);
  
  return state;
};
```

---

## Page: Reviewer Dashboard

**Purpose:** Reviewer sees assigned projects, evaluation form, their reliability score.

**Components:**

1. **AssignmentQueue:**
   - Card per assignment: project title | domain | expertise match badge | status chip
   - Sorted: incomplete first, then submitted
   - Clicking opens EvaluationModal

2. **EvaluationModal:**
   - Tabs: "Project Info" | "Evaluate"
   - Project Info: title, description, tech stack, GitHub link, demo URL
   - Evaluate: per-criterion slider (score_min to score_max, step=0.5) + text comment
   - Running total shown as reviewer fills criteria
   - "Submit Final Evaluation" button — disabled if any criterion not scored
   - Confirmation dialog: "This evaluation cannot be modified after submission."

3. **ReliabilityScoreCard** (FR-R05):
   ```
   Your Consistency Score
   ████████████░░░░  82/100
   "Your scores are well-aligned with peer reviewers"
   Based on 6 shared project evaluations
   ```

4. **DeadlineCountdown:**
   - Real-time countdown to evaluation_deadline
   - Changes color: green → yellow (T-6h) → red (T-2h)

**API Calls:**
```typescript
// Get assignments
GET /api/v1/reviews/my-assignments
Headers: { Authorization: Bearer {jwt} }

// Submit evaluation
POST /api/v1/reviews/{assignment_id}/submit
Body: {
  scores: [{criteria_id, score}],
  feedback_text: string,
  is_final: true
}
```

**Error States:**
- Score out of range: inline validation before submit button enabled
- Already submitted: modal shows read-only view with "Submitted at {time}"
- Assignment not owned: redirect to /reviewer/dashboard with "Access denied"

---

## Page: Results Leaderboard

**Purpose:** Show rankings with CI, score breakdown, confidence. Different views for admin (before publish) and participants (after publish).

**Components:**

1. **LeaderboardTable:**
   - Rank | Team Name | Final Score | Confidence % | CI Range | Feedback Status
   - Animated rank badges (1st = gold, 2nd = silver, 3rd = bronze)
   - CI range shown as mini range slider visual
   - "View Feedback" button per row (opens FeedbackModal)

2. **ScoreBreakdownAccordion** (expandable per team):
   - Per-criterion: raw_avg vs hackathon_avg, weight
   - Horizontal bar chart comparison
   - Normalization explanation expandable: "Z-score normalization applied to account for reviewer rating style differences"

3. **FeedbackModal:**
   - Team name + rank
   - Full Gemini feedback text
   - "Feedback generated by AI based on reviewer scores"
   - Loading skeleton while `feedback_status == 'generating'`
   - Template fallback labeled "AI-assisted feedback"

4. **ResultsConfidenceExplainer:**
   - Info card: "What is Confidence Score? Confidence reflects how consistently reviewers agreed on your team's performance. 100% = perfect agreement. Lower scores mean more reviewer disagreement."
   - Krippendorff α shown: "Inter-rater reliability: 0.84 (Strong)"

**WS events handled:**
- `RANKINGS_READY`: show table, show "Feedback generating..." for all rows
- `FEEDBACK_READY`: update specific row's feedback status
- `RESULTS_PUBLISHED`: redirect participants from "waiting" page to leaderboard

---

## Page: Admin — Audit Trail Viewer

**Purpose:** Demonstrate hash chain integrity, show tamper detection.

**Components:**

1. **ChainIntegrityBanner:**
   - ✅ green: "Chain intact — 847 entries verified"
   - ❌ red: "Chain breach detected at entry #412 — tampering suspected"
   - "Verify Now" button → POST /audit/{id}/verify

2. **AuditLogTable:**
   - Columns: Seq# | Timestamp | Action | Entity | Actor | Hash (truncated)
   - Filter by: entity_type, action, date range
   - Click row: expands full metadata JSON, full hash, canonical payload

3. **HashChainVisualizer:**
   - First 5 entries shown as linked blocks: `[hash1]←[hash2]←[hash3]`
   - Visual representation of chain linkage for judges

---

---

# PHASE 7: BACKEND SERVICE SPECIFICATIONS

## ReviewService

**Responsibilities:** Reviewer profile management, assignment trigger, assignment plan retrieval, evaluation CRUD, accept/decline flow, dynamic reassignment orchestration.

**Inputs:** Reviewer profiles, project submissions, conflict declarations, admin triggers
**Outputs:** Assignment plan, reviewer_assignments rows, evaluation records, audit log entries

**Redis Usage:**
- Read: `reviewer_embedding:{id}:{hackathon_id}` (cache reviewer embeddings)
- Write: `assignment_lock:{hackathon_id}` (prevent concurrent runs)
- Pub: `assignment:{hackathon_id}` (progress events)

**Celery Usage:**
- Enqueues: `run_reviewer_assignment`, `check_reviewer_no_shows` (ETA-scheduled)
- Does NOT enqueue: bias analysis (that's BiasService's job)

**Rate Limits:** Assignment trigger: 1 per minute per hackathon (Redis rate key)

**Caching Strategy:**
- Reviewer embeddings: cached 24h, invalidated on profile update
- Project embeddings: cached 7d, no invalidation needed (submissions locked after deadline)

**Monitoring Metrics:**
- `assignment_duration_seconds` histogram (target p95 < 60s)
- `assignment_workload_variance_pct` gauge per hackathon
- `reviewer_acceptance_rate` gauge per hackathon

---

## BiasService

**Responsibilities:** Run all 6 statistical bias tests, create bias_alert records, compute fairness score, broadcast via Redis pub/sub.

**Inputs:** All submitted evaluations for hackathon, reviewer profiles, registration demographic data
**Outputs:** bias_alert records, fairness_score, Redis pub/sub events

**Critical Implementation Requirement:** ALL bias analysis runs inside Celery worker (ai_low queue), NEVER in API request handler. This is non-negotiable for <500ms API response time.

**Redis Usage:**
- Write/Read: `bias_analysis_lock:{hackathon_id}` (deduplication)
- Write: `fairness_score:{hackathon_id}` (cache 5min)
- Pub: `evaluation-live:{hackathon_id}` (bias alert events)

**Failure Handling:**
- scipy import error: alert ops, worker refuses bias_analysis jobs
- DB query timeout: log warning, return empty alerts list (no crash)
- All demographic fields blank: return INFO alert, don't crash

---

## ResultsService

**Responsibilities:** Coordinate results computation (Phase 1: fast, no Gemini) and feedback generation (Phase 2: async, Gemini). Manage results versioning. Handle publish flow.

**Inputs:** All submitted evaluations, rubric weights, team data
**Outputs:** final_results rows, team_feedback rows, Pub/Sub events

**Key Constraint:** Phase 1 (ranking computation) must complete in <30s for 50 teams × 3 reviewers. Phase 2 (Gemini feedback) may take 3-5 minutes and is non-blocking.

**Redis Usage:**
- Read: `feedback:{hackathon_id}:{team_id}:{score_hash}` (Gemini feedback cache)
- Write: cached feedback with 24h TTL
- Pub: `results:{hackathon_id}` (stage events)

**Failure Handling:**
- Gemini rate limit: exponential backoff (4s, 8s, 16s), then template_fallback
- Bootstrap CI overflow (very large n): cap at 2000 resamples
- Results computation fails mid-way: transaction rollback, all-or-nothing versioned insert

---

## AuditService

**Responsibilities:** Insert-only hash chain writes, chain verification, GDPR anonymization of actor_ids.

**Inputs:** Action, actor_id, entity_type, entity_id, metadata dict
**Outputs:** audit_log row ID

**Critical Requirement:** NEVER fail business logic due to audit failure. Audit write failures are logged as CRITICAL but do not propagate exceptions to callers.

```python
class AuditService:
    def write(self, action, actor_id, entity_type, entity_id, metadata):
        try:
            result = db.execute("SELECT insert_audit_log($1, $2, $3, $4, $5)",
                               action, actor_id, entity_type, entity_id, json.dumps(metadata))
            return result[0][0]
        except Exception as e:
            logger.critical(f"AUDIT_LOG_FAILURE: {e} | action={action} | entity={entity_id}")
            metrics.increment("audit_log_failures")
            # DO NOT RAISE — business logic must continue

    def verify_chain(self, hackathon_id: str) -> ChainVerificationResult:
        entries = db.query("""
            SELECT sequence_num, previous_hash, current_hash, canonical_payload, hash_algorithm
            FROM audit_log
            WHERE (metadata->>'hackathon_id')::UUID = :hackathon_id
            ORDER BY sequence_num ASC
        """, hackathon_id=hackathon_id)
        
        for i, entry in enumerate(entries):
            expected_hash = hashlib.sha256(
                (entry.previous_hash + entry.canonical_payload).encode()
            ).hexdigest()
            
            if expected_hash != entry.current_hash:
                return ChainVerificationResult(
                    verified=False,
                    first_broken_link={
                        "sequence_num": entry.sequence_num,
                        "stored_hash": entry.current_hash,
                        "computed_hash": expected_hash
                    },
                    entries_checked_before_failure=i
                )
        
        return ChainVerificationResult(verified=True, chain_length=len(entries))
```

---

---

# PHASE 8: DATABASE SPECIFICATION IMPROVEMENTS

## Missing Tables

1. `conflict_declarations` — see Phase 4.2 ✅
2. `assignment_runs` — for audit + AI vs random comparison ✅
3. `bias_alerts` — full statistical detail ✅
4. `team_feedback` — versioned Gemini feedback ✅

## Missing Indexes

```sql
-- Performance: admin reviewing evaluations for a hackathon
CREATE INDEX idx_evaluations_hackathon_status ON evaluations(hackathon_id, status);

-- Performance: results engine loading all evaluations
CREATE INDEX idx_evaluation_scores_evaluation ON evaluation_scores(evaluation_id);

-- Performance: bias service loading reviewer scores
CREATE INDEX idx_evaluations_reviewer ON evaluations(hackathon_id)
    INCLUDE (reviewer_assignment_id, total_raw_score, submitted_at);

-- Performance: results engine loading per-project scores
CREATE INDEX idx_evaluations_submission_submitted ON evaluations(submission_id, status)
    WHERE status = 'submitted';

-- Audit log fast range query by hackathon
CREATE INDEX idx_audit_log_hackathon_seq ON audit_log
    ((metadata->>'hackathon_id'), sequence_num);
```

## Missing Constraints

```sql
-- Rubric weights must be positive
ALTER TABLE evaluation_criteria ADD CONSTRAINT criteria_weight_positive 
    CHECK (weight > 0);

-- Evaluation scores must be within criterion range
-- (Implemented as application-level validation; DB constraint via trigger)
CREATE OR REPLACE FUNCTION check_score_range() RETURNS TRIGGER AS $$
DECLARE
    v_min FLOAT; v_max FLOAT;
BEGIN
    SELECT score_min, score_max INTO v_min, v_max
    FROM evaluation_criteria WHERE id = NEW.criteria_id;
    IF NEW.raw_score < v_min OR NEW.raw_score > v_max THEN
        RAISE EXCEPTION 'Score % outside range [%, %]', NEW.raw_score, v_min, v_max;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_evaluation_score_range
BEFORE INSERT OR UPDATE ON evaluation_scores
FOR EACH ROW EXECUTE FUNCTION check_score_range();

-- Prevent rubric changes after lock
CREATE OR REPLACE FUNCTION check_rubric_lock() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM hackathons WHERE id = NEW.hackathon_id AND rubric_locked_at IS NOT NULL) THEN
        RAISE EXCEPTION 'Rubric is locked for hackathon %', NEW.hackathon_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rubric_lock_check
BEFORE INSERT OR UPDATE ON evaluation_criteria
FOR EACH ROW EXECUTE FUNCTION check_rubric_lock();
```

## Missing Foreign Keys

```sql
-- Link evaluations to hackathon directly (performance + consistency)
ALTER TABLE evaluations ADD COLUMN hackathon_id UUID REFERENCES hackathons(id);
-- Populate: UPDATE evaluations e SET hackathon_id = ra.hackathon_id FROM reviewer_assignments ra WHERE ra.id = e.reviewer_assignment_id;

-- Link evaluation_scores to hackathon for fast aggregation
ALTER TABLE evaluation_scores ADD COLUMN hackathon_id UUID REFERENCES hackathons(id);
```

---

---

# PHASE 9: DEMO STRATEGY

## R12 — Reviewer Expertise Matching

**How Judges Verify:** Click "Run Assignment." Watch progress bar. See completed table.

**What to Show:**
```
Assignment Results:
Reviewer              Project                    Expertise Score
──────────────────────────────────────────────────────────────
Dr. Anita (AI/ML)    → AI Crop Disease (AI)        0.91  ████
Prof. Rajan (Security) → Auth System (Security)    0.88  ███
Rahul (Frontend)     → React Dashboard (Web)        0.85  ███

AI Assignment Mean:    0.782
Random Assignment Mean: 0.491
Improvement:          +59.3%
```

**Screenshot Needed:** Assignment table sorted by expertise score, with random baseline comparison panel.

**Mock Data Required:** 8 reviewers with distinct expertise profiles (AI/ML, Security, Frontend, Backend, Cloud, Mobile, Data, Design). 15 submissions with matching domain diversity. Ensure at least 3 clear domain matches and 2 deliberate mismatches to show algorithm working.

---

## R13 — Workload Balance

**What to Show:** Bar chart: all reviewers at 3-4 projects each, target=3.75, ±10% band visible, all bars within band.

**Mock Data:** 8 reviewers, 15 projects, K=2 = 30 total slots = 3.75 per reviewer. 7 get 4, 1 gets 2 (within ±10% for target 3.75: 10% of 3.75 = 0.375, so 3 to 4 is exactly ±10%). Pre-verify with actual algorithm before demo.

---

## R14 — Conflict Detection

**What to Show:** Conflict graph with 2-3 edge examples. One reviewer institution-conflicted with one team. Assignment table shows those rows excluded (no assignment).

**Mock Data:** Reviewer "Prof. Singh (VIT CS Dept)" → conflicts with "VIT Team A". Assignment table: Prof. Singh assigned to all teams EXCEPT VIT Team A. Conflict edge shown in graph.

---

## R15 — Dynamic Reassignment

**How to Demo:** 
1. Show evaluation window with Reviewer B having 0 of 4 evaluations complete
2. Advance demo clock to T-6h checkpoint (or trigger manually)
3. Show admin alert: "⚠️ Reviewer #2 has submitted 0 of 4 evaluations. Suggested reassignment: Dr. Anita (expertise=0.81)"
4. Admin clicks "Auto-Reassign"
5. Show new assignment row for Dr. Anita, old row marked "NO_SHOW"

**Mock Data:** Pre-create one reviewer with accepted assignment and 0 submitted evaluations. Have a good backup reviewer available.

---

## R16 — Bias Detection

**The Money Shot for Judges.** This is where you differentiate from every other team.

**Inject 3 bias patterns in seed data:**

```python
# Pattern 1: Reviewer A is harsh (z-score bias)
# Reviewer A gives all scores ~40% below average
reviewer_a_scores = [4.2, 3.8, 4.5, 4.1, 3.9, 4.3]  # When others give 6.8 avg

# Pattern 2: Institutional bias — teams from College X score lower
college_x_teams = [5.1, 5.3, 4.9, 5.2, 5.0]     # College X teams
other_teams =     [7.4, 7.2, 7.8, 7.1, 7.3, 7.6]  # Other teams
# Mann-Whitney U should fire with p < 0.001

# Pattern 3: Tech stack bias — React teams score lower than Python teams
react_scores =  [5.8, 6.1, 5.9, 6.0]
python_scores = [7.9, 8.1, 7.8, 8.2, 7.7]
```

**Demo Sequence:**
1. Show bias dashboard with 0 alerts (before evaluation window)
2. Submit first batch of evaluations (seeded with patterns)
3. Watch alerts appear in real-time:
   - "⚠️ REVIEWER OUTLIER: Reviewer #1 z-score = -2.71 (harsh). 6 affected submissions."
   - "🔴 INSTITUTIONAL BIAS: p=0.003 (Bonferroni-corrected). VIT Vellore teams score 2.3 points below average."
4. Click alert to expand: show p-value (0.003), Bonferroni correction (0.018), effect size (0.61, large), group sizes
5. Admin clicks "Acknowledge + Renormalize"
6. Show Fairness Score dropping from 95 → 74 → recovering to 82 after normalization

**Key Numbers to Have Ready:** p=0.003, z=-2.71, effect_size=0.61, fairness_score=74, Krippendorff α=0.73

---

## R17 — Audit Trail

**Demo Sequence:**
1. Show audit trail table: 847 entries, with actions like REGISTRATION_APPROVED, REVIEWER_ASSIGNED, EVALUATION_SUBMITTED, BIAS_ALERT_CREATED
2. Click "Verify Chain" → wait 234ms → "✅ Chain intact — 847 entries verified"
3. **Tamper demo:** "Let me show what happens if someone modifies a record..." — Manually UPDATE one audit_log entry's metadata in psql (pre-prepared in demo DB)
4. Click "Verify Chain" again → "❌ Chain breach at entry #412 — tampering detected"
5. "This is why our audit trail is tamper-evident — any modification is immediately detectable"

**Mock Data:** Pre-populate 800+ audit_log entries covering all action types. Have a second DB instance with a tampered entry ready.

---

## R18 — Score Normalization

**What to Show:**
- Box plot: Reviewer A's raw scores cluster around 4.2, Reviewer B's around 7.1 → after normalization, both distributions converge to global mean 6.8
- "Without normalization, teams reviewed by Reviewer A would be penalized simply due to reviewer harshness"

**Chart:** Side-by-side box plots: Raw scores per reviewer vs Normalized scores per reviewer.

---

## R20 — Results <2 Minutes

**What to Show:** Timer started when admin clicks "Compute Results." Rankings appear at T+18s. "Rankings computed in 18 seconds. Feedback generating in background..."

**Pre-verification:** Run `compute_results_task` on demo data before presentation, time it, ensure <30s.

---

## R21 — Confidence Scores

**What to Show:**
```
Rankings:
#1 NeuralNomads    8.91  ████████████████████  Confidence: 90%  α=0.84
#2 DataDriven      8.23  ████████████████░░░░  Confidence: 71%  α=0.69
#3 CloudNative     7.88  ███████████████░░░░░  Confidence: 65%  α=0.64
```

**Say to judges:** "Confidence score reflects how consistently our reviewers agreed. 90% means reviewers were in strong agreement. The Krippendorff's alpha of 0.84 indicates strong inter-rater reliability — a metric commonly used in academic peer review."

---

## R22 — Personalized Feedback

**What to Show:** Click "View Feedback" for 3 different teams. Show each has unique, specific content referencing their actual scores and domain. Contrast with a template fallback example to show the Gemini output quality.

---

## R34 — Hash Chain

Covered under R17 demo above.

---

---

# PHASE 10: DEVELOPMENT PLAN

**Team:** B1 (Lead Backend), B2 (AI Engineer), B3 (Data/Logic), F1 (Lead Frontend), F2 (UI Focus)

---

## DAY 2 (Primary Day for This Subsystem)

### Hours 16-20: Reviewer Profiles + Conflict Detection

| Task | Owner | Dep | Time | Priority | Risk |
|---|---|---|---|---|---|
| Create DB migrations: reviewer_profiles, conflict_declarations, assignment_runs, evaluations, evaluation_scores, bias_alerts, final_results, team_feedback, audit_log | B1 | Day 1 DB done | 1.5h | P0 | Low |
| Implement reviewer profile API (POST /profile, POST /conflicts/declare) | B1 | Migrations | 1h | P0 | Low |
| Implement reviewer embedding generation (SentenceTransformer encode on expertise_text + bio) | B2 | Model loaded (Day 1) | 45m | P0 | Low |
| Build cost matrix + 1:K assignment algorithm with workload verification | B2 | Reviewer embeddings | 2h | P0 | HIGH (complex) |
| Implement conflict matrix builder (institution match + declared conflicts) | B3 | conflict_declarations | 45m | P0 | Low |
| Seed mock data: 8 reviewer profiles with diverse expertise | B3 | reviewer_profiles table | 30m | P0 | Low |
| Reviewer Profile + Conflict Declaration UI form | F1 | Routing done (Day 1) | 1.5h | P0 | Low |
| Assignment Panel UI: K-selector, Run button, progress bar (no data yet) | F2 | Assignment API contract | 1h | P0 | Low |

### Hours 21-24: Assignment Engine + Evaluation UI

| Task | Owner | Dep | Time | Priority | Risk |
|---|---|---|---|---|---|
| Wrap assignment algorithm in `run_reviewer_assignment` Celery task with all 8 stages + WS events | B1 | Assignment algorithm | 1.5h | P0 | Medium |
| Implement random baseline computation (for demo metrics) | B2 | Assignment algorithm | 30m | P0 | Low |
| API: POST /reviews/assign/{id}, GET /reviews/assignment-plan/{id}, POST /confirm | B1 | Celery task | 1h | P0 | Low |
| Evaluation submission API with score validation + audit log write | B3 | evaluations table | 1h | P0 | Low |
| Rubric lock mechanism + weight sum validation | B3 | evaluation_criteria | 30m | P0 | Low |
| AssignmentTable + MetricsPanel + WorkloadChart UI | F1 | Assignment plan API | 2h | P0 | Medium |
| EvaluationForm (sliders per criterion, text area, submit) | F2 | Eval submission API | 1.5h | P0 | Low |

### Hours 25-27: Bias Detection + Audit Trail

| Task | Owner | Dep | Time | Priority | Risk |
|---|---|---|---|---|---|
| BiasDetectionService: all 6 tests with Bonferroni correction and sample guards | B2 | scipy, evaluations data | 2h | P0 | HIGH (statistics) |
| Custom Krippendorff's alpha implementation (50 lines numpy) | B2 | NumPy | 45m | P0 | Medium |
| `run_bias_analysis` Celery task with Redis deduplication lock | B1 | BiasDetectionService | 45m | P0 | Low |
| Audit log: PostgreSQL `insert_audit_log` function with advisory lock | B3 | audit_log table | 1h | P0 | Medium (SQL) |
| AuditService.verify_chain() Python implementation | B3 | audit_log function | 45m | P0 | Low |
| Bias Dashboard UI: FairnessScoreGauge, BiasAlertFeed, ReviewerHeatmap | F2 | Bias API | 2h | P0 | Medium |
| Admin WS hook: connect to evaluation-live channel, dispatch alerts to Zustand | F1 | WS contract | 1h | P0 | Low |

### Hours 28-30: Results Engine + Seed Data

| Task | Owner | Dep | Time | Priority | Risk |
|---|---|---|---|---|---|
| `compute_results` Celery task: Z-normalize, bootstrap CI, ranking, versioned persist | B1 | normalize_reviewer_scores(), evaluations | 1.5h | P0 | HIGH (math) |
| `generate_feedback` Celery task: Gemini with exponential backoff + template fallback | B2 | Gemini API key working | 1h | P0 | Medium |
| Results APIs: POST /compute, GET /rankings, GET /feedback/{team_id}, POST /publish | B1 | compute_results task | 1h | P0 | Low |
| ResultsLeaderboard UI: table with CI bars, FeedbackModal, ScoreBreakdown | F1 | Rankings API | 1.5h | P0 | Medium |
| Seed: inject 3 bias patterns into evaluation data | B3 | Bias detection working | 30m | P0 | Low |
| Audit Trail Viewer UI: table + Verify Chain button + HashChainVisualizer | F2 | Audit API | 1h | P0 | Low |

---

## DAY 3 (Polish + Demo Prep for This Subsystem)

### Hours 38-42: This Subsystem Polish

| Task | Owner | Dep | Time | Priority | Risk |
|---|---|---|---|---|---|
| ETA-scheduled reviewer deadline checks (schedule_reviewer_deadline_checks) | B3 | check_reviewer_no_shows task | 1h | P0 | Low |
| GDPR reviewer erasure endpoint | B3 | AuditService | 45m | P1 | Low |
| Reviewer reliability/consistency score endpoint + UI card | B2 | Completed evaluations | 45m | P1 | Low |
| WS reconnect with exponential backoff in all frontend hooks | F1 | All WS hooks | 45m | P0 | Low |
| HTTP polling fallback for all WS channels (5s intervals) | F2 | React Query | 45m | P0 | Low |
| Pre-generate all reviewer embeddings + project embeddings in seed data | B2 | Seed data | 30m | P0 | Low |
| Pre-run assignment algorithm on demo data; verify <60s | B1 | Full pipeline | 30m | P0 | Low |
| Pre-run bias analysis on seeded data; verify all 3 patterns detected | B2 | Bias detection | 30m | P0 | Medium |
| Pre-compute results; verify rankings output; verify <30s | B1 | Results engine | 30m | P0 | Low |
| Tampered audit log entry prepared in demo DB copy | B3 | Audit trail working | 15m | P0 | Low |

### Hours 43-45: Demo Rehearsal

| Task | Owner | Time | Notes |
|---|---|---|---|
| Walk through 10-minute demo script covering R12-R22, R32, R34 | All | 1.5h | At least 2 full rehearsals |
| Verify all charts render with demo data | F1/F2 | 30m | |
| Prepare fallback: if WS fails, HTTP polling screenshots ready | F1 | 30m | |
| Pre-generate all Gemini feedback outputs and cache in Redis | B2 | 30m | Avoids rate limit during live demo |

---

## Critical Dependencies Chart

```
B1: DB Migrations ──▶ Auth APIs (Day 1) ──▶ Assignment API ──▶ Celery Task ──▶ Results API
B2: Model Load (Day 1) ──▶ Reviewer Embeddings ──▶ Cost Matrix ──▶ Bias Detection ──▶ generate_feedback
B3: Seed Data (Day 1) ──▶ Conflict Matrix ──▶ Audit Log SQL ──▶ Verify Chain ──▶ Bias Seed Injection
F1: Routing (Day 1) ──▶ Assignment Panel ──▶ WS Hook ──▶ Bias Dashboard ──▶ Leaderboard
F2: Layouts (Day 1) ──▶ Reviewer Dashboard ──▶ EvaluationForm ──▶ Bias Alerts ──▶ Audit Viewer
```

**Highest Risk Tasks (assign most experienced engineer):**
1. `run_reviewer_assignment` Celery task (1:K matrix construction) → **B2**
2. `BiasDetectionService` all 6 tests with Bonferroni → **B2**
3. `insert_audit_log` PostgreSQL function with advisory lock → **B3**
4. `compute_results` bootstrap CI + Z-normalization → **B1**

---

*End of HACKOS Reviewer Matching + Assignment + Bias Detection + Results Engine Implementation PRD.*
*Version 1.0 | Generated for 3-day hackathon sprint | Team: 3BE + 2FE*