# ADR-001: Microservices-Ready Modular Monolith

**Status:** Accepted  
**Date:** 2025-01-15  
**Deciders:** HackOS Engineering Team  
**Category:** Architecture

---

## Context

HackOS is a hackathon management platform with 12 distinct service domains:
Auth, Registration, AI Processing, Team Formation, Submission, Review Assignment,
Bias Detection, Results, Communication, Promotion, Analytics, and Audit.

The initial version must be delivered in a 3-day development window with a 5-person team.

The production system requirement is explicitly described as a "microservices architecture" (PRD §3.1, R28).

## Decision

We will build a **microservices-ready modular monolith** for the MVP, with explicit extraction points designed into the architecture from day one.

Each service domain is implemented as:
1. A dedicated FastAPI router (`/api/v1/<service>/`)
2. A self-contained service layer class (no cross-service imports at the service layer)
3. A namespaced Celery task module (`tasks.<service>.*`)
4. A separate Docker Compose service entry with its own `WORKER_QUEUE` environment variable

This is NOT a "big ball of mud" monolith. It is a structured monolith with hard service boundaries enforced at the code review level.

## Consequences

### Positive
- **Development velocity:** 3 engineers can work in parallel without merge conflicts across service boundaries
- **Deployment simplicity:** Single Docker Compose file, single Postgres database, no service discovery needed
- **Debugging:** Full stack traces across service calls; no distributed tracing required for MVP
- **Correct for scale:** At demo time (<100 concurrent users), the overhead of inter-service HTTP calls would add latency with zero benefit
- **Extraction is mechanical:** Each module's service boundary is already drawn; extraction = split router into separate FastAPI app + add message bus

### Negative
- **Not independently deployable:** A bad deploy affects all services simultaneously (mitigated: Celery workers are separate processes)
- **Shared database:** Schema changes require coordination (mitigated: each service queries only its own tables via namespaced functions)
- **Cannot scale services independently:** Registration service cannot be scaled without scaling the API as a whole (mitigated: Celery workers ARE independently scalable via separate task queues)

## Extraction Path to True Microservices

When the Registration Service needs to be extracted (trigger: >500 registrations/hour requiring dedicated scale):

```
Step 1: Move /api/v1/registrations/* router to standalone FastAPI app
Step 2: Add SQS/Kafka event: RegistrationCompleted → consumed by AI Processing Service
Step 3: Move registration_pipeline Celery tasks to new worker pool
Step 4: Update Nginx to route /api/v1/registrations/* to new service
Step 5: Add health check and circuit breaker for inter-service calls
Estimated effort: 2 engineer-weeks
```

Repeat for each service in this priority order:
1. Registration Service (highest load)
2. AI Processing Service (CPU-bound, needs dedicated GPU instances)  
3. Review & Bias Service (evaluation window burst traffic)
4. Communication Service (notification fan-out at scale)
5. All others (low traffic, low urgency)

## Current Docker Compose Service Boundaries

```yaml
services:
  nginx:                        # API Gateway / Reverse Proxy
  api:                          # FastAPI app — all routers (extraction target)
  celery-worker-registration:   # registration_pipeline tasks (extraction target #1)
  celery-worker-ai:             # reviewer_assignment, bias_detection, team_formation tasks
  celery-worker-notifications:  # chatbot, deadline_reminders, result_notifications
  celery-beat:                  # Scheduler — Celery periodic tasks
  redis:                        # Broker + Cache + Pub/Sub (would split in production)
  postgres:                     # Primary database (would shard by service in production)
```

Each `celery-worker-*` service is already independently scalable via Docker Compose `--scale`.

## Production Kubernetes Target Architecture

```
                    ┌─────────────────┐
                    │    AWS ALB      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
    ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
    │ Registration │ │  Review &   │ │ Communication│
    │   Service    │ │  Bias Svc   │ │   Service    │
    │ (ECS Fargate │ │(ECS Fargate)│ │(ECS Fargate) │
    │  2–20 tasks) │ └─────────────┘ └──────────────┘
    └──────┬───────┘        │                │
           │         ┌──────┴────────────────┘
           ▼         ▼
    ┌────────────────────────────────────────┐
    │              AWS SQS FIFO              │
    │   (registration_high, ai_low, notif)  │
    └────────────────────────────────────────┘
           │
           ▼
    ┌────────────────────────────────────────┐
    │         Aurora PostgreSQL              │
    │  Primary (writes) + Read Replica       │
    │         + pgvector extension           │
    └────────────────────────────────────────┘
```

**Service mesh:** Istio for mTLS between services  
**GitOps:** ArgoCD for deployment  
**Observability:** OpenTelemetry → Grafana + Jaeger distributed tracing  
**Secret management:** AWS Secrets Manager (not env vars)

## Alternatives Considered

### True Microservices from Day 0
**Rejected.** For a 5-person team with a 3-day deadline, the overhead of service discovery, distributed tracing, inter-service authentication, and separate CI/CD pipelines would consume 60%+ of development time on infrastructure rather than features. The judging criteria reward working AI features over infrastructure purity.

### Serverless (Supabase Edge Functions only)
**Rejected for AI workloads.** Edge Functions cannot run SciPy (statistical tests), NumPy (Hungarian algorithm), or SentenceTransformer (384MB model). A Python microservice is non-negotiable for the AI components. Supabase is used for Auth, RLS, Realtime, and pgvector.

### ILP / OR-Tools for optimization
**Rejected.** scipy.optimize.linear_sum_assignment (Hungarian algorithm) solves the reviewer assignment problem exactly at O(n³) and is sufficient for n<200. OR-Tools adds a 50MB dependency with no benefit at this scale.

---

*This ADR is referenced in the pitch deck under "Architecture" and in the README under "Design Decisions".*
