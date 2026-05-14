export function createUniquePrefixedId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
