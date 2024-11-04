import * as i0 from '@angular/core';
import { Injectable, EventEmitter, Component, ViewChild, ViewEncapsulation, NgModule } from '@angular/core';
import { AsyncSubject, BehaviorSubject } from 'rxjs';

const WASMPROJECT = "assets/wasm/index.js";
const WASMREMOTE = "https://cdn.jsdelivr.net/npm/ngx-scanner-qrcode@1.6.9/wasm/index.js";
const WASMREMOTELATEST = "https://cdn.jsdelivr.net/npm/ngx-scanner-qrcode@latest/wasm/index.js";
const BEEP = `data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAABQAAAkAAgICAgICAgICAgICAgICAgICAgKCgoKCgoKCgoKCgoKCgoKCgoKCgwMDAwMDAwMDAwMDAwMDAwMDAwMDg4ODg4ODg4ODg4ODg4ODg4ODg4P//////////////////////////AAAAAExhdmM1OC41NAAAAAAAAAAAAAAAACQEUQAAAAAAAAJAk0uXRQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAANQAbGeUEQAAHZYZ3fASqD4P5TKBgocg+Bw/8+CAYBA4XB9/4EBAEP4nB9+UOf/6gfUCAIKyjgQ/Kf//wfswAAAwQA/+MYxAYOqrbdkZGQAMA7DJLCsQxNOij///////////+tv///3RWiZGBEhsf/FO/+LoCSFs1dFVS/g8f/4Mhv0nhqAieHleLy/+MYxAYOOrbMAY2gABf/////////////////usPJ66R0wI4boY9/8jQYg//g2SPx1M0N3Z0kVJLIs///Uw4aMyvHJJYmPBYG/+MYxAgPMALBucAQAoGgaBoFQVBUFQWDv6gZBUFQVBUGgaBr5YSgqCoKhIGg7+IQVBUFQVBoGga//SsFSoKnf/iVTEFNRTMu/+MYxAYAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV`;
const MEDIA_STREAM_DEFAULT = {
    audio: false,
    video: true
};
const CANVAS_STYLES_LAYER = {
    lineWidth: 1,
    strokeStyle: 'green',
    fillStyle: '#55f02880'
};
const CANVAS_STYLES_TEXT = {
    font: '15px serif',
    strokeStyle: '#fff0',
    fillStyle: '#ff0000'
};
const CONFIG_DEFAULT = {
    src: '',
    fps: 30,
    vibrate: 300,
    decode: 'utf-8',
    isBeep: true,
    constraints: MEDIA_STREAM_DEFAULT,
    canvasStyles: [CANVAS_STYLES_LAYER, CANVAS_STYLES_TEXT]
};

/**
 * WASM_READY
 * @returns
 */
var WASM_READY = () => ('zbarWasm' in window);
/**
 * OVERRIDES
 * @param variableKey
 * @param config
 * @param defaultConfig
 * @returns
 */
const OVERRIDES = (variableKey, config, defaultConfig) => {
    if (config && Object.keys(config[variableKey]).length) {
        for (const key in defaultConfig) {
            const cloneDeep = JSON.parse(JSON.stringify({ ...config[variableKey], ...{ [key]: defaultConfig[key] } }));
            config[variableKey] = config[variableKey].hasOwnProperty(key) ? config[variableKey] : cloneDeep;
        }
        return config[variableKey];
    }
    else {
        return defaultConfig;
    }
};
/**
 * AS_COMPLETE
 * @param as
 * @param data
 * @param error
 */
const AS_COMPLETE = (as, data, error) => {
    error ? as.error(error) : as.next(data);
    as.complete();
};
/**
 * PLAY_AUDIO
 * @param isPlay
 * @returns
 */
const PLAY_AUDIO = (isPlay = false) => {
    if (isPlay === false)
        return;
    const audio = new Audio(BEEP);
    // when the sound has been loaded, execute your code
    audio.oncanplaythrough = () => {
        const promise = audio.play();
        if (promise) {
            promise.catch((e) => {
                if (e.name === "NotAllowedError" || e.name === "NotSupportedError") {
                    // console.log(e.name);
                }
            });
        }
    };
};
/**
 * DRAW_RESULT_APPEND_CHILD
 * @param code
 * @param oriCanvas
 * @param elTarget
 * @param canvasStyles
 */
