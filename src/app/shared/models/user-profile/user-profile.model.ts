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
