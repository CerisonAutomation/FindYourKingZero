import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { BaseInputProps } from '@/types/base-props';

// Form field variants
const formFieldVariants = cva(
  'space-y-2',
  {
    variants: {
      size: {
        sm: 'space-y-1',
        md: 'space-y-2',
        lg: 'space-y-3',
      },
      layout: {
        vertical: 'flex flex-col',
        horizontal: 'flex items-center gap-4',
      },
    },
    defaultVariants: {
      size: 'md',
      layout: 'vertical',
    },
  }
);

// Form field props interface
export interface FormFieldProps extends BaseInputProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  children: React.ReactNode;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

// Form field component
export function FormField({
  label,
  description,
  error,
  required = false,
  disabled = false,
  size = 'md',
  layout = 'vertical',
  children,
  helperText,
  leftIcon,
  rightIcon,
  leftAddon,
  rightAddon,
  className,
  ...props
}: FormFieldProps) {
  const fieldId = props.id || props.name || `field-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn(formFieldVariants({ size, layout }), className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error && 'text-destructive',
            disabled && 'opacity-50',
            layout === 'horizontal' && 'min-w-[100px] shrink-0'
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center gap-2">
        {leftAddon && (
          <div className="flex items-center px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground">
            {leftAddon}
          </div>
        )}

        <div className="relative flex-1">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          {React.cloneElement(children as React.ReactElement, {
            id: fieldId,
            disabled,
            'aria-invalid': !!error,
            'aria-describedby': error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined,
            className: cn(
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              leftAddon && 'rounded-l-none',
              rightAddon && 'rounded-r-none',
              error && 'border-destructive focus:border-destructive',
              (children as React.ReactElement).props.className
            ),
          })}

          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {rightAddon && (
          <div className="flex items-center px-3 py-2 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground">
            {rightAddon}
          </div>
        )}
      </div>

      {(description || error || helperText) && (
        <div className="space-y-1">
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}

          {error && (
            <p id={`${fieldId}-error`} className="text-xs text-destructive">
              {error}
            </p>
          )}

          {helperText && !error && (
            <p id={`${fieldId}-helper`} className="text-xs text-muted-foreground">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Reusable input field component
export interface InputFieldProps extends Omit<FormFieldProps, 'children'> {
  type?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  onBlur?: (value: string | number) => void;
  onFocus?: (value: string | number) => void;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  autoComplete?: string;
}

export function InputField({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  maxLength,
  minLength,
  pattern,
  min,
  max,
  step,
  autoComplete,
  ...fieldProps
}: InputFieldProps) {
  const { Input } = require('@/components/ui/input');

  return (
    <FormField {...fieldProps}>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={(e) => onBlur?.(e.target.value)}
        onFocus={(e) => onFocus?.(e.target.value)}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
      />
    </FormField>
  );
}

// Reusable textarea field component
export interface TextareaFieldProps extends Omit<FormFieldProps, 'children'> {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  onFocus?: (value: string) => void;
  rows?: number;
  maxLength?: number;
  minLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export function TextareaField({
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  rows = 3,
  maxLength,
  minLength,
  resize = 'vertical',
  ...fieldProps
}: TextareaFieldProps) {
  const { Textarea } = require('@/components/ui/textarea');

  return (
    <FormField {...fieldProps}>
      <Textarea
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={(e) => onBlur?.(e.target.value)}
        onFocus={(e) => onFocus?.(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        minLength={minLength}
        className={cn(
          resize === 'none' && 'resize-none',
          resize === 'vertical' && 'resize-y',
          resize === 'horizontal' && 'resize-x',
          resize === 'both' && 'resize'
        )}
      />
    </FormField>
  );
}

// Reusable select field component
export interface SelectFieldProps extends Omit<FormFieldProps, 'children'> {
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
}

export function SelectField({
  options,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  searchable = false,
  clearable = false,
  multiple = false,
  ...fieldProps
}: SelectFieldProps) {
  const { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } = require('@/components/ui/select');

  return (
    <FormField {...fieldProps}>
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={(newValue) => {
          onChange?.(newValue);
          onBlur?.(newValue);
        }}
        disabled={fieldProps.disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

// Reusable checkbox field component
export interface CheckboxFieldProps extends Omit<FormFieldProps, 'children'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  indeterminate?: boolean;
}

export function CheckboxField({
  checked,
  defaultChecked,
  onChange,
  label,
  description,
  indeterminate = false,
  ...fieldProps
}: CheckboxFieldProps) {
  const { Checkbox } = require('@/components/ui/checkbox');

  return (
    <FormField {...fieldProps}>
      <div className="flex items-start space-x-3">
        <Checkbox
          id={fieldProps.id}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onChange}
          disabled={fieldProps.disabled}
          indeterminate={indeterminate}
        />
        <div className="space-y-1 leading-none">
          {label && (
            <label
              htmlFor={fieldProps.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </FormField>
  );
}

// Reusable switch field component
export interface SwitchFieldProps extends Omit<FormFieldProps, 'children'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function SwitchField({
  checked,
  defaultChecked,
  onChange,
  label,
  description,
  ...fieldProps
}: SwitchFieldProps) {
  const { Switch } = require('@/components/ui/switch');

  return (
    <FormField {...fieldProps}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {label && (
            <label
              htmlFor={fieldProps.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <Switch
          id={fieldProps.id}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onChange}
          disabled={fieldProps.disabled}
        />
      </div>
    </FormField>
  );
}

export default {
  FormField,
  InputField,
  TextareaField,
  SelectField,
  CheckboxField,
  SwitchField,
};
