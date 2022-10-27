export interface IParamsGetListPosition {
  page: number;
  pageSize: number;
  search?: string;
  active?: boolean;
  idDepartment?: string;
}

export interface IPosition {
  Id?: string;
  Active?: boolean;
  Domain?: string;
  Code?: string;
  Name: string;
  IdLevel?: string;
  Description?: string;
  IdDepartment?: string;
  LevelName?: string;
  DepartmentName?: string;
}