export interface IParamsGetListPersonnel {
  page: number;
  pageSize: number;
  search: string;
  idPosition?: string;
  idDepartment?: string;
  active?: boolean;
}

export interface IPersonnel {
  Id?: string;
  Domain?: string;
  FullName?: string;
  Address?: string;
  Phone?: string;
  AvatarUrl?: string;
  Email?: string;
  Gender?: number;
  Dob?: string;
  IdPosition?: string;
  PositionName?: string;
  Active?: boolean;
  IdAccount?: string;
  AttendanceTime?: string;
  SpecificHasFace?: boolean;
  IdAttendanceType?: string;
}

export interface IParamsGetListPersonnelFreeTime {
  page: number;
  pageSize: number;
  from: string;
  to: string;
  search: string;
  idPosition?: string;
  active?: boolean;
  idDepartment?: string;
}