const DRAW_RESULT_APPEND_CHILD = (code, oriCanvas, elTarget, canvasStyles) => {
    let widthZoom;
    let heightZoom;
    let oriWidth = oriCanvas.width;
    let oriHeight = oriCanvas.height;
    let oriWHRatio = oriWidth / oriHeight;
    let imgWidth = parseInt(getComputedStyle(oriCanvas).width);
    let imgHeight = parseInt(getComputedStyle(oriCanvas).height);
    let imgWHRatio = imgWidth / imgHeight;
    elTarget.innerHTML = '';
    if (oriWHRatio > imgWHRatio) {
        widthZoom = imgWidth / oriWidth;
        heightZoom = imgWidth / oriWHRatio / oriHeight;
    }
    else {
        heightZoom = imgHeight / oriHeight;
        widthZoom = (imgHeight * oriWHRatio) / oriWidth;
    }
    for (let i = 0; i < code.length; i++) {
        const _code = code[i];
        // New canvas
        let cvs = document.createElement("canvas");
        let ctx = cvs.getContext('2d', { willReadFrequently: true });
        let loc = {};
        let X = [];
        let Y = [];
        let fontSize = 0;
        let svgSize = 0;
        let num = canvasStyles.length === 2 && canvasStyles[1]?.font?.replace(/[^0-9]/g, '');
        if (num && /[0-9]/g.test(num)) {
            fontSize = parseFloat(num);
            svgSize = (widthZoom || 1) * fontSize;
            if (Number.isNaN(svgSize)) {
                svgSize = fontSize;
            }
        }
        // Point x,y
        const points = _code.points;
        for (let j = 0; j < points.length; j++) {
            const xj = points?.[j]?.x ?? 0;
            const yj = points?.[j]?.y ?? 0;
            loc[`x${j + 1}`] = xj;
            loc[`y${j + 1}`] = yj;
            X.push(xj);
            Y.push(yj);
        }
        // Min max
        let maxX = Math.max(...X);
        let minX = Math.min(...X);
        let maxY = Math.max(...Y);
        let minY = Math.min(...Y);
        // Add class
        cvs.setAttribute('class', 'qrcode-polygon');
        // Size with screen zoom
        if (oriWHRatio > imgWHRatio) {
            cvs.style.top = minY * heightZoom + (imgHeight - imgWidth / oriWHRatio) * 0.5 + "px";
            cvs.style.left = minX * widthZoom + "px";
            cvs.width = (maxX - minX) * widthZoom;
            cvs.height = (maxY - minY) * widthZoom;
        }
        else {
            cvs.style.top = minY * heightZoom + "px";
            cvs.style.left = minX * widthZoom + (imgWidth - imgHeight * oriWHRatio) * 0.5 + "px";
            cvs.width = (maxX - minX) * heightZoom;
            cvs.height = (maxY - minY) * heightZoom;
        }
        // Style for canvas
        for (const key in canvasStyles[0]) {
            ctx[key] = canvasStyles[0][key];
        }
        // polygon [x,y, x,y, x,y.....];
        const polygon = [];
        for (let k = 0; k < X.length; k++) {
            polygon.push((loc[`x${k + 1}`] - minX) * heightZoom);
            polygon.push((loc[`y${k + 1}`] - minY) * widthZoom);
        }
        // Copy array
        const shape = polygon.slice(0);
        // Draw polygon
        ctx.beginPath();
        ctx.moveTo(shape.shift(), shape.shift());
        while (shape.length) {
            ctx.lineTo(shape.shift(), shape.shift()); //x,y
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (fontSize) {
            // Tooltip result
            const qrcodeTooltipTemp = document.createElement('div');
            qrcodeTooltipTemp.setAttribute('class', 'qrcode-tooltip-temp');
            qrcodeTooltipTemp.innerText = _code.value;
            qrcodeTooltipTemp.style.maxWidth = ((oriWidth > window.innerWidth) ? window.innerWidth * 0.9 : oriWidth) + "px";
            qrcodeTooltipTemp.style.borderRadius = `clamp(1px, ${(widthZoom * fontSize) - 10}px, 3px)`;
            qrcodeTooltipTemp.style.paddingBlock = `clamp(1px, ${(widthZoom * fontSize) - 10}px, 3px)`; // top - bottom
            qrcodeTooltipTemp.style.paddingInline = `clamp(2.5px, ${(widthZoom * fontSize) - 6}px, 10px)`; // left - right
            const xmlString = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 512 512"><rect x="128" y="128" width="336" height="336" rx="57" ry="57"></rect><path d="M383.5,128l.5-24a56.16,56.16,0,0,0-56-56H112a64.19,64.19,0,0,0-64,64V328a56.16,56.16,0,0,0,56,56h24"></path></svg>`;
            const xmlDom = new DOMParser().parseFromString(xmlString, 'application/xml');
            const svgDom = qrcodeTooltipTemp.ownerDocument.importNode(xmlDom.documentElement, true);
            svgDom.style.marginLeft = `clamp(1px, ${(widthZoom * fontSize) - 10}px, 3px)`; // left - right
            qrcodeTooltipTemp.appendChild(svgDom);
            svgDom.addEventListener("click", () => window.navigator['clipboard'].writeText(_code.value));
            qrcodeTooltipTemp.addEventListener("click", () => window.navigator['clipboard'].writeText(_code.value));
            // Tooltip box
            const qrcodeTooltip = document.createElement('div');
            qrcodeTooltip.setAttribute('class', 'qrcode-tooltip');
            qrcodeTooltip.appendChild(qrcodeTooltipTemp);
            heightZoom = imgHeight / oriHeight;
            widthZoom = (imgHeight * oriWHRatio) / oriWidth;
            qrcodeTooltip.style.fontSize = widthZoom * fontSize + 'px';
            qrcodeTooltip.style.top = minY * heightZoom + "px";
            qrcodeTooltip.style.left = minX * widthZoom + (imgWidth - imgHeight * oriWHRatio) * 0.5 + "px";
            qrcodeTooltip.style.width = (maxX - minX) * heightZoom + "px";
            qrcodeTooltip.style.height = (maxY - minY) * heightZoom + "px";
            // Result text
            const resultText = document.createElement('span');
            resultText.innerText = _code.value;
            // Set position result text
            resultText.style.top = minY * heightZoom + (-20 * heightZoom) + "px";
            resultText.style.left = minX * widthZoom + (imgWidth - imgHeight * oriWHRatio) * 0.5 + "px";
            // Style text
            const ff = canvasStyles[1]?.font?.split(' ')?.[1];
            resultText.style.fontFamily = ff;
            resultText.style.fontSize = widthZoom * fontSize + 'px';
            resultText.style.color = canvasStyles?.[1]?.fillStyle;
            elTarget?.appendChild(qrcodeTooltip);
            elTarget?.appendChild(resultText);
        }
        elTarget?.appendChild(cvs);
    }
    ;
};
/**
 * DRAW_RESULT_ON_CANVAS
 * @param code
 * @param cvs
 * @param canvasStyles
 */
const DRAW_RESULT_ON_CANVAS = (code, cvs, canvasStyles) => {
    let ctx = cvs.getContext('2d', { willReadFrequently: true });
    for (let i = 0; i < code.length; i++) {
        const _code = code[i];
        let loc = {};
        let X = [];
        let Y = [];
        let fontSize = 0;
        const fs = canvasStyles[1]?.font?.split(' ')?.[0];
        let num = fs?.replace(/[^0-9]/g, '');
        if (num && /[0-9]/g.test(num)) {
            fontSize = parseFloat(num);
        }
        // Point x,y
        const points = _code.points;
        for (let j = 0; j < points.length; j++) {
            const xj = points?.[j]?.x ?? 0;
            const yj = points?.[j]?.y ?? 0;
            loc[`x${j + 1}`] = xj;
            loc[`y${j + 1}`] = yj;
            X.push(xj);
            Y.push(yj);
        }
        // Min max
        let minX = Math.min(...X);
        let minY = Math.min(...Y);
        const styleLayer = () => {
            for (const key in canvasStyles[0]) {
                ctx[key] = canvasStyles[0][key];
            }
            // polygon [x,y, x,y, x,y.....];
            const polygon = [];
            for (let k = 0; k < X.length; k++) {
                polygon.push(loc[`x${k + 1}`]);
                polygon.push(loc[`y${k + 1}`]);
            }
            // Copy array
            const shape = polygon.slice(0);
            // Draw polygon
            ctx.beginPath();
            ctx.moveTo(shape.shift(), shape.shift());
            while (shape.length) {
                ctx.lineTo(shape.shift(), shape.shift()); //x,y
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        };
        let cvs2 = document.createElement('canvas');
        const styleText = () => {
            const ff = canvasStyles[1]?.font?.split(' ')?.[1];
            cvs2.height = cvs.height;
            cvs2.width = cvs.width;
            let ctx2 = cvs2.getContext('2d', { willReadFrequently: true });
            ctx2.font = fontSize + `px ` + ff;
            for (const key in canvasStyles[1]) {
                ctx2[key] = canvasStyles[1][key];
            }
            FILL_TEXT_MULTI_LINE(ctx2, _code.value, minX, minY - 5);
        };
        styleLayer();
        styleText();
        // Merge cvs2 into cvs
        ctx.drawImage(cvs2, 0, 0);
    }
    ;
};
/**
 * READ_AS_DATA_URL
 * @param file
 * @param configs
 * @returns
 */
const READ_AS_DATA_URL = (file, configs) => {
    /** overrides **/
    let decode = configs?.decode ?? CONFIG_DEFAULT.decode;
    let canvasStyles = configs?.canvasStyles?.length === 2 ? configs?.canvasStyles : [CANVAS_STYLES_LAYER, CANVAS_STYLES_TEXT];
    let isBeep = configs?.isBeep ?? CONFIG_DEFAULT.isBeep;
    /** drawImage **/
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
            const objectFile = {
                name: file.name,
                file: file,
                url: URL.createObjectURL(file)
            };
            // Set the src of this Image object.
            const image = new Image();
            // Setting cross origin value to anonymous
            image.setAttribute('crossOrigin', 'anonymous');
            // When our image has loaded.
            image.onload = async () => {
                // Get the canvas element by using the getElementById method.
                const canvas = document.createElement('canvas');
                // HTMLImageElement size
                canvas.width = image.naturalWidth || image.width;
                canvas.height = image.naturalHeight || image.height;
                // Get a 2D drawing context for the canvas.
                const ctx = canvas.getContext('2d');
                // Draw image
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                // Data image
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                // Scanner
                if (WASM_READY()) {
                    const code = await zbarWasm.scanImageData(imageData);
                    if (code?.length) {
                        // Decode
                        code.forEach((s) => s.value = s.decode(decode?.toLocaleLowerCase()));
                        // Overlay
                        DRAW_RESULT_ON_CANVAS(code, canvas, canvasStyles);
                        // Emit object
                        const blob = await CANVAS_TO_BLOB(canvas);
                        const url = URL.createObjectURL(blob);
                        const blobToFile = (theBlob, fileName) => new File([theBlob], fileName, { lastModified: new Date().getTime(), type: theBlob.type });
                        resolve(Object.assign({}, objectFile, { data: code, url: url, canvas: canvas, file: blobToFile(blob, objectFile.name) }));
                        PLAY_AUDIO(isBeep);
                    }
                    else {
                        resolve(Object.assign({}, objectFile, { data: code, canvas: canvas }));
                    }
                }
            };
            // Set src
            image.src = objectFile.url;
        };
        fileReader.onerror = (error) => reject(error);
        fileReader.readAsDataURL(file);
    });
};
/**
 * Convert canvas to blob
 * canvas.toBlob((blob) => { .. }, 'image/jpeg', 0.95); // JPEG at 95% quality
 * @param canvas
 * @param type
 * @returns
 */
