export interface ApiResponse<T> {
  status: number;
  data: T;
  timestamp: string;
}

export interface BaseObject {
  id: number;
  aggId: string;
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

export interface PivotData<T> {
  data: T[];
  lastRow: number;
  secondaryColumnFields: any[];
  quantity: number;
}

export interface PivotRequest {
  startRow: number;
  endRow: number;
  filterModel: any;
  sortModel: any[];
}