export interface IParamsGetListRole {
  idPosition?: string;
  search: string;
  active?: boolean;
}

export interface IRole {
  Id?: string;
  Active?: boolean;
  FunctionCode: string;
  FunctionName?: string;
  IdFunction: string;
  IdPosition?: string;
  PositionCode?: string;
  PositionName?: string;
  Description?: string;
  IsMenu?: boolean;
  Icon?: string;
  Url?: string;
  RoleChilds?: IRoleChild[];
}

export interface IRoleChild extends IRole {
  IdParent?: string;
  ParentCode?: string;
  ParentName?: string;
}

export interface IBodyUpdateRole {
  IdPosition: string;
  IdFunction: string;
  Active: boolean;
}