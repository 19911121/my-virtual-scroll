import type * as CSS from 'csstype';
import type { ScrollRefCoordinates } from './scroll';
import type { ScrollDirectionValue } from './scroll';
interface StyleReturnType extends CSS.Properties<string | number>, CSS.PropertiesHyphen<string | number> {
    [index: string]: any;
}
interface WrapperStyleProp {
    transformFunctionName: 'translateX' | 'translateY';
    size: 'width' | 'height';
}
interface StyleWrapper {
    size: number;
    current: number;
}
declare type SizeDirection = Capitalize<'top' | 'right' | 'bottom' | 'left'>;
declare type SizeSingleStartName<K extends keyof CSSStyleDeclaration = keyof CSSStyleDeclaration> = K extends `${infer S}${SizeDirection}` ? S : never;
declare type SizePairNameGroup = ['border_width'];
declare type SizePairNameSplit<G extends SizePairNameGroup[number] = SizePairNameGroup[number]> = G extends `${infer S}_${infer E}` ? [S, E] : never;
declare type SizePairStartName<K extends keyof CSSStyleDeclaration = keyof CSSStyleDeclaration> = K extends `${infer S}${SizeDirection}${Capitalize<SizePairNameSplit[1]>}` ? S : never;
declare type SizePairEndName<S extends SizePairStartName, K extends keyof CSSStyleDeclaration = keyof CSSStyleDeclaration> = K extends `${S}${SizeDirection}${infer E}` ? E extends Capitalize<SizePairNameSplit[1]> ? Uncapitalize<E> : never : never;
declare const getStartDirectionName: (scrollRefCoordinates: ScrollRefCoordinates) => Capitalize<ScrollRefCoordinates[0]>;
declare const getStyleProp: (direction: ScrollDirectionValue) => WrapperStyleProp;
declare const getWrapperStyle: (wrapper: HTMLElement, styleProp: WrapperStyleProp, styleWrapper: StyleWrapper) => StyleReturnType;
declare const getResetWrapperStyles: (wrapper: HTMLElement, styleProp: WrapperStyleProp) => StyleReturnType;
declare const wrapperStyles: (computedStyle: CSSStyleDeclaration, scrollRefCoordinates: ScrollRefCoordinates) => {
    getStartEmptySize: (name: SizeSingleStartName) => number;
    getEndEmptySize: (name: SizeSingleStartName) => number;
    getEmptySizeSum: (name: SizeSingleStartName) => number;
    getPairStartEmptySize: (startName: SizePairStartName, endName: "width") => number;
    getPairEndEmptySize: (startName: SizePairStartName, endName: "width") => number;
    getPairEmptySizeSum: (startName: SizePairStartName, endName: "width") => number;
};
export { wrapperStyles, getStyleProp, getWrapperStyle, getResetWrapperStyles, getStartDirectionName, };
export type { StyleReturnType, StyleWrapper, };
