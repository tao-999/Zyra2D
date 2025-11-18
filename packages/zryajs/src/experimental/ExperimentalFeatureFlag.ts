// packages/zryajs/src/experimental/ExperimentalFeatureFlag.ts

export type ExperimentalFeatureId = string;

const flags = new Set<ExperimentalFeatureId>();

export function enableFeature(id: ExperimentalFeatureId): void {
  flags.add(id);
}

export function disableFeature(id: ExperimentalFeatureId): void {
  flags.delete(id);
}

export function isFeatureEnabled(id: ExperimentalFeatureId): boolean {
  return flags.has(id);
}
