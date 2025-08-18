const backendUrl = import.meta.env.VITE_BACKEND_URL;

export async function fetchFromBackend(endpoint, options = {}) {
  const res = await fetch(`${backendUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Backend request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
