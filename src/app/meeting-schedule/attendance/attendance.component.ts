import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID, QueryList, ViewChild, ViewChildren } from '@angular/core';
import * as dayjs from 'dayjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { convertImageToFile } from 'src/app/lib/defines/function.define';
import { IBodyUpdateStatusAttendance, IMeetingSchedule } from 'src/app/lib/services/meeting-schedule/interfaces/meeting-schedule.interface';
import { MeetingScheduleService } from 'src/app/lib/services/meeting-schedule/meeting-schedule.service';
import { IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';
declare var faceapi: any;
@Component({
  selector: 'bm-meeting-schedule-attendance',
  templateUrl: './attendance.component.html'
})
export class BmMeetingScheduleAttendanceComponent implements OnInit {

  modeAttendance: boolean;
  loading: boolean;
  listPersonnelJoin: IPersonnel[];
  disableChangePersonnelJoin: boolean;
  keyFetch: string;
  loadingDetail: boolean;
  firstCallDetail: boolean;
  canvas: any;
  interval: any;
  attendanceData: IBodyUpdateStatusAttendance[];
  loadedFaceApi: boolean;
  loadingCamera: boolean;

  @Input() meetingSchedule: IMeetingSchedule;

  @Output() saveSuccess = new EventEmitter<IMeetingSchedule>();

  @ViewChild('video') video: ElementRef<HTMLVideoElement>;
  @ViewChild('container') container: ElementRef;
  @ViewChildren('personnelRef') personnelRef: QueryList<ElementRef>;

  constructor(
    @Inject(PLATFORM_ID) private platform: Object,
    private meetingScheduleService: MeetingScheduleService,
    private nzMessageService: NzMessageService
  ) {
    this.listPersonnelJoin = [];
    this.loading = false;
    this.disableChangePersonnelJoin = false;
    this.attendanceData = [];
  }

  async ngOnInit(): Promise<void> {
    if (this.meetingSchedule &&
      (dayjs(this.meetingSchedule.EstEndTime).diff(dayjs(), 'minute', false) > 0 && dayjs(this.meetingSchedule.EstStartTime).diff(dayjs(), 'minute', false) < 0) ||
      dayjs(this.meetingSchedule.EstEndTime).diff(dayjs(), 'minute', false) < 0 ||
      this.meetingSchedule.StatusCode !== 'MS_DEFAULT') {
      this.disableChangePersonnelJoin = true;
    }
    this.getDetailAttendanceMeetingSchedule();
  }

  async getDetailAttendanceMeetingSchedule() {
    this.loadingDetail = true;
    try {
      const result = await this.meetingScheduleService.getDetailAttendanceMeetingSchedule(this.meetingSchedule.Id);
      this.listPersonnelJoin = result.Value;
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingDetail = false;
    }
  }

  async handlerStartAttendance(event: Event) {
    event.stopPropagation();
    try {
      const result = await this.meetingScheduleService.startAttendance(this.meetingSchedule.Id);
      this.meetingSchedule.StartTime = dayjs().format('YYYY-MM-DDTHH:mm:ss');
      this.modeAttendance = true;
    } catch (error) {
      console.log(error);
    }
    if (this.loadedFaceApi) {
      this.startVideo();

      return;
    }
    this.initModelsFaceApi();
  }

  async initModelsFaceApi() {
    this.loadingCamera = true;
    await Promise.all([
      faceapi.loadSsdMobilenetv1Model('../../../assets/models'),
      faceapi.loadFaceRecognitionModel('../../../assets/models'),
      faceapi.loadFaceLandmarkModel('../../../assets/models'),
      faceapi.nets.tinyFaceDetector.loadFromUri('../../../assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('../../../assets/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('../../../assets/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('../../../assets/models'),
    ]).then(this.startVideo.bind(this));
  }

  startVideo() {
    this.loadedFaceApi = true;
    this.loadingCamera = false;
    if (isPlatformBrowser(this.platform) && 'mediaDevices' in navigator) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(async (ms: MediaStream) => {
        const video = this.video.nativeElement;
        video.srcObject = ms;
        await video.play();
        this.canvas = faceapi.createCanvasFromMedia(video);
        this.canvas.style.position = 'absolute';
        this.container.nativeElement.append(this.canvas);
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(this.canvas, displaySize);
        this.attendanceData = [];
        this.interval = setInterval(async () => {
          if (!this.canvas) {
            return;
          }
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          if (this.canvas) {
            this.canvas.getContext("2d").clearRect(0, 0, video.videoWidth, video.videoHeight);
            faceapi.draw.drawDetections(this.canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);
            const canvas_data = document.createElement("canvas");
            canvas_data
              .getContext("2d")
              .drawImage(video, 0, 0, canvas_data.width, canvas_data.height);
            if (resizedDetections.length && resizedDetections[0].detection.score > 0.8) {
              const box = resizedDetections[0].detection.box;
              const body = new FormData();
              const imageToFiles = await convertImageToFile(canvas_data, 0);
              body.append('image', imageToFiles);
              const result = await this.meetingScheduleService.attendanceByFaceImage(body);
              if (result.success) {
                const personnelIndex = this.listPersonnelJoin.findIndex(item => item.IdAccount === result.result);
                if (personnelIndex > -1) {
                  const personAttended = this.attendanceData.find(item => item.IdAccount === result.result);
                  !personAttended && this.attendanceData.push({
                    IdAccount: result.result,
                    IdStatus: this.listPersonnelJoin[personnelIndex].IdStatus,
                    AttendanceTime: dayjs().format('YYYY-MM-DDTHH:mm:ss')
                  });
                  this.listPersonnelJoin[personnelIndex].AttendanceTime = dayjs().format('YYYY-MM-DDTHH:mm:ss');
                  const drawBox = new faceapi.draw.DrawBox(box, {
                    label: this.listPersonnelJoin[personnelIndex].FullName,
                  });
                  drawBox.draw(this.canvas);
                  this.personnelRef.toArray()[personnelIndex].nativeElement.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
                }
              }
            }
          }
        }, 250)
      })
    }
  }

  handlerStopAttendance() {
    if (this.video) {
      this.video.nativeElement.srcObject && (this.video.nativeElement.srcObject as MediaStream).getVideoTracks()[0].stop();
      this.video.nativeElement.pause();
      this.video.nativeElement.srcObject = null;
    }
    if (this.container && this.canvas) {
      this.container.nativeElement.removeChild(this.canvas);
    }
    clearInterval(this.interval);
    this.interval = undefined;
    this.canvas = undefined;
    this.modeAttendance = false;
    this.loadingCamera = false;
  }

  async handlerSave(event: Event) {
    event.stopPropagation();
    this.handlerStopAttendance();
    try {
      await this.meetingScheduleService.updateStatusAttendance(this.meetingSchedule.Id, this.attendanceData);
      const result = await this.meetingScheduleService.endAttendance(this.meetingSchedule.Id);
      if (result.success) {
        this.saveSuccess.emit({ ...this.meetingSchedule, StatusCode: 'MS_COMPLETED', StatusName: 'Đã kết thúc', EndTime: dayjs().format('YYYY-MM-DDTHH:mm:ss') });
        this.attendanceData = [];
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    }
  }

  handlerErrorImage(e: any) {
    if (e.target && e.target.src && e.target.src !== 'https://t3.ftcdn.net/jpg/02/09/37/00/360_F_209370065_JLXhrc5inEmGl52SyvSPeVB23hB6IjrR.jpg') {
      e.target.src = 'https://t3.ftcdn.net/jpg/02/09/37/00/360_F_209370065_JLXhrc5inEmGl52SyvSPeVB23hB6IjrR.jpg';
    }
  }

  handlerPersonAttend(event: boolean, personnel: IPersonnel) {
    const personAttended = this.attendanceData.find(item => item.IdAccount === personnel.Id);
    if (event) {
      personnel.AttendanceTime = dayjs().format('YYYY-MM-DDTHH:mm:ss');
      !personAttended && this.attendanceData.push({
        IdAccount: personnel.Id,
        IdStatus: personnel.IdStatus,
        AttendanceTime: dayjs().format('YYYY-MM-DDTHH:mm:ss')
      });
      return;
    }
    personnel.AttendanceTime = undefined;
    personAttended && (this.attendanceData = this.attendanceData.filter(item => item.IdAccount !== personAttended.IdAccount));
  }
}
