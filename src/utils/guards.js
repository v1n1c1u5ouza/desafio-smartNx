export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function assert(condition, status, message) {
  if (!condition) throw new HttpError(status, message);
}

export function requireFields(obj, fields) {
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null || obj[f] === '') {
      throw new HttpError(400, `Campo obrigatório ausente: ${f}`);
    }
  }
}

export function ensureOwner(entityUserId, requestUserId, message) {
  if (String(entityUserId) !== String(requestUserId)) {
    throw new HttpError(403, message);
  }
}

export function pickDefined(obj, keys) {
  const out = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}
