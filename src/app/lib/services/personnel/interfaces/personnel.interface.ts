export interface IParamsGetListPersonnel {
  page: number;
  pageSize: number;
  search?: string;
  idPosition?: string;
  active?: boolean;
}

export interface IPersonnel {
  Id: string;
  Domain: string;
  Username: string;
  FullName: string;
  Address: string;
  Phone: string;
  AvatarUrl: string;
  Email: string;
  Gender: number;
  Dob: string;
  IdPosition: string;
  Active: boolean;
}