import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { APP_CONFIG } from '../constants/app.constant';
import { ApiResponse, PivotData, PivotRequest } from '../models/rest-api.model';

export interface BulkOperationRequest {
  ids: number[];
}

/**
 * Generic Base API Service
 * Provides common CRUD and pagination operations for all entities
 * @template T - The entity type
 */
@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService<T> {
  protected http = inject(HttpClient);
  protected abstract apiPath: string;
  protected abstract module: string; // 'core', 'auth', etc.

  protected get apiUrl(): string {
    return `${APP_CONFIG.API_BASE_URL}/v1/${this.module}/${this.apiPath}`;
  }

  /**
   * Get entities with pagination using pivot paging
   * @param request - Pivot request with pagination, filter, and sort
   */
  pivotPaging(request: PivotRequest): Observable<ApiResponse<PivotData<T>>> {
    return this.http.post<ApiResponse<PivotData<T>>>(
      `${this.apiUrl}/pivotPaging`,
      request
    );
  }

  /**
   * Get total count of entities matching filter
   * @param filterModel - Filter criteria
   */
  pivotCount(filterModel: any = {}): Observable<number> {
    return this.http.post<ApiResponse<number>>(
      `${this.apiUrl}/pivotCount`,
      { filterModel }
    ).pipe(
      map(response => response.data || 0)
    );
  }

  /**
   * Get entities with pagination using effective pivot paging
   * Similar to pivotPaging but for effective-dated records
   * @param request - Pivot request with pagination, filter, and sort
   */
  pivotPagingEffective(request: PivotRequest): Observable<ApiResponse<PivotData<T>>> {
    return this.http.post<ApiResponse<PivotData<T>>>(
      `${this.apiUrl}/pivotPagingEffective`,
      request
    );
  }

  /**
   * Get entity by aggregate ID
   * @param aggId - Aggregate ID (UUID)
   */
  getByAggId(aggId: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(
      `${this.apiUrl}/getByAggId`,
      { params: { aggId } }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create new entity
   * @param entity - Entity data to create
   */
  create(entity: Partial<T>): Observable<T> {
    return this.http.post<ApiResponse<T>>(
      this.apiUrl,
      entity
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update existing entity by ID
   * @param id - Entity ID
   * @param entity - Updated entity data
   */
  update(id: number, entity: Partial<T>): Observable<T> {
    return this.http.put<ApiResponse<T>>(
      `${this.apiUrl}/${id}`,
      entity
    ).pipe(
      map(response => response.data)
    );
  }


  /**
   * Bulk approve entities
   * @param ids - Array of entity IDs to approve
   */
  bulkApprove(ids: number[]): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/bulkApprove`,
      { ids }
    ).pipe(
      map(() => undefined)
    );
  }

  /**
   * Bulk delete entities
   * @param ids - Array of entity IDs to delete
   */
  bulkDelete(ids: number[]): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/bulkDelete`,
      { ids }
    ).pipe(
      map(() => undefined)
    );
  }

  /**
   * Get all entities without pagination
   * Useful for dropdowns, lookups, or small datasets
   * @param maxRows - Maximum number of rows to fetch (default: 1000)
   * @param filterModel - Optional filter criteria
   * @param sortModel - Optional sort criteria
   */
  getAll(maxRows: number = 1000, filterModel: any = {}, sortModel: any[] = []): Observable<T[]> {
    const request: PivotRequest = {
      startRow: 0,
      endRow: maxRows,
      filterModel,
      sortModel
    };
    
    return this.pivotPaging(request).pipe(
      map(response => response.data?.data || [])
    );
  }

  /**
   * Search entities with a simple search term
   * Override this method in child services for custom search logic
   * @param searchTerm - Search term
   * @param searchFields - Fields to search in
   */
  search(searchTerm: string, searchFields: string[] = []): Observable<T[]> {
    const filterModel: any = {};
    
    if (searchTerm && searchFields.length > 0) {
      // Create OR filter for multiple fields
      filterModel._search = {
        filterType: 'text',
        type: 'contains',
        filter: searchTerm,
        fields: searchFields
      };
    }

    const request: PivotRequest = {
      startRow: 0,
      endRow: 100,
      filterModel,
      sortModel: []
    };
    
    return this.pivotPaging(request).pipe(
      map(response => response.data?.data || [])
    );
  }
}
