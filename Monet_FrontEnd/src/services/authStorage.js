const TOKEN_KEY = "monet_access_token";
const USER_KEY = "monet_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser() {
  localStorage.removeItem(USER_KEY);
}

export function clearAuthStorage() {
  removeToken();
  removeStoredUser();
}

export function extractToken(data) {
  return (
    data?.token ||
    data?.access_token ||
    data?.authorization?.token ||
    data?.authorisation?.token ||
    null
  );
}

export function extractUser(data) {
  return data?.user || data?.data?.user || null;
}