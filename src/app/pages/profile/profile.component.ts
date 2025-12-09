import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserMetaCardComponent } from '../../shared/components/user-profile/user-meta-card/user-meta-card.component';
import { UserInfoCardComponent } from '../../shared/components/user-profile/user-info-card/user-info-card.component';
// import { UserAddressCardComponent } from '../../shared/components/user-profile/user-address-card/user-address-card.component';
import { UserSettingComponent } from '../../shared/components/user-profile/user-setting/user-setting.component';
import { ProfileService } from '../../shared/services/profile.service';
import { ProfileInfo } from '../../shared/models/user-profile/user-profile.model';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    UserMetaCardComponent,
    UserInfoCardComponent,
    // UserAddressCardComponent,
    UserSettingComponent,
  ],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  
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
}
