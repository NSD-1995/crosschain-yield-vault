const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

async function request(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return text ? JSON.parse(text) : {};
}

export function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }
  return Promise.resolve({ ok: true });
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

export function pauseVault() {
  return request("/admin/pause", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function unpauseVault() {
  return request("/admin/unpause", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function updateCap(depositCap) {
  return request("/admin/deposit-cap", {
    method: "POST",
    body: JSON.stringify({ depositCap }),
  });
}

export function getAdminStatus() {
  return request("/admin/status");
}

export function getAdminEvents() {
  return request("/admin/events");
}

export function getSuspiciousTransactions() {
  return request("/admin/suspicious-transactions");
}

export function simulateYield(amount) {
  return request("/admin/yield-update", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}
