import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.mjs';
import { AccessPerformanceAdjudicationService } from '../src/domain.mjs';

class MemoryStore { constructor() { this.database = { accessPerformanceAdjudicationReviews: [] }; } read() { return structuredClone(this.database); } write(data) { this.database = structuredClone(data); } }
const headers = { 'x-actor-id': 'owner-http-857', 'x-actor-role': 'evidence_owner', 'x-request-id': 'request-http-857' };
const body = { supplierId: 'SUP-857', evidenceReference: 'EVD-857', adjudicationReference: 'ADJ-857-ACCESS-01', adjudicationScope: 'access_entitlement_adjudication' };
const route = '/access-performance-adjudication-reviews';

describe('access-performance adjudication HTTP transport', () => {
  it('returns supplied request identifier and submitted adjudication review', async () => { const app = createApp(new AccessPerformanceAdjudicationService(new MemoryStore())); const response = await request(app).post(route).set(headers).send(body); expect(response.status).toBe(201); expect(response.headers['x-request-id']).toBe(headers['x-request-id']); expect(response.body.status).toBe('submitted'); });
  it('returns structured invalid-input and missing-actor errors', async () => { const app = createApp(new AccessPerformanceAdjudicationService(new MemoryStore())); const invalid = await request(app).post(route).set(headers).send({ ...body, adjudicationScope: 'invalid' }); const missingActor = await request(app).post(route).set('x-request-id', 'request-missing-actor-857').send(body); expect(invalid.status).toBe(422); expect(invalid.body.error.code).toBe('invalid_input'); expect(missingActor.status).toBe(403); expect(missingActor.body.error.code).toBe('forbidden'); });
  it('returns structured not-found errors for unknown review and action', async () => { const app = createApp(new AccessPerformanceAdjudicationService(new MemoryStore())); const missing = await request(app).get(`${route}/missing-review-857`); const created = await request(app).post(route).set(headers).send(body); const unknown = await request(app).post(`${route}/${created.body.id}/unknownAction`).set({ 'x-actor-id': 'profile-http-857', 'x-actor-role': 'adjudication_profile_analyst', 'x-request-id': 'request-unknown-action-857' }).send({ note: 'unknown' }); expect(missing.status).toBe(404); expect(missing.body.error.code).toBe('not_found'); expect(unknown.status).toBe(404); expect(unknown.body.error.code).toBe('not_found'); });
});
