import { convertDOMRectToScrollRect } from "./scroll";
import { getWrapperMarginPaddingSum } from "./styles";
import type { MyVirtualScrollOptions } from "../my-virtual-scroll";
import type { ScrollRect, ScrollRefCoordinates } from "./scroll";

interface CreateRowRectFunctionOptions {
  container: ScrollRect;
  scrollRefCoordinates: ScrollRefCoordinates;
  size: MyVirtualScrollOptions['rowSize'];
  /**
   * 좌표 보정 값
   * 
   * row 생성될 때 스크롤이 존재하면 해당 x 및 y 값에서 wrapper 여백을 뺸 값
   */
  calibrationValue: number;
};

interface Options {
  /**
   * 위아래 추가로 보여 줄 Row 갯수
   *
   * 화면에 렌더링 된 갯수가 10개이고 bench가 1인 경우 총 12개, bench가 2인 경우 14개가 보임
   */
  bench: number;
};

/**
 * 사용자 데이터
 */
type Row<T = any> = T;


/**
 * bench 반환
 * 
 * @param options 
 */
const getBench = (options?: Options) => {
  const bench = options?.bench ?? 0;

  return bench;
};

/**
 * 고정 사이즈를 가진 row rect 생성
 * 
 * @param containerRect
 * @param rows
 * @param scrollRefCoordinates
 * @param size 
 * @param calibrationValue 
 */
const createRowRect = <R = Row> (rows: R[], containerRect: ScrollRect, wrapperMarginPaddingSum: number, scrollRefCoordinates: ScrollRefCoordinates, size: MyVirtualScrollOptions['rowSize']): ScrollRect[] => {
  const r = Array.from(rows).map((v, i) => {
    const [startCoordinateKey, endCoordinateKey] = scrollRefCoordinates;
    const start = wrapperMarginPaddingSum + (size * i);

    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      [startCoordinateKey]: start,
      [endCoordinateKey]: start + size,
    };
  });

  console.log(r);

  return r;
};

/**
 * 동적 사이즈를 사진 row Rect 생성
 * 
 * @param children 
 */
const createDynamicRowRect = (children: HTMLCollection, conatinerRect: ScrollRect, scrollRefCoordinates: ScrollRefCoordinates): ScrollRect[] => {
  const r = Array.from(children).map((v, i) => {
    const [startCoordinateKey, endCoordinateKey] = scrollRefCoordinates;
    const rect = v.getBoundingClientRect();

    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      [startCoordinateKey]: rect[startCoordinateKey] - conatinerRect[startCoordinateKey],
      [endCoordinateKey]: rect[endCoordinateKey] - conatinerRect[startCoordinateKey],
    };
  });

  return r;
};

/**
 * 화면에 노출 된 첫번째 Row 반환
 * 
 * @param rowRects 
 * @param containerRect 
 * @param scrollRefCoordinates 
 * @param scroll 
 * @param calibrationValue 
 */
const getFirstRow = (rowRects: ScrollRect[], containerRect: ScrollRect, scrollRefCoordinates: ScrollRefCoordinates, scroll: number): number => {
  const [, endCoordinateKey] = scrollRefCoordinates;
  const firstRow = rowRects.findIndex((v, i) => scroll < v[endCoordinateKey]);

  return Math.max(0, firstRow);
}

/**
 * 화면에 노출 할 첫번쨰 bench row
 *
 * @param firstRow 화면에 노출 된 첫번째 Row
 */
const getFirstBenchRow = (firstRow: number, options?: Options): number => Math.max(0, firstRow - getBench(options));

/**
 * 화면에 표시 할 before bench rows 반환
 *
 * @param firstRow 화면에 표시 할 첫번쨰 Row
 */
const getBeforeBenchRows = (rowRects: ScrollRect[], firstRow: number, options?: Options): ScrollRect[] => {
  return rowRects.slice(getFirstBenchRow(firstRow, options), firstRow);
}

/**
 * 화면에 노출 된 마지막 Row 반환
 * 
 * @param rowRects 
 * @param containerRect 
 * @param scrollRefCoordinates 
 * @param calibrationValue 
 * @param scroll 
 * @param fr 
 */
const getLastRow = (rowRects: ScrollRect[], containerRect: ScrollRect, scrollRefCoordinates: ScrollRefCoordinates, scroll: number, fr?: number): number => {
  const [startCoordinateKey, endCoordinateKey] = scrollRefCoordinates;
  const containerSize = containerRect[endCoordinateKey] - containerRect[startCoordinateKey];
  const firstRow = fr ?? getFirstRow(rowRects, containerRect, scrollRefCoordinates, scroll);
  let lastRow = rowRects.slice(firstRow, rowRects.length).findIndex(v => scroll + containerSize <= v[startCoordinateKey]);

  lastRow = -1 === lastRow ? rowRects.length : firstRow + lastRow;

  return Math.min(rowRects.length, lastRow);
}

/**
 * 화면에 표시 할 마지막 bench row
 * 
 * @param lastRow 
 */
const getLastBenchRow = (lastRow: number, rowCount: number, options?: Options): number => Math.min(rowCount, lastRow + getBench(options));

/**
 * 화면에 표시 할 bench rows (width | height) 합
 * 
 * @param scroll 현재 스크롤 위치
 * @param firstRow 첫번째 Row
 */
const getBeforeBenchSize = (rowRects: ScrollRect[], containerRect: ScrollRect, wrapperMarginPaddingSum: number, scrollRefCoordinates: ScrollRefCoordinates, scroll: number, firstRow: number, options?: Options): number => {
  const [startCoordinateKey] = scrollRefCoordinates;
  const firstRowRect = rowRects[firstRow];
  const beforeBenchRowsRect = getBeforeBenchRows(rowRects, firstRow, options);
  const beforeBenchFirstRowRect = beforeBenchRowsRect[0];

  /** 첫번쨰 Row 가려진 사이즈 */
  const firstRowHideSize = scroll > wrapperMarginPaddingSum
    ? scroll - firstRowRect[startCoordinateKey]
    : 0;

  return beforeBenchRowsRect.length
    ? firstRowHideSize + firstRowRect[startCoordinateKey] - beforeBenchFirstRowRect[startCoordinateKey]
    : firstRowHideSize;
}

export {
  createRowRect,
  createDynamicRowRect,
  getFirstRow,
  getFirstBenchRow,
  getLastRow,
  getLastBenchRow,
  getBeforeBenchSize,
};

export type {
  Row,
};