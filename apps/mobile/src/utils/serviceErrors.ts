/**
 * Custom error class for service errors with i18n support
 * The message property should be a translation key (e.g., 'program.invalidInput')
 */
export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceError';
  }
}

/**
 * Translates service errors to user-friendly i18n messages
 *
 * If the error is our ServiceError, it returns the translated message.
 * If it's a Firebase error or any other error, it returns a generic error message.
 *
 * @param error - The error object from services
 * @param t - The translation function from useTranslation hook
 * @returns Translated error message string in the user's language
 *
 * @example
 * try {
 *   await services.firestore.deleteProgram(userId, programId);
 * } catch (error) {
 *   const message = getServiceErrorMessage(error, t);
 *   showError(message);
 * }
 */
export function getServiceErrorMessage(
  error: unknown,
  t: (key: string, options?: Record<string, string | number>) => string,
): string {
  // If it's our ServiceError, translate the message (which is a translation key)
  if (error instanceof ServiceError) {
    return t(error.message);
  }

  // For Firebase errors or any other errors, return generic message
  return t('common.somethingWentWrong');
}
