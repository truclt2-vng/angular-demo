import { Component, inject, OnInit } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { AuthService } from '../../../services/auth.service';
import { ProfileService, ProfileInfo } from '../../../services/profile.service';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports:[CommonModule,RouterModule,DropdownComponent,DropdownItemTwoComponent]
})
export class UserDropdownComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  
  isOpen = false;
  profile: ProfileInfo | null = null;

  ngOnInit() {
    // Subscribe to profile changes
    this.profileService.profile$.subscribe(profile => {
      this.profile = profile;
    });

    // Load profile (interceptor will handle authentication)
    this.profileService.getMyProfile().subscribe({
      error: (error) => console.error('Error loading profile:', error)
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  onLogout() {
    this.authService.logout();
    this.profileService.clearProfile();
    this.closeDropdown();
    // Redirect to home or login page after logout
    this.router.navigate(['']);
  }

  getAvatarUrl(): string {
    return this.profileService.getAvatarUrl(this.profile?.avatar || null);
  }

  getDisplayName(): string {
    return this.profile?.displayName || 'User';
  }

  getUserEmail(): string {
    return this.profile?.userName || '';
  }
}