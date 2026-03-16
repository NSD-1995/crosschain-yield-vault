const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json();
}

export function getVaultStats() {
  return request("/vault/stats");
}

export function getUserPosition(address) {
  return request(`/user/${address}/position`);
}

export function getTransactions(address) {
  return request(`/user/${address}/transactions`);
}

export function initiateBridge(data) {
  return request("/bridge/initiate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getBridgeStatus(txHash) {
  return request(`/bridge/status/${txHash}`);
}

export function pauseVault(token) {
  return request("/admin/pause", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
}

export function updateCap(token, depositCap) {
  return request("/admin/deposit-cap", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ depositCap }),
  });
}

export function getAdminStatus(token) {
  return request("/admin/status", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getAdminEvents(token) {
  return (
    request("/admin/events"),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export function getSuspiciousTransactions(token) {
  return (
    request("/admin/suspicious-transactions"),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export function simulateYield(token, amount) {
  return request("/admin/yield-update", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });
}

export function unpauseVault(token) {
  return request("/admin/unpause", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
}
