import { convertDOMRectToScrollRect, ScrollRefCoordinates } from "./utils/scroll";
import { getWrapperStartMargin, getWrapperStartPadding, getWrapperStyle, getStylePropKey, getResetWrapperStyles, getWrapperMarginPaddingSum } from "./utils/styles";
import { createRowRect, createDynamicRowRect, getFirstRow, getLastRow, getFirstBenchRow, getLastBenchRow, getBeforeBenchSize } from "./utils/rows";
import type { ScrollCallBack, ScrollRect, ScrollDirectionValue } from "./utils/scroll";
import type { StyleReturnType, StyleWrapper } from "./utils/styles";
import type { Row } from "./utils/rows";

/**
 * 옵션
 */
interface Options<R = Row> {
  /**
   * 데이터를 표시 할 Row
   */
  rows?: Row<R>[];
  
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

  /**
   * 가상 스크롤 사용할 방향
   */
  direction: ScrollDirectionValue;

  /**
   * 스타일 자동등록 여부
   */
  autoStyles: boolean;

  /**
   * FIXME: 호환성 떄문에 남겨 둠
   * Row 높이 값(px)
   */
  rowHeight: number;
}

/**
 * Row Update 후 발생되는 return type
 */
type UpdateRowReturnType = {
  rendered: () => void;
};

class MyVirtualScroll<R = Row> {
  private options: Options<R>;
  private rows: Row<R>[] = [];

  // #region container (root, 스크롤 생성 영역)
  /** 가상스크롤을 적용 할 container (root, 스크롤 생성 영역) */
  private refContainer: HTMLElement;

  /** continaer 영역 좌표 */
  private containerRect!: ScrollRect;
  // #endregion

  // #region wrapper (body, contents 영역)
  /** 가상스크롤을 적용 할 wrapper (body, contents 영역) */
  private refWrapper: HTMLElement;

  /** wrapper 영역 좌표 */
  private wrapperRect!: ScrollRect;

  /** wrapper styles */
  private wrapperStyles!: CSSStyleDeclaration;

  /**
   * style wrapper
   */
  private wrapperPosition: StyleWrapper = {
    current: 0,
    size: 0,
  };

  // #endregion

  // #region render rows

  /** 렌더링 할 Rows */
  private renderRows: Row<R>[] = [];

  /** 현재 그려 진 첫번쨰 row index */
  private renderFirstRow = 0;

  /** 현재 그려 진 마지막 row index */
  private renderLastRow = 0;

  /** Row 에 대한 Rect 정보를 담고있는 배열 */
  private rowRects: ScrollRect[] = [];
  // #endregion

  // #region etc
  /**
   * 스크롤 보정 영역 스크롤이 이동되어 있는 상태에서 생성 및 row update 시 좌표 값 계산하기 위해 사용
   */
  private calibrationScroll = 0;

  /**
   * 화면에 표시하기 위해 계산 할 좌표 위치 속성 값
   *
   * 가로: left, right
   * 세로: top, bottom
   * 와 같이 사용함
   */
  private referenceCoordinates: ScrollRefCoordinates;

  /**
   * 스크롤 이벤트
   */
  private bindHandleContainerScroll = this.handleContainerScroll.bind(this);

  /**
   * 스크롤 이벤트 발생 시 외부로 내보 낼 콜백
   */
  private callback: ScrollCallBack | null = null;
  // #endregion

  constructor(container: HTMLElement, wrapper: HTMLElement, options?: Partial<Options<R>>) {
    this.refContainer = container;
    this.refWrapper = wrapper;
    this.options = {
      rowSize: options?.rowHeight ?? options?.rowSize ?? 0,
      rowHeight: options?.rowHeight ?? 0,
      bench: options?.bench ?? 0,
      direction: options?.direction ?? 'vertical',
      autoStyles: options?.autoStyles ?? false,
    };
    this.rows = options?.rows ?? [];

    if ('horizontal' === this.options.direction) this.referenceCoordinates = ['left', 'right'];
    else this.referenceCoordinates = ['top', 'bottom'];

    this.init();

    if (this.options.rowHeight) console.warn('rowHeight 대신 rowSize를 사용해 주세요! rowHeight는 곧 삭제됩니다.');
  }

  /**
   * 초기화
   */
  private init() {
    this.initContainer();
    this.initWrapper();
    this.initRender();
  }

  // #region container
  /**
   * container 초기화
   */
  private initContainer(): void {
    this.removeContainerEvent();
    this.addContainerEvent();
    this.containerRect = convertDOMRectToScrollRect(this.refContainer.getBoundingClientRect());
    this.calibrationScroll = 'horizontal' === this.options.direction
      ? this.wrapperPosition.current - this.refContainer.scrollLeft
      : this.wrapperPosition.current - this.refContainer.scrollTop;
  }

