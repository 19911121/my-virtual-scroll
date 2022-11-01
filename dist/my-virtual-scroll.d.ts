import type * as CSS from 'csstype';
declare type Row<T = any> = T;
interface Options<R = any> {
    rows?: Row<R>[];
    rowHeight: number;
    bench: number;
    direction: 'vertical';
    autoStyles: boolean;
}
declare type ScrollRect = Pick<DOMRect, 'top' | 'right' | 'bottom' | 'left' | 'width' | 'height' | 'x' | 'y'>;
declare type ScrollCallBack = (e: Event) => void;
declare type UpdateRowReturnType = {
    rendered: () => void;
};
interface StyleReturnType extends CSS.Properties<string | number>, CSS.PropertiesHyphen<string | number> {
    [index: string]: any;
}
declare class MyVirtualScroll<R = any> {
    private options;
    private rows;
    private refContainer;
    private containerRect;
    private containerStyles;
    private refWrapper;
    private wrapperStyles;
    private wrapperWidth;
    private wrapperPaddingLeft;
    private wrapperHeight;
    private wrapperPaddingTop;
    private renderRows;
    private renderFirstRow;
    private renderLastRow;
    private rowRects;
    private calibrationScroll;
    private referenceCoordinates;
    private bindHandleContainerScroll;
    private callback;
    constructor(container: HTMLElement, wrapper: HTMLElement, options?: Partial<Options<R>>);
    private init;
    private hasVerticalScroll;
    private convertDOMRectToScrollRect;
    private initContainer;
    private getContainerHeight;
    private getContainerWidth;
    private addContainerEvent;
    private removeContainerEvent;
    private initWrapper;
    private getWrapperMarginTop;
    private getWrapperMarginBottom;
    private getWrapperMarginVertical;
    private getWrapperPaddingTop;
    private getWrapperPaddingBottom;
    private getWrapperPaddingVertical;
    getWrapperStyle(): StyleReturnType;
    private resetWrapperStyles;
    private updateWrapperStyles;
    private getBeforeBenchWidth;
    private getBeforeBenchHeight;
    private initDynamicRenderRows;
    private initRenderRows;
    private initRender;
    getRenderRows(): R[];
    getRenderFirstRow(): number;
    getRenderLastRow(): number;
    private getFirstRow;
    private getFirstBenchRow;
    private getBeforeBenchRows;
    private getLastRow;
    addRenderRows(children: HTMLCollection): void;
    updateRows(rows: Row<R>[]): UpdateRowReturnType;
    private getLastBenchRow;
    private execVerticalScroll;
    moveVerticalScrollToRow(row: number): void;
    addContainerScrollEvent(cb: ScrollCallBack): void;
    removeContainerScrollEvent(): void;
    private handleContainerScroll;
}
export default MyVirtualScroll;
export type { Row as MyVirtualScrollRow, Options as MyVirtualScrollOptions, ScrollRect as MyVirtualScrollScrollRect, ScrollCallBack as MyVirtualScrollScrollCallBack, UpdateRowReturnType as MyVirtualScrollUpdateRow, StyleReturnType as MyVirtualScrollStyle, };
