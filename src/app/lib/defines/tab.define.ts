import { ITab } from "../interfaces/tab.interface";

export const TabsDefault = (): ITab[] => {
  return [
    {
      key: 'active',
      title: 'Đang hoạt động'
    },
    {
      key: 'deactive',
      title: 'Ngừng hoạt động'
    }
  ];
}