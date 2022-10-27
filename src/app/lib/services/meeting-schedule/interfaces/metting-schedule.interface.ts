export interface IParamsGetListMeetingSchedule {
  page: number;
  pageSize: number;
  search?: string;
  from?: string;
  to?: string;
  idDepartment?: string;
  idCreator?: string;
  status?: string;
}

export interface IMeetingSchedule {
  Id?: string;
  Code?: string;
  Title: string;
  Content?: string;
  IdRoom?: string;
  IdCreator?: string;
  EstStartTime?: string;
  EstEndTime?: string;
  EstDuration: number;
  IsSyncGGCalendar: boolean;
  IsGGMeetRoom: boolean;
  Status?: string;
}