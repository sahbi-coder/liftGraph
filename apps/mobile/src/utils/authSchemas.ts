import z from 'zod';

type TranslationFunction = (key: string) => string;

export const getEmailSchema = (t: TranslationFunction) =>
  z.string().min(1, t('auth.validation.emailRequired')).email(t('auth.validation.emailInvalid'));

export const getPasswordSchema = (t: TranslationFunction) =>
  z.string().min(1, t('auth.validation.passwordRequired'));

export const getPasswordSchemaForSignup = (t: TranslationFunction) =>
  z
    .string()
    .min(1, t('auth.validation.passwordRequired'))
    .min(6, t('auth.validation.passwordMinLength'));

export const getNameSchema = (t: TranslationFunction) =>
  z.string().min(1, t('auth.validation.nameRequired')).min(2, t('auth.validation.nameMinLength'));

export const getConfirmPasswordSchema = (password: string, t: TranslationFunction) => {
  return z
    .string()
    .min(1, t('auth.validation.confirmPasswordRequired'))
    .refine((val) => val === password, {
      message: t('auth.validation.passwordsDoNotMatch'),
    });
};
