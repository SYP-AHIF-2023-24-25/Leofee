import { AsyncSubject } from "rxjs";
import { ScannerQRCodeConfig, ScannerQRCodeSelectedFiles } from "./ngx-scanner-qrcode.options";
/**
 * WASM_READY
 * @returns
 */
export declare var WASM_READY: () => boolean;
/**
 * OVERRIDES
 * @param variableKey
 * @param config
 * @param defaultConfig
 * @returns
 */
export declare const OVERRIDES: (variableKey: string, config: any, defaultConfig: any) => any;
/**
 * AS_COMPLETE
 * @param as
 * @param data
 * @param error
 */
export declare const AS_COMPLETE: (as: AsyncSubject<any>, data: any, error?: any) => void;
/**
 * PLAY_AUDIO
 * @param isPlay
 * @returns
 */
export declare const PLAY_AUDIO: (isPlay?: boolean) => void;
/**
 * DRAW_RESULT_APPEND_CHILD
 * @param code
 * @param oriCanvas
 * @param elTarget
 * @param canvasStyles
 */
export declare const DRAW_RESULT_APPEND_CHILD: (code: any[], oriCanvas: HTMLCanvasElement, elTarget: HTMLCanvasElement | HTMLDivElement, canvasStyles: CanvasRenderingContext2D[]) => void;
/**
 * DRAW_RESULT_ON_CANVAS
 * @param code
 * @param cvs
 * @param canvasStyles
 */
export declare const DRAW_RESULT_ON_CANVAS: (code: any[], cvs: HTMLCanvasElement, canvasStyles: CanvasRenderingContext2D[]) => void;
/**
 * READ_AS_DATA_URL
 * @param file
 * @param configs
 * @returns
 */
export declare const READ_AS_DATA_URL: (file: File, configs: ScannerQRCodeConfig) => Promise<ScannerQRCodeSelectedFiles>;
/**
 * Convert canvas to blob
 * canvas.toBlob((blob) => { .. }, 'image/jpeg', 0.95); // JPEG at 95% quality
 * @param canvas
 * @param type
 * @returns
 */
export declare const CANVAS_TO_BLOB: (canvas: HTMLCanvasElement, type?: string) => Promise<any>;
/**
 * Convert blob to file
 * @param theBlob
 * @param fileName
 * @returns
 */
export declare const BLOB_TO_FILE: (theBlob: any, fileName: string) => File;
/**
 * FILES_TO_SCAN
 * @param files
 * @param configs
 * @param percentage
 * @param quality
 * @param as
 * @returns
 */
export declare const FILES_TO_SCAN: (files: File[] | undefined, configs: ScannerQRCodeConfig, percentage?: number, quality?: number, as?: AsyncSubject<ScannerQRCodeSelectedFiles[]>) => AsyncSubject<ScannerQRCodeSelectedFiles[]>;
/**
 * FILL_TEXT_MULTI_LINE
 * @param ctx
 * @param text
 * @param x
 * @param y
 */
export declare const FILL_TEXT_MULTI_LINE: (ctx: CanvasRenderingContext2D, text: string, x: number, y: number) => void;
/**
 * COMPRESS_IMAGE_FILE
 * @param files
 * @param percentage
 * @param quality
 * @returns
 */
export declare const COMPRESS_IMAGE_FILE: (files?: File[], percentage?: number, quality?: number) => Promise<File[]>;
/**
 * REMOVE_RESULT_PANEL
 * @param element
 */
export declare const REMOVE_RESULT_PANEL: (element: HTMLElement) => void;
/**
 * RESET_CANVAS
 * @param canvas
 */
export declare const RESET_CANVAS: (canvas: HTMLCanvasElement) => void;
/**
 * UPDATE_WIDTH_HEIGHT_VIDEO
 * @param video
 * @param canvas
 */
export declare const UPDATE_WIDTH_HEIGHT_VIDEO: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
/**
 * VIBRATE
 * @param time
 */
export declare const VIBRATE: (time?: number) => void;
/**
 * IS_MOBILE
 * @returns
 */
export declare const IS_MOBILE: () => boolean;
