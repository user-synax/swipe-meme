export async function authenticatedFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important for httpOnly cookies
  });
}
