export interface IParamsGetListRoom {
  page: number;
  pageSize: number;
  search?: string;
  active?: boolean;
}

export interface IRoom {
  Id?: string;
  Active?: boolean;
  Domain?: string;
  Code?: string;
  Name: string;
  AmountSlot: number;
  Description?: string;
}