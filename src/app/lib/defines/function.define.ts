import * as dayjs from "dayjs";
import { NzNotificationService } from "ng-zorro-antd/notification";
import { MeetingScheduleService } from "../services/meeting-schedule/meeting-schedule.service";

export const convertFileToBase64 = (file: File): Promise<string | ArrayBuffer> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (event) => {
      resolve(event.target?.result ?? '');
    };
  });
};

export const viewMsDuplicate = async (notificationService: NzNotificationService, meetingScheduleService: MeetingScheduleService, idMsDuplicate: string) => {
  notificationService.remove();
  let content = '<div class="d-flex justify-content-between bm-mt-24px"><div class="bm-font-head-5s">Tên</div><div class="bm-font-head-5s">Thời gian</div></div>';
  try {
    const result = await meetingScheduleService.getMeetingScheduleByIds(idMsDuplicate.toLowerCase().split(',').filter(item => !!item).join(','));
    console.log(result);
    result.Value.forEach(item => {
      content += `<div class="d-flex justify-content-between bm-mt-12px">
        <div class="bm-font-head-5">${item.Title}</div>
        <div class="bm-font-head-5">${dayjs(item.EstStartTime).format('DD/MM/YYYY HH:mm')} - ${dayjs(item.EstEndTime).format('DD/MM/YYYY HH:mm')}</div>
        </div>`
    });
  } catch (error) {
    console.log(error);
  }
  notificationService.blank(
    '<div class="bm-font-head-4s">Lịch họp trùng</div>',
    content,
    {
      nzDuration: 0,
      nzPlacement: 'top',
      nzStyle: {
        width: '600px'
      }
    }
  );
}

export const convertImageToFile = (image: HTMLCanvasElement, index: number) => {
  return new Promise<File>(resolve => {
    image.toBlob(blob => {
      resolve(new File([blob], `image_${index}.jpg`, { type: 'image/jpeg' }));
    });
  });
}