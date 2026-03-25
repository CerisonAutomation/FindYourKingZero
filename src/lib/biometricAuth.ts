// =====================================================
// BIOMETRIC AUTH — Face ID / Touch ID via Web Authentication API
// Uses WebAuthn (navigator.credentials) on supported browsers
// Falls back to Capacitor Biometric plugin on native
// =====================================================
import {useCallback, useState} from 'react';

export interface BiometricResult {
  success: boolean;
  method: 'webauthn' | 'capacitor' | 'unsupported';
  error?: string;
}

/**
 * Check if biometric authentication is available on this device.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    // Check Capacitor native biometrics
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isPluginAvailable?.('BiometricAuth')) {
      const result = await (window as any).Capacitor.Plugins.BiometricAuth.checkBiometry();
      return result?.isAvailable === true;
    }

    // Check WebAuthn / platform authenticator
    if (window.PublicKeyCredential) {
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Prompt biometric authentication.
 * Returns success/failure result.
 */
export async function authenticateBiometric(
  reason = 'Verify your identity',
): Promise<BiometricResult> {
  // Try Capacitor native biometrics first
  if (typeof window !== 'undefined' && (window as any).Capacitor?.isPluginAvailable?.('BiometricAuth')) {
    try {
      const result = await (window as any).Capacitor.Plugins.BiometricAuth.verify({
        reason,
        title: 'Biometric Verification',
      });
      return {
        success: result?.verified === true,
        method: 'capacitor',
      };
    } catch (err: any) {
      return {
        success: false,
        method: 'capacitor',
        error: err?.message ?? 'Biometric verification failed',
      };
    }
  }

  // WebAuthn fallback
  if (window.PublicKeyCredential) {
    try {
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

      if (!available) {
        return {
          success: false,
          method: 'unsupported',
          error: 'No biometric authenticator available',
        };
      }

      // Create a credential for verification
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'Find Your King',
            id: window.location.hostname,
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: 'user',
            displayName: 'User',
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      });

      return {
        success: !!credential,
        method: 'webauthn',
      };
    } catch (err: any) {
      return {
        success: false,
        method: 'webauthn',
        error: err?.name === 'NotAllowedError'
          ? 'Authentication cancelled'
          : err?.message ?? 'WebAuthn verification failed',
      };
    }
  }

  return {
    success: false,
    method: 'unsupported',
    error: 'Biometric authentication not supported on this device',
  };
}

/**
 * React hook for biometric auth with state management.
 */
export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const checkAvailability = useCallback(async () => {
    const available = await isBiometricAvailable();
    setIsAvailable(available);
    return available;
  }, []);

  const authenticate = useCallback(
    async (reason?: string): Promise<BiometricResult> => {
      setIsAuthenticating(true);
      try {
        return await authenticateBiometric(reason);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [],
  );

  return {
    isAvailable,
    isAuthenticating,
    checkAvailability,
    authenticate,
  };
}

export default {
  isBiometricAvailable,
  authenticateBiometric,
  useBiometricAuth,
};