  /**
   * container 높이 반환
   */
  private getContainerHeight(): number {
    return this.refContainer.offsetHeight;
  }

  /**
   * container 넓이 반환
   */
  private getContainerWidth(): number {
    return this.refContainer.offsetWidth;
  }

  /**
   * container 이벤트 등록
   */
  private addContainerEvent(): void {
    this.refContainer.addEventListener('scroll', this.bindHandleContainerScroll);
  }

  /**
   * container 이벤트 제거
   */
  private removeContainerEvent(): void {
    this.refContainer.removeEventListener('scroll', this.bindHandleContainerScroll);
  }
  // #endregion

  // #region wrapper
  /**
   * wrapper 초기화
   */
  private initWrapper() {
    this.wrapperStyles = window.getComputedStyle(this.refWrapper);
    this.wrapperRect = convertDOMRectToScrollRect(this.refWrapper.getBoundingClientRect());
  }

  /**
   * wrapper styles을 업데이트 합니다.
   */
  private updateWrapperStyles = (reset = false) => {
    if (!this.options.autoStyles) return;

    const styles = reset
      ? getResetWrapperStyles(this.refWrapper, getStylePropKey(this.options.direction))
      : getWrapperStyle(this.refWrapper, getStylePropKey(this.options.direction), this.wrapperPosition);

    for (const [k, v] of Object.entries(styles)) {
      if (Reflect.has(this.refWrapper.style, k)) this.refWrapper.style.setProperty(k, v?.toString() ?? '');
    }
  };

  /**
   * wrapper 스타일 반환
   */
  public getWrapperStyle(): StyleReturnType {
    return getWrapperStyle(this.refWrapper, getStylePropKey(this.options.direction), this.wrapperPosition);
  }
  // #endregion

  // #region rows
  /**
   * 화면에 표시 할 Rows 초기화
   */
  private initRenderRows(): void {
    const rowSize = this.options.rowSize;

    this.rowRects = createRowRect(this.rows, this.containerRect, getWrapperMarginPaddingSum(this.wrapperStyles, this.referenceCoordinates), this.referenceCoordinates, rowSize);
    this.wrapperPosition.size = this.rows.length * rowSize;

    if ('horizontal' === this.options.direction) this.execHorizontalScroll(this.refContainer.scrollLeft);
    else this.execVerticalScroll(this.refContainer.scrollTop);
  }

  /**
   * 화면에 표시할 동적 Rows 초기화
   */
  private initDynamicRenderRows(): void {
    const wrapperChildren = this.refWrapper.children;

    if (this.rows.length !== wrapperChildren.length) console.warn('렌더링 된 Row 개수와 전체 Row 개수가 일치하지 않아 정상적으로 표시되지 않을 수 있습니다.', `rows length ${this.rows.length}`, `child length ${wrapperChildren.length}`);
    
    const wrapperMarginPaddingSum = getWrapperMarginPaddingSum(this.wrapperStyles, this.referenceCoordinates);

    this.rowRects = createDynamicRowRect(wrapperChildren, this.containerRect, this.referenceCoordinates);
    this.wrapperPosition.size = 'horizontal' === this.options.direction
    ? this.refWrapper.offsetWidth
    : this.refWrapper.offsetHeight;

    if ('horizontal' === this.options.direction) this.execHorizontalScroll(this.refContainer.scrollLeft);
    else this.execVerticalScroll(this.refContainer.scrollTop);
  }

  /**
   * render 초기화
   */
  private initRender() {
    if (this.options.rowSize) this.initRenderRows();
    else this.initDynamicRenderRows();
  }

  /**
   * rendering 할 rows 반환
   */
  public getRenderRows(): R[] {
    return this.renderRows;
  }

  /**
   * 현재 표시 된 첫번째 row 반환
   */
  public getRenderFirstRow(): number {
    return this.renderFirstRow;
  }

  /**
   * 현재 표시 된 마지막 row 반환
   */
  public getRenderLastRow(): number {
    return this.renderLastRow;
  }

  /**
   * rows 정보가 업데이트 될 시 호출
   */
  public updateRows(rows: Row<R>[]): UpdateRowReturnType {
    this.rows = rows;
    
    return {
      /**
       * rows 업데이트 후
       * 사용자 페이지에서 렌더링 완료 시 호출이 필요합니다.
       */
      rendered: () => {
        // 동적 렌더링인 경우 스타일 초기화
        if (!this.options.rowSize) this.updateWrapperStyles(true);

        this.init();
      },
    };
  }

