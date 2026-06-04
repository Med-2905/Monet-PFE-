export function getErrorMessage(error, fallback = 'Something went wrong.') {
  const data = error?.response?.data;

  if (!data) return fallback;

  if (typeof data.message === 'string') return data.message;

  if (data.errors && typeof data.errors === 'object') {
    const firstKey = Object.keys(data.errors)[0];
    const firstError = data.errors[firstKey];

    if (Array.isArray(firstError)) return firstError[0];
    if (typeof firstError === 'string') return firstError;
  }

  return fallback;
}

export function getValidationErrors(error) {
  const errors = error?.response?.data?.errors;

  if (!errors || typeof errors !== 'object') return {};

  return errors;
}
