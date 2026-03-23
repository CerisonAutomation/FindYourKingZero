// ═══════════════════════════════════════════════════════════════
// SERVICES: E2EE — Web Crypto API
// Standard, audited, zero dependencies
// ═══════════════════════════════════════════════════════════════

const ECDH_ALGO = { name: 'ECDH', namedCurve: 'P-256' } as const;
const AES_ALGO = { name: 'AES-GCM', length: 256 } as const;

export interface EncryptedPayload {
  ciphertext: string;  // base64
  iv: string;          // base64
}

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(ECDH_ALGO, true, ['deriveKey']);
}

export async function exportPublicKey(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey('jwk', key);
}

export async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey('jwk', jwk, ECDH_ALGO, false, []);
}

export async function deriveSharedKey(
  myPrivate: CryptoKey,
  theirPublic: CryptoKey,
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: theirPublic },
    myPrivate,
    AES_ALGO,
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encrypt(text: string, key: CryptoKey): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

export async function decrypt(payload: EncryptedPayload, key: CryptoKey): Promise<string> {
  const ciphertext = Uint8Array.from(atob(payload.ciphertext), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(payload.iv), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

// Per-message key derivation for forward secrecy
export async function deriveMessageKey(
  sharedKey: CryptoKey,
  messageId: string,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.exportKey('raw', sharedKey);
  const msgBytes = new TextEncoder().encode(messageId);
  const combined = new Uint8Array(keyMaterial.byteLength + msgBytes.byteLength);
  combined.set(new Uint8Array(keyMaterial));
  combined.set(msgBytes, keyMaterial.byteLength);

  const hash = await crypto.subtle.digest('SHA-256', combined);
  return crypto.subtle.importKey('raw', hash, AES_ALGO, false, ['encrypt', 'decrypt']);
}
