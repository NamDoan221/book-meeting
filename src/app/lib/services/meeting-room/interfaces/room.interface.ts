export interface IParamsGetListMeetingRoom {
  page: number;
  pageSize: number;
  search: string;
  active?: boolean;
}

export interface IParamsGetListMeetingRoomFreeTime {
  page: number;
  pageSize: number;
  from: string;
  to: string;
  search: string;
  active?: boolean;
}

export interface IMeetingRoom {
  Id?: string;
  Active?: boolean;
  Domain?: string;
  Code?: string;
  Name: string;
  AmountSlot: number;
  Description?: string;
  IdMsDuplicate?: string;
  CountMsDuplicate?: number;
}