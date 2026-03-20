import { useState, useCallback, useRef, useEffect } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

// Validation rule interface
export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
}

// Form field interface
export interface FormField<T = any> {
  value: T;
  error: string | undefined;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
}

// Form state interface
export interface FormState<T extends Record<string, any>> {
  fields: Record<keyof T, FormField<T[keyof T]>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

// Form validation options
export interface FormValidationOptions<T extends Record<string, any>> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, ValidationRule<T[keyof T]>>>;
  schema?: z.ZodSchema<T>;
  onSubmit?: (values: T) => Promise<void> | void;
  onFieldChange?: (field: keyof T, value: T[keyof T]) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  resetOnSubmit?: boolean;
  showErrorsOnChange?: boolean;
}

// Form validation hook
export function useFormValidation<T extends Record<string, any>>(
  options: FormValidationOptions<T>
) {
  const { toast } = useToast();
  const {
    initialValues,
    validationRules = {},
    schema,
    onSubmit,
    onFieldChange,
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    resetOnSubmit = false,
    showErrorsOnChange = false,
  } = options;

  // Create initial form state
  const createInitialState = (): FormState<T> => ({
    fields: Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = {
        value: initialValues[key as keyof T],
        error: undefined,
        touched: false,
        dirty: false,
        validating: false,
      };
      return acc;
    }, {} as Record<keyof T, FormField<T[keyof T]>>),
    isValid: true,
    isDirty: false,
    isSubmitting: false,
    submitCount: 0,
  });

  const [formState, setFormState] = useState<FormState<T>>(createInitialState);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Validation functions
  const validateField = useCallback((
    fieldName: keyof T,
    value: T[keyof T]
  ): string | null => {
    // Skip validation if field hasn't been touched and we're not showing errors on change
    if (!formState.fields[fieldName].touched && !showErrorsOnChange) {
      return formState.fields[fieldName].error || null;
    }

    // Zod schema validation
    if (schema) {
      try {
        // Use safeParse instead of accessing shape property
        const result = schema.safeParse({ [fieldName]: value });
        if (!result.success) {
          return result.error.issues[0]?.message || 'Invalid value';
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.issues[0]?.message || 'Invalid value';
        }
      }
    }

    // Custom validation rules
    const rules = validationRules[fieldName];
    if (!rules) return null;

    const { required, minLength, maxLength, min, max, pattern, custom, message } = rules;

    // Required validation
    if (required && (value === undefined || value === null || value === '')) {
      return message || 'This field is required';
    }

    // Skip other validations if value is empty and not required
    if (!required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (minLength && value.length < minLength) {
        return message || `Minimum ${minLength} characters required`;
      }
      if (maxLength && value.length > maxLength) {
        return message || `Maximum ${maxLength} characters allowed`;
      }
      if (pattern && !pattern.test(value)) {
        return message || 'Invalid format';
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (min !== undefined && value < min) {
        return message || `Minimum value is ${min}`;
      }
      if (max !== undefined && value > max) {
        return message || `Maximum value is ${max}`;
      }
    }

    // Custom validation
    if (custom) {
      const customError = custom(value);
      if (customError) return customError;
    }

    return null;
  }, [formState.fields, schema, validationRules, showErrorsOnChange]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newFields = { ...formState.fields };

    Object.keys(newFields).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, newFields[fieldName].value);
      newFields[fieldName] = {
        ...newFields[fieldName],
        error: error || undefined,
        touched: true,
      } as FormField<T[keyof T]>;
      if (error) isValid = false;
    });

    setFormState(prev => ({
      ...prev,
      fields: newFields,
      isValid,
    }));

    return isValid;
  }, [formState.fields, validateField]);

  // Set field value
  const setFieldValue = useCallback((
    fieldName: keyof T,
    value: T[keyof T],
    validate = validateOnChange
  ) => {
    const newFields = { ...formState.fields };
    const currentField = newFields[fieldName];

    newFields[fieldName] = {
      ...currentField,
      value,
      dirty: value !== initialValues[fieldName],
      touched: true,
    };

    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Validate immediately or debounce
    if (validate && validateOnChange) {
      if (debounceMs > 0) {
        debounceTimeoutRef.current = setTimeout(() => {
          setFormState(prev => {
            const fields = { ...prev.fields };
            const error = validateField(fieldName, value);
            fields[fieldName] = {
              ...fields[fieldName],
              error: error || undefined,
            } as FormField<T[keyof T]>;

            const isValid = Object.values(fields).every(field => !field.error);

            return {
              ...prev,
              fields,
              isValid,
              isDirty: Object.values(fields).some(field => field.dirty),
            };
          });
        }, debounceMs);
      } else {
        const error = validateField(fieldName, value);
        newFields[fieldName].error = error || undefined;
      }
    }

    setFormState(prev => ({
      ...prev,
      fields: newFields,
      isValid: Object.values(newFields).every(field => !field.error),
      isDirty: Object.values(newFields).some(field => field.dirty),
    }));

    onFieldChange?.(fieldName, value);
  }, [formState.fields, initialValues, validateOnChange, validateField, onFieldChange, debounceMs]);

  // Set field error
  const setFieldError = useCallback((fieldName: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: {
          ...prev.fields[fieldName],
          error,
          touched: true,
        },
      },
      isValid: false,
    }));
  }, []);

  // Clear field error
  const clearFieldError = useCallback((fieldName: keyof T) => {
    setFormState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: {
          ...prev.fields[fieldName],
          error: undefined,
        },
      },
      isValid: Object.values(prev.fields).every(field => !field.error),
    }));
  }, []);

  // Touch field
  const touchField = useCallback((fieldName: keyof T) => {
    setFormState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: {
          ...prev.fields[fieldName],
          touched: true,
        },
      },
    }));
  }, []);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName: keyof T) => {
    touchField(fieldName);

    if (validateOnBlur) {
      const error = validateField(fieldName, formState.fields[fieldName].value);
      setFormState(prev => ({
        ...prev,
        fields: {
          ...prev.fields,
          [fieldName]: {
            ...prev.fields[fieldName],
            error: error || undefined,
            touched: true,
          },
        },
        isValid: Object.values(prev.fields).every(field => !field.error),
      }));
    }
  }, [formState.fields, validateField, validateOnBlur, touchField]);

  // Reset form
  const resetForm = useCallback((values?: Partial<T>) => {
    const newValues = { ...initialValues, ...values };
    const newFields = Object.keys(newValues).reduce((acc, key) => {
      acc[key as keyof T] = {
        value: newValues[key as keyof T],
        error: undefined,
        touched: false,
        dirty: false,
        validating: false,
      } as FormField<T[keyof T]>;
      return acc;
    }, {} as Record<keyof T, FormField<T[keyof T]>>);

    setFormState({
      fields: newFields,
      isValid: true,
      isDirty: false,
      isSubmitting: false,
      submitCount: 0,
    });
  }, [initialValues]);

  // Submit form
  const submitForm = useCallback(async () => {
    // Validate all fields
    const isValid = validateForm();

    if (!isValid) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      submitCount: prev.submitCount + 1,
    }));

    try {
      const values = Object.keys(formState.fields).reduce((acc, key) => {
        acc[key as keyof T] = formState.fields[key as keyof T].value;
        return acc;
      }, {} as T);

      await onSubmit?.(values);

      if (resetOnSubmit) {
        resetForm();
      }
    } catch (error) {
      toast({
        title: 'Submission Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  }, [formState.fields, validateForm, onSubmit, resetOnSubmit, resetForm, toast]);

  // Get field props for form inputs
  const getFieldProps = useCallback((fieldName: keyof T) => ({
    value: formState.fields[fieldName].value,
    onChange: (value: T[keyof T]) => setFieldValue(fieldName, value),
    onBlur: () => handleFieldBlur(fieldName),
    error: formState.fields[fieldName].error,
    touched: formState.fields[fieldName].touched,
    dirty: formState.fields[fieldName].dirty,
    validating: formState.fields[fieldName].validating,
  }), [formState.fields, setFieldValue, handleFieldBlur]);

  // Get form values
  const getValues = useCallback((): T => {
    return Object.keys(formState.fields).reduce((acc, key) => {
      acc[key as keyof T] = formState.fields[key as keyof T].value;
      return acc;
    }, {} as T);
  }, [formState.fields]);

  // Set multiple values
  const setValues = useCallback((values: Partial<T>) => {
    const newFields = { ...formState.fields };

    Object.entries(values).forEach(([key, value]) => {
      const fieldName = key as keyof T;
      newFields[fieldName] = {
        ...newFields[fieldName],
        value,
        dirty: value !== initialValues[fieldName],
      };
    });

    setFormState(prev => ({
      ...prev,
      fields: newFields,
      isDirty: Object.values(newFields).some(field => field.dirty),
    }));
  }, [formState.fields, initialValues]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    formState,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    isSubmitting: formState.isSubmitting,
    submitCount: formState.submitCount,

    // Methods
    setFieldValue,
    setFieldError,
    clearFieldError,
    touchField,
    handleFieldBlur,
    resetForm,
    submitForm,
    getFieldProps,
    getValues,
    setValues,
    validateForm,
    validateField,
  };
}

// Preset validation rules
export const validationRules = {
  required: { required: true },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    message: 'Please enter a valid phone number',
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username must be 3-20 characters (letters, numbers, underscore only)',
  },
  age: {
    required: true,
    min: 18,
    max: 120,
    message: 'Age must be between 18 and 120',
  },
  bio: {
    maxLength: 500,
    message: 'Bio must be less than 500 characters',
  },
};

export default useFormValidation;
