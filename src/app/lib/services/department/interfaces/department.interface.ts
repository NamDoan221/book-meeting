export interface IParamsGetListDepartment {
  page: number;
  pageSize: number;
  search?: string;
  active?: boolean;
}

export interface IDepartment {
  Id?: string;
  Active?: boolean;
  Domain?: string;
  Code?: string;
  Name: string;
  IdLevel?: string;
  LevelName?: string;
  Description?: string;
}