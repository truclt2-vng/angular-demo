import { Component, OnInit, inject } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { CommonModule } from '@angular/common';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ProfileService } from '../../../services/profile.service';
import { ProfileInfo } from '../../../models/user-profile/user-profile.model';

@Component({
  selector: 'app-user-info-card',
  imports: [
    CommonModule,
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
  ],
  templateUrl: './user-info-card.component.html',
  styles: ``
})
export class UserInfoCardComponent implements OnInit {
  private profileService = inject(ProfileService);
  public modal = inject(ModalService);

  isOpen = false;
  isLoading = false;
  profile: ProfileInfo | null = null;

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.profileService.getMyProfile().subscribe({
      next: (response) => {
        this.profile = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;
      }
    });
  }

  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }

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

  getUpdateDate(): string {
    return this.profile?.updateDate || '';
  }

  getFormattedUpdateDate(): string {
    if (!this.profile?.updateDate) return 'Not set';
    
    const date = new Date(this.profile.updateDate);
    const dateTimeFormat = this.profile.dataFormat?.dateTimeFormat?.dateTime || 'dd/MM/yyyy HH:mm:ss';
    
    // Simple formatting based on the format pattern
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    let formatted = dateTimeFormat
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', year)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
    
    return formatted;
  }

  // Social links (not in API)
  user = {
    phone: '+09 363 398 46',
    social: {
      facebook: 'https://www.facebook.com/PimjoHQ',
      x: 'https://x.com/PimjoHQ',
      linkedin: 'https://www.linkedin.com/company/pimjo',
      instagram: 'https://instagram.com/PimjoHQ',
    },
  };

  handleSave() {
    // Handle save logic here
    console.log('Saving changes...');
    this.modal.closeModal();
  }
}
