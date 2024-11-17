import { AsyncSubject } from "rxjs";
import { Renderer2 } from "@angular/core";
/**
 * LOAD_WASM
 * @param as
 * @param renderer
 * @returns
 */
export declare const LOAD_WASM: (as?: AsyncSubject<boolean | any>, renderer?: Renderer2) => AsyncSubject<boolean | any>;
