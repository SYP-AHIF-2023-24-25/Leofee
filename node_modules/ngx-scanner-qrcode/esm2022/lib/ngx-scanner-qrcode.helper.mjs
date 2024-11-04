import { AsyncSubject } from "rxjs";
import { BEEP, CANVAS_STYLES_LAYER, CANVAS_STYLES_TEXT, CONFIG_DEFAULT } from "./ngx-scanner-qrcode.default";
/**
 * WASM_READY
 * @returns
 */
export var WASM_READY = () => ('zbarWasm' in window);
/**
 * OVERRIDES
 * @param variableKey
 * @param config
 * @param defaultConfig
 * @returns
 */
export const OVERRIDES = (variableKey, config, defaultConfig) => {
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
export const AS_COMPLETE = (as, data, error) => {
    error ? as.error(error) : as.next(data);
    as.complete();
};
/**
 * PLAY_AUDIO
 * @param isPlay
 * @returns
 */
export const PLAY_AUDIO = (isPlay = false) => {
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
export const DRAW_RESULT_APPEND_CHILD = (code, oriCanvas, elTarget, canvasStyles) => {
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
export const DRAW_RESULT_ON_CANVAS = (code, cvs, canvasStyles) => {
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
export const READ_AS_DATA_URL = (file, configs) => {
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
export const CANVAS_TO_BLOB = (canvas, type) => {
    return new Promise((resolve, reject) => canvas.toBlob(blob => resolve(blob), type));
};
/**
 * Convert blob to file
 * @param theBlob
 * @param fileName
 * @returns
 */
export const BLOB_TO_FILE = (theBlob, fileName) => {
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
export const FILES_TO_SCAN = (files = [], configs, percentage, quality, as = new AsyncSubject()) => {
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
export const FILL_TEXT_MULTI_LINE = (ctx, text, x, y) => {
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
export const COMPRESS_IMAGE_FILE = (files = [], percentage = 100, quality = 100) => {
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
export const REMOVE_RESULT_PANEL = (element) => {
    // clear text result and tooltip
    Object.assign([], element.childNodes).forEach(el => element.removeChild(el));
};
/**
 * RESET_CANVAS
 * @param canvas
 */
export const RESET_CANVAS = (canvas) => {
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
export const UPDATE_WIDTH_HEIGHT_VIDEO = (video, canvas) => {
    video.style.width = canvas.offsetWidth + 'px';
    video.style.height = canvas.offsetHeight + 'px';
};
/**
 * VIBRATE
 * @param time
 */
export const VIBRATE = (time = 300) => {
    time && IS_MOBILE() && window?.navigator?.vibrate(time);
};
/**
 * IS_MOBILE
 * @returns
 */
export const IS_MOBILE = () => {
    const vendor = navigator.userAgent || navigator['vendor'] || window['opera'];
    const phone = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i;
    const version = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i;
    const isSafari = /^((?!chrome|android).)*safari/i;
    return !!(phone.test(vendor) || version.test(vendor.substr(0, 4))) && !isSafari.test(vendor);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXNjYW5uZXItcXJjb2RlLmhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1zY2FubmVyLXFyY29kZS9zcmMvbGliL25neC1zY2FubmVyLXFyY29kZS5oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNwQyxPQUFPLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBSTdHOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxJQUFJLFVBQVUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsQ0FBQztBQUVyRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxXQUFtQixFQUFFLE1BQVcsRUFBRSxhQUFrQixFQUFFLEVBQUU7SUFDaEYsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDckQsS0FBSyxNQUFNLEdBQUcsSUFBSSxhQUFhLEVBQUU7WUFDL0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUcsYUFBcUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BILE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztT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LEVBQUU7SUFDNUIsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUssTUFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RGLE1BQU0sS0FBSyxHQUFHLHFWQUFxVixDQUFDO0lBQ3BXLE1BQU0sT0FBTyxHQUFHLDJoREFBMmhELENBQUM7SUFDNWlELE1BQU0sUUFBUSxHQUFHLGdDQUFnQyxDQUFDO0lBQ2xELE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0YsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXN5bmNTdWJqZWN0IH0gZnJvbSBcInJ4anNcIjtcclxuaW1wb3J0IHsgQkVFUCwgQ0FOVkFTX1NUWUxFU19MQVlFUiwgQ0FOVkFTX1NUWUxFU19URVhULCBDT05GSUdfREVGQVVMVCB9IGZyb20gXCIuL25neC1zY2FubmVyLXFyY29kZS5kZWZhdWx0XCI7XHJcbmltcG9ydCB7IFNjYW5uZXJRUkNvZGVDb25maWcsIFNjYW5uZXJRUkNvZGVTZWxlY3RlZEZpbGVzIH0gZnJvbSBcIi4vbmd4LXNjYW5uZXItcXJjb2RlLm9wdGlvbnNcIjtcclxuZGVjbGFyZSB2YXIgemJhcldhc206IGFueTtcclxuXHJcbi8qKlxyXG4gKiBXQVNNX1JFQURZXHJcbiAqIEByZXR1cm5zIFxyXG4gKi9cclxuZXhwb3J0IHZhciBXQVNNX1JFQURZID0gKCkgPT4gKCd6YmFyV2FzbScgaW4gd2luZG93KTtcclxuXHJcbi8qKlxyXG4gKiBPVkVSUklERVNcclxuICogQHBhcmFtIHZhcmlhYmxlS2V5IFxyXG4gKiBAcGFyYW0gY29uZmlnIFxyXG4gKiBAcGFyYW0gZGVmYXVsdENvbmZpZyBcclxuICogQHJldHVybnMgXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgT1ZFUlJJREVTID0gKHZhcmlhYmxlS2V5OiBzdHJpbmcsIGNvbmZpZzogYW55LCBkZWZhdWx0Q29uZmlnOiBhbnkpID0+IHtcclxuICBpZiAoY29uZmlnICYmIE9iamVjdC5rZXlzKGNvbmZpZ1t2YXJpYWJsZUtleV0pLmxlbmd0aCkge1xyXG4gICAgZm9yIChjb25zdCBrZXkgaW4gZGVmYXVsdENvbmZpZykge1xyXG4gICAgICBjb25zdCBjbG9uZURlZXAgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHsgLi4uY29uZmlnW3ZhcmlhYmxlS2V5XSwgLi4ueyBba2V5XTogKGRlZmF1bHRDb25maWcgYXMgYW55KVtrZXldIH0gfSkpO1xyXG4gICAgICBjb25maWdbdmFyaWFibGVLZXldID0gY29uZmlnW3ZhcmlhYmxlS2V5XS5oYXNPd25Qcm9wZXJ0eShrZXkpID8gY29uZmlnW3ZhcmlhYmxlS2V5XSA6IGNsb25lRGVlcDtcclxuICAgIH1cclxuICAgIHJldHVybiBjb25maWdbdmFyaWFibGVLZXldO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gZGVmYXVsdENvbmZpZztcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogQVNfQ09NUExFVEVcclxuICogQHBhcmFtIGFzIFxyXG4gKiBAcGFyYW0gZGF0YSBcclxuICogQHBhcmFtIGVycm9yIFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IEFTX0NPTVBMRVRFID0gKGFzOiBBc3luY1N1YmplY3Q8YW55PiwgZGF0YTogYW55LCBlcnJvcj86IGFueSkgPT4ge1xyXG4gIGVycm9yID8gYXMuZXJyb3IoZXJyb3IpIDogYXMubmV4dChkYXRhKTtcclxuICBhcy5jb21wbGV0ZSgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFBMQVlfQVVESU9cclxuICogQHBhcmFtIGlzUGxheSBcclxuICogQHJldHVybnMgXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgUExBWV9BVURJTyA9IChpc1BsYXk6IGJvb2xlYW4gPSBmYWxzZSkgPT4ge1xyXG4gIGlmIChpc1BsYXkgPT09IGZhbHNlKSByZXR1cm47XHJcbiAgY29uc3QgYXVkaW8gPSBuZXcgQXVkaW8oQkVFUCk7XHJcbiAgLy8gd2hlbiB0aGUgc291bmQgaGFzIGJlZW4gbG9hZGVkLCBleGVjdXRlIHlvdXIgY29kZVxyXG4gIGF1ZGlvLm9uY2FucGxheXRocm91Z2ggPSAoKSA9PiB7XHJcbiAgICBjb25zdCBwcm9taXNlID0gYXVkaW8ucGxheSgpO1xyXG4gICAgaWYgKHByb21pc2UpIHtcclxuICAgICAgcHJvbWlzZS5jYXRjaCgoZSkgPT4ge1xyXG4gICAgICAgIGlmIChlLm5hbWUgPT09IFwiTm90QWxsb3dlZEVycm9yXCIgfHwgZS5uYW1lID09PSBcIk5vdFN1cHBvcnRlZEVycm9yXCIpIHtcclxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGUubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERSQVdfUkVTVUxUX0FQUEVORF9DSElMRFxyXG4gKiBAcGFyYW0gY29kZSBcclxuICogQHBhcmFtIG9yaUNhbnZhcyBcclxuICogQHBhcmFtIGVsVGFyZ2V0IFxyXG4gKiBAcGFyYW0gY2FudmFzU3R5bGVzIFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERSQVdfUkVTVUxUX0FQUEVORF9DSElMRCA9IChjb2RlOiBhbnlbXSwgb3JpQ2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgZWxUYXJnZXQ6IEhUTUxDYW52YXNFbGVtZW50IHwgSFRNTERpdkVsZW1lbnQsIGNhbnZhc1N0eWxlczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEW10pID0+IHtcclxuICBsZXQgd2lkdGhab29tO1xyXG4gIGxldCBoZWlnaHRab29tO1xyXG4gIGxldCBvcmlXaWR0aCA9IG9yaUNhbnZhcy53aWR0aDtcclxuICBsZXQgb3JpSGVpZ2h0ID0gb3JpQ2FudmFzLmhlaWdodDtcclxuICBsZXQgb3JpV0hSYXRpbyA9IG9yaVdpZHRoIC8gb3JpSGVpZ2h0O1xyXG4gIGxldCBpbWdXaWR0aCA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUob3JpQ2FudmFzKS53aWR0aCk7XHJcbiAgbGV0IGltZ0hlaWdodCA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUob3JpQ2FudmFzKS5oZWlnaHQpO1xyXG4gIGxldCBpbWdXSFJhdGlvID0gaW1nV2lkdGggLyBpbWdIZWlnaHQ7XHJcbiAgZWxUYXJnZXQuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gIGlmIChvcmlXSFJhdGlvID4gaW1nV0hSYXRpbykge1xyXG4gICAgd2lkdGhab29tID0gaW1nV2lkdGggLyBvcmlXaWR0aDtcclxuICAgIGhlaWdodFpvb20gPSBpbWdXaWR0aCAvIG9yaVdIUmF0aW8gLyBvcmlIZWlnaHQ7XHJcbiAgfSBlbHNlIHtcclxuICAgIGhlaWdodFpvb20gPSBpbWdIZWlnaHQgLyBvcmlIZWlnaHQ7XHJcbiAgICB3aWR0aFpvb20gPSAoaW1nSGVpZ2h0ICogb3JpV0hSYXRpbykgLyBvcmlXaWR0aDtcclxuICB9XHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY29kZS5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgX2NvZGUgPSBjb2RlW2ldO1xyXG4gICAgLy8gTmV3IGNhbnZhc1xyXG4gICAgbGV0IGN2cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICBsZXQgY3R4ID0gY3ZzLmdldENvbnRleHQoJzJkJywgeyB3aWxsUmVhZEZyZXF1ZW50bHk6IHRydWUgfSkgYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG4gICAgbGV0IGxvYzogYW55ID0ge307XHJcbiAgICBsZXQgWDogYW55ID0gW107XHJcbiAgICBsZXQgWTogYW55ID0gW107XHJcbiAgICBsZXQgZm9udFNpemUgPSAwO1xyXG4gICAgbGV0IHN2Z1NpemUgPSAwO1xyXG5cclxuICAgIGxldCBudW0gPSBjYW52YXNTdHlsZXMubGVuZ3RoID09PSAyICYmIGNhbnZhc1N0eWxlc1sxXT8uZm9udD8ucmVwbGFjZSgvW14wLTldL2csICcnKTtcclxuICAgIGlmIChudW0gJiYgL1swLTldL2cudGVzdChudW0pKSB7XHJcbiAgICAgIGZvbnRTaXplID0gcGFyc2VGbG9hdChudW0pO1xyXG4gICAgICBzdmdTaXplID0gKHdpZHRoWm9vbSB8fCAxKSAqIGZvbnRTaXplO1xyXG4gICAgICBpZiAoTnVtYmVyLmlzTmFOKHN2Z1NpemUpKSB7XHJcbiAgICAgICAgc3ZnU2l6ZSA9IGZvbnRTaXplO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUG9pbnQgeCx5XHJcbiAgICBjb25zdCBwb2ludHMgPSBfY29kZS5wb2ludHM7XHJcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvaW50cy5sZW5ndGg7IGorKykge1xyXG4gICAgICBjb25zdCB4aiA9IHBvaW50cz8uW2pdPy54ID8/IDA7XHJcbiAgICAgIGNvbnN0IHlqID0gcG9pbnRzPy5bal0/LnkgPz8gMDtcclxuICAgICAgbG9jW2B4JHtqICsgMX1gXSA9IHhqO1xyXG4gICAgICBsb2NbYHkke2ogKyAxfWBdID0geWo7XHJcbiAgICAgIFgucHVzaCh4aik7XHJcbiAgICAgIFkucHVzaCh5aik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWluIG1heFxyXG4gICAgbGV0IG1heFggPSBNYXRoLm1heCguLi5YKTtcclxuICAgIGxldCBtaW5YID0gTWF0aC5taW4oLi4uWCk7XHJcbiAgICBsZXQgbWF4WSA9IE1hdGgubWF4KC4uLlkpO1xyXG4gICAgbGV0IG1pblkgPSBNYXRoLm1pbiguLi5ZKTtcclxuXHJcbiAgICAvLyBBZGQgY2xhc3NcclxuICAgIGN2cy5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ3FyY29kZS1wb2x5Z29uJyk7XHJcblxyXG4gICAgLy8gU2l6ZSB3aXRoIHNjcmVlbiB6b29tXHJcbiAgICBpZiAob3JpV0hSYXRpbyA+IGltZ1dIUmF0aW8pIHtcclxuICAgICAgY3ZzLnN0eWxlLnRvcCA9IG1pblkgKiBoZWlnaHRab29tICsgKGltZ0hlaWdodCAtIGltZ1dpZHRoIC8gb3JpV0hSYXRpbykgKiAwLjUgKyBcInB4XCI7XHJcbiAgICAgIGN2cy5zdHlsZS5sZWZ0ID0gbWluWCAqIHdpZHRoWm9vbSArIFwicHhcIjtcclxuICAgICAgY3ZzLndpZHRoID0gKG1heFggLSBtaW5YKSAqIHdpZHRoWm9vbTtcclxuICAgICAgY3ZzLmhlaWdodCA9IChtYXhZIC0gbWluWSkgKiB3aWR0aFpvb207XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjdnMuc3R5bGUudG9wID0gbWluWSAqIGhlaWdodFpvb20gKyBcInB4XCI7XHJcbiAgICAgIGN2cy5zdHlsZS5sZWZ0ID0gbWluWCAqIHdpZHRoWm9vbSArIChpbWdXaWR0aCAtIGltZ0hlaWdodCAqIG9yaVdIUmF0aW8pICogMC41ICsgXCJweFwiO1xyXG4gICAgICBjdnMud2lkdGggPSAobWF4WCAtIG1pblgpICogaGVpZ2h0Wm9vbTtcclxuICAgICAgY3ZzLmhlaWdodCA9IChtYXhZIC0gbWluWSkgKiBoZWlnaHRab29tO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFN0eWxlIGZvciBjYW52YXNcclxuICAgIGZvciAoY29uc3Qga2V5IGluIGNhbnZhc1N0eWxlc1swXSkge1xyXG4gICAgICAoY3R4IGFzIGFueSlba2V5XSA9IChjYW52YXNTdHlsZXNbMF0gYXMgYW55KVtrZXldO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHBvbHlnb24gW3gseSwgeCx5LCB4LHkuLi4uLl07XHJcbiAgICBjb25zdCBwb2x5Z29uID0gW107XHJcbiAgICBmb3IgKGxldCBrID0gMDsgayA8IFgubGVuZ3RoOyBrKyspIHtcclxuICAgICAgcG9seWdvbi5wdXNoKChsb2NbYHgke2sgKyAxfWBdIC0gbWluWCkgKiBoZWlnaHRab29tKTtcclxuICAgICAgcG9seWdvbi5wdXNoKChsb2NbYHkke2sgKyAxfWBdIC0gbWluWSkgKiB3aWR0aFpvb20pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENvcHkgYXJyYXlcclxuICAgIGNvbnN0IHNoYXBlID0gcG9seWdvbi5zbGljZSgwKSBhcyBhbnk7XHJcblxyXG4gICAgLy8gRHJhdyBwb2x5Z29uXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubW92ZVRvKHNoYXBlLnNoaWZ0KCksIHNoYXBlLnNoaWZ0KCkpO1xyXG4gICAgd2hpbGUgKHNoYXBlLmxlbmd0aCkge1xyXG4gICAgICBjdHgubGluZVRvKHNoYXBlLnNoaWZ0KCksIHNoYXBlLnNoaWZ0KCkpOyAvL3gseVxyXG4gICAgfVxyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICBpZiAoZm9udFNpemUpIHtcclxuICAgICAgLy8gVG9vbHRpcCByZXN1bHRcclxuICAgICAgY29uc3QgcXJjb2RlVG9vbHRpcFRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgcXJjb2RlVG9vbHRpcFRlbXAuc2V0QXR0cmlidXRlKCdjbGFzcycsICdxcmNvZGUtdG9vbHRpcC10ZW1wJyk7XHJcbiAgICAgIHFyY29kZVRvb2x0aXBUZW1wLmlubmVyVGV4dCA9IF9jb2RlLnZhbHVlO1xyXG4gICAgICBxcmNvZGVUb29sdGlwVGVtcC5zdHlsZS5tYXhXaWR0aCA9ICgob3JpV2lkdGggPiB3aW5kb3cuaW5uZXJXaWR0aCkgPyB3aW5kb3cuaW5uZXJXaWR0aCAqIDAuOSA6IG9yaVdpZHRoKSArIFwicHhcIjtcclxuICAgICAgcXJjb2RlVG9vbHRpcFRlbXAuc3R5bGUuYm9yZGVyUmFkaXVzID0gYGNsYW1wKDFweCwgJHsod2lkdGhab29tICogZm9udFNpemUpIC0gMTB9cHgsIDNweClgO1xyXG4gICAgICBxcmNvZGVUb29sdGlwVGVtcC5zdHlsZS5wYWRkaW5nQmxvY2sgPSBgY2xhbXAoMXB4LCAkeyh3aWR0aFpvb20gKiBmb250U2l6ZSkgLSAxMH1weCwgM3B4KWA7IC8vIHRvcCAtIGJvdHRvbVxyXG4gICAgICBxcmNvZGVUb29sdGlwVGVtcC5zdHlsZS5wYWRkaW5nSW5saW5lID0gYGNsYW1wKDIuNXB4LCAkeyh3aWR0aFpvb20gKiBmb250U2l6ZSkgLSA2fXB4LCAxMHB4KWA7IC8vIGxlZnQgLSByaWdodFxyXG4gICAgICBjb25zdCB4bWxTdHJpbmcgPSBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIke3N2Z1NpemV9XCIgaGVpZ2h0PVwiJHtzdmdTaXplfVwiIHZpZXdCb3g9XCIwIDAgNTEyIDUxMlwiPjxyZWN0IHg9XCIxMjhcIiB5PVwiMTI4XCIgd2lkdGg9XCIzMzZcIiBoZWlnaHQ9XCIzMzZcIiByeD1cIjU3XCIgcnk9XCI1N1wiPjwvcmVjdD48cGF0aCBkPVwiTTM4My41LDEyOGwuNS0yNGE1Ni4xNiw1Ni4xNiwwLDAsMC01Ni01NkgxMTJhNjQuMTksNjQuMTksMCwwLDAtNjQsNjRWMzI4YTU2LjE2LDU2LjE2LDAsMCwwLDU2LDU2aDI0XCI+PC9wYXRoPjwvc3ZnPmA7XHJcbiAgICAgIGNvbnN0IHhtbERvbSA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoeG1sU3RyaW5nLCAnYXBwbGljYXRpb24veG1sJyk7XHJcbiAgICAgIGNvbnN0IHN2Z0RvbSA9IHFyY29kZVRvb2x0aXBUZW1wLm93bmVyRG9jdW1lbnQuaW1wb3J0Tm9kZSh4bWxEb20uZG9jdW1lbnRFbGVtZW50LCB0cnVlKTtcclxuICAgICAgc3ZnRG9tLnN0eWxlLm1hcmdpbkxlZnQgPSBgY2xhbXAoMXB4LCAkeyh3aWR0aFpvb20gKiBmb250U2l6ZSkgLSAxMH1weCwgM3B4KWA7IC8vIGxlZnQgLSByaWdodFxyXG4gICAgICBxcmNvZGVUb29sdGlwVGVtcC5hcHBlbmRDaGlsZChzdmdEb20pO1xyXG4gICAgICBzdmdEb20uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHdpbmRvdy5uYXZpZ2F0b3JbJ2NsaXBib2FyZCddLndyaXRlVGV4dChfY29kZS52YWx1ZSkpO1xyXG4gICAgICBxcmNvZGVUb29sdGlwVGVtcC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gd2luZG93Lm5hdmlnYXRvclsnY2xpcGJvYXJkJ10ud3JpdGVUZXh0KF9jb2RlLnZhbHVlKSk7XHJcblxyXG4gICAgICAvLyBUb29sdGlwIGJveFxyXG4gICAgICBjb25zdCBxcmNvZGVUb29sdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIHFyY29kZVRvb2x0aXAuc2V0QXR0cmlidXRlKCdjbGFzcycsICdxcmNvZGUtdG9vbHRpcCcpO1xyXG4gICAgICBxcmNvZGVUb29sdGlwLmFwcGVuZENoaWxkKHFyY29kZVRvb2x0aXBUZW1wKTtcclxuICAgICAgaGVpZ2h0Wm9vbSA9IGltZ0hlaWdodCAvIG9yaUhlaWdodDtcclxuICAgICAgd2lkdGhab29tID0gKGltZ0hlaWdodCAqIG9yaVdIUmF0aW8pIC8gb3JpV2lkdGg7XHJcbiAgICAgIHFyY29kZVRvb2x0aXAuc3R5bGUuZm9udFNpemUgPSB3aWR0aFpvb20gKiBmb250U2l6ZSArICdweCc7XHJcbiAgICAgIHFyY29kZVRvb2x0aXAuc3R5bGUudG9wID0gbWluWSAqIGhlaWdodFpvb20gKyBcInB4XCI7XHJcbiAgICAgIHFyY29kZVRvb2x0aXAuc3R5bGUubGVmdCA9IG1pblggKiB3aWR0aFpvb20gKyAoaW1nV2lkdGggLSBpbWdIZWlnaHQgKiBvcmlXSFJhdGlvKSAqIDAuNSArIFwicHhcIjtcclxuICAgICAgcXJjb2RlVG9vbHRpcC5zdHlsZS53aWR0aCA9IChtYXhYIC0gbWluWCkgKiBoZWlnaHRab29tICsgXCJweFwiO1xyXG4gICAgICBxcmNvZGVUb29sdGlwLnN0eWxlLmhlaWdodCA9IChtYXhZIC0gbWluWSkgKiBoZWlnaHRab29tICsgXCJweFwiO1xyXG5cclxuICAgICAgLy8gUmVzdWx0IHRleHRcclxuICAgICAgY29uc3QgcmVzdWx0VGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgcmVzdWx0VGV4dC5pbm5lclRleHQgPSBfY29kZS52YWx1ZTtcclxuXHJcbiAgICAgIC8vIFNldCBwb3NpdGlvbiByZXN1bHQgdGV4dFxyXG4gICAgICByZXN1bHRUZXh0LnN0eWxlLnRvcCA9IG1pblkgKiBoZWlnaHRab29tICsgKC0yMCAqIGhlaWdodFpvb20pICsgXCJweFwiO1xyXG4gICAgICByZXN1bHRUZXh0LnN0eWxlLmxlZnQgPSBtaW5YICogd2lkdGhab29tICsgKGltZ1dpZHRoIC0gaW1nSGVpZ2h0ICogb3JpV0hSYXRpbykgKiAwLjUgKyBcInB4XCI7XHJcblxyXG4gICAgICAvLyBTdHlsZSB0ZXh0XHJcbiAgICAgIGNvbnN0IGZmID0gY2FudmFzU3R5bGVzWzFdPy5mb250Py5zcGxpdCgnICcpPy5bMV07XHJcbiAgICAgIHJlc3VsdFRleHQuc3R5bGUuZm9udEZhbWlseSA9IGZmO1xyXG4gICAgICByZXN1bHRUZXh0LnN0eWxlLmZvbnRTaXplID0gd2lkdGhab29tICogZm9udFNpemUgKyAncHgnO1xyXG4gICAgICByZXN1bHRUZXh0LnN0eWxlLmNvbG9yID0gY2FudmFzU3R5bGVzPy5bMV0/LmZpbGxTdHlsZSBhcyBzdHJpbmc7XHJcblxyXG4gICAgICBlbFRhcmdldD8uYXBwZW5kQ2hpbGQocXJjb2RlVG9vbHRpcCk7XHJcbiAgICAgIGVsVGFyZ2V0Py5hcHBlbmRDaGlsZChyZXN1bHRUZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBlbFRhcmdldD8uYXBwZW5kQ2hpbGQoY3ZzKTtcclxuICB9O1xyXG5cclxufVxyXG5cclxuLyoqXHJcbiAqIERSQVdfUkVTVUxUX09OX0NBTlZBU1xyXG4gKiBAcGFyYW0gY29kZSBcclxuICogQHBhcmFtIGN2cyBcclxuICogQHBhcmFtIGNhbnZhc1N0eWxlcyBcclxuICovXHJcbmV4cG9ydCBjb25zdCBEUkFXX1JFU1VMVF9PTl9DQU5WQVMgPSAoY29kZTogYW55W10sIGN2czogSFRNTENhbnZhc0VsZW1lbnQsIGNhbnZhc1N0eWxlczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEW10pID0+IHtcclxuICBsZXQgY3R4ID0gY3ZzLmdldENvbnRleHQoJzJkJywgeyB3aWxsUmVhZEZyZXF1ZW50bHk6IHRydWUgfSkgYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvZGUubGVuZ3RoOyBpKyspIHtcclxuICAgIGNvbnN0IF9jb2RlID0gY29kZVtpXTtcclxuICAgIGxldCBsb2M6IGFueSA9IHt9O1xyXG4gICAgbGV0IFg6IGFueSA9IFtdO1xyXG4gICAgbGV0IFk6IGFueSA9IFtdO1xyXG4gICAgbGV0IGZvbnRTaXplID0gMDtcclxuXHJcbiAgICBjb25zdCBmcyA9IGNhbnZhc1N0eWxlc1sxXT8uZm9udD8uc3BsaXQoJyAnKT8uWzBdO1xyXG4gICAgbGV0IG51bSA9IGZzPy5yZXBsYWNlKC9bXjAtOV0vZywgJycpO1xyXG4gICAgaWYgKG51bSAmJiAvWzAtOV0vZy50ZXN0KG51bSkpIHtcclxuICAgICAgZm9udFNpemUgPSBwYXJzZUZsb2F0KG51bSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUG9pbnQgeCx5XHJcbiAgICBjb25zdCBwb2ludHMgPSBfY29kZS5wb2ludHM7XHJcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvaW50cy5sZW5ndGg7IGorKykge1xyXG4gICAgICBjb25zdCB4aiA9IHBvaW50cz8uW2pdPy54ID8/IDA7XHJcbiAgICAgIGNvbnN0IHlqID0gcG9pbnRzPy5bal0/LnkgPz8gMDtcclxuICAgICAgbG9jW2B4JHtqICsgMX1gXSA9IHhqO1xyXG4gICAgICBsb2NbYHkke2ogKyAxfWBdID0geWo7XHJcbiAgICAgIFgucHVzaCh4aik7XHJcbiAgICAgIFkucHVzaCh5aik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWluIG1heFxyXG4gICAgbGV0IG1pblggPSBNYXRoLm1pbiguLi5YKTtcclxuICAgIGxldCBtaW5ZID0gTWF0aC5taW4oLi4uWSk7XHJcblxyXG4gICAgY29uc3Qgc3R5bGVMYXllciA9ICgpID0+IHtcclxuICAgICAgZm9yIChjb25zdCBrZXkgaW4gY2FudmFzU3R5bGVzWzBdKSB7XHJcbiAgICAgICAgKGN0eCBhcyBhbnkpW2tleV0gPSAoY2FudmFzU3R5bGVzWzBdIGFzIGFueSlba2V5XTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcG9seWdvbiBbeCx5LCB4LHksIHgseS4uLi4uXTtcclxuICAgICAgY29uc3QgcG9seWdvbiA9IFtdO1xyXG4gICAgICBmb3IgKGxldCBrID0gMDsgayA8IFgubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICBwb2x5Z29uLnB1c2gobG9jW2B4JHtrICsgMX1gXSk7XHJcbiAgICAgICAgcG9seWdvbi5wdXNoKGxvY1tgeSR7ayArIDF9YF0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDb3B5IGFycmF5XHJcbiAgICAgIGNvbnN0IHNoYXBlID0gcG9seWdvbi5zbGljZSgwKSBhcyBhbnk7XHJcblxyXG4gICAgICAvLyBEcmF3IHBvbHlnb25cclxuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICBjdHgubW92ZVRvKHNoYXBlLnNoaWZ0KCksIHNoYXBlLnNoaWZ0KCkpO1xyXG4gICAgICB3aGlsZSAoc2hhcGUubGVuZ3RoKSB7XHJcbiAgICAgICAgY3R4LmxpbmVUbyhzaGFwZS5zaGlmdCgpLCBzaGFwZS5zaGlmdCgpKTsgLy94LHlcclxuICAgICAgfVxyXG4gICAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgY3ZzMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgY29uc3Qgc3R5bGVUZXh0ID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBmZiA9IGNhbnZhc1N0eWxlc1sxXT8uZm9udD8uc3BsaXQoJyAnKT8uWzFdO1xyXG4gICAgICBjdnMyLmhlaWdodCA9IGN2cy5oZWlnaHQ7XHJcbiAgICAgIGN2czIud2lkdGggPSBjdnMud2lkdGg7XHJcbiAgICAgIGxldCBjdHgyID0gY3ZzMi5nZXRDb250ZXh0KCcyZCcsIHsgd2lsbFJlYWRGcmVxdWVudGx5OiB0cnVlIH0pIGFzIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuICAgICAgY3R4Mi5mb250ID0gZm9udFNpemUgKyBgcHggYCArIGZmO1xyXG4gICAgICBmb3IgKGNvbnN0IGtleSBpbiBjYW52YXNTdHlsZXNbMV0pIHtcclxuICAgICAgICAoY3R4MiBhcyBhbnkpW2tleV0gPSAoY2FudmFzU3R5bGVzWzFdIGFzIGFueSlba2V5XTtcclxuICAgICAgfVxyXG4gICAgICBGSUxMX1RFWFRfTVVMVElfTElORShjdHgyLCBfY29kZS52YWx1ZSwgbWluWCwgbWluWSAtIDUpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0eWxlTGF5ZXIoKTtcclxuICAgIHN0eWxlVGV4dCgpO1xyXG4gICAgLy8gTWVyZ2UgY3ZzMiBpbnRvIGN2c1xyXG4gICAgY3R4LmRyYXdJbWFnZShjdnMyLCAwLCAwKTtcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogUkVBRF9BU19EQVRBX1VSTFxyXG4gKiBAcGFyYW0gZmlsZSBcclxuICogQHBhcmFtIGNvbmZpZ3MgXHJcbiAqIEByZXR1cm5zIFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFJFQURfQVNfREFUQV9VUkwgPSAoZmlsZTogRmlsZSwgY29uZmlnczogU2Nhbm5lclFSQ29kZUNvbmZpZyk6IFByb21pc2U8U2Nhbm5lclFSQ29kZVNlbGVjdGVkRmlsZXM+ID0+IHtcclxuICAvKiogb3ZlcnJpZGVzICoqL1xyXG4gIGxldCBkZWNvZGUgPSBjb25maWdzPy5kZWNvZGUgPz8gQ09ORklHX0RFRkFVTFQuZGVjb2RlO1xyXG4gIGxldCBjYW52YXNTdHlsZXMgPSBjb25maWdzPy5jYW52YXNTdHlsZXM/Lmxlbmd0aCA9PT0gMiA/IGNvbmZpZ3M/LmNhbnZhc1N0eWxlcyA6IFtDQU5WQVNfU1RZTEVTX0xBWUVSLCBDQU5WQVNfU1RZTEVTX1RFWFRdO1xyXG4gIGxldCBpc0JlZXAgPSBjb25maWdzPy5pc0JlZXAgPz8gQ09ORklHX0RFRkFVTFQuaXNCZWVwO1xyXG5cclxuICAvKiogZHJhd0ltYWdlICoqL1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgIGZpbGVSZWFkZXIub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBvYmplY3RGaWxlID0ge1xyXG4gICAgICAgIG5hbWU6IGZpbGUubmFtZSxcclxuICAgICAgICBmaWxlOiBmaWxlLFxyXG4gICAgICAgIHVybDogVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKVxyXG4gICAgICB9O1xyXG4gICAgICAvLyBTZXQgdGhlIHNyYyBvZiB0aGlzIEltYWdlIG9iamVjdC5cclxuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgLy8gU2V0dGluZyBjcm9zcyBvcmlnaW4gdmFsdWUgdG8gYW5vbnltb3VzXHJcbiAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSgnY3Jvc3NPcmlnaW4nLCAnYW5vbnltb3VzJyk7XHJcbiAgICAgIC8vIFdoZW4gb3VyIGltYWdlIGhhcyBsb2FkZWQuXHJcbiAgICAgIGltYWdlLm9ubG9hZCA9IGFzeW5jICgpID0+IHtcclxuICAgICAgICAvLyBHZXQgdGhlIGNhbnZhcyBlbGVtZW50IGJ5IHVzaW5nIHRoZSBnZXRFbGVtZW50QnlJZCBtZXRob2QuXHJcbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgLy8gSFRNTEltYWdlRWxlbWVudCBzaXplXHJcbiAgICAgICAgY2FudmFzLndpZHRoID0gaW1hZ2UubmF0dXJhbFdpZHRoIHx8IGltYWdlLndpZHRoO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWFnZS5uYXR1cmFsSGVpZ2h0IHx8IGltYWdlLmhlaWdodDtcclxuICAgICAgICAvLyBHZXQgYSAyRCBkcmF3aW5nIGNvbnRleHQgZm9yIHRoZSBjYW52YXMuXHJcbiAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJykgYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG4gICAgICAgIC8vIERyYXcgaW1hZ2VcclxuICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIC8vIERhdGEgaW1hZ2VcclxuICAgICAgICBjb25zdCBpbWFnZURhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgLy8gU2Nhbm5lclxyXG4gICAgICAgIGlmIChXQVNNX1JFQURZKCkpIHtcclxuICAgICAgICAgIGNvbnN0IGNvZGUgPSBhd2FpdCB6YmFyV2FzbS5zY2FuSW1hZ2VEYXRhKGltYWdlRGF0YSk7XHJcbiAgICAgICAgICBpZiAoY29kZT8ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIC8vIERlY29kZVxyXG4gICAgICAgICAgICBjb2RlLmZvckVhY2goKHM6IGFueSkgPT4gcy52YWx1ZSA9IHMuZGVjb2RlKGRlY29kZT8udG9Mb2NhbGVMb3dlckNhc2UoKSkpO1xyXG5cclxuICAgICAgICAgICAgLy8gT3ZlcmxheVxyXG4gICAgICAgICAgICBEUkFXX1JFU1VMVF9PTl9DQU5WQVMoY29kZSwgY2FudmFzLCBjYW52YXNTdHlsZXMpO1xyXG5cclxuICAgICAgICAgICAgLy8gRW1pdCBvYmplY3RcclxuICAgICAgICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IENBTlZBU19UT19CTE9CKGNhbnZhcyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XHJcbiAgICAgICAgICAgIGNvbnN0IGJsb2JUb0ZpbGUgPSAodGhlQmxvYjogYW55LCBmaWxlTmFtZTogc3RyaW5nKSA9PiBuZXcgRmlsZShbdGhlQmxvYl0sIGZpbGVOYW1lLCB7IGxhc3RNb2RpZmllZDogbmV3IERhdGUoKS5nZXRUaW1lKCksIHR5cGU6IHRoZUJsb2IudHlwZSB9KTtcclxuICAgICAgICAgICAgcmVzb2x2ZShPYmplY3QuYXNzaWduKHt9LCBvYmplY3RGaWxlLCB7IGRhdGE6IGNvZGUsIHVybDogdXJsLCBjYW52YXM6IGNhbnZhcywgZmlsZTogYmxvYlRvRmlsZShibG9iLCBvYmplY3RGaWxlLm5hbWUpIH0pKTtcclxuXHJcbiAgICAgICAgICAgIFBMQVlfQVVESU8oaXNCZWVwKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUoT2JqZWN0LmFzc2lnbih7fSwgb2JqZWN0RmlsZSwgeyBkYXRhOiBjb2RlLCBjYW52YXM6IGNhbnZhcyB9KSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICAvLyBTZXQgc3JjXHJcbiAgICAgIGltYWdlLnNyYyA9IG9iamVjdEZpbGUudXJsO1xyXG4gICAgfVxyXG4gICAgZmlsZVJlYWRlci5vbmVycm9yID0gKGVycm9yOiBhbnkpID0+IHJlamVjdChlcnJvcik7XHJcbiAgICBmaWxlUmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XHJcbiAgfSlcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgY2FudmFzIHRvIGJsb2JcclxuICogY2FudmFzLnRvQmxvYigoYmxvYikgPT4geyAuLiB9LCAnaW1hZ2UvanBlZycsIDAuOTUpOyAvLyBKUEVHIGF0IDk1JSBxdWFsaXR5XHJcbiAqIEBwYXJhbSBjYW52YXMgXHJcbiAqIEBwYXJhbSB0eXBlIFxyXG4gKiBAcmV0dXJucyBcclxuICovXHJcbmV4cG9ydCBjb25zdCBDQU5WQVNfVE9fQkxPQiA9IChjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCB0eXBlPzogc3RyaW5nKTogUHJvbWlzZTxhbnk+ID0+IHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gY2FudmFzLnRvQmxvYihibG9iID0+IHJlc29sdmUoYmxvYiksIHR5cGUpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgYmxvYiB0byBmaWxlXHJcbiAqIEBwYXJhbSB0aGVCbG9iIFxyXG4gKiBAcGFyYW0gZmlsZU5hbWUgXHJcbiAqIEByZXR1cm5zIFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IEJMT0JfVE9fRklMRSA9ICh0aGVCbG9iOiBhbnksIGZpbGVOYW1lOiBzdHJpbmcpOiBGaWxlID0+IHtcclxuICByZXR1cm4gbmV3IEZpbGUoW3RoZUJsb2JdLCBmaWxlTmFtZSwgeyBsYXN0TW9kaWZpZWQ6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLCB0eXBlOiB0aGVCbG9iLnR5cGUgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGSUxFU19UT19TQ0FOXHJcbiAqIEBwYXJhbSBmaWxlcyBcclxuICogQHBhcmFtIGNvbmZpZ3MgXHJcbiAqIEBwYXJhbSBwZXJjZW50YWdlIFxyXG4gKiBAcGFyYW0gcXVhbGl0eSBcclxuICogQHBhcmFtIGFzIFxyXG4gKiBAcmV0dXJucyBcclxuICovXHJcbmV4cG9ydCBjb25zdCBGSUxFU19UT19TQ0FOID0gKGZpbGVzOiBGaWxlW10gPSBbXSwgY29uZmlnczogU2Nhbm5lclFSQ29kZUNvbmZpZywgcGVyY2VudGFnZT86IG51bWJlciwgcXVhbGl0eT86IG51bWJlciwgYXMgPSBuZXcgQXN5bmNTdWJqZWN0PFNjYW5uZXJRUkNvZGVTZWxlY3RlZEZpbGVzW10+KCkpOiBBc3luY1N1YmplY3Q8U2Nhbm5lclFSQ29kZVNlbGVjdGVkRmlsZXNbXT4gPT4ge1xyXG4gIENPTVBSRVNTX0lNQUdFX0ZJTEUoZmlsZXMsIHBlcmNlbnRhZ2UsIHF1YWxpdHkpLnRoZW4oKF9maWxlczogRmlsZVtdKSA9PiB7XHJcbiAgICBQcm9taXNlLmFsbChPYmplY3QuYXNzaWduKFtdLCBfZmlsZXMpLm1hcCgobTogRmlsZSkgPT4gUkVBRF9BU19EQVRBX1VSTChtLCBjb25maWdzKSkpLnRoZW4oKGltZzogU2Nhbm5lclFSQ29kZVNlbGVjdGVkRmlsZXNbXSkgPT4ge1xyXG4gICAgICBBU19DT01QTEVURShhcywgaW1nKTtcclxuICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiBBU19DT01QTEVURShhcywgbnVsbCwgZXJyb3IpKTtcclxuICB9KTtcclxuICByZXR1cm4gYXM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGSUxMX1RFWFRfTVVMVElfTElORVxyXG4gKiBAcGFyYW0gY3R4IFxyXG4gKiBAcGFyYW0gdGV4dCBcclxuICogQHBhcmFtIHggXHJcbiAqIEBwYXJhbSB5IFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IEZJTExfVEVYVF9NVUxUSV9MSU5FID0gKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0ZXh0OiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyKSA9PiB7XHJcbiAgbGV0IGxpbmVIZWlnaHQgPSBjdHgubWVhc3VyZVRleHQoXCJNXCIpLndpZHRoICogMS4yO1xyXG4gIGxldCBsaW5lcyA9IHRleHQuc3BsaXQoXCJcXG5cIik7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkge1xyXG4gICAgY3R4LmZpbGxUZXh0KGxpbmVzW2ldLCB4LCB5KTtcclxuICAgIGN0eC5zdHJva2VUZXh0KGxpbmVzW2ldLCB4LCB5KTtcclxuICAgIHkgKz0gbGluZUhlaWdodDtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDT01QUkVTU19JTUFHRV9GSUxFXHJcbiAqIEBwYXJhbSBmaWxlcyBcclxuICogQHBhcmFtIHBlcmNlbnRhZ2UgXHJcbiAqIEBwYXJhbSBxdWFsaXR5IFxyXG4gKiBAcmV0dXJucyBcclxuICovXHJcbmV4cG9ydCBjb25zdCBDT01QUkVTU19JTUFHRV9GSUxFID0gKGZpbGVzOiBGaWxlW10gPSBbXSwgcGVyY2VudGFnZSA9IDEwMCwgcXVhbGl0eSA9IDEwMCkgPT4ge1xyXG4gIGlmIChmaWxlcy5sZW5ndGggJiYgKHBlcmNlbnRhZ2UgPCAxMDAgfHwgcXVhbGl0eSA8IDEwMCkpIHtcclxuICAgIC8vIEhhdmUgZmlsZXNcclxuICAgIGNvbnN0IHJlc2l6ZWRGaWxlczogRmlsZVtdID0gW107XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8RmlsZVtdPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xyXG4gICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKCkgYXMgSFRNTEltYWdlRWxlbWVudDtcclxuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQ6IGFueSkge1xyXG4gICAgICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJykgYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG4gICAgICAgICAgICBjb25zdCBuZXdXaWR0aCA9IE1hdGgucm91bmQoaW1hZ2Uud2lkdGggKiAocGVyY2VudGFnZSAvIDEwMCkpO1xyXG4gICAgICAgICAgICBjb25zdCBuZXdIZWlnaHQgPSBNYXRoLnJvdW5kKGltYWdlLmhlaWdodCAqIChwZXJjZW50YWdlIC8gMTAwKSk7XHJcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IG5ld1dpZHRoO1xyXG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gbmV3SGVpZ2h0O1xyXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwLCBuZXdXaWR0aCwgbmV3SGVpZ2h0KTtcclxuICAgICAgICAgICAgY2FudmFzLnRvQmxvYigoYmxvYjogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgcmVzaXplZEZpbGUgPSBuZXcgRmlsZShbYmxvYl0sIGZpbGUubmFtZSwgeyB0eXBlOiBmaWxlLnR5cGUgfSk7XHJcbiAgICAgICAgICAgICAgcmVzaXplZEZpbGVzLnB1c2gocmVzaXplZEZpbGUpO1xyXG4gICAgICAgICAgICAgIGlmIChmaWxlcy5sZW5ndGggPT09IHJlc2l6ZWRGaWxlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzaXplZEZpbGVzKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIGZpbGUudHlwZSwgcXVhbGl0eSAvIDEwMCk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgaW1hZ2Uuc3JjID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJlYWRlci5vbmVycm9yID0gKGVycm9yOiBhbnkpID0+IHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBObyBmaWxlcyBzZWxlY3RlZFxyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZTxGaWxlW10+KGZpbGVzKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSRU1PVkVfUkVTVUxUX1BBTkVMXHJcbiAqIEBwYXJhbSBlbGVtZW50IFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFJFTU9WRV9SRVNVTFRfUEFORUwgPSAoZWxlbWVudDogSFRNTEVsZW1lbnQpID0+IHtcclxuICAvLyBjbGVhciB0ZXh0IHJlc3VsdCBhbmQgdG9vbHRpcFxyXG4gIE9iamVjdC5hc3NpZ24oW10sIGVsZW1lbnQuY2hpbGROb2RlcykuZm9yRWFjaChlbCA9PiBlbGVtZW50LnJlbW92ZUNoaWxkKGVsKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSRVNFVF9DQU5WQVNcclxuICogQHBhcmFtIGNhbnZhcyBcclxuICovXHJcbmV4cG9ydCBjb25zdCBSRVNFVF9DQU5WQVMgPSAoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCkgPT4ge1xyXG4gIC8vIHJlc2V0IGNhbnZhc1xyXG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnLCB7IHdpbGxSZWFkRnJlcXVlbnRseTogdHJ1ZSB9KSBhcyBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XHJcbiAgLy8gY2xlYXIgZnJhbWUgd2hlbiByZWxvb3BcclxuICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG59XHJcblxyXG4vKipcclxuICogVVBEQVRFX1dJRFRIX0hFSUdIVF9WSURFT1xyXG4gKiBAcGFyYW0gdmlkZW8gXHJcbiAqIEBwYXJhbSBjYW52YXMgXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVVBEQVRFX1dJRFRIX0hFSUdIVF9WSURFTyA9ICh2aWRlbzogSFRNTFZpZGVvRWxlbWVudCwgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IHZvaWQgPT4ge1xyXG4gIHZpZGVvLnN0eWxlLndpZHRoID0gY2FudmFzLm9mZnNldFdpZHRoICsgJ3B4JztcclxuICB2aWRlby5zdHlsZS5oZWlnaHQgPSBjYW52YXMub2Zmc2V0SGVpZ2h0ICsgJ3B4JztcclxufVxyXG5cclxuLyoqXHJcbiAqIFZJQlJBVEVcclxuICogQHBhcmFtIHRpbWUgXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVklCUkFURSA9ICh0aW1lOiBudW1iZXIgPSAzMDApID0+IHtcclxuICB0aW1lICYmIElTX01PQklMRSgpICYmIHdpbmRvdz8ubmF2aWdhdG9yPy52aWJyYXRlKHRpbWUpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIElTX01PQklMRVxyXG4gKiBAcmV0dXJucyBcclxuICovXHJcbmV4cG9ydCBjb25zdCBJU19NT0JJTEUgPSAoKSA9PiB7XHJcbiAgY29uc3QgdmVuZG9yID0gbmF2aWdhdG9yLnVzZXJBZ2VudCB8fCBuYXZpZ2F0b3JbJ3ZlbmRvciddIHx8ICh3aW5kb3cgYXMgYW55KVsnb3BlcmEnXTtcclxuICBjb25zdCBwaG9uZSA9IC8oYW5kcm9pZHxiYlxcZCt8bWVlZ28pLittb2JpbGV8YXZhbnRnb3xiYWRhXFwvfGJsYWNrYmVycnl8YmxhemVyfGNvbXBhbHxlbGFpbmV8ZmVubmVjfGhpcHRvcHxpZW1vYmlsZXxpcChob25lfG9kKXxpcmlzfGtpbmRsZXxsZ2UgfG1hZW1vfG1pZHB8bW1wfG1vYmlsZS4rZmlyZWZveHxuZXRmcm9udHxvcGVyYSBtKG9ifGluKWl8cGFsbSggb3MpP3xwaG9uZXxwKGl4aXxyZSlcXC98cGx1Y2tlcnxwb2NrZXR8cHNwfHNlcmllcyg0fDYpMHxzeW1iaWFufHRyZW98dXBcXC4oYnJvd3NlcnxsaW5rKXx2b2RhZm9uZXx3YXB8d2luZG93cyBjZXx4ZGF8eGlpbm98YW5kcm9pZHxpcGFkfHBsYXlib29rfHNpbGsvaTtcclxuICBjb25zdCB2ZXJzaW9uID0gLzEyMDd8NjMxMHw2NTkwfDNnc298NHRocHw1MFsxLTZdaXw3NzBzfDgwMnN8YSB3YXxhYmFjfGFjKGVyfG9vfHMtKXxhaShrb3xybil8YWwoYXZ8Y2F8Y28pfGFtb2l8YW4oZXh8bnl8eXcpfGFwdHV8YXIoY2h8Z28pfGFzKHRlfHVzKXxhdHR3fGF1KGRpfC1tfHIgfHMgKXxhdmFufGJlKGNrfGxsfG5xKXxiaShsYnxyZCl8YmwoYWN8YXopfGJyKGV8dil3fGJ1bWJ8YnctKG58dSl8YzU1XFwvfGNhcGl8Y2N3YXxjZG0tfGNlbGx8Y2h0bXxjbGRjfGNtZC18Y28obXB8bmQpfGNyYXd8ZGEoaXR8bGx8bmcpfGRidGV8ZGMtc3xkZXZpfGRpY2F8ZG1vYnxkbyhjfHApb3xkcygxMnwtZCl8ZWwoNDl8YWkpfGVtKGwyfHVsKXxlcihpY3xrMCl8ZXNsOHxleihbNC03XTB8b3N8d2F8emUpfGZldGN8Zmx5KC18Xyl8ZzEgdXxnNTYwfGdlbmV8Z2YtNXxnLW1vfGdvKFxcLnd8b2QpfGdyKGFkfHVuKXxoYWllfGhjaXR8aGQtKG18cHx0KXxoZWktfGhpKHB0fHRhKXxocCggaXxpcCl8aHMtY3xodChjKC18IHxffGF8Z3xwfHN8dCl8dHApfGh1KGF3fHRjKXxpLSgyMHxnb3xtYSl8aTIzMHxpYWMoIHwtfFxcLyl8aWJyb3xpZGVhfGlnMDF8aWtvbXxpbTFrfGlubm98aXBhcXxpcmlzfGphKHR8dilhfGpicm98amVtdXxqaWdzfGtkZGl8a2VqaXxrZ3QoIHxcXC8pfGtsb258a3B0IHxrd2MtfGt5byhjfGspfGxlKG5vfHhpKXxsZyggZ3xcXC8oa3xsfHUpfDUwfDU0fC1bYS13XSl8bGlid3xseW54fG0xLXd8bTNnYXxtNTBcXC98bWEodGV8dWl8eG8pfG1jKDAxfDIxfGNhKXxtLWNyfG1lKHJjfHJpKXxtaShvOHxvYXx0cyl8bW1lZnxtbygwMXwwMnxiaXxkZXxkb3x0KC18IHxvfHYpfHp6KXxtdCg1MHxwMXx2ICl8bXdicHxteXdhfG4xMFswLTJdfG4yMFsyLTNdfG4zMCgwfDIpfG41MCgwfDJ8NSl8bjcoMCgwfDEpfDEwKXxuZSgoY3xtKS18b258dGZ8d2Z8d2d8d3QpfG5vayg2fGkpfG56cGh8bzJpbXxvcCh0aXx3dil8b3Jhbnxvd2cxfHA4MDB8cGFuKGF8ZHx0KXxwZHhnfHBnKDEzfC0oWzEtOF18YykpfHBoaWx8cGlyZXxwbChheXx1Yyl8cG4tMnxwbyhja3xydHxzZSl8cHJveHxwc2lvfHB0LWd8cWEtYXxxYygwN3wxMnwyMXwzMnw2MHwtWzItN118aS0pfHF0ZWt8cjM4MHxyNjAwfHJha3N8cmltOXxybyh2ZXx6byl8czU1XFwvfHNhKGdlfG1hfG1tfG1zfG55fHZhKXxzYygwMXxoLXxvb3xwLSl8c2RrXFwvfHNlKGMoLXwwfDEpfDQ3fG1jfG5kfHJpKXxzZ2gtfHNoYXJ8c2llKC18bSl8c2stMHxzbCg0NXxpZCl8c20oYWx8YXJ8YjN8aXR8dDUpfHNvKGZ0fG55KXxzcCgwMXxoLXx2LXx2ICl8c3koMDF8bWIpfHQyKDE4fDUwKXx0NigwMHwxMHwxOCl8dGEoZ3R8bGspfHRjbC18dGRnLXx0ZWwoaXxtKXx0aW0tfHQtbW98dG8ocGx8c2gpfHRzKDcwfG0tfG0zfG01KXx0eC05fHVwKFxcLmJ8ZzF8c2kpfHV0c3R8djQwMHx2NzUwfHZlcml8dmkocmd8dGUpfHZrKDQwfDVbMC0zXXwtdil8dm00MHx2b2RhfHZ1bGN8dngoNTJ8NTN8NjB8NjF8NzB8ODB8ODF8ODN8ODV8OTgpfHczYygtfCApfHdlYmN8d2hpdHx3aShnIHxuY3xudyl8d21sYnx3b251fHg3MDB8eWFzLXx5b3VyfHpldG98enRlLS9pO1xyXG4gIGNvbnN0IGlzU2FmYXJpID0gL14oKD8hY2hyb21lfGFuZHJvaWQpLikqc2FmYXJpL2k7XHJcbiAgcmV0dXJuICEhKHBob25lLnRlc3QodmVuZG9yKSB8fCB2ZXJzaW9uLnRlc3QodmVuZG9yLnN1YnN0cigwLCA0KSkpICYmICFpc1NhZmFyaS50ZXN0KHZlbmRvcik7XHJcbn07XHJcbiJdfQ==