# Operations Runbook

Start the service with `PORT=65060 npm start`. It binds to `0.0.0.0` and persists records in `data/access-performance-adjudication-reviews.json`. Check availability with `GET /health`.

| Condition | Expected response | Operator response |
| --- | --- | --- |
| Invalid adjudication scope | 422 invalid_input | Correct request body |
| Incorrect lifecycle role | 403 forbidden | Use the required role header |
| Replayed request or invalid state | 409 invalid_state | Preserve the existing review and investigate the request ID |
| Missing review or action | 404 not_found | Confirm path and review identifier |

The supported lifecycle actions are `profileAdjudication`, `verifyFinalization`, `validateCommitment`, `approveAdjudication`, and `resolveAdjudication`. Use the corresponding `adjudication_profile_analyst`, `adjudication_finalization_verifier`, `adjudication_commitment_validator`, `adjudication_authority`, and `adjudication_registrar` roles in sequence. A resolved adjudication is terminal and must remain readable without accepting another action.

Before completion, run `npm run check`, `npm test`, and `npm audit --omit=dev --audit-level=high`. Stop the process through SIGINT or SIGTERM so Express closes its listener cleanly.