const CANVAS_TO_BLOB = (canvas, type) => {
    return new Promise((resolve, reject) => canvas.toBlob(blob => resolve(blob), type));
};
/**
 * Convert blob to file
 * @param theBlob
 * @param fileName
 * @returns
 */
const BLOB_TO_FILE = (theBlob, fileName) => {
    return new File([theBlob], fileName, { lastModified: new Date().getTime(), type: theBlob.type });
};
/**
 * FILES_TO_SCAN
 * @param files
 * @param configs
 * @param percentage
 * @param quality
 * @param as
 * @returns
 */
const FILES_TO_SCAN = (files = [], configs, percentage, quality, as = new AsyncSubject()) => {
    COMPRESS_IMAGE_FILE(files, percentage, quality).then((_files) => {
        Promise.all(Object.assign([], _files).map((m) => READ_AS_DATA_URL(m, configs))).then((img) => {
            AS_COMPLETE(as, img);
        }).catch((error) => AS_COMPLETE(as, null, error));
    });
    return as;
};
/**
 * FILL_TEXT_MULTI_LINE
 * @param ctx
 * @param text
 * @param x
 * @param y
 */
const FILL_TEXT_MULTI_LINE = (ctx, text, x, y) => {
    let lineHeight = ctx.measureText("M").width * 1.2;
    let lines = text.split("\n");
    for (var i = 0; i < lines.length; ++i) {
        ctx.fillText(lines[i], x, y);
        ctx.strokeText(lines[i], x, y);
        y += lineHeight;
    }
};
/**
 * COMPRESS_IMAGE_FILE
 * @param files
 * @param percentage
 * @param quality
 * @returns
 */
