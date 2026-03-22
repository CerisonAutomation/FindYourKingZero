import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// AI Configuration Interface
interface AIConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enableStreaming?: boolean;
  timeout?: number;
}

// AI Response Interface
interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  finishReason?: string;
}

// AI Hook State Interface
interface UnifiedAIState {
  isLoading: boolean;
  error: string | null;
  response: AIResponse | null;
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// AI Hook Options Interface
interface UseUnifiedAIOptions {
  enableHistory?: boolean;
  maxHistoryLength?: number;
  autoRetry?: boolean;
  maxRetries?: number;
  onError?: (error: string) => void;
  onSuccess?: (response: AIResponse) => void;
}

// Unified AI Hook
export function useUnifiedAI(config: AIConfig = {}, options: UseUnifiedAIOptions = {}) {
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Default configuration
  const defaultConfig: Required<AIConfig> = {
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 1000,
    enableStreaming: true,
    timeout: 30000,
    ...config,
  };

  const defaultOptions: Required<UseUnifiedAIOptions> = {
    enableHistory: true,
    maxHistoryLength: 10,
    autoRetry: true,
    maxRetries: 3,
    onError: () => {},
    onSuccess: () => {},
    ...options,
  };

  // State management
  const [state, setState] = useState<UnifiedAIState>({
    isLoading: false,
    error: null,
    response: null,
    conversation: [],
  });

  // Enhanced bio generation
  const generateBioSuggestion = useCallback(async (
    interests: string[] = [],
    context: string[] = []
  ): Promise<string | null> => {
    const prompt = `Generate a compelling dating bio based on:
    Interests: ${interests.join(', ') || 'Not specified'}
    Context: ${context.join(', ') || 'General dating profile'}
    
    Requirements:
    - 100-200 characters
    - Authentic and engaging
    - Include personality traits
    - Mention specific interests if provided
    - Avoid clichés
    - Make it memorable and unique`;

    return generateContent(prompt);
  }, []);

  // Profile analysis
  const analyzeProfile = useCallback(async (profileData: {
    bio?: string;
    interests?: string[];
    photos?: string[];
    age?: number;
    location?: string;
  }): Promise<string | null> => {
    const prompt = `Analyze this dating profile and provide improvement suggestions:
    
    Bio: ${profileData.bio || 'Not provided'}
    Interests: ${profileData.interests?.join(', ') || 'Not specified'}
    Age: ${profileData.age || 'Not specified'}
    Location: ${profileData.location || 'Not specified'}
    Photos: ${profileData.photos?.length || 0} photos uploaded
    
    Provide specific, actionable suggestions to improve:
    1. Bio quality and authenticity
    2. Interest diversity
    3. Overall appeal
    4. Safety considerations
    
    Keep response under 300 characters.`;

    return generateContent(prompt);
  }, []);

  // Compatibility scoring
  const calculateCompatibility = useCallback(async (
    profile1: any,
    profile2: any
  ): Promise<number> => {
    const prompt = `Calculate compatibility score (0-100) between two profiles:
    
    Profile 1:
    - Bio: ${profile1.bio || 'Not provided'}
    - Interests: ${profile1.interests?.join(', ') || 'Not specified'}
    - Age: ${profile1.age || 'Not specified'}
    
    Profile 2:
    - Bio: ${profile2.bio || 'Not provided'}
    - Interests: ${profile2.interests?.join(', ') || 'Not specified'}
    - Age: ${profile2.age || 'Not specified'}
    
    Consider:
    - Interest overlap
    - Age appropriateness
    - Bio compatibility
    - Personality indicators
    
    Return only a number between 0-100.`;

    const response = await generateContent(prompt);
    const score = parseInt(response?.match(/\d+/)?.[0] || '0');
    return Math.min(100, Math.max(0, score));
  }, []);

  // Content moderation
  const moderateContent = useCallback(async (content: string): Promise<{
    isAppropriate: boolean;
    confidence: number;
    issues: string[];
  }> => {
    const prompt = `Moderate this content for a dating app:
    
    Content: "${content}"
    
    Check for:
    - Inappropriate language
    - Harassment or hate speech
    - Spam or scam content
    - Personal information sharing
    - Violent or harmful content
    
    Respond with JSON format:
    {
      "isAppropriate": boolean,
      "confidence": number (0-1),
      "issues": ["issue1", "issue2"]
    }`;

    try {
      const response = await generateContent(prompt);
      const parsed = JSON.parse(response || '{}');
      return {
        isAppropriate: parsed.isAppropriate ?? true,
        confidence: parsed.confidence ?? 0.5,
        issues: parsed.issues ?? [],
      };
    } catch {
      return {
        isAppropriate: true,
        confidence: 0.5,
        issues: [],
      };
    }
  }, []);

  // Conversation starter suggestions
  const generateConversationStarters = useCallback(async (
    profile: any,
    context: string = 'dating'
  ): Promise<string[]> => {
    const prompt = `Generate 3 conversation starters for ${context} based on this profile:
    
    Bio: ${profile.bio || 'Not provided'}
    Interests: ${profile.interests?.join(', ') || 'Not specified'}
    
    Requirements:
    - Personalized and specific to their profile
    - Open-ended questions
    - Show genuine interest
    - Avoid generic compliments
    - Keep each under 50 characters
    
    Return as a JSON array of strings.`;

    try {
      const response = await generateContent(prompt);
      const parsed = JSON.parse(response || '[]');
      return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
    } catch {
      return [
        "What's your favorite way to spend a weekend?",
        "I noticed you're into [interest] - tell me more!",
        "What's been the best part of your week so far?",
      ];
    }
  }, []);

  // Event description enhancement
  const enhanceEventDescription = useCallback(async (description: string): Promise<string | null> => {
    const prompt = `Enhance this event description to be more engaging and informative:
    
    Original: "${description}"
    
    Improve:
    - Add excitement and energy
    - Include what to expect
    - Mention atmosphere/vibe
    - Add call-to-action
    - Keep under 300 characters
    - Maintain authenticity
    
    Make it compelling but not overly promotional.`;

    return generateContent(prompt);
  }, []);

  // Core content generation function
  const generateContent = useCallback(async (prompt: string): Promise<string | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Prepare conversation history
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for a dating app. Be authentic, respectful, and provide practical advice.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      // Add conversation history if enabled
      if (defaultOptions.enableHistory && state.conversation.length > 0) {
        messages.splice(-1, 0, ...state.conversation.slice(-defaultOptions.maxHistoryLength));
      }

      // Call AI function
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages,
          model: defaultConfig.model,
          temperature: defaultConfig.temperature,
          max_tokens: defaultConfig.maxTokens,
          stream: defaultConfig.enableStreaming,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const content = response.data?.content || response.data || '';
      
      // Update conversation history
      if (defaultOptions.enableHistory) {
        setState(prev => ({
          ...prev,
          conversation: [
            ...prev.conversation.slice(-defaultOptions.maxHistoryLength),
            { role: 'user', content: prompt },
            { role: 'assistant', content },
          ],
        }));
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        response: {
          content,
          usage: response.data?.usage,
          model: response.data?.model,
          finishReason: response.data?.finish_reason,
        },
      }));

