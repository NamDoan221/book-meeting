export interface IParamsGetListAttendanceType {
  page: number;
  pageSize: number;
  search?: string;
  active?: boolean;
}

export interface IAttendanceType {
  Id: string;
  Code: string;
  Name: string;
  Index: number;
  Description: string;
  IsRequired: boolean;
  Active: boolean;
}