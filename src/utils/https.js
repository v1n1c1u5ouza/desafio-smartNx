export function ok(res, data) {
  return res.status(200).json(data);
}


export function created(res, data) {
  return res.status(201).json(data);
}


export function noContent(res) {
  return res.status(204).send();
}


export function badRequest(res, message) {
  return res.status(400).json({ error: message });
}


export function unauthorized(res, message) {
  return res.status(401).json({ error: message });
}


export function forbidden(res, message) {
  return res.status(403).json({ error: message });
}


export function notFound(res, message) {
  return res.status(404).json({ error: message });
}


export function internal(res, error, fallbackMsg = 'Ocorreu um erro interno') {
  return res.status(500).json({ error: fallbackMsg, details: error?.message });
}