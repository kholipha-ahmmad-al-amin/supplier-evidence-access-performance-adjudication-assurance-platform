import { inputError } from './errors.mjs';

export const text = (value, name) => {
  if (typeof value !== 'string' || !value.trim()) throw inputError(`${name} is required`);
  return value.trim();
};

export const adjudicationScope = (value) => {
  value = text(value, 'adjudication scope');
  if (!['access_entitlement_adjudication', 'evidence_commitment_adjudication', 'exception_route_adjudication'].includes(value)) throw inputError('adjudication scope is invalid');
  return value;
};

export const actor = (headers) => ({ id: headers['x-actor-id'], role: headers['x-actor-role'] });
