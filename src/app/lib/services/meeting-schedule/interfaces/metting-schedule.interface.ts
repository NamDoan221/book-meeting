export interface IParamsGetListMeetingSchedule {
  page: number;
  pageSize: number;
  search: string;
  from?: string;
  to?: string;
  idDepartment?: string;
  idCreator?: string;
  idAccount?: string;
  status?: string;
}

export interface IMeetingSchedule {
  Id?: string;
  Code?: string;
  Title: string;
  Content?: string;
  PositionName?: string;
  IdRoom?: string;
  RoomName?: string;
  IdCreator?: string;
  CreatorName?: string;
  EstStartTime?: string;
  EstEndTime?: string;
  EstDuration: number;
  IsSyncGGCalendar: boolean;
  IsGGMeetRoom: boolean;
  Status?: string;
  StatusName?: string;
  DepartmentName?: string;
  CreateDate?: string;
  CreatorAvatar?: string;
  StatusCode?: string;
  MeetingScheduleDtls?: IMeetingScheduleJoin[];
}

export interface IMeetingScheduleJoin {
  IdAccount: string;
  IdAttendanceType: string;
}

export interface IBodyAddPersonnelToMeetingSchedule {
  IdAccount: string;
  IdMeetingSchedule: string;
}