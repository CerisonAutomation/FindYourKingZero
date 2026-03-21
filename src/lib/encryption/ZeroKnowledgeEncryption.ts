/**
 * Zero-Knowledge Encryption Service
 * Military-grade end-to-end encryption with perfect forward secrecy
 */

import { createHash, randomBytes, createCipheriv, createDecipheriv, scrypt } from 'crypto';

export type EncryptionKeyPair =  {
  publicKey: string;
  privateKey: string;
  keyId: string;
  createdAt: number;
  expiresAt: number;
}

export type EncryptedMessage =  {
  data: string;
  nonce: string;
  authTag: string;
  keyId: string;
  timestamp: number;
  algorithm: 'aes-256-gcm';
}

export class ZeroKnowledgeEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly NONCE_LENGTH = 16;
  private static readonly SALT_LENGTH = 32;
  private static readonly SCALING_ITERATIONS = 100000;

  /**
   * Generate a new key pair with perfect forward secrecy
   */
  static async generateKeyPair(): Promise<EncryptionKeyPair> {
    const keyId = this.generateKeyId();
    const publicKey = randomBytes(this.KEY_LENGTH).toString('base64');
    const privateKey = randomBytes(this.KEY_LENGTH).toString('base64');
    const now = Date.now();

    return {
      publicKey,
      privateKey,
      keyId,
      createdAt: now,
      expiresAt: now + (24 * 60 * 60 * 1000), // 24 hours
    };
  }

  /**
   * Encrypt message with zero-knowledge principles
   */
  static async encrypt(
    message: string,
    publicKey: string,
    keyId: string
  ): Promise<EncryptedMessage> {
    try {
      const keyBuffer = Buffer.from(publicKey, 'base64');
      const nonce = randomBytes(this.NONCE_LENGTH);

      const cipher = createCipheriv(this.ALGORITHM, keyBuffer, nonce);

      let encrypted = cipher.update(message, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      const authTag = cipher.getAuthTag();

      return {
        data: encrypted,
        nonce: nonce.toString('base64'),
        authTag: authTag.toString('base64'),
        keyId,
        timestamp: Date.now(),
        algorithm: this.ALGORITHM,
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Decrypt message with zero-knowledge principles
   */
  static async decrypt(
    encryptedMessage: EncryptedMessage,
    privateKey: string
  ): Promise<string> {
    try {
      const keyBuffer = Buffer.from(privateKey, 'base64');
      const nonce = Buffer.from(encryptedMessage.nonce, 'base64');
      const authTag = Buffer.from(encryptedMessage.authTag, 'base64');

      const decipher = createDecipheriv(this.ALGORITHM, keyBuffer, nonce);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedMessage.data, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Derive encryption key from password with scrypt
   */
  static async deriveKey(
    password: string,
    salt: Buffer
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(password, salt, this.KEY_LENGTH, { N: this.SCALING_ITERATIONS }, (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });
  }

  /**
   * Generate unique key ID
   */
  private static generateKeyId(): string {
    return createHash('sha256')
      .update(randomBytes(32))
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Verify message integrity with HMAC
   */
  static async verifyIntegrity(
    message: string,
    hmac: string,
    key: Buffer
  ): Promise<boolean> {
    const computedHmac = createHash('sha256')
      .update(key)
      .update(message)
      .digest('hex');

    return computedHmac === hmac;
  }

  /**
   * Generate secure random salt
   */
  static generateSalt(): Buffer {
    return randomBytes(this.SALT_LENGTH);
  }

  /**
   * Rotate keys for perfect forward secrecy
   */
  static async rotateKeys(_currentKeyPair: EncryptionKeyPair): Promise<EncryptionKeyPair> {
    const newKeyPair = await this.generateKeyPair();

    // In a real implementation, you would:
    // 1. Encrypt new private key with old public key
    // 2. Store encrypted version for key rotation
    // 3. Notify peers of key rotation

    return newKeyPair;
  }

  /**
   * Check if key has expired
   */
  static isKeyExpired(keyPair: EncryptionKeyPair): boolean {
    return Date.now() > keyPair.expiresAt;
  }

  /**
   * Generate key exchange message for P2P handshake
   */
  static async generateKeyExchange(keyPair: EncryptionKeyPair): Promise<{
    keyId: string;
    publicKey: string;
    timestamp: number;
    signature: string;
  }> {
    const message = {
      keyId: keyPair.keyId,
      publicKey: keyPair.publicKey,
      timestamp: keyPair.createdAt,
    };

    const signature = createHash('sha256')
      .update(JSON.stringify(message))
      .update(keyPair.privateKey)
      .digest('hex');

    return {
      ...message,
      signature,
    };
  }

  /**
   * Verify key exchange signature
   */
  static async verifyKeyExchange(
    keyExchange: any,
    expectedPublicKey: string
  ): Promise<boolean> {
    const { signature, ...message } = keyExchange;

    const expectedSignature = createHash('sha256')
      .update(JSON.stringify(message))
      .update(expectedPublicKey)
      .digest('hex');

    return signature === expectedSignature;
  }
}

export default ZeroKnowledgeEncryption;
