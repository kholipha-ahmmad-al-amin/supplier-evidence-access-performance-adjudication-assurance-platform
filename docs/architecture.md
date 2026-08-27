# Adjudication Service Architecture

The service separates transport, domain policy, and persistence. Express supplies request correlation and structured error serialization. The domain service owns adjudication scope validation, role gates, idempotency, and state transitions. The store writes a complete replacement document to a temporary file before atomic rename, so a valid commit cannot expose a partially written JSON document.

| State | Required role | Next state |
| --- | --- | --- |
| submitted | adjudication_profile_analyst | adjudication_profiled |
| adjudication_profiled | adjudication_finalization_verifier | finalization_verified |
| finalization_verified | adjudication_commitment_validator | commitment_validated |
| commitment_validated | adjudication_authority | adjudication_approved |
| adjudication_approved | adjudication_registrar | adjudication_resolved |

Permitted adjudication scopes are `access_entitlement_adjudication`, `evidence_commitment_adjudication`, and `exception_route_adjudication`. Every accepted command carries an actor identifier, role, and request identifier. The service rejects a request identifier that has already been recorded in the same review, whether it originated during submission or a later transition.

The service never mutates a review before scope, actor, request identifier, and current state checks pass. Terminal records remain readable but cannot advance after `adjudication_resolved`.