      defaultOptions.onSuccess({
        content,
        usage: response.data?.usage,
        model: response.data?.model,
        finishReason: response.data?.finish_reason,
      });

      return content;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      defaultOptions.onError(errorMessage);

      toast({
        title: 'AI Error',
        description: errorMessage,
        variant: 'destructive',
      });

      // Auto-retry if enabled
      if (defaultOptions.autoRetry) {
        // Implementation for retry logic could go here
      }

      return null;
    }
  }, [
    defaultConfig,
    defaultOptions,
    state.conversation,
    toast,
  ]);

  // Clear conversation history
  const clearConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      conversation: [],
      response: null,
      error: null,
    }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      response: null,
      conversation: [],
    });
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Return hook interface
  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    response: state.response,
    conversation: state.conversation,

    // Methods
    generateBioSuggestion,
    analyzeProfile,
    calculateCompatibility,
    moderateContent,
    generateConversationStarters,
    enhanceEventDescription,
    generateContent,

    // Utilities
    clearConversation,
    reset,
    cleanup,
  };
}

// Export types for external use
export type { AIConfig, AIResponse, UseUnifiedAIOptions, UnifiedAIState };

export default useUnifiedAI;
import { useState, useCallback, useRef, useEffect } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

// Validation rule interface
export interface ValidationRule <T = any> {
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
export interface FormField <T = any> {
  value: T;
  error: string | undefined;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
}

// Form state interface
export interface FormState <T extends Record<string, any>> {
  fields: Record<keyof T, FormField<T[keyof T]>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

// Form validation options
export interface FormValidationOptions <T extends Record<string, any>> {
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
