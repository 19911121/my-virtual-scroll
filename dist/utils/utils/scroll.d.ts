interface Options {
    direction: ScrollDirectionValue;
}
type ScrollRect = Pick<DOMRect, 'top' | 'right' | 'bottom' | 'left' | 'width' | 'height' | 'x' | 'y'>;
type ScrollCallBack = (e: Event) => void;
type ScrollRefCoordinates = ['left', 'right'] | ['top', 'bottom'];
declare const ScrollDirection: {
    readonly Horizontal: "horizontal";
    readonly Vertical: "vertical";
};
type ScrollDirectionKey = keyof typeof ScrollDirection;
type ScrollDirectionValue = typeof ScrollDirection[ScrollDirectionKey];
declare const convertDOMRectToScrollRect: (domrect: DOMRect) => ScrollRect;
declare const getContainerCurrentScroll: (container: HTMLElement, direction: Options['direction']) => number;
export { ScrollDirection, getContainerCurrentScroll, convertDOMRectToScrollRect, };
export type { ScrollRect, ScrollCallBack, ScrollDirectionKey, ScrollDirectionValue, ScrollRefCoordinates, Options as ScrollOptions, };
