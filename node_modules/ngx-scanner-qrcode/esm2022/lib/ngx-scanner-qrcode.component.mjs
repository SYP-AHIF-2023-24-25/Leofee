import { Component, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { AsyncSubject, BehaviorSubject } from 'rxjs';
import { CANVAS_STYLES_LAYER, CANVAS_STYLES_TEXT, CONFIG_DEFAULT, MEDIA_STREAM_DEFAULT } from './ngx-scanner-qrcode.default';
import { AS_COMPLETE, BLOB_TO_FILE, CANVAS_TO_BLOB, DRAW_RESULT_APPEND_CHILD, FILES_TO_SCAN, OVERRIDES, PLAY_AUDIO, REMOVE_RESULT_PANEL, RESET_CANVAS, UPDATE_WIDTH_HEIGHT_VIDEO, VIBRATE, WASM_READY } from './ngx-scanner-qrcode.helper';
import { LOAD_WASM } from './ngx-scanner-qrcode.loader';
import * as i0 from "@angular/core";
class NgxScannerQrcodeComponent {
    constructor(renderer, elementRef) {
        this.renderer = renderer;
        this.elementRef = elementRef;
        /**
         * EventEmitter
         */
        this.event = new EventEmitter();
        /**
         * Input
         */
        this.src = CONFIG_DEFAULT.src;
        this.fps = CONFIG_DEFAULT.fps;
        this.vibrate = CONFIG_DEFAULT.vibrate;
        this.decode = CONFIG_DEFAULT.decode;
        this.isBeep = CONFIG_DEFAULT.isBeep;
        this.config = CONFIG_DEFAULT;
        this.constraints = CONFIG_DEFAULT.constraints;
        this.canvasStyles = [CANVAS_STYLES_LAYER, CANVAS_STYLES_TEXT];
        /**
         * Export
        */
        this.isStart = false;
        this.isPause = false;
        this.isLoading = false;
        this.isTorch = false;
        this.data = new BehaviorSubject([]);
        this.devices = new BehaviorSubject([]);
        this.deviceIndexActive = 0;
        this.dataForResize = [];
        this.ready = new AsyncSubject();
        this.STATUS = {
            startON: () => this.isStart = true,
            pauseON: () => this.isPause = true,
            loadingON: () => this.isLoading = true,
            startOFF: () => this.isStart = false,
            pauseOFF: () => this.isPause = false,
            loadingOFF: () => this.isLoading = false,
            torchOFF: () => this.isTorch = false,
        };
    }
    ngOnInit() {
        this.overrideConfig();
        LOAD_WASM(this.ready, this.renderer).subscribe(() => {
            if (this.src) {
                this.loadImage(this.src);
            }
            this.resize();
        });
    }
    /**
     * start
     * @param playDeviceCustom
     * @returns
     */
    start(playDeviceCustom) {
        const as = new AsyncSubject();
        if (this.isStart) {
            // Reject
            AS_COMPLETE(as, false);
        }
        else {
            // fix safari
            this.safariWebRTC(as, playDeviceCustom);
        }
        return as;
    }
    /**
     * stop
     * @returns
     */
    stop() {
        this.STATUS.pauseOFF();
        this.STATUS.startOFF();
        this.STATUS.torchOFF();
        this.STATUS.loadingOFF();
        const as = new AsyncSubject();
        try {
            clearTimeout(this.rAF_ID);
            this.video.nativeElement.srcObject.getTracks().forEach((track) => {
                track.stop();
                AS_COMPLETE(as, true);
            });
            this.dataForResize = [];
            RESET_CANVAS(this.canvas.nativeElement);
            REMOVE_RESULT_PANEL(this.resultsPanel.nativeElement);
        }
        catch (error) {
            AS_COMPLETE(as, false, error);
        }
        return as;
    }
    /**
     * play
     * @returns
     */
    play() {
        const as = new AsyncSubject();
        if (this.isPause) {
            this.video.nativeElement.play();
            this.STATUS.pauseOFF();
            this.requestAnimationFrame();
            AS_COMPLETE(as, true);
        }
        else {
            AS_COMPLETE(as, false);
        }
        return as;
    }
    /**
     * pause
     * @returns
     */
    pause() {
        const as = new AsyncSubject();
        if (this.isStart) {
            clearTimeout(this.rAF_ID);
            this.video.nativeElement.pause();
            this.STATUS.pauseON();
            AS_COMPLETE(as, true);
        }
        else {
            AS_COMPLETE(as, false);
        }
        return as;
    }
    /**
     * playDevice
     * @param deviceId
     * @param as
     * @returns
     */
    playDevice(deviceId, as = new AsyncSubject()) {
        const constraints = this.getConstraints();
        const existDeviceId = (this.isStart && constraints) ? constraints.deviceId !== deviceId : true;
        switch (true) {
            case deviceId === 'null' || deviceId === 'undefined' || !deviceId:
                stop();
                this.stop();
                AS_COMPLETE(as, false);
                break;
            case deviceId && existDeviceId:
                stop();
                this.stop();
                // Loading on
                this.STATUS.loadingON();
                this.deviceIndexActive = this.devices.value.findIndex((f) => f.deviceId === deviceId);
                const constraints = { ...this.constraints, audio: false, video: { deviceId: deviceId, ...this.constraints.video } };
                // MediaStream
                navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                    this.video.nativeElement.srcObject = stream;
                    this.video.nativeElement.onloadedmetadata = () => {
                        this.video.nativeElement.play();
                        this.requestAnimationFrame();
                        AS_COMPLETE(as, true);
                        this.STATUS.startON();
                        this.STATUS.loadingOFF();
                    };
                }).catch((error) => {
                    this.eventEmit(false);
                    AS_COMPLETE(as, false, error);
                    this.STATUS.startOFF();
                    this.STATUS.loadingOFF();
                });
                break;
            default:
                AS_COMPLETE(as, false);
                this.STATUS.loadingOFF();
                break;
        }
        return as;
    }
    /**
     * loadImage
     * @param src
     * @returns
     */
    loadImage(src) {
        const as = new AsyncSubject();
        // Loading on
        this.STATUS.startOFF();
        this.STATUS.loadingON();
        // Set the src of this Image object.
        const image = new Image();
        // Setting cross origin value to anonymous
        image.setAttribute('crossOrigin', 'anonymous');
        // When our image has loaded.
        image.onload = () => {
            WASM_READY() && this.drawImage(image, (flag) => {
                AS_COMPLETE(as, flag);
                this.STATUS.startOFF();
                this.STATUS.loadingOFF();
            });
        };
        // Set src
        image.src = src;
        return as;
    }
    /**
     * torcher
     * @returns
     */
    torcher() {
        const as = this.applyConstraints({ advanced: [{ torch: this.isTorch }] });
        as.subscribe(() => false, () => this.isTorch = !this.isTorch);
        return as;
    }
    /**
     * applyConstraints
     * @param constraints
     * @param deviceIndex
     * @returns
     */
    applyConstraints(constraints, deviceIndex = 0) {
        const as = new AsyncSubject();
        if (this.isStart) {
            const stream = this.video.nativeElement.srcObject;
            if (deviceIndex !== null || deviceIndex !== undefined || !Number.isNaN(deviceIndex)) {
                const videoTrack = stream.getVideoTracks()[deviceIndex];
                const imageCapture = new window.ImageCapture(videoTrack);
                imageCapture.getPhotoCapabilities().then(async () => {
                    await videoTrack.applyConstraints(constraints);
                    UPDATE_WIDTH_HEIGHT_VIDEO(this.video.nativeElement, this.canvas.nativeElement);
                    AS_COMPLETE(as, true);
                }).catch((error) => {
                    switch (error?.name) {
                        case 'NotFoundError':
                        case 'DevicesNotFoundError':
                            AS_COMPLETE(as, false, 'Required track is missing');
                            break;
                        case 'NotReadableError':
                        case 'TrackStartError':
                            AS_COMPLETE(as, false, 'Webcam or mic are already in use');
                            break;
                        case 'OverconstrainedError':
                        case 'ConstraintNotSatisfiedError':
                            AS_COMPLETE(as, false, 'Constraints can not be satisfied by avb. devices');
                            break;
                        case 'NotAllowedError':
                        case 'PermissionDeniedError':
                            AS_COMPLETE(as, false, 'Permission denied in browser');
                            break;
                        case 'TypeError':
                            AS_COMPLETE(as, false, 'Empty constraints object');
                            break;
                        default:
                            AS_COMPLETE(as, false, error);
                            break;
                    }
                });
            }
            else {
                AS_COMPLETE(as, false, 'Please check again deviceIndex');
            }
        }
        else {
            AS_COMPLETE(as, false, 'Please start the scanner');
        }
        return as;
    }
    ;
    /**
     * getConstraints
     * @param deviceIndex
     * @returns
     */
    getConstraints(deviceIndex = 0) {
        const stream = this.video.nativeElement.srcObject;
        const videoTrack = stream?.getVideoTracks()[deviceIndex];
        return videoTrack?.getConstraints();
    }
    /**
     * download
     * @param fileName
     * @param percentage
     * @param quality
     * @returns
     */
    download(fileName = `ngx_scanner_qrcode_${Date.now()}.png`, percentage, quality) {
        const as = new AsyncSubject();
        (async () => {
            const blob = await CANVAS_TO_BLOB(this.canvas.nativeElement);
            const file = BLOB_TO_FILE(blob, fileName);
            FILES_TO_SCAN([file], this.config, percentage, quality, as).subscribe((res) => {
                res.forEach((item) => {
                    if (item?.data?.length) {
                        const link = document.createElement('a');
                        link.href = item.url;
                        link.download = item.name;
                        link.click();
                        link.remove();
                    }
                });
            });
        })();
        return as;
    }
    /**
     * resize
     */
    resize() {
        window.addEventListener("resize", () => {
            DRAW_RESULT_APPEND_CHILD(this.dataForResize, this.canvas.nativeElement, this.resultsPanel.nativeElement, this.canvasStyles);
            UPDATE_WIDTH_HEIGHT_VIDEO(this.video.nativeElement, this.canvas.nativeElement);
        });
    }
    /**
     * overrideConfig
     */
    overrideConfig() {
        if ('src' in this.config)
            this.src = this.config.src;
        if ('fps' in this.config)
            this.fps = this.config.fps;
        if ('vibrate' in this.config)
            this.vibrate = this.config.vibrate;
        if ('decode' in this.config)
            this.decode = this.config.decode;
        if ('isBeep' in this.config)
            this.isBeep = this.config.isBeep;
        if ('constraints' in this.config)
            this.constraints = OVERRIDES('constraints', this.config, MEDIA_STREAM_DEFAULT);
        if ('canvasStyles' in this.config && this.config?.canvasStyles?.length === 2)
            this.canvasStyles = this.config.canvasStyles;
    }
    /**
     * safariWebRTC
     * Fix issue on safari
     * https://webrtchacks.com/guide-to-safari-webrtc
     * @param as
     * @param playDeviceCustom
     */
    safariWebRTC(as, playDeviceCustom) {
        // Loading on
        this.STATUS.startOFF();
        this.STATUS.loadingON();
        navigator.mediaDevices.getUserMedia(this.constraints).then((stream) => {
            stream.getTracks().forEach(track => track.stop());
            this.loadAllDevices(as, playDeviceCustom);
        }).catch((error) => {
            AS_COMPLETE(as, false, error);
            this.STATUS.startOFF();
            this.STATUS.loadingOFF();
        });
    }
    /**
     * loadAllDevices
     * @param as
     * @param playDeviceCustom
     */
    loadAllDevices(as, playDeviceCustom) {
        navigator.mediaDevices.enumerateDevices().then(devices => {
            let cameraDevices = devices.filter(f => f.kind == 'videoinput');
            this.devices.next(cameraDevices);
            if (cameraDevices?.length > 0) {
                AS_COMPLETE(as, cameraDevices);
                playDeviceCustom ? playDeviceCustom(cameraDevices) : this.playDevice(cameraDevices[0].deviceId);
            }
            else {
                AS_COMPLETE(as, false, 'No camera detected.');
                this.STATUS.startOFF();
                this.STATUS.loadingOFF();
            }
        }).catch((error) => {
            AS_COMPLETE(as, false, error);
            this.STATUS.startOFF();
            this.STATUS.loadingOFF();
        });
    }
    /**
     * drawImage
     * @param element
     * @param callback
     */
    async drawImage(element, callback = () => { }) {
        // Get the canvas element by using the getElementById method.
        const canvas = this.canvas.nativeElement;
        // Get a 2D drawing context for the canvas.
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        // HTMLImageElement size
        if (element instanceof HTMLImageElement) {
            canvas.width = element.naturalWidth;
            canvas.height = element.naturalHeight;
            element.style.visibility = '';
            this.video.nativeElement.style.visibility = 'hidden';
            // Image center and auto scale
            this.renderer.setStyle(this.elementRef.nativeElement, 'width', canvas.width + 'px');
            this.renderer.setStyle(this.elementRef.nativeElement, 'maxWidth', 100 + '%');
            this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'inline-block');
        }
        // HTMLVideoElement size
        if (element instanceof HTMLVideoElement) {
            canvas.width = element.videoWidth;
            canvas.height = element.videoHeight;
            element.style.visibility = '';
            this.canvas.nativeElement.style.visibility = 'hidden';
        }
        // Set width, height for video element
        UPDATE_WIDTH_HEIGHT_VIDEO(this.video.nativeElement, canvas);
        // clear frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw image
        ctx.drawImage(element, 0, 0, canvas.width, canvas.height);
        // Data image
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // Draw frame
        const code = await zbarWasm.scanImageData(imageData);
        if (code?.length) {
            // Decode
            code.forEach((s) => s.value = s.decode(this.decode?.toLocaleLowerCase()));
            // Overlay
            DRAW_RESULT_APPEND_CHILD(code, Object.freeze(this.canvas.nativeElement), this.resultsPanel.nativeElement, this.canvasStyles);
            // To blob and emit data
            const EMIT_DATA = () => {
                this.eventEmit(code);
                this.dataForResize = code;
            };
            // HTMLImageElement
            if (element instanceof HTMLImageElement) {
                callback(true);
                EMIT_DATA();
                VIBRATE(this.vibrate);
                PLAY_AUDIO(this.isBeep);
            }
            // HTMLVideoElement
            if (element instanceof HTMLVideoElement) {
                EMIT_DATA();
                VIBRATE(this.vibrate);
                PLAY_AUDIO(this.isBeep);
            }
        }
        else {
            callback(false);
            REMOVE_RESULT_PANEL(this.resultsPanel.nativeElement);
            this.dataForResize = [];
        }
    }
    /**
     * eventEmit
     * @param response
     */
    eventEmit(response = false) {
        (response !== false) && this.data.next(response || []);
        (response !== false) && this.event.emit(response || []);
    }
    /**
     * Single-thread
     * Loop Recording on Camera
     * Must be destroy request
     * Not using: requestAnimationFrame
     * @param delay
     */
    requestAnimationFrame(delay = 100) {
        try {
            clearTimeout(this.rAF_ID);
            this.rAF_ID = setTimeout(() => {
                if (this.video.nativeElement.readyState === this.video.nativeElement.HAVE_ENOUGH_DATA) {
                    delay = 0; // Appy first request
                    WASM_READY() && this.drawImage(this.video.nativeElement);
                    this.isStart && !this.isPause && this.requestAnimationFrame(delay);
                }
            }, /*avoid cache mediaStream*/ delay || this.fps);
        }
        catch (error) {
            clearTimeout(this.rAF_ID);
        }
    }
    /**
     * isReady
     */
    get isReady() {
        return this.ready;
    }
    ngOnDestroy() {
        this.pause();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.3", ngImport: i0, type: NgxScannerQrcodeComponent, deps: [{ token: i0.Renderer2 }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.0.3", type: NgxScannerQrcodeComponent, selector: "ngx-scanner-qrcode", inputs: { src: "src", fps: "fps", vibrate: "vibrate", decode: "decode", isBeep: "isBeep", config: "config", constraints: "constraints", canvasStyles: "canvasStyles" }, outputs: { event: "event" }, host: { classAttribute: "ngx-scanner-qrcode" }, viewQueries: [{ propertyName: "video", first: true, predicate: ["video"], descendants: true }, { propertyName: "canvas", first: true, predicate: ["canvas"], descendants: true }, { propertyName: "resultsPanel", first: true, predicate: ["resultsPanel"], descendants: true }], exportAs: ["scanner"], ngImport: i0, template: `<div #resultsPanel class="origin-overlay"></div><canvas #canvas class="origin-canvas"></canvas><video #video playsinline class="origin-video"></video>`, isInline: true, styles: [".ngx-scanner-qrcode{display:block;position:relative}.origin-overlay{width:100%;position:absolute}.origin-overlay span{z-index:2;text-align:left;position:absolute}.origin-overlay .qrcode-polygon{z-index:1;position:absolute}.origin-canvas{width:100%;position:absolute}.origin-video{width:100%;background-color:#262626}.qrcode-tooltip{z-index:3;position:absolute}.qrcode-tooltip:hover .qrcode-tooltip-temp{display:block;position:absolute;cursor:copy}.qrcode-tooltip:hover .qrcode-tooltip-temp:active{color:#afafaf}.qrcode-tooltip .qrcode-tooltip-temp{bottom:0;left:50%;color:#fff;text-align:left;display:none;width:max-content;word-wrap:break-word;transform:translate(-50%);transform-style:preserve-3d;background-color:#000000d0;box-shadow:1px 1px 20px #000000e0}.qrcode-tooltip .qrcode-tooltip-temp svg{cursor:pointer}.qrcode-tooltip .qrcode-tooltip-temp svg rect{fill:none;stroke:#fff;stroke-linejoin:round;stroke-width:32px}.qrcode-tooltip .qrcode-tooltip-temp svg path{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px}.qrcode-tooltip .qrcode-tooltip-temp svg:active rect{stroke:#afafaf}.qrcode-tooltip .qrcode-tooltip-temp svg:active path{stroke:#afafaf}\n"], encapsulation: i0.ViewEncapsulation.None }); }
}
export { NgxScannerQrcodeComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.3", ngImport: i0, type: NgxScannerQrcodeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-scanner-qrcode', template: `<div #resultsPanel class="origin-overlay"></div><canvas #canvas class="origin-canvas"></canvas><video #video playsinline class="origin-video"></video>`, host: { 'class': 'ngx-scanner-qrcode' }, exportAs: 'scanner', inputs: ['src', 'fps', 'vibrate', 'decode', 'isBeep', 'config', 'constraints', 'canvasStyles'], outputs: ['event'], queries: {
                        video: new ViewChild('video'),
                        canvas: new ViewChild('canvas'),
                        resultsPanel: new ViewChild('resultsPanel')
                    }, encapsulation: ViewEncapsulation.None, styles: [".ngx-scanner-qrcode{display:block;position:relative}.origin-overlay{width:100%;position:absolute}.origin-overlay span{z-index:2;text-align:left;position:absolute}.origin-overlay .qrcode-polygon{z-index:1;position:absolute}.origin-canvas{width:100%;position:absolute}.origin-video{width:100%;background-color:#262626}.qrcode-tooltip{z-index:3;position:absolute}.qrcode-tooltip:hover .qrcode-tooltip-temp{display:block;position:absolute;cursor:copy}.qrcode-tooltip:hover .qrcode-tooltip-temp:active{color:#afafaf}.qrcode-tooltip .qrcode-tooltip-temp{bottom:0;left:50%;color:#fff;text-align:left;display:none;width:max-content;word-wrap:break-word;transform:translate(-50%);transform-style:preserve-3d;background-color:#000000d0;box-shadow:1px 1px 20px #000000e0}.qrcode-tooltip .qrcode-tooltip-temp svg{cursor:pointer}.qrcode-tooltip .qrcode-tooltip-temp svg rect{fill:none;stroke:#fff;stroke-linejoin:round;stroke-width:32px}.qrcode-tooltip .qrcode-tooltip-temp svg path{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px}.qrcode-tooltip .qrcode-tooltip-temp svg:active rect{stroke:#afafaf}.qrcode-tooltip .qrcode-tooltip-temp svg:active path{stroke:#afafaf}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.Renderer2 }, { type: i0.ElementRef }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXNjYW5uZXItcXJjb2RlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1zY2FubmVyLXFyY29kZS9zcmMvbGliL25neC1zY2FubmVyLXFyY29kZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBYyxZQUFZLEVBQWdDLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNoSSxPQUFPLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNyRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0gsT0FBTyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLHdCQUF3QixFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixFQUFFLFlBQVksRUFBRSx5QkFBeUIsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM08sT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDZCQUE2QixDQUFDOztBQUl4RCxNQWVhLHlCQUF5QjtJQXVEcEMsWUFBb0IsUUFBbUIsRUFBVSxVQUFzQjtRQUFuRCxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQVUsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQTdDdkU7O1dBRUc7UUFDSSxVQUFLLEdBQUcsSUFBSSxZQUFZLEVBQXlCLENBQUM7UUFFekQ7O1dBRUc7UUFDSSxRQUFHLEdBQXVCLGNBQWMsQ0FBQyxHQUFHLENBQUM7UUFDN0MsUUFBRyxHQUF1QixjQUFjLENBQUMsR0FBRyxDQUFDO1FBQzdDLFlBQU8sR0FBdUIsY0FBYyxDQUFDLE9BQU8sQ0FBQztRQUNyRCxXQUFNLEdBQXVCLGNBQWMsQ0FBQyxNQUFNLENBQUM7UUFDbkQsV0FBTSxHQUF3QixjQUFjLENBQUMsTUFBTSxDQUFDO1FBQ3BELFdBQU0sR0FBd0IsY0FBYyxDQUFDO1FBQzdDLGdCQUFXLEdBQWlDLGNBQWMsQ0FBQyxXQUFXLENBQUM7UUFDdkUsaUJBQVksR0FBdUMsQ0FBQyxtQkFBbUIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRXBHOztVQUVFO1FBQ0ssWUFBTyxHQUFZLEtBQUssQ0FBQztRQUN6QixZQUFPLEdBQVksS0FBSyxDQUFDO1FBQ3pCLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFDM0IsWUFBTyxHQUFZLEtBQUssQ0FBQztRQUN6QixTQUFJLEdBQUcsSUFBSSxlQUFlLENBQXdCLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELFlBQU8sR0FBRyxJQUFJLGVBQWUsQ0FBd0IsRUFBRSxDQUFDLENBQUM7UUFDekQsc0JBQWlCLEdBQVcsQ0FBQyxDQUFDO1FBTTdCLGtCQUFhLEdBQTBCLEVBQUUsQ0FBQztRQUMxQyxVQUFLLEdBQUcsSUFBSSxZQUFZLEVBQVcsQ0FBQztRQUVwQyxXQUFNLEdBQUc7WUFDZixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJO1lBQ2xDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUk7WUFDbEMsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSTtZQUN0QyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLO1lBQ3BDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUs7WUFDcEMsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSztZQUN4QyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLO1NBQ3JDLENBQUE7SUFFMEUsQ0FBQztJQUU1RSxRQUFRO1FBQ04sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3RCLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2xELElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDWixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUMxQjtZQUNELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksS0FBSyxDQUFDLGdCQUEyQjtRQUN0QyxNQUFNLEVBQUUsR0FBRyxJQUFJLFlBQVksRUFBTyxDQUFDO1FBQ25DLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixTQUFTO1lBQ1QsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN4QjthQUFNO1lBQ0wsYUFBYTtZQUNiLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7U0FDekM7UUFDRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFFRDs7O09BR0c7SUFDSSxJQUFJO1FBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6QixNQUFNLEVBQUUsR0FBRyxJQUFJLFlBQVksRUFBTyxDQUFDO1FBQ25DLElBQUk7WUFDRixZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQXlCLENBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBdUIsRUFBRSxFQUFFO2dCQUNsRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2IsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3hDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDdEQ7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLFdBQVcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQVksQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksSUFBSTtRQUNULE1BQU0sRUFBRSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDbkMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDN0IsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN2QjthQUFNO1lBQ0wsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN4QjtRQUNELE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUs7UUFDVixNQUFNLEVBQUUsR0FBRyxJQUFJLFlBQVksRUFBTyxDQUFDO1FBQ25DLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdEIsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN2QjthQUFNO1lBQ0wsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN4QjtRQUNELE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksVUFBVSxDQUFDLFFBQWdCLEVBQUUsS0FBd0IsSUFBSSxZQUFZLEVBQU87UUFDakYsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzFDLE1BQU0sYUFBYSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMvRixRQUFRLElBQUksRUFBRTtZQUNaLEtBQUssUUFBUSxLQUFLLE1BQU0sSUFBSSxRQUFRLEtBQUssV0FBVyxJQUFJLENBQUMsUUFBUTtnQkFDL0QsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNaLFdBQVcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZCLE1BQU07WUFDUixLQUFLLFFBQVEsSUFBSSxhQUFhO2dCQUM1QixJQUFJLEVBQUUsQ0FBQztnQkFDUCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1osYUFBYTtnQkFDYixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBc0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQztnQkFDM0csTUFBTSxXQUFXLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO2dCQUNwSCxjQUFjO2dCQUNkLFNBQVMsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQW1CLEVBQUUsRUFBRTtvQkFDNUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztvQkFDNUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLEdBQUcsR0FBRyxFQUFFO3dCQUMvQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDaEMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7d0JBQzdCLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQzNCLENBQUMsQ0FBQTtnQkFDSCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFVLEVBQUUsRUFBRTtvQkFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDdEIsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQzNCLENBQUMsQ0FBQyxDQUFDO2dCQUNILE1BQU07WUFDUjtnQkFDRSxXQUFXLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN6QixNQUFNO1NBQ1Q7UUFDRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksU0FBUyxDQUFDLEdBQVc7UUFDMUIsTUFBTSxFQUFFLEdBQUcsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUNuQyxhQUFhO1FBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hCLG9DQUFvQztRQUNwQyxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQzFCLDBDQUEwQztRQUMxQyxLQUFLLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMvQyw2QkFBNkI7UUFDN0IsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7WUFDbEIsVUFBVSxFQUFFLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFhLEVBQUUsRUFBRTtnQkFDdEQsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQztRQUNGLFVBQVU7UUFDVixLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNoQixPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFFRDs7O09BR0c7SUFDSSxPQUFPO1FBQ1osTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUQsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxnQkFBZ0IsQ0FBQyxXQUFrRSxFQUFFLFdBQVcsR0FBRyxDQUFDO1FBQ3pHLE1BQU0sRUFBRSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDbkMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQXdCLENBQUM7WUFDakUsSUFBSSxXQUFXLEtBQUssSUFBSSxJQUFJLFdBQVcsS0FBSyxTQUFTLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUNuRixNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUMsV0FBVyxDQUFxQixDQUFDO2dCQUM1RSxNQUFNLFlBQVksR0FBRyxJQUFLLE1BQWMsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2xFLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDbEQsTUFBTSxVQUFVLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQy9DLHlCQUF5QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQy9FLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFO29CQUN0QixRQUFRLEtBQUssRUFBRSxJQUFJLEVBQUU7d0JBQ25CLEtBQUssZUFBZSxDQUFDO3dCQUNyQixLQUFLLHNCQUFzQjs0QkFDekIsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsMkJBQXFDLENBQUMsQ0FBQzs0QkFDOUQsTUFBTTt3QkFDUixLQUFLLGtCQUFrQixDQUFDO3dCQUN4QixLQUFLLGlCQUFpQjs0QkFDcEIsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsa0NBQTRDLENBQUMsQ0FBQzs0QkFDckUsTUFBTTt3QkFDUixLQUFLLHNCQUFzQixDQUFDO3dCQUM1QixLQUFLLDZCQUE2Qjs0QkFDaEMsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsa0RBQTRELENBQUMsQ0FBQzs0QkFDckYsTUFBTTt3QkFDUixLQUFLLGlCQUFpQixDQUFDO3dCQUN2QixLQUFLLHVCQUF1Qjs0QkFDMUIsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsOEJBQXdDLENBQUMsQ0FBQzs0QkFDakUsTUFBTTt3QkFDUixLQUFLLFdBQVc7NEJBQ2QsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsMEJBQW9DLENBQUMsQ0FBQzs0QkFDN0QsTUFBTTt3QkFDUjs0QkFDRSxXQUFXLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFZLENBQUMsQ0FBQzs0QkFDckMsTUFBTTtxQkFDVDtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNKO2lCQUFNO2dCQUNMLFdBQVcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLGdDQUEwQyxDQUFDLENBQUM7YUFDcEU7U0FDRjthQUFNO1lBQ0wsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsMEJBQW9DLENBQUMsQ0FBQztTQUM5RDtRQUNELE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUFBLENBQUM7SUFFRjs7OztPQUlHO0lBQ0ksY0FBYyxDQUFDLFdBQVcsR0FBRyxDQUFDO1FBQ25DLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQXdCLENBQUM7UUFDakUsTUFBTSxVQUFVLEdBQUcsTUFBTSxFQUFFLGNBQWMsRUFBRSxDQUFDLFdBQVcsQ0FBcUIsQ0FBQztRQUM3RSxPQUFPLFVBQVUsRUFBRSxjQUFjLEVBQTJCLENBQUM7SUFDL0QsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLFFBQVEsQ0FBQyxXQUFtQixzQkFBc0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsVUFBbUIsRUFBRSxPQUFnQjtRQUM5RyxNQUFNLEVBQUUsR0FBRyxJQUFJLFlBQVksRUFBTyxDQUFDO1FBQ25DLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDVixNQUFNLElBQUksR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzdELE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDMUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQWlDLEVBQUUsRUFBRTtnQkFDMUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQWdDLEVBQUUsRUFBRTtvQkFDL0MsSUFBSSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTt3QkFDdEIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO3dCQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQzFCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDYixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7cUJBQ2Y7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDTCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFFRDs7T0FFRztJQUNLLE1BQU07UUFDWixNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUNyQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsYUFBb0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbkkseUJBQXlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNqRixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLGNBQWM7UUFDcEIsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU07WUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ3JELElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNO1lBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUNyRCxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsTUFBTTtZQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDakUsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU07WUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzlELElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNO1lBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM5RCxJQUFJLGFBQWEsSUFBSSxJQUFJLENBQUMsTUFBTTtZQUFFLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFDakgsSUFBSSxjQUFjLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxNQUFNLEtBQUssQ0FBQztZQUFFLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7SUFDN0gsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNLLFlBQVksQ0FBQyxFQUFxQixFQUFFLGdCQUEyQjtRQUNyRSxhQUFhO1FBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hCLFNBQVMsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFtQixFQUFFLEVBQUU7WUFDakYsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUU7WUFDdEIsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxjQUFjLENBQUMsRUFBcUIsRUFBRSxnQkFBMkI7UUFDdkUsU0FBUyxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN2RCxJQUFJLGFBQWEsR0FBMEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksWUFBWSxDQUFDLENBQUM7WUFDdkYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDakMsSUFBSSxhQUFhLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDN0IsV0FBVyxDQUFDLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDL0IsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNqRztpQkFBTTtnQkFDTCxXQUFXLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxxQkFBNEIsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO2FBQzFCO1FBQ0gsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUU7WUFDdEIsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQTRDLEVBQUUsV0FBcUIsR0FBRyxFQUFFLEdBQUcsQ0FBQztRQUNsRyw2REFBNkQ7UUFDN0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7UUFDekMsMkNBQTJDO1FBQzNDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLENBQTZCLENBQUM7UUFDOUYsd0JBQXdCO1FBQ3hCLElBQUksT0FBTyxZQUFZLGdCQUFnQixFQUFFO1lBQ3ZDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUNwQyxNQUFNLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7WUFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO1lBQ3JELDhCQUE4QjtZQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQztZQUNwRixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzdFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQztTQUNsRjtRQUNELHdCQUF3QjtRQUN4QixJQUFJLE9BQU8sWUFBWSxnQkFBZ0IsRUFBRTtZQUN2QyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFDbEMsTUFBTSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1lBQ3BDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztTQUN2RDtRQUNELHNDQUFzQztRQUN0Qyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM1RCxjQUFjO1FBQ2QsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ2hELGFBQWE7UUFDYixHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFELGFBQWE7UUFDYixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEUsYUFBYTtRQUNiLE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyRCxJQUFJLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDaEIsU0FBUztZQUNULElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9FLFVBQVU7WUFDVix3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM3SCx3QkFBd0I7WUFDeEIsTUFBTSxTQUFTLEdBQUcsR0FBRyxFQUFFO2dCQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUM1QixDQUFDLENBQUM7WUFDRixtQkFBbUI7WUFDbkIsSUFBSSxPQUFPLFlBQVksZ0JBQWdCLEVBQUU7Z0JBQ3ZDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDZixTQUFTLEVBQUUsQ0FBQztnQkFDWixPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN0QixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3pCO1lBQ0QsbUJBQW1CO1lBQ25CLElBQUksT0FBTyxZQUFZLGdCQUFnQixFQUFFO2dCQUN2QyxTQUFTLEVBQUUsQ0FBQztnQkFDWixPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN0QixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3pCO1NBQ0Y7YUFBTTtZQUNMLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoQixtQkFBbUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNLLFNBQVMsQ0FBQyxXQUFnQixLQUFLO1FBQ3JDLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN2RCxDQUFDLFFBQVEsS0FBSyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNLLHFCQUFxQixDQUFDLFFBQWdCLEdBQUc7UUFDL0MsSUFBSTtZQUNGLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUM1QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDckYsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLHFCQUFxQjtvQkFDaEMsVUFBVSxFQUFFLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUN6RCxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3BFO1lBQ0gsQ0FBQyxFQUFFLDJCQUEyQixDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbkQ7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDM0I7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDZixDQUFDOzhHQTdlVSx5QkFBeUI7a0dBQXpCLHlCQUF5Qix3bEJBYjFCLHdKQUF3Sjs7U0FhdkoseUJBQXlCOzJGQUF6Qix5QkFBeUI7a0JBZnJDLFNBQVM7K0JBQ0Usb0JBQW9CLFlBQ3BCLHdKQUF3SixRQUU1SixFQUFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxZQUM3QixTQUFTLFVBQ1gsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsY0FBYyxDQUFDLFdBQ3JGLENBQUMsT0FBTyxDQUFDLFdBQ1Q7d0JBQ1AsS0FBSyxFQUFFLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQzt3QkFDN0IsTUFBTSxFQUFFLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQzt3QkFDL0IsWUFBWSxFQUFFLElBQUksU0FBUyxDQUFDLGNBQWMsQ0FBQztxQkFDNUMsaUJBQ2MsaUJBQWlCLENBQUMsSUFBSSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBPbkRlc3Ryb3ksIE9uSW5pdCwgUmVuZGVyZXIyLCBWaWV3Q2hpbGQsIFZpZXdFbmNhcHN1bGF0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEFzeW5jU3ViamVjdCwgQmVoYXZpb3JTdWJqZWN0IH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IENBTlZBU19TVFlMRVNfTEFZRVIsIENBTlZBU19TVFlMRVNfVEVYVCwgQ09ORklHX0RFRkFVTFQsIE1FRElBX1NUUkVBTV9ERUZBVUxUIH0gZnJvbSAnLi9uZ3gtc2Nhbm5lci1xcmNvZGUuZGVmYXVsdCc7XHJcbmltcG9ydCB7IEFTX0NPTVBMRVRFLCBCTE9CX1RPX0ZJTEUsIENBTlZBU19UT19CTE9CLCBEUkFXX1JFU1VMVF9BUFBFTkRfQ0hJTEQsIEZJTEVTX1RPX1NDQU4sIE9WRVJSSURFUywgUExBWV9BVURJTywgUkVNT1ZFX1JFU1VMVF9QQU5FTCwgUkVTRVRfQ0FOVkFTLCBVUERBVEVfV0lEVEhfSEVJR0hUX1ZJREVPLCBWSUJSQVRFLCBXQVNNX1JFQURZIH0gZnJvbSAnLi9uZ3gtc2Nhbm5lci1xcmNvZGUuaGVscGVyJztcclxuaW1wb3J0IHsgTE9BRF9XQVNNIH0gZnJvbSAnLi9uZ3gtc2Nhbm5lci1xcmNvZGUubG9hZGVyJztcclxuaW1wb3J0IHsgU2Nhbm5lclFSQ29kZUNvbmZpZywgU2Nhbm5lclFSQ29kZURldmljZSwgU2Nhbm5lclFSQ29kZVJlc3VsdCwgU2Nhbm5lclFSQ29kZVNlbGVjdGVkRmlsZXMgfSBmcm9tICcuL25neC1zY2FubmVyLXFyY29kZS5vcHRpb25zJztcclxuZGVjbGFyZSB2YXIgemJhcldhc206IGFueTtcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbmd4LXNjYW5uZXItcXJjb2RlJyxcclxuICB0ZW1wbGF0ZTogYDxkaXYgI3Jlc3VsdHNQYW5lbCBjbGFzcz1cIm9yaWdpbi1vdmVybGF5XCI+PC9kaXY+PGNhbnZhcyAjY2FudmFzIGNsYXNzPVwib3JpZ2luLWNhbnZhc1wiPjwvY2FudmFzPjx2aWRlbyAjdmlkZW8gcGxheXNpbmxpbmUgY2xhc3M9XCJvcmlnaW4tdmlkZW9cIj48L3ZpZGVvPmAsXHJcbiAgc3R5bGVVcmxzOiBbJy4vbmd4LXNjYW5uZXItcXJjb2RlLmNvbXBvbmVudC5zY3NzJ10sXHJcbiAgaG9zdDogeyAnY2xhc3MnOiAnbmd4LXNjYW5uZXItcXJjb2RlJyB9LFxyXG4gIGV4cG9ydEFzOiAnc2Nhbm5lcicsXHJcbiAgaW5wdXRzOiBbJ3NyYycsICdmcHMnLCAndmlicmF0ZScsICdkZWNvZGUnLCAnaXNCZWVwJywgJ2NvbmZpZycsICdjb25zdHJhaW50cycsICdjYW52YXNTdHlsZXMnXSxcclxuICBvdXRwdXRzOiBbJ2V2ZW50J10sXHJcbiAgcXVlcmllczoge1xyXG4gICAgdmlkZW86IG5ldyBWaWV3Q2hpbGQoJ3ZpZGVvJyksXHJcbiAgICBjYW52YXM6IG5ldyBWaWV3Q2hpbGQoJ2NhbnZhcycpLFxyXG4gICAgcmVzdWx0c1BhbmVsOiBuZXcgVmlld0NoaWxkKCdyZXN1bHRzUGFuZWwnKVxyXG4gIH0sXHJcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTmd4U2Nhbm5lclFyY29kZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgLyoqXHJcbiAgICogRWxlbWVudFxyXG4gICAqIHBsYXlzaW5saW5lIHJlcXVpcmVkIHRvIHRlbGwgaU9TIHNhZmFyaSB3ZSBkb24ndCB3YW50IGZ1bGxzY3JlZW5cclxuICAgKi9cclxuICBwdWJsaWMgdmlkZW8hOiBFbGVtZW50UmVmPEhUTUxWaWRlb0VsZW1lbnQ+O1xyXG4gIHB1YmxpYyBjYW52YXMhOiBFbGVtZW50UmVmPEhUTUxDYW52YXNFbGVtZW50PjtcclxuICBwdWJsaWMgcmVzdWx0c1BhbmVsITogRWxlbWVudFJlZjxIVE1MRGl2RWxlbWVudD47XHJcblxyXG4gIC8qKlxyXG4gICAqIEV2ZW50RW1pdHRlclxyXG4gICAqL1xyXG4gIHB1YmxpYyBldmVudCA9IG5ldyBFdmVudEVtaXR0ZXI8U2Nhbm5lclFSQ29kZVJlc3VsdFtdPigpO1xyXG5cclxuICAvKipcclxuICAgKiBJbnB1dFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzcmM6IHN0cmluZyB8IHVuZGVmaW5lZCA9IENPTkZJR19ERUZBVUxULnNyYztcclxuICBwdWJsaWMgZnBzOiBudW1iZXIgfCB1bmRlZmluZWQgPSBDT05GSUdfREVGQVVMVC5mcHM7XHJcbiAgcHVibGljIHZpYnJhdGU6IG51bWJlciB8IHVuZGVmaW5lZCA9IENPTkZJR19ERUZBVUxULnZpYnJhdGU7XHJcbiAgcHVibGljIGRlY29kZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gQ09ORklHX0RFRkFVTFQuZGVjb2RlO1xyXG4gIHB1YmxpYyBpc0JlZXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSBDT05GSUdfREVGQVVMVC5pc0JlZXA7XHJcbiAgcHVibGljIGNvbmZpZzogU2Nhbm5lclFSQ29kZUNvbmZpZyA9IENPTkZJR19ERUZBVUxUO1xyXG4gIHB1YmxpYyBjb25zdHJhaW50czogTWVkaWFTdHJlYW1Db25zdHJhaW50cyB8IGFueSA9IENPTkZJR19ERUZBVUxULmNvbnN0cmFpbnRzO1xyXG4gIHB1YmxpYyBjYW52YXNTdHlsZXM6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRFtdIHwgYW55W10gPSBbQ0FOVkFTX1NUWUxFU19MQVlFUiwgQ0FOVkFTX1NUWUxFU19URVhUXTtcclxuXHJcbiAgLyoqXHJcbiAgICogRXhwb3J0XHJcbiAgKi9cclxuICBwdWJsaWMgaXNTdGFydDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBpc1BhdXNlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIGlzTG9hZGluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBpc1RvcmNoOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIGRhdGEgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFNjYW5uZXJRUkNvZGVSZXN1bHRbXT4oW10pO1xyXG4gIHB1YmxpYyBkZXZpY2VzID0gbmV3IEJlaGF2aW9yU3ViamVjdDxTY2FubmVyUVJDb2RlRGV2aWNlW10+KFtdKTtcclxuICBwdWJsaWMgZGV2aWNlSW5kZXhBY3RpdmU6IG51bWJlciA9IDA7XHJcblxyXG4gIC8qKlxyXG4gICAqIFByaXZhdGVcclxuICAqL1xyXG4gIHByaXZhdGUgckFGX0lEOiBhbnk7XHJcbiAgcHJpdmF0ZSBkYXRhRm9yUmVzaXplOiBTY2FubmVyUVJDb2RlUmVzdWx0W10gPSBbXTtcclxuICBwcml2YXRlIHJlYWR5ID0gbmV3IEFzeW5jU3ViamVjdDxib29sZWFuPigpO1xyXG5cclxuICBwcml2YXRlIFNUQVRVUyA9IHtcclxuICAgIHN0YXJ0T046ICgpID0+IHRoaXMuaXNTdGFydCA9IHRydWUsXHJcbiAgICBwYXVzZU9OOiAoKSA9PiB0aGlzLmlzUGF1c2UgPSB0cnVlLFxyXG4gICAgbG9hZGluZ09OOiAoKSA9PiB0aGlzLmlzTG9hZGluZyA9IHRydWUsXHJcbiAgICBzdGFydE9GRjogKCkgPT4gdGhpcy5pc1N0YXJ0ID0gZmFsc2UsXHJcbiAgICBwYXVzZU9GRjogKCkgPT4gdGhpcy5pc1BhdXNlID0gZmFsc2UsXHJcbiAgICBsb2FkaW5nT0ZGOiAoKSA9PiB0aGlzLmlzTG9hZGluZyA9IGZhbHNlLFxyXG4gICAgdG9yY2hPRkY6ICgpID0+IHRoaXMuaXNUb3JjaCA9IGZhbHNlLFxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLCBwcml2YXRlIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHsgfVxyXG5cclxuICBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgIHRoaXMub3ZlcnJpZGVDb25maWcoKTtcclxuICAgIExPQURfV0FTTSh0aGlzLnJlYWR5LCB0aGlzLnJlbmRlcmVyKS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5zcmMpIHtcclxuICAgICAgICB0aGlzLmxvYWRJbWFnZSh0aGlzLnNyYyk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5yZXNpemUoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc3RhcnRcclxuICAgKiBAcGFyYW0gcGxheURldmljZUN1c3RvbSBcclxuICAgKiBAcmV0dXJucyBcclxuICAgKi9cclxuICBwdWJsaWMgc3RhcnQocGxheURldmljZUN1c3RvbT86IEZ1bmN0aW9uKTogQXN5bmNTdWJqZWN0PGFueT4ge1xyXG4gICAgY29uc3QgYXMgPSBuZXcgQXN5bmNTdWJqZWN0PGFueT4oKTtcclxuICAgIGlmICh0aGlzLmlzU3RhcnQpIHtcclxuICAgICAgLy8gUmVqZWN0XHJcbiAgICAgIEFTX0NPTVBMRVRFKGFzLCBmYWxzZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBmaXggc2FmYXJpXHJcbiAgICAgIHRoaXMuc2FmYXJpV2ViUlRDKGFzLCBwbGF5RGV2aWNlQ3VzdG9tKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHN0b3BcclxuICAgKiBAcmV0dXJucyBcclxuICAgKi9cclxuICBwdWJsaWMgc3RvcCgpOiBBc3luY1N1YmplY3Q8YW55PiB7XHJcbiAgICB0aGlzLlNUQVRVUy5wYXVzZU9GRigpO1xyXG4gICAgdGhpcy5TVEFUVVMuc3RhcnRPRkYoKTtcclxuICAgIHRoaXMuU1RBVFVTLnRvcmNoT0ZGKCk7XHJcbiAgICB0aGlzLlNUQVRVUy5sb2FkaW5nT0ZGKCk7XHJcbiAgICBjb25zdCBhcyA9IG5ldyBBc3luY1N1YmplY3Q8YW55PigpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuckFGX0lEKTtcclxuICAgICAgKHRoaXMudmlkZW8ubmF0aXZlRWxlbWVudC5zcmNPYmplY3QgYXMgTWVkaWFTdHJlYW0pLmdldFRyYWNrcygpLmZvckVhY2goKHRyYWNrOiBNZWRpYVN0cmVhbVRyYWNrKSA9PiB7XHJcbiAgICAgICAgdHJhY2suc3RvcCgpO1xyXG4gICAgICAgIEFTX0NPTVBMRVRFKGFzLCB0cnVlKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuZGF0YUZvclJlc2l6ZSA9IFtdO1xyXG4gICAgICBSRVNFVF9DQU5WQVModGhpcy5jYW52YXMubmF0aXZlRWxlbWVudCk7XHJcbiAgICAgIFJFTU9WRV9SRVNVTFRfUEFORUwodGhpcy5yZXN1bHRzUGFuZWwubmF0aXZlRWxlbWVudCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBBU19DT01QTEVURShhcywgZmFsc2UsIGVycm9yIGFzIGFueSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBwbGF5XHJcbiAgICogQHJldHVybnMgXHJcbiAgICovXHJcbiAgcHVibGljIHBsYXkoKTogQXN5bmNTdWJqZWN0PGFueT4ge1xyXG4gICAgY29uc3QgYXMgPSBuZXcgQXN5bmNTdWJqZWN0PGFueT4oKTtcclxuICAgIGlmICh0aGlzLmlzUGF1c2UpIHtcclxuICAgICAgdGhpcy52aWRlby5uYXRpdmVFbGVtZW50LnBsYXkoKTtcclxuICAgICAgdGhpcy5TVEFUVVMucGF1c2VPRkYoKTtcclxuICAgICAgdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKTtcclxuICAgICAgQVNfQ09NUExFVEUoYXMsIHRydWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgQVNfQ09NUExFVEUoYXMsIGZhbHNlKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHBhdXNlXHJcbiAgICogQHJldHVybnMgXHJcbiAgICovXHJcbiAgcHVibGljIHBhdXNlKCk6IEFzeW5jU3ViamVjdDxhbnk+IHtcclxuICAgIGNvbnN0IGFzID0gbmV3IEFzeW5jU3ViamVjdDxhbnk+KCk7XHJcbiAgICBpZiAodGhpcy5pc1N0YXJ0KSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJBRl9JRCk7XHJcbiAgICAgIHRoaXMudmlkZW8ubmF0aXZlRWxlbWVudC5wYXVzZSgpO1xyXG4gICAgICB0aGlzLlNUQVRVUy5wYXVzZU9OKCk7XHJcbiAgICAgIEFTX0NPTVBMRVRFKGFzLCB0cnVlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIEFTX0NPTVBMRVRFKGFzLCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBwbGF5RGV2aWNlXHJcbiAgICogQHBhcmFtIGRldmljZUlkIFxyXG4gICAqIEBwYXJhbSBhcyBcclxuICAgKiBAcmV0dXJucyBcclxuICAgKi9cclxuICBwdWJsaWMgcGxheURldmljZShkZXZpY2VJZDogc3RyaW5nLCBhczogQXN5bmNTdWJqZWN0PGFueT4gPSBuZXcgQXN5bmNTdWJqZWN0PGFueT4oKSk6IEFzeW5jU3ViamVjdDxhbnk+IHtcclxuICAgIGNvbnN0IGNvbnN0cmFpbnRzID0gdGhpcy5nZXRDb25zdHJhaW50cygpO1xyXG4gICAgY29uc3QgZXhpc3REZXZpY2VJZCA9ICh0aGlzLmlzU3RhcnQgJiYgY29uc3RyYWludHMpID8gY29uc3RyYWludHMuZGV2aWNlSWQgIT09IGRldmljZUlkIDogdHJ1ZTtcclxuICAgIHN3aXRjaCAodHJ1ZSkge1xyXG4gICAgICBjYXNlIGRldmljZUlkID09PSAnbnVsbCcgfHwgZGV2aWNlSWQgPT09ICd1bmRlZmluZWQnIHx8ICFkZXZpY2VJZDpcclxuICAgICAgICBzdG9wKCk7XHJcbiAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgQVNfQ09NUExFVEUoYXMsIGZhbHNlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBkZXZpY2VJZCAmJiBleGlzdERldmljZUlkOlxyXG4gICAgICAgIHN0b3AoKTtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgICAvLyBMb2FkaW5nIG9uXHJcbiAgICAgICAgdGhpcy5TVEFUVVMubG9hZGluZ09OKCk7XHJcbiAgICAgICAgdGhpcy5kZXZpY2VJbmRleEFjdGl2ZSA9IHRoaXMuZGV2aWNlcy52YWx1ZS5maW5kSW5kZXgoKGY6IFNjYW5uZXJRUkNvZGVEZXZpY2UpID0+IGYuZGV2aWNlSWQgPT09IGRldmljZUlkKTtcclxuICAgICAgICBjb25zdCBjb25zdHJhaW50cyA9IHsgLi4udGhpcy5jb25zdHJhaW50cywgYXVkaW86IGZhbHNlLCB2aWRlbzogeyBkZXZpY2VJZDogZGV2aWNlSWQsIC4uLnRoaXMuY29uc3RyYWludHMudmlkZW8gfSB9O1xyXG4gICAgICAgIC8vIE1lZGlhU3RyZWFtXHJcbiAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMpLnRoZW4oKHN0cmVhbTogTWVkaWFTdHJlYW0pID0+IHtcclxuICAgICAgICAgIHRoaXMudmlkZW8ubmF0aXZlRWxlbWVudC5zcmNPYmplY3QgPSBzdHJlYW07XHJcbiAgICAgICAgICB0aGlzLnZpZGVvLm5hdGl2ZUVsZW1lbnQub25sb2FkZWRtZXRhZGF0YSA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy52aWRlby5uYXRpdmVFbGVtZW50LnBsYXkoKTtcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKTtcclxuICAgICAgICAgICAgQVNfQ09NUExFVEUoYXMsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLlNUQVRVUy5zdGFydE9OKCk7XHJcbiAgICAgICAgICAgIHRoaXMuU1RBVFVTLmxvYWRpbmdPRkYoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5ldmVudEVtaXQoZmFsc2UpO1xyXG4gICAgICAgICAgQVNfQ09NUExFVEUoYXMsIGZhbHNlLCBlcnJvcik7XHJcbiAgICAgICAgICB0aGlzLlNUQVRVUy5zdGFydE9GRigpO1xyXG4gICAgICAgICAgdGhpcy5TVEFUVVMubG9hZGluZ09GRigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIEFTX0NPTVBMRVRFKGFzLCBmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5TVEFUVVMubG9hZGluZ09GRigpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbG9hZEltYWdlXHJcbiAgICogQHBhcmFtIHNyYyBcclxuICAgKiBAcmV0dXJucyBcclxuICAgKi9cclxuICBwdWJsaWMgbG9hZEltYWdlKHNyYzogc3RyaW5nKTogQXN5bmNTdWJqZWN0PGFueT4ge1xyXG4gICAgY29uc3QgYXMgPSBuZXcgQXN5bmNTdWJqZWN0PGFueT4oKTtcclxuICAgIC8vIExvYWRpbmcgb25cclxuICAgIHRoaXMuU1RBVFVTLnN0YXJ0T0ZGKCk7XHJcbiAgICB0aGlzLlNUQVRVUy5sb2FkaW5nT04oKTtcclxuICAgIC8vIFNldCB0aGUgc3JjIG9mIHRoaXMgSW1hZ2Ugb2JqZWN0LlxyXG4gICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgIC8vIFNldHRpbmcgY3Jvc3Mgb3JpZ2luIHZhbHVlIHRvIGFub255bW91c1xyXG4gICAgaW1hZ2Uuc2V0QXR0cmlidXRlKCdjcm9zc09yaWdpbicsICdhbm9ueW1vdXMnKTtcclxuICAgIC8vIFdoZW4gb3VyIGltYWdlIGhhcyBsb2FkZWQuXHJcbiAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgIFdBU01fUkVBRFkoKSAmJiB0aGlzLmRyYXdJbWFnZShpbWFnZSwgKGZsYWc6IGJvb2xlYW4pID0+IHtcclxuICAgICAgICBBU19DT01QTEVURShhcywgZmxhZyk7XHJcbiAgICAgICAgdGhpcy5TVEFUVVMuc3RhcnRPRkYoKTtcclxuICAgICAgICB0aGlzLlNUQVRVUy5sb2FkaW5nT0ZGKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIC8vIFNldCBzcmNcclxuICAgIGltYWdlLnNyYyA9IHNyYztcclxuICAgIHJldHVybiBhcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHRvcmNoZXJcclxuICAgKiBAcmV0dXJucyBcclxuICAgKi9cclxuICBwdWJsaWMgdG9yY2hlcigpOiBBc3luY1N1YmplY3Q8YW55PiB7XHJcbiAgICBjb25zdCBhcyA9IHRoaXMuYXBwbHlDb25zdHJhaW50cyh7IGFkdmFuY2VkOiBbeyB0b3JjaDogdGhpcy5pc1RvcmNoIH1dIH0pO1xyXG4gICAgYXMuc3Vic2NyaWJlKCgpID0+IGZhbHNlLCAoKSA9PiB0aGlzLmlzVG9yY2ggPSAhdGhpcy5pc1RvcmNoKTtcclxuICAgIHJldHVybiBhcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGFwcGx5Q29uc3RyYWludHNcclxuICAgKiBAcGFyYW0gY29uc3RyYWludHMgXHJcbiAgICogQHBhcmFtIGRldmljZUluZGV4IFxyXG4gICAqIEByZXR1cm5zIFxyXG4gICAqL1xyXG4gIHB1YmxpYyBhcHBseUNvbnN0cmFpbnRzKGNvbnN0cmFpbnRzOiBNZWRpYVRyYWNrQ29uc3RyYWludFNldCB8IE1lZGlhVHJhY2tDb25zdHJhaW50cyB8IGFueSwgZGV2aWNlSW5kZXggPSAwKTogQXN5bmNTdWJqZWN0PGFueT4ge1xyXG4gICAgY29uc3QgYXMgPSBuZXcgQXN5bmNTdWJqZWN0PGFueT4oKTtcclxuICAgIGlmICh0aGlzLmlzU3RhcnQpIHtcclxuICAgICAgY29uc3Qgc3RyZWFtID0gdGhpcy52aWRlby5uYXRpdmVFbGVtZW50LnNyY09iamVjdCBhcyBNZWRpYVN0cmVhbTtcclxuICAgICAgaWYgKGRldmljZUluZGV4ICE9PSBudWxsIHx8IGRldmljZUluZGV4ICE9PSB1bmRlZmluZWQgfHwgIU51bWJlci5pc05hTihkZXZpY2VJbmRleCkpIHtcclxuICAgICAgICBjb25zdCB2aWRlb1RyYWNrID0gc3RyZWFtLmdldFZpZGVvVHJhY2tzKClbZGV2aWNlSW5kZXhdIGFzIE1lZGlhU3RyZWFtVHJhY2s7XHJcbiAgICAgICAgY29uc3QgaW1hZ2VDYXB0dXJlID0gbmV3ICh3aW5kb3cgYXMgYW55KS5JbWFnZUNhcHR1cmUodmlkZW9UcmFjayk7XHJcbiAgICAgICAgaW1hZ2VDYXB0dXJlLmdldFBob3RvQ2FwYWJpbGl0aWVzKCkudGhlbihhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICBhd2FpdCB2aWRlb1RyYWNrLmFwcGx5Q29uc3RyYWludHMoY29uc3RyYWludHMpO1xyXG4gICAgICAgICAgVVBEQVRFX1dJRFRIX0hFSUdIVF9WSURFTyh0aGlzLnZpZGVvLm5hdGl2ZUVsZW1lbnQsIHRoaXMuY2FudmFzLm5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgICAgICAgQVNfQ09NUExFVEUoYXMsIHRydWUpO1xyXG4gICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XHJcbiAgICAgICAgICBzd2l0Y2ggKGVycm9yPy5uYW1lKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ05vdEZvdW5kRXJyb3InOlxyXG4gICAgICAgICAgICBjYXNlICdEZXZpY2VzTm90Rm91bmRFcnJvcic6XHJcbiAgICAgICAgICAgICAgQVNfQ09NUExFVEUoYXMsIGZhbHNlLCAnUmVxdWlyZWQgdHJhY2sgaXMgbWlzc2luZycgYXMgc3RyaW5nKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnTm90UmVhZGFibGVFcnJvcic6XHJcbiAgICAgICAgICAgIGNhc2UgJ1RyYWNrU3RhcnRFcnJvcic6XHJcbiAgICAgICAgICAgICAgQVNfQ09NUExFVEUoYXMsIGZhbHNlLCAnV2ViY2FtIG9yIG1pYyBhcmUgYWxyZWFkeSBpbiB1c2UnIGFzIHN0cmluZyk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ092ZXJjb25zdHJhaW5lZEVycm9yJzpcclxuICAgICAgICAgICAgY2FzZSAnQ29uc3RyYWludE5vdFNhdGlzZmllZEVycm9yJzpcclxuICAgICAgICAgICAgICBBU19DT01QTEVURShhcywgZmFsc2UsICdDb25zdHJhaW50cyBjYW4gbm90IGJlIHNhdGlzZmllZCBieSBhdmIuIGRldmljZXMnIGFzIHN0cmluZyk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ05vdEFsbG93ZWRFcnJvcic6XHJcbiAgICAgICAgICAgIGNhc2UgJ1Blcm1pc3Npb25EZW5pZWRFcnJvcic6XHJcbiAgICAgICAgICAgICAgQVNfQ09NUExFVEUoYXMsIGZhbHNlLCAnUGVybWlzc2lvbiBkZW5pZWQgaW4gYnJvd3NlcicgYXMgc3RyaW5nKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnVHlwZUVycm9yJzpcclxuICAgICAgICAgICAgICBBU19DT01QTEVURShhcywgZmFsc2UsICdFbXB0eSBjb25zdHJhaW50cyBvYmplY3QnIGFzIHN0cmluZyk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgQVNfQ09NUExFVEUoYXMsIGZhbHNlLCBlcnJvciBhcyBhbnkpO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIEFTX0NPTVBMRVRFKGFzLCBmYWxzZSwgJ1BsZWFzZSBjaGVjayBhZ2FpbiBkZXZpY2VJbmRleCcgYXMgc3RyaW5nKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgQVNfQ09NUExFVEUoYXMsIGZhbHNlLCAnUGxlYXNlIHN0YXJ0IHRoZSBzY2FubmVyJyBhcyBzdHJpbmcpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFzO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIGdldENvbnN0cmFpbnRzXHJcbiAgICogQHBhcmFtIGRldmljZUluZGV4IFxyXG4gICAqIEByZXR1cm5zIFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDb25zdHJhaW50cyhkZXZpY2VJbmRleCA9IDApOiBNZWRpYVRyYWNrQ29uc3RyYWludFNldCB8IE1lZGlhVHJhY2tDb25zdHJhaW50cyB7XHJcbiAgICBjb25zdCBzdHJlYW0gPSB0aGlzLnZpZGVvLm5hdGl2ZUVsZW1lbnQuc3JjT2JqZWN0IGFzIE1lZGlhU3RyZWFtO1xyXG4gICAgY29uc3QgdmlkZW9UcmFjayA9IHN0cmVhbT8uZ2V0VmlkZW9UcmFja3MoKVtkZXZpY2VJbmRleF0gYXMgTWVkaWFTdHJlYW1UcmFjaztcclxuICAgIHJldHVybiB2aWRlb1RyYWNrPy5nZXRDb25zdHJhaW50cygpIGFzIE1lZGlhVHJhY2tDb25zdHJhaW50cztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGRvd25sb2FkXHJcbiAgICogQHBhcmFtIGZpbGVOYW1lIFxyXG4gICAqIEBwYXJhbSBwZXJjZW50YWdlIFxyXG4gICAqIEBwYXJhbSBxdWFsaXR5IFxyXG4gICAqIEByZXR1cm5zIFxyXG4gICAqL1xyXG4gIHB1YmxpYyBkb3dubG9hZChmaWxlTmFtZTogc3RyaW5nID0gYG5neF9zY2FubmVyX3FyY29kZV8ke0RhdGUubm93KCl9LnBuZ2AsIHBlcmNlbnRhZ2U/OiBudW1iZXIsIHF1YWxpdHk/OiBudW1iZXIpOiBBc3luY1N1YmplY3Q8U2Nhbm5lclFSQ29kZVNlbGVjdGVkRmlsZXNbXT4ge1xyXG4gICAgY29uc3QgYXMgPSBuZXcgQXN5bmNTdWJqZWN0PGFueT4oKTtcclxuICAgIChhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCBDQU5WQVNfVE9fQkxPQih0aGlzLmNhbnZhcy5uYXRpdmVFbGVtZW50KTtcclxuICAgICAgY29uc3QgZmlsZSA9IEJMT0JfVE9fRklMRShibG9iLCBmaWxlTmFtZSk7XHJcbiAgICAgIEZJTEVTX1RPX1NDQU4oW2ZpbGVdLCB0aGlzLmNvbmZpZywgcGVyY2VudGFnZSwgcXVhbGl0eSwgYXMpLnN1YnNjcmliZSgocmVzOiBTY2FubmVyUVJDb2RlU2VsZWN0ZWRGaWxlc1tdKSA9PiB7XHJcbiAgICAgICAgcmVzLmZvckVhY2goKGl0ZW06IFNjYW5uZXJRUkNvZGVTZWxlY3RlZEZpbGVzKSA9PiB7XHJcbiAgICAgICAgICBpZiAoaXRlbT8uZGF0YT8ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgICAgIGxpbmsuaHJlZiA9IGl0ZW0udXJsO1xyXG4gICAgICAgICAgICBsaW5rLmRvd25sb2FkID0gaXRlbS5uYW1lO1xyXG4gICAgICAgICAgICBsaW5rLmNsaWNrKCk7XHJcbiAgICAgICAgICAgIGxpbmsucmVtb3ZlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSkoKTtcclxuICAgIHJldHVybiBhcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHJlc2l6ZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVzaXplKCk6IHZvaWQge1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xyXG4gICAgICBEUkFXX1JFU1VMVF9BUFBFTkRfQ0hJTEQodGhpcy5kYXRhRm9yUmVzaXplIGFzIGFueSwgdGhpcy5jYW52YXMubmF0aXZlRWxlbWVudCwgdGhpcy5yZXN1bHRzUGFuZWwubmF0aXZlRWxlbWVudCwgdGhpcy5jYW52YXNTdHlsZXMpO1xyXG4gICAgICBVUERBVEVfV0lEVEhfSEVJR0hUX1ZJREVPKHRoaXMudmlkZW8ubmF0aXZlRWxlbWVudCwgdGhpcy5jYW52YXMubmF0aXZlRWxlbWVudCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG92ZXJyaWRlQ29uZmlnXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvdmVycmlkZUNvbmZpZygpOiB2b2lkIHtcclxuICAgIGlmICgnc3JjJyBpbiB0aGlzLmNvbmZpZykgdGhpcy5zcmMgPSB0aGlzLmNvbmZpZy5zcmM7XHJcbiAgICBpZiAoJ2ZwcycgaW4gdGhpcy5jb25maWcpIHRoaXMuZnBzID0gdGhpcy5jb25maWcuZnBzO1xyXG4gICAgaWYgKCd2aWJyYXRlJyBpbiB0aGlzLmNvbmZpZykgdGhpcy52aWJyYXRlID0gdGhpcy5jb25maWcudmlicmF0ZTtcclxuICAgIGlmICgnZGVjb2RlJyBpbiB0aGlzLmNvbmZpZykgdGhpcy5kZWNvZGUgPSB0aGlzLmNvbmZpZy5kZWNvZGU7XHJcbiAgICBpZiAoJ2lzQmVlcCcgaW4gdGhpcy5jb25maWcpIHRoaXMuaXNCZWVwID0gdGhpcy5jb25maWcuaXNCZWVwO1xyXG4gICAgaWYgKCdjb25zdHJhaW50cycgaW4gdGhpcy5jb25maWcpIHRoaXMuY29uc3RyYWludHMgPSBPVkVSUklERVMoJ2NvbnN0cmFpbnRzJywgdGhpcy5jb25maWcsIE1FRElBX1NUUkVBTV9ERUZBVUxUKTtcclxuICAgIGlmICgnY2FudmFzU3R5bGVzJyBpbiB0aGlzLmNvbmZpZyAmJiB0aGlzLmNvbmZpZz8uY2FudmFzU3R5bGVzPy5sZW5ndGggPT09IDIpIHRoaXMuY2FudmFzU3R5bGVzID0gdGhpcy5jb25maWcuY2FudmFzU3R5bGVzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc2FmYXJpV2ViUlRDXHJcbiAgICogRml4IGlzc3VlIG9uIHNhZmFyaVxyXG4gICAqIGh0dHBzOi8vd2VicnRjaGFja3MuY29tL2d1aWRlLXRvLXNhZmFyaS13ZWJydGNcclxuICAgKiBAcGFyYW0gYXMgXHJcbiAgICogQHBhcmFtIHBsYXlEZXZpY2VDdXN0b20gXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzYWZhcmlXZWJSVEMoYXM6IEFzeW5jU3ViamVjdDxhbnk+LCBwbGF5RGV2aWNlQ3VzdG9tPzogRnVuY3Rpb24pOiB2b2lkIHtcclxuICAgIC8vIExvYWRpbmcgb25cclxuICAgIHRoaXMuU1RBVFVTLnN0YXJ0T0ZGKCk7XHJcbiAgICB0aGlzLlNUQVRVUy5sb2FkaW5nT04oKTtcclxuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKHRoaXMuY29uc3RyYWludHMpLnRoZW4oKHN0cmVhbTogTWVkaWFTdHJlYW0pID0+IHtcclxuICAgICAgc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2godHJhY2sgPT4gdHJhY2suc3RvcCgpKTtcclxuICAgICAgdGhpcy5sb2FkQWxsRGV2aWNlcyhhcywgcGxheURldmljZUN1c3RvbSk7XHJcbiAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xyXG4gICAgICBBU19DT01QTEVURShhcywgZmFsc2UsIGVycm9yKTtcclxuICAgICAgdGhpcy5TVEFUVVMuc3RhcnRPRkYoKTtcclxuICAgICAgdGhpcy5TVEFUVVMubG9hZGluZ09GRigpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBsb2FkQWxsRGV2aWNlc1xyXG4gICAqIEBwYXJhbSBhcyBcclxuICAgKiBAcGFyYW0gcGxheURldmljZUN1c3RvbSBcclxuICAgKi9cclxuICBwcml2YXRlIGxvYWRBbGxEZXZpY2VzKGFzOiBBc3luY1N1YmplY3Q8YW55PiwgcGxheURldmljZUN1c3RvbT86IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMoKS50aGVuKGRldmljZXMgPT4ge1xyXG4gICAgICBsZXQgY2FtZXJhRGV2aWNlczogU2Nhbm5lclFSQ29kZURldmljZVtdID0gZGV2aWNlcy5maWx0ZXIoZiA9PiBmLmtpbmQgPT0gJ3ZpZGVvaW5wdXQnKTtcclxuICAgICAgdGhpcy5kZXZpY2VzLm5leHQoY2FtZXJhRGV2aWNlcyk7XHJcbiAgICAgIGlmIChjYW1lcmFEZXZpY2VzPy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgQVNfQ09NUExFVEUoYXMsIGNhbWVyYURldmljZXMpO1xyXG4gICAgICAgIHBsYXlEZXZpY2VDdXN0b20gPyBwbGF5RGV2aWNlQ3VzdG9tKGNhbWVyYURldmljZXMpIDogdGhpcy5wbGF5RGV2aWNlKGNhbWVyYURldmljZXNbMF0uZGV2aWNlSWQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIEFTX0NPTVBMRVRFKGFzLCBmYWxzZSwgJ05vIGNhbWVyYSBkZXRlY3RlZC4nIGFzIGFueSk7XHJcbiAgICAgICAgdGhpcy5TVEFUVVMuc3RhcnRPRkYoKTtcclxuICAgICAgICB0aGlzLlNUQVRVUy5sb2FkaW5nT0ZGKCk7XHJcbiAgICAgIH1cclxuICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XHJcbiAgICAgIEFTX0NPTVBMRVRFKGFzLCBmYWxzZSwgZXJyb3IpO1xyXG4gICAgICB0aGlzLlNUQVRVUy5zdGFydE9GRigpO1xyXG4gICAgICB0aGlzLlNUQVRVUy5sb2FkaW5nT0ZGKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGRyYXdJbWFnZVxyXG4gICAqIEBwYXJhbSBlbGVtZW50IFxyXG4gICAqIEBwYXJhbSBjYWxsYmFjayBcclxuICAgKi9cclxuICBwcml2YXRlIGFzeW5jIGRyYXdJbWFnZShlbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50IHwgSFRNTFZpZGVvRWxlbWVudCwgY2FsbGJhY2s6IEZ1bmN0aW9uID0gKCkgPT4geyB9KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAvLyBHZXQgdGhlIGNhbnZhcyBlbGVtZW50IGJ5IHVzaW5nIHRoZSBnZXRFbGVtZW50QnlJZCBtZXRob2QuXHJcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLmNhbnZhcy5uYXRpdmVFbGVtZW50O1xyXG4gICAgLy8gR2V0IGEgMkQgZHJhd2luZyBjb250ZXh0IGZvciB0aGUgY2FudmFzLlxyXG4gICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJywgeyB3aWxsUmVhZEZyZXF1ZW50bHk6IHRydWUgfSkgYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG4gICAgLy8gSFRNTEltYWdlRWxlbWVudCBzaXplXHJcbiAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQpIHtcclxuICAgICAgY2FudmFzLndpZHRoID0gZWxlbWVudC5uYXR1cmFsV2lkdGg7XHJcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBlbGVtZW50Lm5hdHVyYWxIZWlnaHQ7XHJcbiAgICAgIGVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xyXG4gICAgICB0aGlzLnZpZGVvLm5hdGl2ZUVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xyXG4gICAgICAvLyBJbWFnZSBjZW50ZXIgYW5kIGF1dG8gc2NhbGVcclxuICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgJ3dpZHRoJywgY2FudmFzLndpZHRoICsgJ3B4Jyk7XHJcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICdtYXhXaWR0aCcsIDEwMCArICclJyk7XHJcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICdkaXNwbGF5JywgJ2lubGluZS1ibG9jaycpO1xyXG4gICAgfVxyXG4gICAgLy8gSFRNTFZpZGVvRWxlbWVudCBzaXplXHJcbiAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxWaWRlb0VsZW1lbnQpIHtcclxuICAgICAgY2FudmFzLndpZHRoID0gZWxlbWVudC52aWRlb1dpZHRoO1xyXG4gICAgICBjYW52YXMuaGVpZ2h0ID0gZWxlbWVudC52aWRlb0hlaWdodDtcclxuICAgICAgZWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gJyc7XHJcbiAgICAgIHRoaXMuY2FudmFzLm5hdGl2ZUVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xyXG4gICAgfVxyXG4gICAgLy8gU2V0IHdpZHRoLCBoZWlnaHQgZm9yIHZpZGVvIGVsZW1lbnRcclxuICAgIFVQREFURV9XSURUSF9IRUlHSFRfVklERU8odGhpcy52aWRlby5uYXRpdmVFbGVtZW50LCBjYW52YXMpO1xyXG4gICAgLy8gY2xlYXIgZnJhbWVcclxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KVxyXG4gICAgLy8gRHJhdyBpbWFnZVxyXG4gICAgY3R4LmRyYXdJbWFnZShlbGVtZW50LCAwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gICAgLy8gRGF0YSBpbWFnZVxyXG4gICAgY29uc3QgaW1hZ2VEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gICAgLy8gRHJhdyBmcmFtZVxyXG4gICAgY29uc3QgY29kZSA9IGF3YWl0IHpiYXJXYXNtLnNjYW5JbWFnZURhdGEoaW1hZ2VEYXRhKTtcclxuICAgIGlmIChjb2RlPy5sZW5ndGgpIHtcclxuICAgICAgLy8gRGVjb2RlXHJcbiAgICAgIGNvZGUuZm9yRWFjaCgoczogYW55KSA9PiBzLnZhbHVlID0gcy5kZWNvZGUodGhpcy5kZWNvZGU/LnRvTG9jYWxlTG93ZXJDYXNlKCkpKTtcclxuICAgICAgLy8gT3ZlcmxheVxyXG4gICAgICBEUkFXX1JFU1VMVF9BUFBFTkRfQ0hJTEQoY29kZSwgT2JqZWN0LmZyZWV6ZSh0aGlzLmNhbnZhcy5uYXRpdmVFbGVtZW50KSwgdGhpcy5yZXN1bHRzUGFuZWwubmF0aXZlRWxlbWVudCwgdGhpcy5jYW52YXNTdHlsZXMpO1xyXG4gICAgICAvLyBUbyBibG9iIGFuZCBlbWl0IGRhdGFcclxuICAgICAgY29uc3QgRU1JVF9EQVRBID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZXZlbnRFbWl0KGNvZGUpO1xyXG4gICAgICAgIHRoaXMuZGF0YUZvclJlc2l6ZSA9IGNvZGU7XHJcbiAgICAgIH07XHJcbiAgICAgIC8vIEhUTUxJbWFnZUVsZW1lbnRcclxuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50KSB7XHJcbiAgICAgICAgY2FsbGJhY2sodHJ1ZSk7XHJcbiAgICAgICAgRU1JVF9EQVRBKCk7XHJcbiAgICAgICAgVklCUkFURSh0aGlzLnZpYnJhdGUpO1xyXG4gICAgICAgIFBMQVlfQVVESU8odGhpcy5pc0JlZXApO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIEhUTUxWaWRlb0VsZW1lbnRcclxuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MVmlkZW9FbGVtZW50KSB7XHJcbiAgICAgICAgRU1JVF9EQVRBKCk7XHJcbiAgICAgICAgVklCUkFURSh0aGlzLnZpYnJhdGUpO1xyXG4gICAgICAgIFBMQVlfQVVESU8odGhpcy5pc0JlZXApO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjYWxsYmFjayhmYWxzZSk7XHJcbiAgICAgIFJFTU9WRV9SRVNVTFRfUEFORUwodGhpcy5yZXN1bHRzUGFuZWwubmF0aXZlRWxlbWVudCk7XHJcbiAgICAgIHRoaXMuZGF0YUZvclJlc2l6ZSA9IFtdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZXZlbnRFbWl0XHJcbiAgICogQHBhcmFtIHJlc3BvbnNlIFxyXG4gICAqL1xyXG4gIHByaXZhdGUgZXZlbnRFbWl0KHJlc3BvbnNlOiBhbnkgPSBmYWxzZSk6IHZvaWQge1xyXG4gICAgKHJlc3BvbnNlICE9PSBmYWxzZSkgJiYgdGhpcy5kYXRhLm5leHQocmVzcG9uc2UgfHwgW10pO1xyXG4gICAgKHJlc3BvbnNlICE9PSBmYWxzZSkgJiYgdGhpcy5ldmVudC5lbWl0KHJlc3BvbnNlIHx8IFtdKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNpbmdsZS10aHJlYWRcclxuICAgKiBMb29wIFJlY29yZGluZyBvbiBDYW1lcmFcclxuICAgKiBNdXN0IGJlIGRlc3Ryb3kgcmVxdWVzdCBcclxuICAgKiBOb3QgdXNpbmc6IHJlcXVlc3RBbmltYXRpb25GcmFtZVxyXG4gICAqIEBwYXJhbSBkZWxheVxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRlbGF5OiBudW1iZXIgPSAxMDApOiB2b2lkIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJBRl9JRCk7XHJcbiAgICAgIHRoaXMuckFGX0lEID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMudmlkZW8ubmF0aXZlRWxlbWVudC5yZWFkeVN0YXRlID09PSB0aGlzLnZpZGVvLm5hdGl2ZUVsZW1lbnQuSEFWRV9FTk9VR0hfREFUQSkge1xyXG4gICAgICAgICAgZGVsYXkgPSAwOyAvLyBBcHB5IGZpcnN0IHJlcXVlc3RcclxuICAgICAgICAgIFdBU01fUkVBRFkoKSAmJiB0aGlzLmRyYXdJbWFnZSh0aGlzLnZpZGVvLm5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgICAgICAgdGhpcy5pc1N0YXJ0ICYmICF0aGlzLmlzUGF1c2UgJiYgdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZGVsYXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgLyphdm9pZCBjYWNoZSBtZWRpYVN0cmVhbSovIGRlbGF5IHx8IHRoaXMuZnBzKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJBRl9JRCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBpc1JlYWR5XHJcbiAgICovXHJcbiAgZ2V0IGlzUmVhZHkoKTogQXN5bmNTdWJqZWN0PGJvb2xlYW4+IHtcclxuICAgIHJldHVybiB0aGlzLnJlYWR5O1xyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB0aGlzLnBhdXNlKCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==