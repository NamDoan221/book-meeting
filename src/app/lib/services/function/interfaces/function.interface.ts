export interface IParamsGetListFunction {
  page: number;
  pageSize: number;
  search: string;
  active?: boolean;
}

export interface IFunction {
  Id?: string;
  Active?: boolean;
  Code?: string;
  Name: string;
  Url?: string;
  Params?: string;
  IdParent?: string;
  Description?: string;
  IsMenu?: boolean;
  Icon?: string;
  FunctionChilds?: IFunction[];
}