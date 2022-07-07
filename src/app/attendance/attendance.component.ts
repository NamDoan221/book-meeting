import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
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

export class BmMeetingAttendanceComponent implements OnInit, OnDestroy {

  loading: boolean;
  pageSize: number;
  total: number;
  pageIndexGroup: number;
  listMeetingSchedule: any[];
  columnConfig: string[];
  isOpenDraw: boolean;
  drawerRefGlobal: NzDrawerRef;

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
    this.columnConfig = [
      'Tên cuộc họp',
      'Thời gian diễn ra',
      'Thời lượng dự kiến',
      'Phòng họp',
      'Người quản lý cuộc họp',
      'Số người được tham gia',
      'Mô tả nội dung cuộc họp',
      'Trạng thái'
    ];
  }

  ngOnInit(): void {
    this.initModelsFaceApi();

    console.log(faceapi);

    // setTimeout(() => {
    //   this.video.nativeElement.pause();
    //   (this.video.nativeElement.srcObject as MediaStream).getVideoTracks()[0].stop();
    //   this.video.nativeElement.srcObject = null;
    // }, 15000)
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
        const _video = this.video.nativeElement;
        _video.srcObject = ms;
        await _video.play();
        let canvas = faceapi.createCanvasFromMedia(_video);
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = `${_video.offsetWidth * 0.2188}px`;
        this.container.nativeElement.append(canvas);
        const displaySize = { width: _video.offsetWidth * 0.585, height: _video.clientHeight };
        faceapi.matchDimensions(canvas, displaySize);
        let image_number = 0;
        let interval = setInterval(async () => {
          if (!canvas) {
            return;
          }
          const detections = await faceapi
            .detectAllFaces(_video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          if (canvas) {
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
            const canvas_data = document.createElement("canvas");
            canvas_data
              .getContext("2d")
              .drawImage(_video, 0, 0, canvas_data.width, canvas_data.height);
            image_number++;
            if (image_number > 200) {
              clearInterval(interval);
              this.container.nativeElement.removeChild(canvas);
              interval = undefined;
              canvas = undefined;
            }
          }
        }, 100)
      })
    }
  }

  ngOnDestroy(): void {
    (this.video.nativeElement.srcObject as MediaStream).getVideoTracks()[0].stop();
  }

}
