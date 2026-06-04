export function formatDate(value) {
  if (!value) return '-';

  try {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}
/*
export function fullName(user = {}) {
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.name || '-';
}*/

export function fullName(user = {}) {
  // Try both snake_case and camelCase
  const first = user.first_name || user.firstName || '';
  const last = user.last_name || user.lastName || '';
  return [first, last].filter(Boolean).join(' ') || user.name || user.fullName || '-';
}


