interface Options {
    direction: ScrollDirectionValue;
}
declare type ScrollRect = Pick<DOMRect, 'top' | 'right' | 'bottom' | 'left' | 'width' | 'height' | 'x' | 'y'>;
declare type ScrollCallBack = (e: Event) => void;
declare type ScrollRefCoordinates = ['left', 'right'] | ['top', 'bottom'];
declare const ScrollDirection: {
    readonly Horizontal: "horizontal";
    readonly Vertical: "vertical";
};
declare type ScrollDirectionKey = keyof typeof ScrollDirection;
declare type ScrollDirectionValue = typeof ScrollDirection[ScrollDirectionKey];
declare const convertDOMRectToScrollRect: (domrect: DOMRect) => ScrollRect;
declare const getContainerCurrentScroll: (container: HTMLElement, direction: Options['direction']) => number;
export { ScrollDirection, getContainerCurrentScroll, convertDOMRectToScrollRect, };
export type { ScrollRect, ScrollCallBack, ScrollDirectionKey, ScrollDirectionValue, ScrollRefCoordinates, Options as ScrollOptions, };
