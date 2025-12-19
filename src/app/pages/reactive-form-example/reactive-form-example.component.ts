import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { DynamicReactiveFormComponent } from '@app/shared/components/dynamic-form/reactive/dynamic-reactive-form.component';
import { FormConfig, DynamicFormData, SelectOption } from '@app/shared/models/dynamic-form.model';
import { CountryService } from '@app/shared/services/hcm-core/country.service';

@Component({
  selector: 'app-reactive-form-example',
  standalone: true,
  imports: [CommonModule, DynamicReactiveFormComponent],
  template: `
    <div class="p-6 space-y-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">
        Reactive Dynamic Form Example
      </h1>

      <!-- Example 1: User Registration -->
      <div>
        <h2 class="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">
          User Registration
        </h2>
        
        <div *ngIf="isLoadingCountries" class="p-4 text-center text-gray-600 dark:text-gray-400">
          Loading countries...
        </div>
        
        <app-dynamic-reactive-form
          *ngIf="!isLoadingCountries"
          [config]="registrationConfig"
          [data]="registrationData"
          [title]="'Create Account'"
          [isSubmitting]="isSubmitting"
          [showResetButton]="true"
          [showDebugInfo]="true"
          (formSubmit)="onRegister($event)"
          (formCancel)="onCancel()"
          (valueChanges)="onFormChange($event)"
        />
      </div>

      <!-- Example 2: User Profile Update -->
      <div>
        <h2 class="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">
          Update Profile
        </h2>
        <app-dynamic-reactive-form
          [config]="profileConfig"
          [data]="profileData"
          [title]="'Edit Profile'"
          [submitButtonText]="'Update Profile'"
          [showCancelButton]="false"
          (formSubmit)="onUpdateProfile($event)"
        />
      </div>

      <!-- Example 3: Contact Form -->
      <div>
        <h2 class="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">
          Contact Us
        </h2>
        <app-dynamic-reactive-form
          [config]="contactConfig"
          [title]="'Send Message'"
          [submitButtonText]="'Send Message'"
          (formSubmit)="onContact($event)"
          (formCancel)="onCancel()"
        />
      </div>

      <!-- Last Submitted Data -->
      <div *ngIf="lastSubmitted" class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h3 class="mb-2 text-lg font-semibold text-green-800 dark:text-green-300">
          Last Submitted Data:
        </h3>
        <pre class="text-sm text-green-700 dark:text-green-400">{{ lastSubmitted | json }}</pre>
      </div>
    </div>
  `
})
export class ReactiveFormExampleComponent implements OnInit {
  private countryService = inject(CountryService);
  
  isSubmitting = false;
  isLoadingCountries = true;
  lastSubmitted: any = null;
  countryOptions: SelectOption[] = [];

  ngOnInit() {
    this.loadCountries();
  }

  private loadCountries() {
    this.isLoadingCountries = true;
    this.countryService.getCountryOptions().subscribe({
      next: (options) => {
        this.countryOptions = options;
        // Update the country field options in the config
        const countryField = this.registrationConfig.fields.find(f => f.name === 'country');
        if (countryField) {
          countryField.options = options;
        }
        this.isLoadingCountries = false;
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        // Fallback to default options on error
        this.countryOptions = [
          { label: 'United States', value: 'US' },
          { label: 'Vietnam', value: 'VN' },
          { label: 'United Kingdom', value: 'UK' },
          { label: 'Japan', value: 'JP' }
        ];
        const countryField = this.registrationConfig.fields.find(f => f.name === 'country');
        if (countryField) {
          countryField.options = this.countryOptions;
        }
        this.isLoadingCountries = false;
      }
    });
  }

