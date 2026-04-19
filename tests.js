// enforcement.test.ts
import { describe, it, expect, vi } from 'vitest';
import { POST } from './route';

describe('Enforcement Layer', () => {
  it('refuse unknown fields', async () => {
    const res = await POST(new Request('..', { method: 'POST', body: JSON.stringify({ unknown: 'x' }) }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: { code: 'validation_failed' } });
  });

  it('refuse PII or json without evidence', async () => {
    const bad = { ..., evidence: '{"credit":"1234"}' };
    const res = await POST(/* ... */);
    expect(await res.json()).toHaveProperty('error.code', 'validation_failed');
  });

  it('refuse closeout without outcome', async () => {
    await expect().rejects.toThrow('Closeout requires outcome');
  });

  it('success + version stamping', async () => {
    const res = await POST(validPayload);
    expect(res.status).toBe(200);
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('[enforce v1.2]'));
  });
});