# Angular Reactive Dynamic Forms

A production-ready, type-safe reactive forms implementation with best practices.

## Features

✅ **Reactive Forms Best Practices**
- FormBuilder for clean construction
- Type-safe form controls
- Proper validation handling
- Automatic unsubscribe
- getRawValue() for disabled fields
- Value change debouncing

✅ **Built-in Validators**
- Required fields
- Email validation
- Min/Max length
- Min/Max values
- Pattern matching
- Custom validators support

✅ **Smart Error Handling**
- Contextual error messages
- Touch/dirty state tracking
- Visual error indicators
- Field-specific validation

✅ **Performance Optimized**
- Debounced value changes
- Distinct until changed
- TrackBy for loops
- Proper cleanup on destroy

✅ **Developer Experience**
- Debug mode toggle
- Form state visibility
- TypeScript typed
- Public API methods

## Usage

### Basic Example

```typescript
import { DynamicReactiveFormComponent } from './dynamic-reactive-form.component';
import { Validators } from '@angular/forms';

config: FormConfig = {
  columns: 2,
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      validators: [Validators.email]
    },
    {
      name: 'password',
      label: 'Password',
      type: 'text',
      required: true,
      validators: [Validators.minLength(8)]
    }
  ]
};

<app-dynamic-reactive-form
  [config]="config"
  [data]="initialData"
  (formSubmit)="onSubmit($event)"
/>
```

### With Custom Validators

```typescript
import { AbstractControl, ValidationErrors } from '@angular/forms';

// Custom validator
function emailDomainValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && !value.endsWith('@company.com')) {
    return { invalidDomain: true };
  }
  return null;
}

config: FormConfig = {
  fields: [
    {
      name: 'companyEmail',
      label: 'Company Email',
      type: 'email',
      required: true,
      validators: [Validators.email, emailDomainValidator]
    }
  ]
};
```

### Accessing Form Methods

```typescript
@ViewChild(DynamicReactiveFormComponent) formComponent!: DynamicReactiveFormComponent;

ngAfterViewInit() {
  // Get current value
  const value = this.formComponent.getFormValue();
  
  // Check validity
  if (this.formComponent.isFormValid()) {
    // Do something
  }
  
  // Patch value
  this.formComponent.patchValue({ name: 'John' });
  
  // Reset form
  this.formComponent.resetForm();
  
  // Mark as dirty/pristine
  this.formComponent.markAsDirty();
  this.formComponent.markAsPristine();
}
```

## Configuration Options

### Form Config
```typescript
interface FormConfig {
  columns?: number; // 1-4 grid columns
  fields: FieldConfig[];
}
```

### Field Config
```typescript
interface FieldConfig {
  name: string;           // Unique field identifier
  label: string;          // Display label
  type: FieldType;        // Input type
  value?: any;            // Default value
  placeholder?: string;   // Placeholder text
  required?: boolean;     // Required validation
  disabled?: boolean;     // Disable field
  readonly?: boolean;     // Read-only mode
  options?: SelectOption[]; // For select/radio
  validators?: any[];     // Angular validators
  colspan?: number;       // Grid span (1-12)
  visible?: boolean;      // Show/hide field
}
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `config` | `FormConfig` | required | Form configuration |
| `data` | `DynamicFormData` | - | Initial form data |
| `title` | `string` | - | Form title |
| `submitButtonText` | `string` | 'Save' | Submit button text |
| `cancelButtonText` | `string` | 'Cancel' | Cancel button text |
| `showCancelButton` | `boolean` | `true` | Show cancel button |
| `showResetButton` | `boolean` | `false` | Show reset button |
| `isSubmitting` | `boolean` | `false` | Loading state |
| `showDebugInfo` | `boolean` | `false` | Show form state |

## Output Events

| Event | Payload | Description |
|-------|---------|-------------|
| `formSubmit` | `DynamicFormData` | Valid form submitted |
| `formCancel` | `void` | Cancel clicked |
| `valueChanges` | `DynamicFormData` | Form value changed (debounced) |

## Public Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `patchValue(data)` | `void` | Update partial values |
| `setValue(data)` | `void` | Set all values |
| `resetForm(data?)` | `void` | Reset form |
| `getFormValue()` | `DynamicFormData` | Get current value |
| `isFormValid()` | `boolean` | Check validity |
| `markAsDirty()` | `void` | Mark as dirty |
| `markAsPristine()` | `void` | Mark as pristine |

## Validation

Built-in error messages for:
- `required` - Field is required
- `email` - Invalid email format
- `minlength` - Minimum length validation
- `maxlength` - Maximum length validation
- `min` - Minimum value
- `max` - Maximum value
- `pattern` - Pattern mismatch

## Best Practices Applied

1. ✅ Type-safe FormBuilder usage
2. ✅ Proper validator composition
3. ✅ getRawValue() for disabled fields
4. ✅ Debounced value changes
5. ✅ Proper unsubscribe handling
6. ✅ Touch/dirty state validation
7. ✅ Contextual error messages
8. ✅ TrackBy for performance
9. ✅ Empty string to null conversion
10. ✅ Public API for parent control

## Examples

See `reactive-form-example.component.ts` for:
- User registration form
- Profile update form
- Contact form
- Custom validators
- Form state handling
