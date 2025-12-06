/**
 * Translates Firebase Authentication error codes to user-friendly i18n messages
 * @param error - The error object from Firebase Auth
 * @param t - The translation function from useTranslation hook
 * @returns Translated error message string
 */
export function getAuthErrorMessage(error: unknown, t: (key: string) => string): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case 'auth/invalid-email':
        return t('auth.invalidEmail');
      case 'auth/user-not-found':
        return t('auth.userNotFound');
      case 'auth/wrong-password':
        return t('auth.wrongPassword');
      case 'auth/invalid-credential':
        // Firebase v9+ uses this for invalid email/password combinations
        return t('auth.wrongPassword');
      case 'auth/email-already-in-use':
        return t('auth.emailAlreadyInUse');
      case 'auth/weak-password':
        return t('auth.weakPassword');
      case 'auth/too-many-requests':
        return t('auth.tooManyRequests');
      case 'auth/network-request-failed':
        return t('auth.networkError');
      case 'auth/user-disabled':
        return t('auth.userDisabled');
      case 'auth/operation-not-allowed':
        return t('auth.operationNotAllowed');
      case 'auth/requires-recent-login':
        return t('auth.requiresRecentLogin');
      default:
        return t('auth.unknownError');
    }
  }
  // Fallback to unknown error for any other error type
  return t('auth.unknownError');
}
