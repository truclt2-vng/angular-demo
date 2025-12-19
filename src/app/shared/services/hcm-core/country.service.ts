import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApiService } from '../BaseApi.service';
import { BaseObject } from '@shared/models/rest-api.model';

export interface Country extends BaseObject {
  name: {
    en: string;
    vi: string;
  };
  nativeName: string;
  codeAlpha2: string;
  codeAlpha3: string | null;
  description: string | null;
  metadata: any;
}

/**
 * Country Service
 * Extends BaseApiService for country-specific operations
 */
@Injectable({
  providedIn: 'root'
})
export class CountryService extends BaseApiService<Country> {
  protected apiPath = 'country';
  protected module = 'core';

  /**
   * Convert countries to select options
   * Uses English name and codeAlpha2 as value
   */
  getCountryOptions(): Observable<{ label: string; value: string }[]> {
    return this.getAll().pipe(
      map(countries => 
        countries
          .filter(country => country.codeAlpha2) // Only include countries with valid code
          .map(country => ({
            label: country.name.en || country.nativeName,
            value: country.codeAlpha2
          }))
          .sort((a, b) => a.label.localeCompare(b.label)) // Sort alphabetically
      )
    );
  }

}
