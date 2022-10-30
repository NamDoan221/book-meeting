import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { AuthService } from '../lib/services/auth/auth.service';
import { MeetingScheduleService } from '../lib/services/meeting-schedule/meting-schedule.service';
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
  isOpenDraw: boolean;
  drawerRefGlobal: NzDrawerRef;
  canvas: any;
  interval: any;
  class_sv = {
    value: 'D13CNPM5'
  };
  attendance = [];
  attendanceId = [];
  faceMatcher: any;

  @ViewChild('video') video: ElementRef<HTMLVideoElement>;
  @ViewChild('container') container: ElementRef;

  constructor(
    private auth: AuthService,
    private drawerService: NzDrawerService,
    private notification: NzNotificationService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platform: Object,
    private meetingScheduleService: MeetingScheduleService
  ) {
    this.loading = false;
    this.total = 2;
    this.pageSize = 20;
    this.pageIndexGroup = 1;
    this.isOpenDraw = false;
  }

  ngOnInit(): void {
    // this.loadTrainingData();
  }

  async handlerStartAttendance(event: string) {
    try {
      const result = await this.meetingScheduleService.startAttendance(event);
      console.log(result);

    } catch (error) {
      console.log(error);
    }
    this.initModelsFaceApi();
  }

  handlerStopAttendance() {
    setTimeout(() => {
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
    }, 1000)
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

  async logFileText(file) {
    const result = await this.http.get(file).toPromise();

    console.log(result);

    // const response = await fetch(file);
    // const text = await response.text();
    return JSON.stringify(result);
  };

  handlerLoadingDataTrainComplete(event: any[]) {
    const faceDescriptors = [];
    event.forEach((i) => {
      const Arr32 = i.descriptors.map((item) => {
        return new Float32Array(Object.values(item));
      });
      faceDescriptors.push(new faceapi.LabeledFaceDescriptors(JSON.stringify(i.label), Arr32));
    });
    this.faceMatcher = new faceapi.FaceMatcher(faceDescriptors, 0.56);
  }

  async loadTrainingData() {
    const faceDescriptors = [];
    let getFileDataTrain = await this.logFileText("../../../assets/data/data-train.txt");
    let dataTrainArr = getFileDataTrain
      ? JSON.parse(getFileDataTrain).dataTrain
      : [];
    dataTrainArr.forEach((i) => {
      let label = JSON.parse(i._label);
      if (label.class === this.class_sv.value) {
        const Arr32 = i._descriptors.map((item) => {
          return new Float32Array(Object.values(item));
        });
        faceDescriptors.push(new faceapi.LabeledFaceDescriptors(i._label, Arr32));
      }
    });
    faceDescriptors.forEach((i, index) => {
      let label = JSON.parse(i.label);
      if (label.class === this.class_sv.value) {
        return this.attendance.push({
          name: label.name,
          id: label.id,
          class: label.class,
          checked: false,
        });
      }
    });

    this.faceMatcher = new faceapi.FaceMatcher(faceDescriptors, 0.56);
    // return faceDescriptors;
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
        this.attendanceId = [];
        this.interval = setInterval(async () => {
          if (!this.canvas) {
            return;
          }
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withFaceDescriptors();
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          if (this.canvas) {
            this.canvas.getContext("2d").clearRect(0, 0, video.videoWidth, video.videoHeight);
            faceapi.draw.drawDetections(this.canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(this.canvas, resizedDetections);
            // const canvas_data = document.createElement("canvas");
            // canvas_data
            //   .getContext("2d")
            //   .drawImage(video, 0, 0, canvas_data.width, canvas_data.height);
            console.log(resizedDetections);
            resizedDetections.forEach((detection) => {
              let bestMatch: { label?: string } = {};
              bestMatch = this.faceMatcher.findBestMatch(detection.descriptor);
              // console.log(bestMatch);

              let personnel = JSON.parse(
                bestMatch.label !== "unknown" ? bestMatch.label : "{}"
              );
              if (bestMatch !== "unknown" && !this.attendanceId.find(item => item === personnel.Id)) {
                // console.log('vào', attendanceId);

                this.attendanceId.push(personnel.Id);
              }
              const box = detection.detection.box;
              const drawBox = new faceapi.draw.DrawBox(box, {
                label: personnel.FullName,
              });
              drawBox.draw(this.canvas);
            });
          }
        }, 250)
      })
    }
  }

  async handlerSave() {
    const allDetection = [];
    for (let id of this.attendanceId) {
      allDetection.push(this.meetingScheduleService.updateStatusAttendance(id));
    }
    try {
      const detectionFace = await Promise.all(allDetection);
      console.log(detectionFace);
    } catch (error) {
      console.log(error);
    }
  }

  ngOnDestroy(): void {
    this.handlerStopAttendance();
  }

}