const COMPRESS_IMAGE_FILE = (files = [], percentage = 100, quality = 100) => {
    if (files.length && (percentage < 100 || quality < 100)) {
        // Have files
        const resizedFiles = [];
        return new Promise((resolve, reject) => {
            for (const file of files) {
                const image = new Image();
                const reader = new FileReader();
                reader.onload = function (event) {
                    image.onload = function () {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const newWidth = Math.round(image.width * (percentage / 100));
                        const newHeight = Math.round(image.height * (percentage / 100));
                        canvas.width = newWidth;
                        canvas.height = newHeight;
                        ctx.drawImage(image, 0, 0, newWidth, newHeight);
                        canvas.toBlob((blob) => {
                            const resizedFile = new File([blob], file.name, { type: file.type });
                            resizedFiles.push(resizedFile);
                            if (files.length === resizedFiles.length) {
                                resolve(resizedFiles);
                            }
                        }, file.type, quality / 100);
                    };
                    image.src = event.target.result;
                };
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            }
        });
    }
    else {
        // No files selected
        return Promise.resolve(files);
    }
};
/**
 * REMOVE_RESULT_PANEL
 * @param element
 */
const REMOVE_RESULT_PANEL = (element) => {
    // clear text result and tooltip
    Object.assign([], element.childNodes).forEach(el => element.removeChild(el));
};
/**
 * RESET_CANVAS
 * @param canvas
 */
