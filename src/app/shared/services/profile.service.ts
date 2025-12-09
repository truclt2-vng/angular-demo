import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { APP_CONFIG } from '../constants/app.constant';
import { ProfileInfo, ProfileResponse, Avatar } from '../models/user-profile/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = `${APP_CONFIG.API_BASE_URL}/${APP_CONFIG.API_VERSION}`;
  
  private profileSubject = new BehaviorSubject<ProfileInfo | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.API_URL}/profile/myprofile/profileInfo`).pipe(
      tap(response => {
        if (response.data) {
          this.profileSubject.next(response.data);
        }
      })
    );
  }

  getCurrentProfile(): ProfileInfo | null {
    return this.profileSubject.value;
  }

  getAvatarUrl(avatar: Avatar | null): string {
    if (!avatar || !avatar.uuid) {
      return '/images/user/owner.png';
    }
    return `/images/user/owner.png`;
  }

  clearProfile(): void {
    this.profileSubject.next(null);
  }
}
