import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DataFaceService } from 'src/app/lib/services/dataface/dataface.service';
declare var faceapi: any;

@Component({
  selector: 'bm-personnel-data_face',
  templateUrl: './data-face.component.html'
})
export class BmPersonnelDataFaceComponent implements OnDestroy {
  completeDetectFace: boolean;
  loading: boolean;
  loadingCamera: boolean;
  loadedFaceApi: boolean;
  modeStartCam: boolean;
  isReStartDataFace: boolean;
  canvas: any;
  interval: any;
  dataFace: HTMLCanvasElement[];

  @Input() idPersonnel: string;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<boolean>();

  @ViewChild('video') video: ElementRef<HTMLVideoElement>;
  @ViewChild('container') container: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platform: Object,
    private nzMessageService: NzMessageService,
    private dataFaceService: DataFaceService
  ) {
    this.completeDetectFace = false;
    this.loading = false;
    this.modeStartCam = false;
    this.dataFace = [];
    this.loadedFaceApi = false;
    this.isReStartDataFace = false;
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

  handlerStart(event: Event) {
    event.stopPropagation();
    if (!this.modeStartCam) {
      if (this.loadedFaceApi) {
        this.startVideo();
      } else {
        this.initModelsFaceApi();
      }
    } else {
      this.stopDetectDataFace();
    }
    this.modeStartCam = !this.modeStartCam;
  }

  handlerReStart(event: Event) {
    event.stopPropagation();
    this.dataFace = [];
    this.completeDetectFace = false;
    this.modeStartCam = true;
    this.isReStartDataFace = false;
    this.startVideo();
  }

  stopDetectDataFace() {
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
    this.loadingCamera = false;
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
        this.interval = setInterval(async () => {
          if (!this.canvas) {
            return;
          }
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
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
            this.dataFace.push(canvas_data);
            if (this.dataFace.length > 250) {
              this.nzMessageService.success('Thu thập dữ liệu thành công.');
              this.completeDetectFace = true;
              this.modeStartCam = false;
              this.isReStartDataFace = true;
              this.stopDetectDataFace();
            }
          }
        }, 100)
      })
    }
  }

  async handlerSave(event: Event) {
    event.stopPropagation();
    try {
      this.loading = true;
      const descriptors = [];
      const allDetection = [];
      for (let face of this.dataFace) {
        allDetection.push(faceapi
          .detectSingleFace(face)
          .withFaceLandmarks()
          .withFaceDescriptor());
      }
      const detectionFace = await Promise.all(allDetection);
      detectionFace.forEach(detection => {
        if (detection) {
          descriptors.push(detection.descriptor);
        }
      })
      const body = { dataTrain: JSON.stringify(descriptors) };
      const result = await this.dataFaceService.addOrUpdateDataFace(this.idPersonnel, body);
      if (result.success) {
        this.saveSuccess.emit(true);
        this.dataFace = [];
        this.completeDetectFace = false;
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error(result.message || 'Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.stopDetectDataFace();
  }
}
