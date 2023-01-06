import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MeetingScheduleService } from '../lib/services/meeting-schedule/meeting-schedule.service';
import * as uuid from 'uuid';
declare var faceapi: any;

@Component({
  selector: 'bm-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})

export class BmMeetingAttendanceComponent implements OnDestroy {

  loading: boolean;
  pageSize: number;
  canvas: any;
  interval: any;
  attendanceId = [];
  meetingScheduleId: string;
  faceMatcher: any;
  keyFetch: string;

  @ViewChild('video') video: ElementRef<HTMLVideoElement>;
  @ViewChild('container') container: ElementRef;

  constructor(
    private nzMessageService: NzMessageService,
    @Inject(PLATFORM_ID) private platform: Object,
    private meetingScheduleService: MeetingScheduleService
  ) {
    this.loading = false;
  }

  async handlerStartAttendance(event: string) {
    this.meetingScheduleId = event;
    try {
      const result = await this.meetingScheduleService.startAttendance(event);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
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

  handlerLoadingDataTrainComplete(event: any[]) {
    this.attendanceId = [];
    const faceDescriptors = [];
    event.forEach((i) => {
      const Arr32 = i.descriptors.map((item) => {
        return new Float32Array(Object.values(item));
      });
      faceDescriptors.push(new faceapi.LabeledFaceDescriptors(JSON.stringify(i.label), Arr32));
    });
    this.faceMatcher = new faceapi.FaceMatcher(faceDescriptors, 0.56);
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
            resizedDetections.forEach((detection) => {
              let bestMatch: { label?: string } = {};
              bestMatch = this.faceMatcher.findBestMatch(detection.descriptor);
              const personnel = JSON.parse(bestMatch.label !== "unknown" ? bestMatch.label : "{}");
              if (bestMatch !== "unknown" && !this.attendanceId.find(item => item === personnel.Id)) {
                this.attendanceId.push(personnel.Id);
                this.keyFetch = uuid();
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
    this.handlerStopAttendance();
    const allDetection = [];
    for (let id of this.attendanceId) {
      // allDetection.push(this.meetingScheduleService.updateStatusAttendance(id));
    }
    try {
      await Promise.all(allDetection);
      const result = await this.meetingScheduleService.endAttendance(this.meetingScheduleId);
      if (result.success) {
        this.attendanceId = [];
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    }
  }

  ngOnDestroy(): void {
    this.handlerStopAttendance();
  }
}
