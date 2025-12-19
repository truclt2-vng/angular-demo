import { Injectable } from '@angular/core';
import { BaseApiService } from '@shared/services/BaseApi.service';

export interface DocumentType {
  id: number;
  aggId: string;
  code: string;
  name: {
    en: string;
    vi: string;
  };
  metadata: any;
  description: string | null;
  recordStatus: string;
  authStatus: string;
  makerId: string | null;
  makerDate: string | null;
  checkerId: string | null;
  checkerDate: string | null;
  createDate: string;
  updateId: string | null;
  updateDate: string | null;
}

/**
 * DocumentType Service
 * Extends BaseApiService for specific operations
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentTypeService extends BaseApiService<DocumentType> {
  protected apiPath = 'documentType';
  protected module = 'core';
}
