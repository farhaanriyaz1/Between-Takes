const configuredBase = import.meta.env.VITE_COMMENTS_API_BASE;
const COMMENTS_API_BASES = configuredBase
  ? [configuredBase]
  : ['http://localhost:5001/api/comments', 'http://localhost:5000/api/comments'];

const handleResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || fallbackMessage);
  }

  return payload;
};

export const fetchMovieComments = async (movieId) => {
  let lastError;

  for (const base of COMMENTS_API_BASES) {
    try {
      const response = await fetch(`${base}/${movieId}`);
      return await handleResponse(response, 'Failed to fetch comments');
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to fetch comments');
};

export const createMovieComment = async ({ movieId, username, text }) => {
  let lastError;

  for (const base of COMMENTS_API_BASES) {
    try {
      const response = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, username, text })
      });
      return await handleResponse(response, 'Failed to post comment');
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to post comment');
};

export const deleteMovieComment = async ({ commentId, username }) => {
  let lastError;

  for (const base of COMMENTS_API_BASES) {
    try {
      const response = await fetch(`${base}/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to delete comment');
      }

      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to delete comment');
};
