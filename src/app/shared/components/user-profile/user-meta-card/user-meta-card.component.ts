import { Component, Input, inject } from '@angular/core';
import { InputFieldComponent } from './../../form/input/input-field.component';
import { ModalService } from '../../../services/modal.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { ProfileService } from '../../../services/profile.service';
import { ProfileInfo } from '../../../models/user-profile/user-profile.model';

@Component({
  selector: 'app-user-meta-card',
  imports: [
    CommonModule,
    ModalComponent,
    InputFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './user-meta-card.component.html',
  styles: ``
})
export class UserMetaCardComponent {
  @Input() profile: ProfileInfo | null = null;
  
  private profileService = inject(ProfileService);
  public modal = inject(ModalService);

  isOpen = false;

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



  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }

  getAvatarUrl(): string {
    return this.profileService.getAvatarUrl(this.profile?.avatar || null);
  }

  getDisplayName(): string {
    return this.profile?.displayName || 'User';
  }

  getFirstName(): string {
    const name = this.profile?.displayName || '';
    return name.split(' - ')[0] || 'User';
  }

  getLastName(): string {
    const name = this.profile?.displayName || '';
    return name.split(' - ')[1] || '';
  }

  getUserEmail(): string {
    return this.profile?.userName || '';
  }

  getBio(): string {
    return this.profile?.bio || '';
  }

  getLocation(): string {
    return this.profile?.timezone || '';
  }

  getLocaleLabel(): string {
    const loc = this.localeOptions.find(l => l.value === this.profile?.locale);
    return loc ? loc.label : this.profile?.locale || 'Not set';
  }

  // Example user data for social links (not in API)
  user = {
    social: {
      facebook: 'https://www.facebook.com/PimjoHQ',
      x: 'https://x.com/PimjoHQ',
      linkedin: 'https://www.linkedin.com/company/pimjo',
      instagram: 'https://instagram.com/PimjoHQ',
    },
    phone: '+09 363 398 46',
  };

  handleSave() {
    // Handle save logic here
    console.log('Saving changes...');
    this.modal.closeModal();
  }
}
