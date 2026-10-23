const DEFAULT_MATCH_ERROR = 'Unable to check the job match. Please try again.'
const AUTH_MATCH_ERROR = 'Your session has expired. Please sign in again.'

export async function requestJobMatch(formData, apiFetch) {
  let response
  try {
    response = await apiFetch('/match', {
      method: 'POST',
      body: formData,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('session')) {
      throw new Error(AUTH_MATCH_ERROR)
    }
    throw new Error(DEFAULT_MATCH_ERROR)
  }

  if (response.status === 401) {
    throw new Error(AUTH_MATCH_ERROR)
  }

  if (!response.ok) {
    let detail
    try {
      const errorBody = await response.json()
      if (typeof errorBody?.detail === 'string') {
        detail = errorBody.detail
      }
    } catch {
      // Use a safe fallback for non-JSON error responses.
    }
    throw new Error(detail || DEFAULT_MATCH_ERROR)
  }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error(DEFAULT_MATCH_ERROR)
  }

  if (
    !result ||
    typeof result !== 'object' ||
    !Number.isInteger(result.match_percentage) ||
    !Array.isArray(result.matching_skills) ||
    !Array.isArray(result.missing_skills) ||
    !Array.isArray(result.recommended_keywords)
  ) {
    throw new Error(DEFAULT_MATCH_ERROR)
  }

  return result
}
