import assert from 'node:assert/strict'
import test from 'node:test'
import { requestJobMatch } from '../src/jobMatchApi.js'

const validResult = {
  match_percentage: 75,
  matching_skills: ['Python'],
  missing_skills: ['Leadership'],
  recommended_keywords: ['FastAPI'],
}

function response({ status = 200, body = validResult, jsonError } = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    async json() {
      if (jsonError) throw jsonError
      return body
    },
  }
}

test('returns a valid successful match response', async () => {
  const result = await requestJobMatch(new FormData(), async () => response())
  assert.deepEqual(result, validResult)
})

test('uses a safe message for malformed success JSON', async () => {
  await assert.rejects(
    requestJobMatch(new FormData(), async () => response({ jsonError: new SyntaxError() })),
    /Unable to check the job match/,
  )
})

test('does not treat an invalid success payload as a match result', async () => {
  await assert.rejects(
    requestJobMatch(new FormData(), async () => response({ body: { detail: 'failure' } })),
    /Unable to check the job match/,
  )
})

test('shows a safe message for malformed HTTP error JSON', async () => {
  await assert.rejects(
    requestJobMatch(new FormData(), async () => response({ status: 500, jsonError: new SyntaxError() })),
    /Unable to check the job match/,
  )
})

test('uses a string detail from HTTP errors', async () => {
  await assert.rejects(
    requestJobMatch(
      new FormData(),
      async () => response({ status: 503, body: { detail: 'Service unavailable.' } }),
    ),
    /Service unavailable/,
  )
})

test('handles HTTP 401 without exposing response data', async () => {
  await assert.rejects(
    requestJobMatch(
      new FormData(),
      async () => response({ status: 401, body: { detail: 'internal auth details' } }),
    ),
    /session has expired/i,
  )
})

test('handles network failures with a safe message', async () => {
  await assert.rejects(
    requestJobMatch(new FormData(), async () => {
      throw new TypeError('private network diagnostic')
    }),
    (error) => {
      assert.match(error.message, /Unable to check the job match/)
      assert.doesNotMatch(error.message, /private network diagnostic/)
      return true
    },
  )
})
