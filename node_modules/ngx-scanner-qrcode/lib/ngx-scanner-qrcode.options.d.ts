export interface ScannerQRCodeConfig {
    src?: string;
    fps?: number;
    vibrate?: number; /** support mobile */
    decode?: string;
    isBeep?: boolean;
    constraints?: MediaStreamConstraints;
    canvasStyles?: CanvasRenderingContext2D[] | any[];
}
export interface ScannerQRCodeSelectedFiles {
    url: string;
    name: string;
    file: File;
    data?: ScannerQRCodeResult[];
    canvas?: HTMLCanvasElement;
}
export interface ScannerQRCodeDevice {
    kind: string;
    label: string;
    groupId: string;
    deviceId: string;
}
export interface ScannerQRCodePoint {
    x: number;
    y: number;
}
export declare enum ScannerQRCodeSymbolType {
    ScannerQRCode_NONE = 0,
    ScannerQRCode_PARTIAL = 1,
    ScannerQRCode_EAN2 = 2,
    ScannerQRCode_EAN5 = 5,
    ScannerQRCode_EAN8 = 8,
    ScannerQRCode_UPCE = 9,
    ScannerQRCode_ISBN10 = 10,
    ScannerQRCode_UPCA = 12,
    ScannerQRCode_EAN13 = 13,
    ScannerQRCode_ISBN13 = 14,
    ScannerQRCode_COMPOSITE = 15,
    ScannerQRCode_I25 = 25,
    ScannerQRCode_DATABAR = 34,
    ScannerQRCode_DATABAR_EXP = 35,
    ScannerQRCode_CODABAR = 38,
    ScannerQRCode_CODE39 = 39,
    ScannerQRCode_PDF417 = 57,
    ScannerQRCode_QRCODE = 64,
    ScannerQRCode_SQCODE = 80,
    ScannerQRCode_CODE93 = 93,
    ScannerQRCode_CODE128 = 128,
    /** mask for base symbol type.
     * @deprecated in 0.11, remove this from existing code
     */
    ScannerQRCode_SYMBOL = 255,
    /** 2-digit add-on flag.
     * @deprecated in 0.11, a ::ScannerQRCode_EAN2 component is used for
     * 2-digit GS1 add-ons
     */
    ScannerQRCode_ADDON2 = 512,
    /** 5-digit add-on flag.
     * @deprecated in 0.11, a ::ScannerQRCode_EAN5 component is used for
     * 5-digit GS1 add-ons
     */
    ScannerQRCode_ADDON5 = 1280,
    /** add-on flag mask.
     * @deprecated in 0.11, GS1 add-ons are represented using composite
     * symbols of type ::ScannerQRCode_COMPOSITE; add-on components use ::ScannerQRCode_EAN2
     * or ::ScannerQRCode_EAN5
     */
    ScannerQRCode_ADDON = 1792
}
export declare enum ScannerQRCodeConfigType {
    ScannerQRCode_CFG_ENABLE = 0,
    ScannerQRCode_CFG_ADD_CHECK = /**< enable check digit when optional */ 1,
    ScannerQRCode_CFG_EMIT_CHECK = /**< return check digit when present */ 2,
    ScannerQRCode_CFG_ASCII = /**< enable full ASCII character set */ 3,
    ScannerQRCode_CFG_BINARY = /**< don't convert binary data to text */ 4,
    ScannerQRCode_CFG_NUM = /**< number of boolean decoder configs */ 5,
    ScannerQRCode_CFG_MIN_LEN = 32,
    ScannerQRCode_CFG_MAX_LEN = /**< maximum data length for valid decode */ 33,
    ScannerQRCode_CFG_UNCERTAINTY = 64,
    ScannerQRCode_CFG_POSITION = 128,
    ScannerQRCode_CFG_TEST_INVERTED = /**< if fails to decode, test inverted */ 129,
    ScannerQRCode_CFG_X_DENSITY = 256,
    ScannerQRCode_CFG_Y_DENSITY = /**< image scanner horizontal scan density */ 257
}
export declare enum ScannerQRCodeOrientation {
    ScannerQRCode_ORIENT_UNKNOWN = -1,
    ScannerQRCode_ORIENT_UP = /**< upright, read left to right */ 0,
    ScannerQRCode_ORIENT_RIGHT = /**< sideways, read top to bottom */ 1,
    ScannerQRCode_ORIENT_DOWN = /**< upside-down, read right to left */ 2,
    ScannerQRCode_ORIENT_LEFT = /**< sideways, read bottom to top */ 3
}
export declare class ScannerQRCodeResult {
    type: ScannerQRCodeSymbolType;
    typeName: string;
    data: Int8Array;
    points: Array<ScannerQRCodePoint>;
    orientation: ScannerQRCodeOrientation;
    time: number;
    cacheCount: number;
    quality: number;
    value: string;
    private constructor();
    static createSymbolsFromPtr(ptr: number, buf: ArrayBuffer): Array<ScannerQRCodeResult>;
    decode(encoding?: string): string;
}
