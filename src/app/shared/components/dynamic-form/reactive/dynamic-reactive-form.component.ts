import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FieldConfig, FormConfig, DynamicFormData } from '@app/shared/models/dynamic-form.model';
import { LabelComponent } from '../../form/label/label.component';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-dynamic-reactive-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LabelComponent,
    ButtonComponent
  ],
  templateUrl: './dynamic-reactive-form.component.html'
})
export class DynamicReactiveFormComponent implements OnInit, OnDestroy {
  @Input() config!: FormConfig;
  @Input() data?: DynamicFormData;
  @Input() title?: string;
  @Input() submitButtonText: string = 'Save';
  @Input() cancelButtonText: string = 'Cancel';
  @Input() showCancelButton: boolean = true;
  @Input() showResetButton: boolean = false;
  @Input() isSubmitting: boolean = false;
  @Input() showDebugInfo: boolean = false;
  
  @Output() formSubmit = new EventEmitter<DynamicFormData>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() valueChanges = new EventEmitter<DynamicFormData>();

  form!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  get visibleFields() {
    return this.config.fields.filter(f => f.visible !== false);
  }

  ngOnInit() {
    this.buildForm();
    this.setupValueChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm() {
    const group: { [key: string]: FormControl } = {};

    this.config.fields.forEach(field => {
      const validators = this.buildValidators(field);
      
      const control = this.fb.control(
        { 
          value: this.data?.[field.name] ?? field.value ?? this.getDefaultValue(field.type), 
          disabled: field.disabled || field.readonly 
        },
        validators
      );

      group[field.name] = control;
    });

    this.form = this.fb.group(group);
  }

  private buildValidators(field: FieldConfig): any[] {
    const validators = [];
    
    if (field.required) {
      validators.push(Validators.required);
    }
    
    if (field.type === 'email') {
      validators.push(Validators.email);
    }
    
    if (field.validators) {
      validators.push(...field.validators);
    }

    return validators;
  }

  private getDefaultValue(type: string): any {
    switch (type) {
      case 'checkbox':
        return false;
      case 'number':
        return null;
      default:
        return null;
    }
  }

  private setupValueChanges() {
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.valueChanges.emit(this.form.getRawValue());
      });
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = this.form.getRawValue();
      
      // Convert empty strings to null
      Object.keys(formData).forEach(key => {
        if (formData[key] === '') {
          formData[key] = null;
        }
      });
      
      this.formSubmit.emit(formData);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.form);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }

  onReset() {
    this.form.reset();
    const defaultValues: any = {};
    this.config.fields.forEach(field => {
      defaultValues[field.name] = this.getDefaultValue(field.type);
    });
    this.form.patchValue(defaultValues);
  }

  hasError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    const field = this.config.fields.find(f => f.name === fieldName);
    
    if (!control || !field) {
      return '';
    }

    if (control.hasError('required')) {
      return `${field.label} is required`;
    }
    
    if (control.hasError('email')) {
      return 'Invalid email format';
    }
    
    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    
    if (control.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    
    if (control.hasError('min')) {
      const min = control.errors?.['min'].min;
      return `Minimum value is ${min}`;
    }
    
    if (control.hasError('max')) {
      const max = control.errors?.['max'].max;
      return `Maximum value is ${max}`;
    }
    
    if (control.hasError('pattern')) {
      return 'Invalid format';
    }

    return 'Invalid value';
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  trackByFieldName(index: number, field: FieldConfig): string {
    return field.name;
  }

  // Public methods for parent component
  patchValue(data: DynamicFormData) {
    this.form.patchValue(data);
  }

  setValue(data: DynamicFormData) {
    this.form.setValue(data);
  }

  resetForm(data?: DynamicFormData) {
    this.form.reset(data);
  }

  getFormValue(): DynamicFormData {
    return this.form.getRawValue();
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  markAsDirty() {
    this.form.markAsDirty();
  }

  markAsPristine() {
    this.form.markAsPristine();
  }
}