  /**
   * 가상스크롤 실행(세로)
   *
   * @param scrollTop 현재 상단 스크롤 위치
   */
  private execVerticalScroll(scrollTop: number): void {
    if (!this.rows.length) return;

    const wrapperMarginPaddingSum = getWrapperMarginPaddingSum(this.wrapperStyles, this.referenceCoordinates);
    const firstRow = getFirstRow(this.rowRects, this.containerRect, this.referenceCoordinates, scrollTop);
    const firstBenchRow = getFirstBenchRow(firstRow, { bench: this.options.bench });
    const lastRow = getLastRow(this.rowRects, this.containerRect, this.referenceCoordinates, scrollTop, firstRow);
    const lastBenchRow = getLastBenchRow(lastRow, this.rowRects.length, { bench: this.options.bench });
    const beforeRowsHeight = getBeforeBenchSize(this.rowRects, this.containerRect, wrapperMarginPaddingSum, this.referenceCoordinates, scrollTop, firstRow, { bench: this.options.bench });

    this.renderFirstRow = firstBenchRow;
    this.renderLastRow = lastBenchRow;
    this.renderRows = this.rows.slice(firstBenchRow, lastBenchRow);
    this.wrapperPosition.current = wrapperMarginPaddingSum > scrollTop
      ? 0
      : scrollTop - beforeRowsHeight - (wrapperMarginPaddingSum);

    console.log('execVerticalScroll: ', wrapperMarginPaddingSum, scrollTop, beforeRowsHeight, lastRow - firstRow);
    
    this.updateWrapperStyles();
  }

  /**
   * Row가 있는 위치로 스크롤 이동
   *
   * @param row 이동 할 row
   */
  public moveVerticalScrollToRow(row: number): void {
    if (!this.rows.length) {
      console.warn('rows가 존재하지 않습니다.');

      return;
    }

    const [refFirstCoordinate] = this.referenceCoordinates;
    const rect = this.rowRects[row];
    const scrollTop = rect[refFirstCoordinate] - this.containerRect[refFirstCoordinate] + this.calibrationScroll;

    this.refContainer.scrollTo(this.refContainer.scrollLeft, scrollTop);
  }

  /**
   * 가로 스크롤에 따른 가상스크롤 실행
   * 
   * @param scrollLeft 현재 가로 스크롤 위치
   */
  private execHorizontalScroll(scrollLeft: number): void {
    if (!this.rows.length) return;

    const wrapperMarginPaddingSum = getWrapperMarginPaddingSum(this.wrapperStyles, this.referenceCoordinates);
    const firstRow = getFirstRow(this.rowRects, this.containerRect, this.referenceCoordinates, scrollLeft);
    const firstBenchRow = getFirstBenchRow(firstRow, { bench: this.options.bench });
    const lastRow = getLastRow(this.rowRects, this.containerRect, this.referenceCoordinates, scrollLeft, firstRow);
    const lastBenchRow = getLastBenchRow(lastRow, this.rowRects.length, { bench: this.options.bench });
    const beforeRowsHeight = getBeforeBenchSize(this.rowRects, this.containerRect, wrapperMarginPaddingSum, this.referenceCoordinates, scrollLeft, firstRow, { bench: this.options.bench });

    this.renderFirstRow = firstBenchRow;
    this.renderLastRow = lastBenchRow;
    this.renderRows = this.rows.slice(firstBenchRow, lastBenchRow);
    this.wrapperPosition.current = wrapperMarginPaddingSum > scrollLeft
      ? 0
      : scrollLeft - beforeRowsHeight - (wrapperMarginPaddingSum);

    this.updateWrapperStyles();
  }

  /**
   * 스크롤 이벤트 추가
   * 
   * @param cb 이벤트 발생 시 호출 할 콜백함수
   */
  public addContainerScrollEvent(cb: ScrollCallBack): void {
    this.callback = cb;
  }

  /**
   * 스크롤 이벤트 제거
   */
  public removeContainerScrollEvent(): void {
    this.callback = null;
  }

  /**
   * 1. container 스크롤 이벤트 발생 시 호출
   *
   * @param e 
   */
  private handleContainerScroll(e: Event): void {
    const target = e.target;

    if (target instanceof HTMLElement) {
      if ('horizontal' === this.options.direction) this.execHorizontalScroll(target.scrollLeft);
      else this.execVerticalScroll(target.scrollTop);
    }

    this.callback?.(e);
  }
  // #endregion
}

export default MyVirtualScroll;
export type {
  Row as MyVirtualScrollRow,
  Options as MyVirtualScrollOptions,
  ScrollRect as MyVirtualScrollScrollRect,
  ScrollCallBack as MyVirtualScrollScrollCallBack,
  UpdateRowReturnType as MyVirtualScrollUpdateRow,
  StyleReturnType as MyVirtualScrollStyle,
};