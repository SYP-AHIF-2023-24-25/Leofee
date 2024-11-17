import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs';
import { AS_COMPLETE, COMPRESS_IMAGE_FILE, FILES_TO_SCAN } from './ngx-scanner-qrcode.helper';
import * as i0 from "@angular/core";
class NgxScannerQrcodeService {
    /**
     * loadFiles
     * @param files
     * @param percentage
     * @param quality
     * @returns
     */
    loadFiles(files = [], percentage, quality) {
        const as = new AsyncSubject();
        COMPRESS_IMAGE_FILE(files, percentage, quality).then((_files) => {
            Promise.all(Object.assign([], _files).map((m) => this.readAsDataURL(m))).then((img) => AS_COMPLETE(as, img)).catch((error) => AS_COMPLETE(as, null, error));
        });
        return as;
    }
    /**
     * loadFilesToScan
     * @param files
     * @param config
     * @param percentage
     * @param quality
     * @returns
     */
    loadFilesToScan(files = [], config, percentage, quality) {
        return FILES_TO_SCAN(files, config, percentage, quality);
    }
    /**
     * readAsDataURL
     * @param file
     * @returns
     */
    readAsDataURL(file) {
        /** drawImage **/
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                const objectFile = {
                    name: file.name,
                    file: file,
                    url: URL.createObjectURL(file)
                };
                resolve(objectFile);
            };
            fileReader.onerror = (error) => reject(error);
            fileReader.readAsDataURL(file);
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.3", ngImport: i0, type: NgxScannerQrcodeService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.3", ngImport: i0, type: NgxScannerQrcodeService, providedIn: 'root' }); }
}
export { NgxScannerQrcodeService };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.3", ngImport: i0, type: NgxScannerQrcodeService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXNjYW5uZXItcXJjb2RlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtc2Nhbm5lci1xcmNvZGUvc3JjL2xpYi9uZ3gtc2Nhbm5lci1xcmNvZGUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQzs7QUFHOUYsTUFHYSx1QkFBdUI7SUFFbEM7Ozs7OztPQU1HO0lBQ0ksU0FBUyxDQUFDLFFBQWdCLEVBQUUsRUFBRSxVQUFtQixFQUFFLE9BQWdCO1FBQ3hFLE1BQU0sRUFBRSxHQUFHLElBQUksWUFBWSxFQUFnQyxDQUFDO1FBQzVELG1CQUFtQixDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBYyxFQUFFLEVBQUU7WUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQWlDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFVLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdk0sQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksZUFBZSxDQUFDLFFBQWdCLEVBQUUsRUFBRSxNQUEyQixFQUFFLFVBQW1CLEVBQUUsT0FBZ0I7UUFDM0csT0FBTyxhQUFhLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxhQUFhLENBQUMsSUFBVTtRQUM5QixpQkFBaUI7UUFDakIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ3BDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO2dCQUN2QixNQUFNLFVBQVUsR0FBRztvQkFDakIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO29CQUNmLElBQUksRUFBRSxJQUFJO29CQUNWLEdBQUcsRUFBRSxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztpQkFDL0IsQ0FBQztnQkFDRixPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEIsQ0FBQyxDQUFBO1lBQ0QsVUFBVSxDQUFDLE9BQU8sR0FBRyxDQUFDLEtBQVUsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25ELFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDOzhHQWpEVSx1QkFBdUI7a0hBQXZCLHVCQUF1QixjQUZ0QixNQUFNOztTQUVQLHVCQUF1QjsyRkFBdkIsdUJBQXVCO2tCQUhuQyxVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQXN5bmNTdWJqZWN0IH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IEFTX0NPTVBMRVRFLCBDT01QUkVTU19JTUFHRV9GSUxFLCBGSUxFU19UT19TQ0FOIH0gZnJvbSAnLi9uZ3gtc2Nhbm5lci1xcmNvZGUuaGVscGVyJztcclxuaW1wb3J0IHsgU2Nhbm5lclFSQ29kZUNvbmZpZywgU2Nhbm5lclFSQ29kZVNlbGVjdGVkRmlsZXMgfSBmcm9tICcuL25neC1zY2FubmVyLXFyY29kZS5vcHRpb25zJztcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICBwcm92aWRlZEluOiAncm9vdCdcclxufSlcclxuZXhwb3J0IGNsYXNzIE5neFNjYW5uZXJRcmNvZGVTZXJ2aWNlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogbG9hZEZpbGVzXHJcbiAgICogQHBhcmFtIGZpbGVzIFxyXG4gICAqIEBwYXJhbSBwZXJjZW50YWdlIFxyXG4gICAqIEBwYXJhbSBxdWFsaXR5IFxyXG4gICAqIEByZXR1cm5zIFxyXG4gICAqL1xyXG4gIHB1YmxpYyBsb2FkRmlsZXMoZmlsZXM6IEZpbGVbXSA9IFtdLCBwZXJjZW50YWdlPzogbnVtYmVyLCBxdWFsaXR5PzogbnVtYmVyKTogQXN5bmNTdWJqZWN0PFNjYW5uZXJRUkNvZGVTZWxlY3RlZEZpbGVzW10+IHtcclxuICAgIGNvbnN0IGFzID0gbmV3IEFzeW5jU3ViamVjdDxTY2FubmVyUVJDb2RlU2VsZWN0ZWRGaWxlc1tdPigpO1xyXG4gICAgQ09NUFJFU1NfSU1BR0VfRklMRShmaWxlcywgcGVyY2VudGFnZSwgcXVhbGl0eSkudGhlbigoX2ZpbGVzOiBGaWxlW10pID0+IHtcclxuICAgICAgUHJvbWlzZS5hbGwoT2JqZWN0LmFzc2lnbihbXSwgX2ZpbGVzKS5tYXAoKG06IEZpbGUpID0+IHRoaXMucmVhZEFzRGF0YVVSTChtKSkpLnRoZW4oKGltZzogU2Nhbm5lclFSQ29kZVNlbGVjdGVkRmlsZXNbXSkgPT4gQVNfQ09NUExFVEUoYXMsIGltZykpLmNhdGNoKChlcnJvcjogYW55KSA9PiBBU19DT01QTEVURShhcywgbnVsbCwgZXJyb3IpKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGFzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbG9hZEZpbGVzVG9TY2FuXHJcbiAgICogQHBhcmFtIGZpbGVzIFxyXG4gICAqIEBwYXJhbSBjb25maWcgXHJcbiAgICogQHBhcmFtIHBlcmNlbnRhZ2UgXHJcbiAgICogQHBhcmFtIHF1YWxpdHkgXHJcbiAgICogQHJldHVybnMgXHJcbiAgICovXHJcbiAgcHVibGljIGxvYWRGaWxlc1RvU2NhbihmaWxlczogRmlsZVtdID0gW10sIGNvbmZpZzogU2Nhbm5lclFSQ29kZUNvbmZpZywgcGVyY2VudGFnZT86IG51bWJlciwgcXVhbGl0eT86IG51bWJlcik6IEFzeW5jU3ViamVjdDxTY2FubmVyUVJDb2RlU2VsZWN0ZWRGaWxlc1tdPiB7XHJcbiAgICByZXR1cm4gRklMRVNfVE9fU0NBTihmaWxlcywgY29uZmlnLCBwZXJjZW50YWdlLCBxdWFsaXR5KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHJlYWRBc0RhdGFVUkxcclxuICAgKiBAcGFyYW0gZmlsZSBcclxuICAgKiBAcmV0dXJucyBcclxuICAgKi9cclxuICBwcml2YXRlIHJlYWRBc0RhdGFVUkwoZmlsZTogRmlsZSk6IFByb21pc2U8U2Nhbm5lclFSQ29kZVNlbGVjdGVkRmlsZXM+IHtcclxuICAgIC8qKiBkcmF3SW1hZ2UgKiovXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICBjb25zdCBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgb2JqZWN0RmlsZSA9IHtcclxuICAgICAgICAgIG5hbWU6IGZpbGUubmFtZSxcclxuICAgICAgICAgIGZpbGU6IGZpbGUsXHJcbiAgICAgICAgICB1cmw6IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSlcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJlc29sdmUob2JqZWN0RmlsZSk7XHJcbiAgICAgIH1cclxuICAgICAgZmlsZVJlYWRlci5vbmVycm9yID0gKGVycm9yOiBhbnkpID0+IHJlamVjdChlcnJvcik7XHJcbiAgICAgIGZpbGVSZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcclxuICAgIH0pXHJcbiAgfVxyXG59Il19