import { ValidatorFn } from '@angular/forms';

/**
 * Form field types
 */
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'date' 
  | 'time' 
  | 'datetime-local'
  | 'select' 
  | 'textarea' 
  | 'checkbox' 
  | 'radio'
  | 'file'
  | 'hidden';

/**
 * Select option for dropdowns and radio buttons
 */
export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

/**
 * Individual field configuration
 */
export interface FieldConfig {
  name: string;              // Unique field identifier (form control name)
  label: string;             // Display label for the field
  type: FieldType;           // Type of input field
  value?: any;               // Default/initial value
  placeholder?: string;      // Placeholder text
  required?: boolean;        // Required field validation
  disabled?: boolean;        // Disable the field
  readonly?: boolean;        // Make field read-only
  options?: SelectOption[];  // Options for select/radio fields
  validators?: ValidatorFn[]; // Angular validators array
  colspan?: number;          // Grid column span (1-12)
  visible?: boolean;         // Show/hide field (default: true)
  hint?: string;            // Helper text below field
  pattern?: string;         // HTML5 pattern attribute
  min?: number | string;    // Minimum value/date
  max?: number | string;    // Maximum value/date
  step?: number;            // Step for number inputs
  rows?: number;            // Rows for textarea
  accept?: string;          // Accept attribute for file inputs
}

/**
 * Form configuration
 */
export interface FormConfig {
  columns?: number;          // Number of grid columns (1-4, default: 1)
  fields: FieldConfig[];     // Array of field configurations
  gap?: string;             // Grid gap (default: '1rem')
}

/**
 * Dynamic form data type (key-value pairs)
 */
export type DynamicFormData = { [key: string]: any };

/**
 * Form validation error messages
 */
export interface ValidationMessages {
  [key: string]: { [error: string]: string };
}

/**
 * Form submit event
 */
export interface FormSubmitEvent {
  value: DynamicFormData;
  formValid: boolean;
  formDirty: boolean;
}
