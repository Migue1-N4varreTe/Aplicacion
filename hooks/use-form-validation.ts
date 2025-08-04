import { useState, useCallback } from "react";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface UseFormValidationReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (name: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: keyof T, error: string) => void;
  clearError: (name: keyof T) => void;
  clearErrors: () => void;
  validate: () => boolean;
  validateField: (name: keyof T) => boolean;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ValidationSchema = {},
): UseFormValidationReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Record<keyof T, string>>(
    {} as Record<keyof T, string>,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T): boolean => {
      const value = values[name];
      const rules = validationSchema[name as string];

      if (!rules) return true;

      // Required validation
      if (rules.required && (!value || value.toString().trim() === "")) {
        setErrorsState((prev) => ({
          ...prev,
          [name]: rules.message || `${String(name)} es requerido`,
        }));
        return false;
      }

      // Skip other validations if value is empty and not required
      if (!value || value.toString().trim() === "") {
        setErrorsState((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
        return true;
      }

      const stringValue = value.toString();

      // Min length validation
      if (rules.minLength && stringValue.length < rules.minLength) {
        setErrorsState((prev) => ({
          ...prev,
          [name]:
            rules.message ||
            `${String(name)} debe tener al menos ${rules.minLength} caracteres`,
        }));
        return false;
      }

      // Max length validation
      if (rules.maxLength && stringValue.length > rules.maxLength) {
        setErrorsState((prev) => ({
          ...prev,
          [name]:
            rules.message ||
            `${String(name)} no puede tener más de ${rules.maxLength} caracteres`,
        }));
        return false;
      }

      // Email validation
      if (rules.email && !/\S+@\S+\.\S+/.test(stringValue)) {
        setErrorsState((prev) => ({
          ...prev,
          [name]: rules.message || "Email inválido",
        }));
        return false;
      }

      // Phone validation
      if (rules.phone && !/^\+?[\d\s\-\(\)]+$/.test(stringValue)) {
        setErrorsState((prev) => ({
          ...prev,
          [name]: rules.message || "Número de teléfono inválido",
        }));
        return false;
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(stringValue)) {
        setErrorsState((prev) => ({
          ...prev,
          [name]:
            rules.message || `${String(name)} no tiene el formato correcto`,
        }));
        return false;
      }

      // Custom validation
      if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) {
          setErrorsState((prev) => ({
            ...prev,
            [name]: customError,
          }));
          return false;
        }
      }

      // Clear error if validation passes
      setErrorsState((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      return true;
    },
    [values, validationSchema],
  );

  const validate = useCallback((): boolean => {
    const fieldNames = Object.keys(validationSchema) as (keyof T)[];
    let isFormValid = true;

    fieldNames.forEach((name) => {
      const isFieldValid = validateField(name);
      if (!isFieldValid) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }, [validateField, validationSchema]);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((name: keyof T, error: string) => {
    setErrorsState((prev) => ({ ...prev, [name]: error }));
  }, []);

  const clearError = useCallback((name: keyof T) => {
    setErrorsState((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrorsState({} as Record<keyof T, string>);
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({} as Record<keyof T, string>);
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    validate,
    validateField,
    setSubmitting,
    reset,
  };
}

export default useFormValidation;
