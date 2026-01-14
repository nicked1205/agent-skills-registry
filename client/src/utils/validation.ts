const MIN_PASSWORD_LENGTH = 8;

export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
  }

  if (!/[a-zA-Z]/.test(password)) {
    return "Password must contain at least one letter";
  }

  if (!/\d/.test(password)) {
    return "Password must contain at least one digit";
  }

  return null;
}

const MAX_USERNAME_LENGTH = 100;
const MIN_USERNAME_LENGTH = 3;

export function validateUsername(username: string): string | null {
  if (
    username.length < MIN_USERNAME_LENGTH ||
    username.length > MAX_USERNAME_LENGTH
  ) {
    return `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters long`;
  }

  if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    return "Username may only contain letters, numbers, underscores (_), and dots (.)";
  }
  return null;
}