const RESET_CANVAS = (canvas) => {
    // reset canvas
    const context = canvas.getContext('2d', { willReadFrequently: true });
    // clear frame when reloop
    context.clearRect(0, 0, canvas.width, canvas.height);
};
/**
 * UPDATE_WIDTH_HEIGHT_VIDEO
 * @param video
 * @param canvas
 */
const UPDATE_WIDTH_HEIGHT_VIDEO = (video, canvas) => {
    video.style.width = canvas.offsetWidth + 'px';
    video.style.height = canvas.offsetHeight + 'px';
};
/**
 * VIBRATE
 * @param time
 */
const VIBRATE = (time = 300) => {
    time && IS_MOBILE() && window?.navigator?.vibrate(time);
};
/**
 * IS_MOBILE
 * @returns
 */
const IS_MOBILE = () => {
    const vendor = navigator.userAgent || navigator['vendor'] || window['opera'];
    const phone = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i;
    const version = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i;
    const isSafari = /^((?!chrome|android).)*safari/i;
    return !!(phone.test(vendor) || version.test(vendor.substr(0, 4))) && !isSafari.test(vendor);
};

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
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.3", ngImport: i0, type: NgxScannerQrcodeService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }] });

/**
 * LOAD_WASM
 * @param as
 * @param renderer
 * @returns
 */
