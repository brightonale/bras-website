import { describe, it, expect, vi } from 'vitest';
import { GET as customHtmlGet, POST as customHtmlPost } from '../src/app/api/committee/custom-html/route';
import { POST as ratePost } from '../src/app/api/rate/route';
import * as actions from '../src/app/actions';

vi.mock('../src/app/actions', () => ({
  getSession: vi.fn()
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn()
  }))
}));

describe('API Authorization', () => {
  it('custom-html GET returns 401 for non-committee', async () => {
    vi.mocked(actions.getSession).mockResolvedValue({ role: 'member', isLoggedIn: true, name: 'test', votingName: 'test' });
    const response = await customHtmlGet();
    expect(response.status).toBe(401);
  });

  it('custom-html POST returns 401 for non-committee', async () => {
    vi.mocked(actions.getSession).mockResolvedValue({ role: 'member', isLoggedIn: true, name: 'test', votingName: 'test' });
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) });
    const response = await customHtmlPost(req);
    expect(response.status).toBe(401);
  });

  it('rate POST returns 401 for unauthenticated user', async () => {
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ pubName: 'Pub', score: 5 }) });
    const response = await ratePost(req);
    expect(response.status).toBe(401);
  });
});
