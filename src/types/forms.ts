/**
 * Tipos TypeScript para formularios y validación
 * Proporciona tipos seguros para el manejo de formularios en la aplicación
 */

/** Estado base para cualquier formulario */
export interface BaseFormState {
  isSubmitting: boolean;
  errors: Record<string, string>;
  isDirty: boolean;
}

/** Datos de formulario de registro */
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

/** Datos de formulario de login */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/** Datos de formulario de dirección */
export interface AddressFormData {
  title: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  type: "home" | "office" | "other";
  isDefault: boolean;
  deliveryInstructions: string;
}

/** Datos de formulario de producto */
export interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  comparePrice?: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  unit: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  description: string;
  ingredients?: string;
  nutritionalInfo?: string;
  images: string[];
  barcode?: string;
  tags: string[];
  isActive: boolean;
  isOrganic: boolean;
  allergens: string[];
}

/** Estado de validación de campo */
export interface FieldValidation {
  isValid: boolean;
  message?: string;
  touched: boolean;
}

/** Resultado de validación de formulario */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstError?: string;
}

/** Opciones de validación */
export interface ValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  zipCode?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

/** Hook de formulario genérico */
export interface UseFormResult<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearErrors: () => void;
  resetForm: () => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  handleSubmit: (onSubmit: (data: T) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>;
}

/** Tipos de input soportados */
export type InputType = 
  | "text" 
  | "email" 
  | "password" 
  | "number" 
  | "tel" 
  | "url" 
  | "search"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "file"
  | "date"
  | "time"
  | "datetime-local";

/** Propiedades comunes de inputs */
export interface BaseInputProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

/** Configuración de campo de formulario */
export interface FormFieldConfig<T = any> {
  type: InputType;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationOptions;
  options?: Array<{ value: T; label: string }>; // Para select, radio, etc.
  hint?: string;
  disabled?: boolean;
  conditional?: (formData: any) => boolean; // Mostrar campo condicionalmente
}

export default {};
