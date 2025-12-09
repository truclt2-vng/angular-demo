import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';
import { ProfileInfo } from '../../../models/user-profile/user-profile.model';
import { ModalService } from '../../../services/modal.service';
import { LabelComponent } from '../../form/label/label.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { ModalComponent } from '../../ui/modal/modal.component';

@Component({
  selector: 'app-user-setting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LabelComponent,
    InputFieldComponent,
    ButtonComponent,
    ModalComponent,
  ],
  templateUrl: './user-setting.component.html',
  styles: ``
})
export class UserSettingComponent implements OnInit, OnChanges {
  @Input() profile: ProfileInfo | null = null;
  
  private profileService = inject(ProfileService);
  private modalService = inject(ModalService);

  isOpen = false;
  isSaving = false;

  // Form data
  timezone = '';
  language = '';
  locale = '';
  dateFormat = '';
  timeFormat = '';
  dateTimeFormat = '';
  decimalSeparator = '';
  thousandSeparator = '';

  // Dropdown options
  languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'vi', label: 'Vietnamese (Tiếng Việt)' },
    { value: 'fr', label: 'French (Français)' },
    { value: 'de', label: 'German (Deutsch)' },
    { value: 'es', label: 'Spanish (Español)' },
    { value: 'ja', label: 'Japanese (日本語)' },
    { value: 'ko', label: 'Korean (한국어)' },
    { value: 'zh', label: 'Chinese (中文)' },
  ];

  localeOptions = [
    { value: 'en_US', label: 'English (United States)' },
    { value: 'en_GB', label: 'English (United Kingdom)' },
    { value: 'vi_VN', label: 'Vietnamese (Vietnam)' },
    { value: 'fr_FR', label: 'French (France)' },
    { value: 'de_DE', label: 'German (Germany)' },
    { value: 'es_ES', label: 'Spanish (Spain)' },
    { value: 'ja_JP', label: 'Japanese (Japan)' },
    { value: 'ko_KR', label: 'Korean (Korea)' },
    { value: 'zh_CN', label: 'Chinese (China)' },
  ];

  timezoneOptions = [
    { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho Chi Minh (Vietnam)' },
    { value: 'Asia/Bangkok', label: 'Asia/Bangkok (Thailand)' },
    { value: 'Asia/Singapore', label: 'Asia/Singapore' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (Japan)' },
    { value: 'Asia/Seoul', label: 'Asia/Seoul (Korea)' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (China)' },
    { value: 'Europe/London', label: 'Europe/London (UK)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (France)' },
    { value: 'Europe/Berlin', label: 'Europe/Berlin (Germany)' },
    { value: 'America/New_York', label: 'America/New York (US Eastern)' },
    { value: 'America/Los_Angeles', label: 'America/Los Angeles (US Pacific)' },
    { value: 'America/Chicago', label: 'America/Chicago (US Central)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney' },
  ];

  ngOnInit() {
    this.loadSettingsFromProfile();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['profile'] && this.profile) {
      this.loadSettingsFromProfile();
    }
  }

  openModal() { 
    this.isOpen = true; 
  }
  
  closeModal() { 
    this.isOpen = false;
    this.loadSettingsFromProfile(); // Reset form data when closing
  }

  loadSettingsFromProfile() {
    if (this.profile) {
      this.timezone = this.profile.timezone || '';
      this.language = this.profile.language || '';
      this.locale = this.profile.locale || '';
      this.dateFormat = this.profile.dataFormat?.dateTimeFormat?.date || '';
      this.timeFormat = this.profile.dataFormat?.dateTimeFormat?.time || '';
      this.dateTimeFormat = this.profile.dataFormat?.dateTimeFormat?.dateTime || '';
      this.decimalSeparator = this.profile.dataFormat?.numberFormat?.decimalSeparator || '';
      this.thousandSeparator = this.profile.dataFormat?.numberFormat?.thousandSeparator || '';
    }
  }

  handleSave() {
    this.isSaving = true;
    
    // Convert empty strings to null
    const settings = {
      id: this.profile?.id,
      timezone: this.timezone,
      language: this.language,
      locale: this.locale,
      dataFormat: {
        numberFormat: {
          decimalSeparator: this.decimalSeparator,
          thousandSeparator: this.thousandSeparator
        },
        dateTimeFormat: {
          date: this.dateFormat,
          time: this.timeFormat,
          dateTime: this.dateTimeFormat
        }
      }
    };
    
    // TODO: Implement API call to save settings
    console.log('Saving settings...', settings);
    
    setTimeout(() => {
      this.isSaving = false;
      this.closeModal();
      alert('Settings saved successfully!');
    }, 1000);
  }

  handleReset() {
    this.loadSettingsFromProfile();
  }

  getLanguageLabel(): string {
    const lang = this.languageOptions.find(l => l.value === this.language);
    return lang ? lang.label : this.language || 'Not set';
  }

  getLocaleLabel(): string {
    const loc = this.localeOptions.find(l => l.value === this.locale);
    return loc ? loc.label : this.locale || 'Not set';
  }

  getTimezoneLabel(): string {
    const tz = this.timezoneOptions.find(t => t.value === this.timezone);
    return tz ? tz.label : this.timezone || 'Not set';
  }
}
