// =====================================================
// SHARE SHEET — Native navigator.share() with fallback
// Falls back to clipboard copy on unsupported platforms
// =====================================================
import {haptics} from './haptics';

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'cancelled';
  error?: string;
}

/**
 * Share content using the native Web Share API.
 * Falls back to clipboard copy when unavailable.
 */
export async function share(data: ShareData): Promise<ShareResult> {
  haptics.tap();

  // Validate — need at least one field
  if (!data.title && !data.text && !data.url) {
    return { success: false, method: 'cancelled', error: 'Nothing to share' };
  }

  // Try native share first
  if (navigator.share && canShareNative(data)) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
        files: data.files,
      });
      haptics.success();
      return { success: true, method: 'native' };
    } catch (err: any) {
      // User cancelled — not an error
      if (err?.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
      // Other error — fall through to clipboard
    }
  }

  // Fallback: copy to clipboard
  try {
    const textToCopy = [data.title, data.text, data.url].filter(Boolean).join('\n');
    await navigator.clipboard.writeText(textToCopy);
    haptics.success();
    return { success: true, method: 'clipboard' };
  } catch (err) {
    return {
      success: false,
      method: 'clipboard',
      error: 'Failed to copy to clipboard',
    };
  }
}

/**
 * Check if the current data can be shared natively (files support check).
 */
function canShareNative(data: ShareData): boolean {
  if (data.files?.length && !navigator.canShare) {
    return false;
  }
  if (data.files?.length && navigator.canShare) {
    return navigator.canShare({ files: data.files });
  }
  return true;
}

/**
 * Share a profile link.
 */
export async function shareProfile(userId: string, displayName: string): Promise<ShareResult> {
  return share({
    title: `Check out ${displayName} on Find Your King`,
    text: `${displayName} is on Find Your King — the LGBTQ+ dating platform. Come say hi!`,
    url: `https://fyking.men/profile/${userId}`,
  });
}

/**
 * Share an event.
 */
export async function shareEvent(
  eventId: string,
  eventName: string,
): Promise<ShareResult> {
  return share({
    title: eventName,
    text: `Join me at ${eventName} on Find Your King!`,
    url: `https://fyking.men/events/${eventId}`,
  });
}

/**
 * Share the app itself (referral).
 */
export async function shareApp(referralCode?: string): Promise<ShareResult> {
  const url = referralCode
    ? `https://fyking.men/invite/${referralCode}`
    : 'https://fyking.men';

  return share({
    title: 'Find Your King',
    text: 'Join the LGBTQ+ community on Find Your King — privacy-first dating.',
    url,
  });
}

export default {
  share,
  shareProfile,
  shareEvent,
  shareApp,
};