const LOAD_WASM = (as = new AsyncSubject(), renderer) => {
    let retry = 0;
    const LOAD_WASM_RETRY = (isLoadWasmRemote = false) => {
        const DONE = () => {
            let timeoutId;
            try {
                const L = () => {
                    clearTimeout(timeoutId);
                    WASM_READY() ? setTimeout(() => AS_COMPLETE(as, true)) : timeoutId = setTimeout(() => L());
                };
                setTimeout(() => L());
                setTimeout(() => clearTimeout(timeoutId), 3000);
            }
            catch (error) {
                clearTimeout(timeoutId);
            }
        };
        const scriptRemote = document.querySelectorAll(`script[src="${WASMREMOTE}"]`);
        const scriptRemoteLatest = document.querySelectorAll(`script[src="${WASMREMOTELATEST}"]`);
        if (scriptRemote.length || scriptRemoteLatest.length) {
            DONE();
        }
        else {
            const scriptProject = document.querySelectorAll(`script[src="${WASMPROJECT}"]`);
            if (scriptProject.length === 1) {
                DONE();
            }
            else {
                scriptProject.forEach(f => f.remove());
                if (renderer) {
                    const script = renderer.createElement("script");
                    renderer.setAttribute(script, "src", isLoadWasmRemote ? WASMREMOTE : WASMPROJECT);
                    renderer.setAttribute(script, "type", "text/javascript");
                    renderer.setAttribute(script, "async", "");
                    renderer.appendChild(document.head, script);
                    script.onload = () => DONE();
                    script.onerror = () => {
                        if (retry < 2) {
                            document.head.removeChild(script);
                            LOAD_WASM_RETRY(true);
                        }
                        else {
                            AS_COMPLETE(as, false, 'Could not load script ' + isLoadWasmRemote ? WASMREMOTE : WASMPROJECT);
                        }
                    };
                    retry += 1;
                }
                else {
                    const mod = document.createElement('script');
                    mod.setAttribute("src", isLoadWasmRemote ? WASMREMOTE : WASMPROJECT);
                    mod.setAttribute("type", "text/javascript");
                    mod.setAttribute("async", "");
                    document.head.appendChild(mod);
                    mod.onload = () => DONE();
                    mod.onerror = () => {
                        if (retry < 2) {
                            document.head.removeChild(mod);
                            LOAD_WASM_RETRY(true);
                        }
                        else {
                            AS_COMPLETE(as, false, 'Could not load script ' + isLoadWasmRemote ? WASMREMOTE : WASMPROJECT);
                        }
                    };
                    retry += 1;
                }
            }
        }
    };
    LOAD_WASM_RETRY();
    return as;
};

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
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.3", ngImport: i0, type: NgxScannerQrcodeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-scanner-qrcode', template: `<div #resultsPanel class="origin-overlay"></div><canvas #canvas class="origin-canvas"></canvas><video #video playsinline class="origin-video"></video>`, host: { 'class': 'ngx-scanner-qrcode' }, exportAs: 'scanner', inputs: ['src', 'fps', 'vibrate', 'decode', 'isBeep', 'config', 'constraints', 'canvasStyles'], outputs: ['event'], queries: {
                        video: new ViewChild('video'),
                        canvas: new ViewChild('canvas'),
                        resultsPanel: new ViewChild('resultsPanel')
                    }, encapsulation: ViewEncapsulation.None, styles: [".ngx-scanner-qrcode{display:block;position:relative}.origin-overlay{width:100%;position:absolute}.origin-overlay span{z-index:2;text-align:left;position:absolute}.origin-overlay .qrcode-polygon{z-index:1;position:absolute}.origin-canvas{width:100%;position:absolute}.origin-video{width:100%;background-color:#262626}.qrcode-tooltip{z-index:3;position:absolute}.qrcode-tooltip:hover .qrcode-tooltip-temp{display:block;position:absolute;cursor:copy}.qrcode-tooltip:hover .qrcode-tooltip-temp:active{color:#afafaf}.qrcode-tooltip .qrcode-tooltip-temp{bottom:0;left:50%;color:#fff;text-align:left;display:none;width:max-content;word-wrap:break-word;transform:translate(-50%);transform-style:preserve-3d;background-color:#000000d0;box-shadow:1px 1px 20px #000000e0}.qrcode-tooltip .qrcode-tooltip-temp svg{cursor:pointer}.qrcode-tooltip .qrcode-tooltip-temp svg rect{fill:none;stroke:#fff;stroke-linejoin:round;stroke-width:32px}.qrcode-tooltip .qrcode-tooltip-temp svg path{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px}.qrcode-tooltip .qrcode-tooltip-temp svg:active rect{stroke:#afafaf}.qrcode-tooltip .qrcode-tooltip-temp svg:active path{stroke:#afafaf}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.Renderer2 }, { type: i0.ElementRef }]; } });

var ScannerQRCodeSymbolType;
(function (ScannerQRCodeSymbolType) {
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_NONE"] = 0] = "ScannerQRCode_NONE";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_PARTIAL"] = 1] = "ScannerQRCode_PARTIAL";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_EAN2"] = 2] = "ScannerQRCode_EAN2";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_EAN5"] = 5] = "ScannerQRCode_EAN5";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_EAN8"] = 8] = "ScannerQRCode_EAN8";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_UPCE"] = 9] = "ScannerQRCode_UPCE";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_ISBN10"] = 10] = "ScannerQRCode_ISBN10";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_UPCA"] = 12] = "ScannerQRCode_UPCA";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_EAN13"] = 13] = "ScannerQRCode_EAN13";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_ISBN13"] = 14] = "ScannerQRCode_ISBN13";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_COMPOSITE"] = 15] = "ScannerQRCode_COMPOSITE";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_I25"] = 25] = "ScannerQRCode_I25";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_DATABAR"] = 34] = "ScannerQRCode_DATABAR";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_DATABAR_EXP"] = 35] = "ScannerQRCode_DATABAR_EXP";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_CODABAR"] = 38] = "ScannerQRCode_CODABAR";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_CODE39"] = 39] = "ScannerQRCode_CODE39";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_PDF417"] = 57] = "ScannerQRCode_PDF417";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_QRCODE"] = 64] = "ScannerQRCode_QRCODE";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_SQCODE"] = 80] = "ScannerQRCode_SQCODE";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_CODE93"] = 93] = "ScannerQRCode_CODE93";
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_CODE128"] = 128] = "ScannerQRCode_CODE128";
    /*
     * Please see _ScannerQRCode_get_symbol_hash() if adding
     * anything after 128
     */
    /** mask for base symbol type.
     * @deprecated in 0.11, remove this from existing code
     */
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_SYMBOL"] = 255] = "ScannerQRCode_SYMBOL";
    /** 2-digit add-on flag.
     * @deprecated in 0.11, a ::ScannerQRCode_EAN2 component is used for
     * 2-digit GS1 add-ons
     */
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_ADDON2"] = 512] = "ScannerQRCode_ADDON2";
    /** 5-digit add-on flag.
     * @deprecated in 0.11, a ::ScannerQRCode_EAN5 component is used for
     * 5-digit GS1 add-ons
     */
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_ADDON5"] = 1280] = "ScannerQRCode_ADDON5";
    /** add-on flag mask.
     * @deprecated in 0.11, GS1 add-ons are represented using composite
     * symbols of type ::ScannerQRCode_COMPOSITE; add-on components use ::ScannerQRCode_EAN2
     * or ::ScannerQRCode_EAN5
     */
    ScannerQRCodeSymbolType[ScannerQRCodeSymbolType["ScannerQRCode_ADDON"] = 1792] = "ScannerQRCode_ADDON";
})(ScannerQRCodeSymbolType || (ScannerQRCodeSymbolType = {}));
var ScannerQRCodeConfigType;
(function (ScannerQRCodeConfigType) {
    ScannerQRCodeConfigType[ScannerQRCodeConfigType["ScannerQRCode_CFG_ENABLE"] = 0] = "ScannerQRCode_CFG_ENABLE";
    ScannerQRCodeConfigType[ScannerQRCodeConfigType["ScannerQRCode_CFG_ADD_CHECK"] = 1] = "ScannerQRCode_CFG_ADD_CHECK";
    ScannerQRCodeConfigType[ScannerQRCodeConfigType["ScannerQRCode_CFG_EMIT_CHECK"] = 2] = "ScannerQRCode_CFG_EMIT_CHECK";
    ScannerQRCodeConfigType[ScannerQRCodeConfigType["ScannerQRCode_CFG_ASCII"] = 3] = "ScannerQRCode_CFG_ASCII";
    ScannerQRCodeConfigType[ScannerQRCodeConfigType["ScannerQRCode_CFG_BINARY"] = 4] = "ScannerQRCode_CFG_BINARY";
    ScannerQRCodeConfigType[ScannerQRCodeConfigType["ScannerQRCode_CFG_NUM"] = 5] = "ScannerQRCode_CFG_NUM";
    ScannerQRCodeConfigType[ScannerQRCodeConfigType["ScannerQRCode_CFG_MIN_LEN"] = 32] = "ScannerQRCode_CFG_MIN_LEN";
    ScannerQRCodeConfigType[ScannerQRCodeConfigType["ScannerQRCode_CFG_MAX_LEN"] = 33] = "ScannerQRCode_CFG_MAX_LEN";
    ScannerQRCodeConfigType[ScannerQRCodeConfigType["ScannerQRCode_CFG_UNCERTAINTY"] = 64] = "ScannerQRCode_CFG_UNCERTAINTY";
    ScannerQRCodeConfigType[ScannerQRCodeConfigType["ScannerQRCode_CFG_POSITION"] = 128] = "ScannerQRCode_CFG_POSITION";
    ScannerQRCodeConfigType[ScannerQRCodeConfigType["ScannerQRCode_CFG_TEST_INVERTED"] = 129] = "ScannerQRCode_CFG_TEST_INVERTED";
    ScannerQRCodeConfigType[ScannerQRCodeConfigType["ScannerQRCode_CFG_X_DENSITY"] = 256] = "ScannerQRCode_CFG_X_DENSITY";
    ScannerQRCodeConfigType[ScannerQRCodeConfigType["ScannerQRCode_CFG_Y_DENSITY"] = 257] = "ScannerQRCode_CFG_Y_DENSITY";
})(ScannerQRCodeConfigType || (ScannerQRCodeConfigType = {}));
var ScannerQRCodeOrientation;
(function (ScannerQRCodeOrientation) {
    ScannerQRCodeOrientation[ScannerQRCodeOrientation["ScannerQRCode_ORIENT_UNKNOWN"] = -1] = "ScannerQRCode_ORIENT_UNKNOWN";
    ScannerQRCodeOrientation[ScannerQRCodeOrientation["ScannerQRCode_ORIENT_UP"] = 0] = "ScannerQRCode_ORIENT_UP";
    ScannerQRCodeOrientation[ScannerQRCodeOrientation["ScannerQRCode_ORIENT_RIGHT"] = 1] = "ScannerQRCode_ORIENT_RIGHT";
    ScannerQRCodeOrientation[ScannerQRCodeOrientation["ScannerQRCode_ORIENT_DOWN"] = 2] = "ScannerQRCode_ORIENT_DOWN";
    ScannerQRCodeOrientation[ScannerQRCodeOrientation["ScannerQRCode_ORIENT_LEFT"] = 3] = "ScannerQRCode_ORIENT_LEFT";
})(ScannerQRCodeOrientation || (ScannerQRCodeOrientation = {}));
class ScannerQRCodeTypePointer {
    constructor(ptr, buf) {
        this.ptr = ptr;
        this.ptr32 = ptr >> 2;
        this.buf = buf;
        this.HEAP8 = new Int8Array(buf);
        this.HEAPU32 = new Uint32Array(buf);
        this.HEAP32 = new Int32Array(buf);
    }
}
class ScannerQRCodeSymbolPtr extends ScannerQRCodeTypePointer {
    get type() {
        return this.HEAPU32[this.ptr32];
    }
    get data() {
        const len = this.HEAPU32[this.ptr32 + 4];
        const ptr = this.HEAPU32[this.ptr32 + 5];
        return Int8Array.from(this.HEAP8.subarray(ptr, ptr + len));
    }
    get points() {
        const len = this.HEAPU32[this.ptr32 + 7];
        const ptr = this.HEAPU32[this.ptr32 + 8];
        const ptr32 = ptr >> 2;
        const res = [];
        for (let i = 0; i < len; ++i) {
            const x = this.HEAP32[ptr32 + i * 2];
            const y = this.HEAP32[ptr32 + i * 2 + 1];
            res.push({ x, y });
        }
        return res;
    }
    get orientation() {
        return this.HEAP32[this.ptr32 + 9];
    }
    get next() {
        const ptr = this.HEAPU32[this.ptr32 + 11];
        if (!ptr)
            return null;
        return new ScannerQRCodeSymbolPtr(ptr, this.buf);
    }
    get time() {
        return this.HEAPU32[this.ptr32 + 13];
    }
    get cacheCount() {
        return this.HEAP32[this.ptr32 + 14];
    }
    get quality() {
        return this.HEAP32[this.ptr32 + 15];
    }
}
class SymbolSetPtr extends ScannerQRCodeTypePointer {
    get head() {
        const ptr = this.HEAPU32[this.ptr32 + 2];
        if (!ptr)
            return null;
        return new ScannerQRCodeSymbolPtr(ptr, this.buf);
    }
}
class ScannerQRCodeResult {
    constructor(ptr) {
        this.value = '';
        this.type = ptr.type;
        this.typeName = ScannerQRCodeSymbolType[this.type];
        this.data = ptr.data;
        this.points = ptr.points;
        this.orientation = ptr.orientation;
        this.time = ptr.time;
        this.cacheCount = ptr.cacheCount;
        this.quality = ptr.quality;
    }
    static createSymbolsFromPtr(ptr, buf) {
        if (ptr == 0)
            return [];
        const set = new SymbolSetPtr(ptr, buf);
        let symbol = set.head;
        const res = [];
        while (symbol !== null) {
            res.push(new ScannerQRCodeResult(symbol));
            symbol = symbol.next;
        }
        return res;
    }
    decode(encoding) {
        const decoder = new TextDecoder(encoding);
        return decoder.decode(this.data);
    }
}

class NgxScannerQrcodeModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.3", ngImport: i0, type: NgxScannerQrcodeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.0.3", ngImport: i0, type: NgxScannerQrcodeModule, declarations: [NgxScannerQrcodeComponent], exports: [NgxScannerQrcodeComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.0.3", ngImport: i0, type: NgxScannerQrcodeModule, providers: [NgxScannerQrcodeService] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.3", ngImport: i0, type: NgxScannerQrcodeModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [NgxScannerQrcodeComponent],
                    exports: [NgxScannerQrcodeComponent],
                    providers: [NgxScannerQrcodeService],
                }]
        }] });

/*
 * Public API Surface of ngx-scanner-qrcode
 */

/**
 * Generated bundle index. Do not edit.
 */

export { LOAD_WASM, NgxScannerQrcodeComponent, NgxScannerQrcodeModule, NgxScannerQrcodeService, ScannerQRCodeConfigType, ScannerQRCodeOrientation, ScannerQRCodeResult, ScannerQRCodeSymbolType };
//# sourceMappingURL=ngx-scanner-qrcode.mjs.map
