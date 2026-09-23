const API_BASE = "http://localhost:5001/api";

function getToken() {
  return localStorage.getItem("tap_token");
}

function getEmail() {
  return localStorage.getItem("tap_email");
}

function setSession(token, email) {
  localStorage.setItem("tap_token", token);
  localStorage.setItem("tap_email", email);
}

function clearSession() {
  localStorage.removeItem("tap_token");
  localStorage.removeItem("tap_email");
}

async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = "Bearer " + token;

  let response;
  try {
    response = await fetch(API_BASE + path, { ...options, headers });
  } catch (err) {
    throw new Error("Cannot reach server. Is the backend running on port 5001?");
  }

  let data = {};
  try {
    data = await response.json();
  } catch (err) {
    data = {};
  }

  if (response.status === 401) {
    clearSession();
    if (!location.pathname.endsWith("index.html") && location.pathname !== "/") {
      location.href = "index.html";
    }
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed (" + response.status + ")");
  }

  return data;
}
