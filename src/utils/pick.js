export default function pick(obj = {}, keys = []) {
  return Object.fromEntries(
    keys
      .filter((k) => Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined)
      .map((k) => [k, obj[k]])
  );
}
