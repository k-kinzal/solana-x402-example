/**
 * Vibration utility for haptic feedback
 *
 * Note: Vibration API is not supported on iOS Safari.
 * Works on Android Chrome/Firefox.
 */

export type VibrationPattern = number | number[];

// Predefined patterns
export const VIBRATION_PATTERNS: Record<string, VibrationPattern> = {
  // Light tap feedback (button press)
  tap: 15,

  // Standard confirmation
  confirm: 30,

  // Error feedback (short pulses)
  error: [50, 50, 50, 50, 50],

  // Rare result - double pulse
  rare: [25, 50, 50],

  // Super Rare result - escalating excitement
  superRare: [15, 30, 30, 30, 80],
};

/**
 * Trigger vibration if supported
 * @param pattern - Duration in ms, or array of [vibrate, pause, vibrate, ...]
 * @returns true if vibration was triggered, false if not supported
 */
export function vibrate(pattern: VibrationPattern): boolean {
  // Check if Vibration API is supported
  if (typeof navigator === 'undefined' || !navigator.vibrate) {
    return false;
  }

  try {
    return navigator.vibrate(pattern);
  } catch {
    // Silently fail if vibration is not allowed
    return false;
  }
}

/**
 * Vibration feedback for button tap
 */
export function vibrateTap(): boolean {
  return vibrate(VIBRATION_PATTERNS.tap);
}

/**
 * Vibration feedback based on gacha rarity
 */
export function vibrateForRarity(rarity: 'common' | 'rare' | 'superRare'): boolean {
  switch (rarity) {
    case 'superRare':
      return vibrate(VIBRATION_PATTERNS.superRare);
    case 'rare':
      return vibrate(VIBRATION_PATTERNS.rare);
    case 'common':
    default:
      // No vibration for common results
      return false;
  }
}
