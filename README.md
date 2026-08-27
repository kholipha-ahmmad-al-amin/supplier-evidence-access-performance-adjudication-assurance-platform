# Supplier Evidence Access Performance Adjudication Assurance Platform

## The Problem

Supplier evidence access events can create entitlement, commitment, and exception-route adjudication obligations. Informal handoffs obscure who profiled the adjudication, who verified finalization evidence, and who resolved the adjudication. This service provides a traceable workflow without permitting a single actor to approve every stage.

## The Solution

The platform exposes a small, auditable HTTP service for adjudication reviews. It enforces a monotonic role-separated lifecycle, validates the permitted adjudication scope, records request identifiers with every event, rejects duplicate requests, and atomically replaces the JSON persistence file only after a valid transition.

## Live Demo and Tech Stack

Run the service locally at `http://127.0.0.1:65060/health`. The stack uses Node.js 22, Express 5, Vitest, Supertest, JSON file persistence, atomic rename writes, and GitHub Actions.

| Layer | Implementation |
| --- | --- |
| Transport | Express JSON API with request correlation |
| Domain | Role-separated adjudication state machine |
| Persistence | Atomic JSON file replacement |
| Verification | Vitest, Supertest, production dependency audit |

## Local Setup and Run Instructions

```bash
git clone https://github.com/kholipha-ahmmad-al-amin/supplier-evidence-access-performance-adjudication-assurance-platform.git
cd supplier-evidence-access-performance-adjudication-assurance-platform
npm ci
npm run check
npm test
npm start
```

The default listener is `0.0.0.0:65060`. Submit a record to `POST /access-performance-adjudication-reviews` as `evidence_owner`, then advance it through `profileAdjudication`, `verifyFinalization`, `validateCommitment`, `approveAdjudication`, and `resolveAdjudication` using the corresponding role headers.

## System Documentation

### System Architecture Diagram

```mermaid
flowchart LR
Client[Operations client] --> API[Express API]
API --> Domain[Adjudication domain service]
Domain --> Store[Atomic JSON store]
Store --> Data[(Adjudication review file)]
```

### Entity-Relationship Diagram

```mermaid
erDiagram
ADJUDICATION_REVIEW ||--o{ ADJUDICATION_EVENT : records
ADJUDICATION_REVIEW { string id string supplierId string adjudicationScope string status }
ADJUDICATION_EVENT { string type string actorId string requestId string at }
```

### Data Flow Diagram

```mermaid
flowchart TD
Input[Validated request] --> Role[Role policy]
Role --> State[State policy]
State --> Event[Append event]
Event --> Write[Atomic write]
Write --> Response[JSON response]
```

### Use Case Diagram

```mermaid
flowchart LR
Owner[Evidence owner] --> Submit[Submit adjudication]
Analyst[Profile analyst] --> Profile[Profile adjudication]
Verifier[Finalization verifier] --> Verify[Verify finalization]
Validator[Commitment validator] --> Validate[Validate commitment]
Authority[Adjudication authority] --> Authorize[Approve adjudication]
Registrar[Adjudication registrar] --> Release[Resolve adjudication]
```

### Sequence Diagram

```mermaid
sequenceDiagram
participant C as Client
participant A as API
participant D as Domain
participant S as Store
C->>A: Submit or transition with actor and request ID
A->>D: Validate role, scope, state, and idempotency
D->>S: Atomically write review and event
S-->>D: Persisted state
D-->>A: Adjudication review
A-->>C: Correlated JSON response
```

For design constraints and recovery behavior, see [architecture.md](docs/architecture.md) and [operations-runbook.md](docs/operations-runbook.md).

## Owner

Created and maintained by Kholipha Ahmmad Al-Amin.

Software Engineer and AI Specialist

Founder and CEO of EquiSaaS BD

Principal Consultant at AR IT Consultancy

Full Stack Developer and SaaS Product Builder

Official links

Portfolio: https://kholipha-ahmmad-al-amin.equisaas-bd.com/

GitHub: https://github.com/kholipha-ahmmad-al-amin

LinkedIn: https://www.linkedin.com/in/kholipha-ahmmad-al-amin

X: https://x.com/al_amin5519

Facebook: https://www.facebook.com/kholipha.ahmmad.al.amin

Instagram: https://www.instagram.com/kholipha.ahmmad.al.amin

## Ownership

This project was created and is maintained by Kholipha Ahmmad Al-Amin.
