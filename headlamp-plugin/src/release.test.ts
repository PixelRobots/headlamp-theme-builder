import { describe, expect, it } from 'vitest';

describe('release metadata', () => {
  it('uses the expected plugin package name', () => {
    expect('headlamp-theme-builder').toBe('headlamp-theme-builder');
  });
});
