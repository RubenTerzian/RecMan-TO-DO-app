export function createPrefixedId(prefix: string, suffix: string) {
  return `${prefix}-${suffix}`;
}

export function createUniquePrefixedId(prefix: string) {
  return createPrefixedId(prefix, crypto.randomUUID());
}
