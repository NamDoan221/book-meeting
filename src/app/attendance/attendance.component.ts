import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { AuthService } from '../lib/services/auth.service';
declare var faceapi: any;

@Component({
  selector: 'bm-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})

export class BmMeetingAttendanceComponent implements OnDestroy {

  loading: boolean;
  pageSize: number;
  total: number;
  pageIndexGroup: number;
  listMeetingSchedule: any[];
  isOpenDraw: boolean;
  drawerRefGlobal: NzDrawerRef;
  canvas: any;
  interval: any;

  @ViewChild('video') video: ElementRef<HTMLVideoElement>;
  @ViewChild('container') container: ElementRef;

  constructor(
    private auth: AuthService,
    private drawerService: NzDrawerService,
    private notification: NzNotificationService,
    @Inject(PLATFORM_ID) private platform: Object
  ) {
    this.loading = false;
    this.total = 2;
    this.pageSize = 20;
    this.pageIndexGroup = 1;
    this.isOpenDraw = false;
  }

  handlerStartAttendance() {
    this.initModelsFaceApi();
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
  }

  async initModelsFaceApi() {
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

  getListMeetingRoom(params: any) {
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        name: `Meet ${i}`,
        start_time: '07/20/2022 13:30',
        estimated_duration: '30',
        meeting_room: `Room ${i}`,
        meeting_manager: `Nhan su ${i}`,
        participants: [i + 1],
        description: `Meet mo ta ${i}`,
        status: 'Chưa diễn ra'
      });
    }
    this.listMeetingSchedule = data;
  }

  handlerQueryParamsChange(params: NzTableQueryParams): void {
    if (!params) {
      return;
    }
    this.pageIndexGroup = params.pageIndex;
    this.pageSize = params.pageSize;
    let param = {
      page: this.pageIndexGroup,
      limit: this.pageSize
    }
    this.getListMeetingRoom(param);
  }

  startVideo() {
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
        this.interval = setInterval(async () => {
          if (!this.canvas) {
            return;
          }
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          if (this.canvas) {
            this.canvas.getContext("2d").clearRect(0, 0, video.videoWidth, video.videoHeight);
            faceapi.draw.drawDetections(this.canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(this.canvas, resizedDetections);
            const canvas_data = document.createElement("canvas");
            canvas_data
              .getContext("2d")
              .drawImage(video, 0, 0, canvas_data.width, canvas_data.height);
          }
        }, 100)
      })
    }
  }

  ngOnDestroy(): void {
    this.handlerStopAttendance();
  }

}