  // Registration Form Configuration
  registrationConfig: FormConfig = {
    columns: 2,
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        required: true,
        placeholder: 'Enter username',
        validators: [
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9_]+$/)
        ],
        colspan: 2
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'your@email.com'
      },
      {
        name: 'confirmEmail',
        label: 'Confirm Email',
        type: 'email',
        required: true,
        placeholder: 'Confirm your email'
      },
      {
        name: 'password',
        label: 'Password',
        type: 'text',
        required: true,
        placeholder: 'Min 8 characters',
        validators: [Validators.minLength(8)]
      },
      {
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'text',
        required: true,
        placeholder: 'Re-enter password'
      },
      {
        name: 'age',
        label: 'Age',
        type: 'number',
        required: true,
        validators: [Validators.min(18), Validators.max(120)]
      },
      {
        name: 'country',
        label: 'Country',
        type: 'select',
        required: true,
        options: [] // Will be populated from API in ngOnInit
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'radio',
        required: true,
        options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' }
        ]
      },
      {
        name: 'newsletter',
        label: 'Subscribe to newsletter',
        type: 'checkbox',
        placeholder: 'I want to receive updates and newsletters',
        colspan: 2
      },
      {
        name: 'bio',
        label: 'Bio',
        type: 'textarea',
        placeholder: 'Tell us about yourself',
        validators: [Validators.maxLength(500)],
        colspan: 2
      }
    ]
  };

  registrationData: DynamicFormData = {
    newsletter: true
  };

  // Profile Update Form Configuration
  profileConfig: FormConfig = {
    columns: 2,
    fields: [
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true,
        placeholder: 'John'
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        required: true,
        placeholder: 'Doe'
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'text',
        placeholder: '+1 234 567 8900',
        validators: [Validators.pattern(/^\+?[0-9\s\-()]+$/)]
      },
      {
        name: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date',
        required: true
      },
      {
        name: 'company',
        label: 'Company',
        type: 'text',
        placeholder: 'Your company name'
      },
      {
        name: 'jobTitle',
        label: 'Job Title',
        type: 'text',
        placeholder: 'Software Engineer'
      },
      {
        name: 'address',
        label: 'Address',
        type: 'textarea',
        placeholder: 'Your full address',
        colspan: 2
      }
    ]
  };

  profileData: DynamicFormData = {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 234 567 8900',
    dateOfBirth: '1990-01-15',
    company: 'Tech Corp',
    jobTitle: 'Senior Developer'
  };

  // Contact Form Configuration
  contactConfig: FormConfig = {
    columns: 1,
    fields: [
      {
        name: 'name',
        label: 'Your Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your name'
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'your@email.com'
      },
      {
        name: 'subject',
        label: 'Subject',
        type: 'select',
        required: true,
        options: [
          { label: 'General Inquiry', value: 'general' },
          { label: 'Technical Support', value: 'support' },
          { label: 'Sales', value: 'sales' },
          { label: 'Feedback', value: 'feedback' }
        ]
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'radio',
        required: true,
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' }
        ]
      },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: 'Type your message here...',
        validators: [Validators.minLength(10), Validators.maxLength(1000)]
      },
      {
        name: 'copyMe',
        label: 'Send me a copy',
        type: 'checkbox',
        placeholder: 'Send a copy of this message to my email'
      }
    ]
  };

  onRegister(data: DynamicFormData) {
    console.log('Registration submitted:', data);
    this.simulateSubmit(data);
  }

  onUpdateProfile(data: DynamicFormData) {
    console.log('Profile updated:', data);
    this.simulateSubmit(data);
  }

  onContact(data: DynamicFormData) {
    console.log('Contact form submitted:', data);
    this.simulateSubmit(data);
  }

  onCancel() {
    console.log('Form cancelled');
  }

  onFormChange(value: DynamicFormData) {
    console.log('Form value changed:', value);
  }

  private simulateSubmit(data: DynamicFormData) {
    this.isSubmitting = true;
    
    setTimeout(() => {
      this.isSubmitting = false;
      this.lastSubmitted = data;
      alert('Form submitted successfully!');
    }, 1500);
  }
}
