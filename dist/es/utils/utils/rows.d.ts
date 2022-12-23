import type { MyVirtualScrollOptions } from "../my-virtual-scroll";
import type { ScrollRect, ScrollRefCoordinates } from "./scroll";
type Row<T = any> = T;
interface Options {
    rowSize: number;
    bench: number;
}
declare const createRowRect: (rowCount: number, scrollRefCoordinates: ScrollRefCoordinates, wrapperStartEmptySize: number, size: MyVirtualScrollOptions['rowSize']) => ScrollRect[];
declare const createDynamicRowRect: (children: HTMLCollection, conatinerRect: ScrollRect, scrollRefCoordinates: ScrollRefCoordinates, calibrationScroll: number) => ScrollRect[];
declare const getFirstRow: (rowRects: ScrollRect[], scrollRefCoordinates: ScrollRefCoordinates, scroll: number) => number;
declare const getFirstBenchRow: (firstRow: number, bench?: Options['bench']) => number;
declare const getLastRow: (rowRects: ScrollRect[], containerRect: ScrollRect, scrollRefCoordinates: ScrollRefCoordinates, scroll: number, fr?: number) => number;
declare const getLastBenchRow: (lastRow: number, rowCount: number, bench?: Options['bench']) => number;
declare const getBeforeBenchSize: (rowRects: ScrollRect[], wrapperStartEmptySize: number, scrollRefCoordinates: ScrollRefCoordinates, scroll: number, firstRow: number, bench?: Options['bench']) => number;
export { createRowRect, createDynamicRowRect, getFirstRow, getFirstBenchRow, getLastRow, getLastBenchRow, getBeforeBenchSize, };
export type { Row, Options as RowOptions, };
