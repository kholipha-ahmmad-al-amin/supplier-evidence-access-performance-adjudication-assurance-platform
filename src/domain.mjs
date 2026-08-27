import { conflict, forbidden, missing } from './errors.mjs';
import { adjudicationScope, text } from './validation.mjs';

const transitions = {
  profileAdjudication: { from: 'submitted', to: 'adjudication_profiled', role: 'adjudication_profile_analyst', event: 'adjudication_profiled' },
  verifyFinalization: { from: 'adjudication_profiled', to: 'finalization_verified', role: 'adjudication_finalization_verifier', event: 'adjudication_finalization_verified' },
  validateCommitment: { from: 'finalization_verified', to: 'commitment_validated', role: 'adjudication_commitment_validator', event: 'adjudication_commitment_validated' },
  approveAdjudication: { from: 'commitment_validated', to: 'adjudication_approved', role: 'adjudication_authority', event: 'adjudication_approved' },
  resolveAdjudication: { from: 'adjudication_approved', to: 'adjudication_resolved', role: 'adjudication_registrar', event: 'adjudication_resolved' }
};
const timestamp = () => new Date().toISOString();
const requireRole = (actor, role) => { if (!actor?.id || actor.role !== role) throw forbidden(`role ${role} is required`); };
const requestSeen = (record, requestId) => record.events.some((event) => event.requestId === requestId);

export class AccessPerformanceAdjudicationService {
  constructor(store) { this.store = store; }
  submit(input, actor, requestId) {
    requireRole(actor, 'evidence_owner'); const database = this.store.read(); if (database.accessPerformanceAdjudicationReviews.some((record) => requestSeen(record, requestId))) throw conflict('request identifier was already used');
    const now = timestamp(); const record = { id: crypto.randomUUID(), supplierId: text(input.supplierId, 'supplier id'), evidenceReference: text(input.evidenceReference, 'evidence reference'), adjudicationReference: text(input.adjudicationReference, 'adjudication reference'), adjudicationScope: adjudicationScope(input.adjudicationScope), status: 'submitted', createdAt: now, updatedAt: now, events: [{ type: 'access_performance_adjudication_submitted', actorId: actor.id, requestId, at: now }] };
    database.accessPerformanceAdjudicationReviews.push(record); this.store.write(database); return record;
  }
  transition(id, action, input, actor, requestId) {
    const policy = transitions[action]; if (!policy) throw missing('action was not found'); requireRole(actor, policy.role); const database = this.store.read(); const record = database.accessPerformanceAdjudicationReviews.find((entry) => entry.id === id);
    if (!record) throw missing('access-performance adjudication review was not found'); if (requestSeen(record, requestId)) throw conflict('request identifier was already used'); if (record.status !== policy.from) throw conflict(`access-performance adjudication review must be ${policy.from}`);
    const note = text(input.note, 'note'); const now = timestamp(); record.status = policy.to; record.updatedAt = now; record.events.push({ type: policy.event, actorId: actor.id, requestId, note, at: now }); database.accessPerformanceAdjudicationReviews = database.accessPerformanceAdjudicationReviews.map((entry) => entry.id === id ? record : entry); this.store.write(database); return record;
  }
  get(id) { const record = this.store.read().accessPerformanceAdjudicationReviews.find((entry) => entry.id === id); if (!record) throw missing('access-performance adjudication review was not found'); return record; }
}
