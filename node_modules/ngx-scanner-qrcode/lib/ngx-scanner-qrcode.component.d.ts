import { ElementRef, EventEmitter, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AsyncSubject, BehaviorSubject } from 'rxjs';
import { ScannerQRCodeConfig, ScannerQRCodeDevice, ScannerQRCodeResult, ScannerQRCodeSelectedFiles } from './ngx-scanner-qrcode.options';
import * as i0 from "@angular/core";
export declare class NgxScannerQrcodeComponent implements OnInit, OnDestroy {
    private renderer;
    private elementRef;
    /**
     * Element
     * playsinline required to tell iOS safari we don't want fullscreen
     */
    video: ElementRef<HTMLVideoElement>;
    canvas: ElementRef<HTMLCanvasElement>;
    resultsPanel: ElementRef<HTMLDivElement>;
    /**
     * EventEmitter
     */
    event: EventEmitter<ScannerQRCodeResult[]>;
    /**
     * Input
     */
    src: string | undefined;
    fps: number | undefined;
    vibrate: number | undefined;
    decode: string | undefined;
    isBeep: boolean | undefined;
    config: ScannerQRCodeConfig;
    constraints: MediaStreamConstraints | any;
    canvasStyles: CanvasRenderingContext2D[] | any[];
    /**
     * Export
    */
    isStart: boolean;
    isPause: boolean;
    isLoading: boolean;
    isTorch: boolean;
    data: BehaviorSubject<ScannerQRCodeResult[]>;
    devices: BehaviorSubject<ScannerQRCodeDevice[]>;
    deviceIndexActive: number;
    /**
     * Private
    */
    private rAF_ID;
    private dataForResize;
    private ready;
    private STATUS;
    constructor(renderer: Renderer2, elementRef: ElementRef);
    ngOnInit(): void;
    /**
     * start
     * @param playDeviceCustom
     * @returns
     */
    start(playDeviceCustom?: Function): AsyncSubject<any>;
    /**
     * stop
     * @returns
     */
    stop(): AsyncSubject<any>;
    /**
     * play
     * @returns
     */
    play(): AsyncSubject<any>;
    /**
     * pause
     * @returns
     */
    pause(): AsyncSubject<any>;
    /**
     * playDevice
     * @param deviceId
     * @param as
     * @returns
     */
    playDevice(deviceId: string, as?: AsyncSubject<any>): AsyncSubject<any>;
    /**
     * loadImage
     * @param src
     * @returns
     */
    loadImage(src: string): AsyncSubject<any>;
    /**
     * torcher
     * @returns
     */
    torcher(): AsyncSubject<any>;
    /**
     * applyConstraints
     * @param constraints
     * @param deviceIndex
     * @returns
     */
    applyConstraints(constraints: MediaTrackConstraintSet | MediaTrackConstraints | any, deviceIndex?: number): AsyncSubject<any>;
    /**
     * getConstraints
     * @param deviceIndex
     * @returns
     */
    getConstraints(deviceIndex?: number): MediaTrackConstraintSet | MediaTrackConstraints;
    /**
     * download
     * @param fileName
     * @param percentage
     * @param quality
     * @returns
     */
    download(fileName?: string, percentage?: number, quality?: number): AsyncSubject<ScannerQRCodeSelectedFiles[]>;
    /**
     * resize
     */
    private resize;
    /**
     * overrideConfig
     */
    private overrideConfig;
    /**
     * safariWebRTC
     * Fix issue on safari
     * https://webrtchacks.com/guide-to-safari-webrtc
     * @param as
     * @param playDeviceCustom
     */
    private safariWebRTC;
    /**
     * loadAllDevices
     * @param as
     * @param playDeviceCustom
     */
    private loadAllDevices;
    /**
     * drawImage
     * @param element
     * @param callback
     */
    private drawImage;
    /**
     * eventEmit
     * @param response
     */
    private eventEmit;
    /**
     * Single-thread
     * Loop Recording on Camera
     * Must be destroy request
     * Not using: requestAnimationFrame
     * @param delay
     */
    private requestAnimationFrame;
    /**
     * isReady
     */
    get isReady(): AsyncSubject<boolean>;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxScannerQrcodeComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NgxScannerQrcodeComponent, "ngx-scanner-qrcode", ["scanner"], { "src": { "alias": "src"; "required": false; }; "fps": { "alias": "fps"; "required": false; }; "vibrate": { "alias": "vibrate"; "required": false; }; "decode": { "alias": "decode"; "required": false; }; "isBeep": { "alias": "isBeep"; "required": false; }; "config": { "alias": "config"; "required": false; }; "constraints": { "alias": "constraints"; "required": false; }; "canvasStyles": { "alias": "canvasStyles"; "required": false; }; }, { "event": "event"; }, never, never, false, never>;
}
