import { AsyncSubject } from 'rxjs';
import { ScannerQRCodeConfig, ScannerQRCodeSelectedFiles } from './ngx-scanner-qrcode.options';
import * as i0 from "@angular/core";
export declare class NgxScannerQrcodeService {
    /**
     * loadFiles
     * @param files
     * @param percentage
     * @param quality
     * @returns
     */
    loadFiles(files?: File[], percentage?: number, quality?: number): AsyncSubject<ScannerQRCodeSelectedFiles[]>;
    /**
     * loadFilesToScan
     * @param files
     * @param config
     * @param percentage
     * @param quality
     * @returns
     */
    loadFilesToScan(files: File[] | undefined, config: ScannerQRCodeConfig, percentage?: number, quality?: number): AsyncSubject<ScannerQRCodeSelectedFiles[]>;
    /**
     * readAsDataURL
     * @param file
     * @returns
     */
    private readAsDataURL;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxScannerQrcodeService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NgxScannerQrcodeService>;
}
