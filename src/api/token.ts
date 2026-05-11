export interface TokenResponse {
  token: string;
  expiresAt: number;
  provider: string;
}

export async function fetchToken(
  apiBaseUrl: string,
  projectKey: string
): Promise<TokenResponse> {
  const res = await fetch(`${apiBaseUrl}/api/v1/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Project-Key": projectKey,
    },
  });

  if (!res.ok) {
    throw new Error(`Token fetch failed (${res.status})`);
  }

  return res.json();
}
