import type { ScrollOptions, ScrollCallBack, ScrollRect } from "./utils/scroll";
import type { StyleReturnType } from "./utils/styles";
import type { Row, RowOptions } from "./utils/rows";
interface Options<R = Row> extends RowOptions, ScrollOptions {
    rows?: Row<R>[];
    autoStyles: boolean;
    rowHeight: number;
}
declare type UpdateRowReturnType = {
    rendered: () => void;
};
declare class MyVirtualScroll<R = Row> {
    private rows;
    private options;
    private refContainer;
    private containerRect;
    private sizeAreaElement;
    private refWrapper;
    private wrapperStyles;
    private wrapperPosition;
    private renderRows;
    private renderFirstRow;
    private renderLastRow;
    private rowRects;
    private referenceCoordinates;
    private bindHandleContainerScroll;
    private callback;
    constructor(container: HTMLElement, wrapper: HTMLElement, options?: Partial<Options<R>>);
    private init;
    private initContainer;
    private getCurrentScroll;
    private addContainerEvent;
    private removeContainerEvent;
    private initWrapper;
    getWrapperStyle(): StyleReturnType;
    private updateWrapperStyles;
    private initRenderRows;
    private initDynamicRenderRows;
    private initRender;
    private initSizeArea;
    getRenderRows(): R[];
    getRenderFirstRow(): number;
    getRenderLastRow(): number;
    addContainerScrollEvent(cb: ScrollCallBack): void;
    removeContainerScrollEvent(): void;
    updateRows(rows: Row<R>[]): UpdateRowReturnType;
    moveVerticalScrollToRow(row: number): void;
    moveScrollToRow(row: number): void;
    private execScroll;
    private handleContainerScroll;
}
export default MyVirtualScroll;
export type { Row as MyVirtualScrollRow, Options as MyVirtualScrollOptions, ScrollRect as MyVirtualScrollScrollRect, ScrollCallBack as MyVirtualScrollScrollCallBack, UpdateRowReturnType as MyVirtualScrollUpdateRow, StyleReturnType as MyVirtualScrollStyle, };
