/**
 * Tommo 1.0 Autonomous Super AI Engine - API Key Management Utility.
 * Format: tmm-xxxxxxxxxxxxxxxxxxxx (20 alphanumeric chars: [A-Za-z0-9])
 */

export const TOMMO_API_KEY_REGEX = /^tmm-[A-Za-z0-9]{20}$/;

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Sinh mã Tommo API Key ngẫu nhiên chuẩn mã hóa an toàn (crypto.getRandomValues).
 * Định dạng: tmm-xxxxxxxxxxxxxxxxxxxx (20 ký tự gồm chữ hoa, chữ thường, số).
 */
export function generateTommoApiKey(): string {
  const bytes = new Uint8Array(20);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for non-crypto environment
    for (let i = 0; i < 20; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  let suffix = '';
  for (let i = 0; i < 20; i++) {
    suffix += CHARSET[bytes[i] % CHARSET.length];
  }

  return `tmm-${suffix}`;
}

/**
 * Kiểm tra tính hợp lệ của Tommo API Key theo định dạng: tmm-xxxxxxxxxxxxxxxxxxxx
 */
export function validateTommoApiKey(key: string | null | undefined): boolean {
  if (!key || typeof key !== 'string') return false;
  return TOMMO_API_KEY_REGEX.test(key.trim());
}

/**
 * Làm mờ API key để hiển thị bảo mật trong UI (VD: tmm-A1B2...9z0X)
 */
export function maskTommoApiKey(key: string): string {
  if (!validateTommoApiKey(key)) return key;
  return `${key.slice(0, 8)}••••••••••••${key.slice(-4)}`;
}
