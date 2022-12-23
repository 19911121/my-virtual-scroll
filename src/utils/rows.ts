import type { MyVirtualScrollOptions } from "../my-virtual-scroll";
import type { ScrollRect, ScrollRefCoordinates } from "./scroll";

/**
 * 사용자 데이터
 */
type Row<T = any> = T;

/**
 * row 옵션
 */
interface Options {
  /**
   * Row 넓이 or 높이 값
   */
  rowSize: number;

  /**
   * 위아래 추가로 보여 줄 Row 갯수
   *
   * 화면에 렌더링 된 갯수가 10개이고 bench가 1인 경우 총 12개, bench가 2인 경우 14개가 보임
   */
  bench: number;
};

/**
 * 고정 사이즈를 가진 row rect 생성
 * 
 * @param rowCount row 개수
 * @param scrollRefCoordinates {@link ScrollRefCoordinates}
 * @param wrapperStartEmptySize 빈 시작 영역 사이즈
 * @param size row 사이즈
 */
const createRowRect = (rowCount: number, scrollRefCoordinates: ScrollRefCoordinates, wrapperStartEmptySize: number, size: MyVirtualScrollOptions['rowSize']): ScrollRect[] => {
  return Array.from({ length: rowCount }, (v, i) => {
    const [startCoordinateKey, endCoordinateKey] = scrollRefCoordinates;
    const start = wrapperStartEmptySize + (size * i);

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
};

/**
 * 동적 사이즈를 사진 row Rect 생성
 * 
 * @param children 자식 elements
 * @param conatinerRect {@link ScrollRect}
 * @param scrollRefCoordinates {@link ScrollRefCoordinates}
 * @param calibrationScroll 스크롤 보정 영역
 */
const createDynamicRowRect = (children: HTMLCollection, conatinerRect: ScrollRect, scrollRefCoordinates: ScrollRefCoordinates, calibrationScroll: number): ScrollRect[] => {
  return Array.from(children).map(v => {
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
      [startCoordinateKey]: rect[startCoordinateKey] - conatinerRect[startCoordinateKey] + calibrationScroll,
      [endCoordinateKey]: rect[endCoordinateKey] - conatinerRect[startCoordinateKey] + calibrationScroll,
    };
  });
};

/**
 * 화면에 노출 된 첫번째 Row 반환
 * 
 * @param rowRects {@link ScrollRect}
 * @param scrollRefCoordinates {@link ScrollRefCoordinates}
 * @param scroll 현재 스크롤 위치
 */
const getFirstRow = (rowRects: ScrollRect[], scrollRefCoordinates: ScrollRefCoordinates, scroll: number): number => {
  const [, endCoordinateKey] = scrollRefCoordinates;
  const firstRow = rowRects.findIndex((v, i) => {
    return scroll < v[endCoordinateKey];
  });

  return Math.max(0, firstRow);
}

/**
 * 화면에 노출 할 첫번쨰 bench row
 * 
 * @param firstRow 화면에 노출 된 첫번째 Row
 * @param bench 추가로 보여 줄 Row (가려진 영역)
 */
const getFirstBenchRow = (firstRow: number, bench: Options['bench'] = 0): number => Math.max(0, firstRow - bench);

/**
 * 화면에 표시 할 before bench rows 반환
 * 
 * @param rowRects {@link ScrollRect}
 * @param firstRow 화면에 노출 된 첫번째 Row
 * @param bench 추가로 보여 줄 Row (가려진 영역)
 */
const getBeforeBenchRows = (rowRects: ScrollRect[], firstRow: number, bench: Options['bench'] = 0): ScrollRect[] => {
  return rowRects.slice(getFirstBenchRow(firstRow, bench), firstRow);
}

/**
 * 화면에 노출 된 마지막 Row 반환
 * 
 * @param rowRects {@link ScrollRect}
 * @param containerRect {@link ScrollRect}
 * @param scrollRefCoordinates {@link ScrollRefCoordinates}
 * @param scroll 현재 스크롤 위치
 * @param fr 화면에 노출 된 첫번째 Row
 */
const getLastRow = (rowRects: ScrollRect[], containerRect: ScrollRect, scrollRefCoordinates: ScrollRefCoordinates, scroll: number, fr?: number): number => {
  const [startCoordinateKey, endCoordinateKey] = scrollRefCoordinates;
  const containerSize = containerRect[endCoordinateKey] - containerRect[startCoordinateKey];
  const firstRow = fr ?? getFirstRow(rowRects, scrollRefCoordinates, scroll);
  let lastRow = rowRects.slice(firstRow, rowRects.length).findIndex(v => scroll + containerSize <= v[startCoordinateKey]);

  lastRow = -1 === lastRow ? rowRects.length : firstRow + lastRow;

  return Math.min(rowRects.length, lastRow);
}

/**
 * 화면에 표시 할 마지막 bench row
 * 
 * @param lastRow 화면에 노출 된 마지막 Row
 * @param rowCount Row 개수
 * @param bench 추가로 보여 줄 Row (가려진 영역)
 */
const getLastBenchRow = (lastRow: number, rowCount: number, bench: Options['bench'] = 0): number => Math.min(rowCount, lastRow + bench);

/**
 * 화면에 표시 할 bench rows (width | height) 합
 * 
 * @param rowRects {@link ScrollRect}
 * @param wrapperStartEmptySize 빈 시작 영역 사이즈
 * @param scrollRefCoordinates {@link ScrollRefCoordinates}
 * @param scroll 현재 스크롤 위치
 * @param firstRow 첫번째 Row
 * @param bench 추가로 보여 줄 Row (가려진 영역)
 * @returns 
 */
const getBeforeBenchSize = (rowRects: ScrollRect[], wrapperStartEmptySize: number, scrollRefCoordinates: ScrollRefCoordinates, scroll: number, firstRow: number, bench: Options['bench'] = 0): number => {
  const [startCoordinateKey] = scrollRefCoordinates;
  const firstRowRect = rowRects[firstRow];
  const beforeBenchRowsRect = getBeforeBenchRows(rowRects, firstRow, bench);
  const beforeBenchFirstRowRect = beforeBenchRowsRect[0];

  /** 첫번쨰 Row 가려진 사이즈 */
  const firstRowHideSize = scroll > wrapperStartEmptySize
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
  Options as RowOptions,
};