import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface NumberFormat {
  decimalSeparator: string;
  thousandSeparator: string;
}

export interface DateTimeFormat {
  date: string;
  time: string;
  dateTime: string;
}

export interface DataFormat {
  numberFormat: NumberFormat;
  dateTimeFormat: DateTimeFormat;
}

export interface Avatar {
  type: string;
  uuid: string;
  provider: string;
}

export interface ProfileInfo {
  makerDate: string;
  updateDate: string;
  displayName: string;
  timezone: string;
  dataFormat: DataFormat;
  bio: string;
  language: string;
  tenantCode: string;
  appCode: string;
  avatar: Avatar;
  userName: string;
  locale: string;
  updateId: string;
  recordStatus: string;
  id: number;
  aggId: string;
  createDate: string;
  makerId: string;
}

export interface ProfileResponse {
  status: number;
  data: ProfileInfo;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = 'https://hcm-api-dev.a4b.vn/api/v1';
  
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
    // You can customize this based on your storage provider
    // For now, returning default avatar
    return `/images/user/owner.png`;
  }

  clearProfile(): void {
    this.profileSubject.next(null);
  }
}
