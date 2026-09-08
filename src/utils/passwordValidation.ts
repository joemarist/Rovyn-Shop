export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one symbol character.';
  }
  return null;
}

export const passwordHint =
  'At least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 symbol.';
