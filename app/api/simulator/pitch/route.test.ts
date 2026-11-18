import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';

const route = import('./route');

function request() {
  return new Request('http://localhost/api/simulator/pitch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol: 'AAPL', companyName: 'Apple', pitchText: 'A test investment thesis.' }),
  });
}

function aiResponse(review: unknown) {
  return new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text: JSON.stringify(review) }], role: 'model' }, finishReason: 'STOP' }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

test('empty or malformed pitch requests return a client error without calling AI', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('AI must not be called for invalid requests');
  });
  const { POST } = await route;
  for (const body of ['', '{"symbol":', 'null']) {
    const response = await POST(new Request('http://localhost/api/simulator/pitch', { method: 'POST', body }));
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /empty or invalid/);
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('AI failures return an error instead of a rejected verdict', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('Unavailable', { status: 503 }));
  t.mock.method(console, 'error', () => {});

  const { POST } = await route;
  const response = await POST(request());
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.match(body.error, /AI review is unavailable/);
  assert.equal(body.data, undefined);
});

test('a provider authentication error explains the configuration problem', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('Forbidden', { status: 403 }));
  t.mock.method(console, 'error', () => {});

  const { POST } = await route;
  const response = await POST(request());
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.match(body.error, /API key or its permissions/);
  assert.equal(body.data, undefined);
});

test('the score determines approval at the 70-point threshold', async (t) => {
  let score = 70;
  t.mock.method(globalThis, 'fetch', async () => aiResponse({
    status: score === 70 ? 'rejected' : 'approved',
    score,
    feedback: 'Test feedback.',
  }));

  const { POST } = await route;
  let response = await POST(request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.review.status, 'approved');

  score = 69;
  response = await POST(request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.review.status, 'rejected');
});

test('invalid AI review data is reported as an error', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => aiResponse({ status: 'rejected', score: -1, feedback: 'Invalid.' }));
  t.mock.method(console, 'error', () => {});

  const { POST } = await route;
  const response = await POST(request());
  assert.equal(response.status, 503);
  assert.equal((await response.json()).data, undefined);
});
