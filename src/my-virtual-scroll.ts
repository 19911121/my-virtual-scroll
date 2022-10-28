import type * as CSS from 'csstype';

/**
 * 사용자 데이터
 */
type Row<T = any> = T;

/**
 * 옵션
 */
interface Options<R = any> {
  /**
   * 데이터를 표시 할 Row
   */
  rows?: Row<R>[];
  /**
   * Row 높이 값(px)
   */
  rowHeight: number;
  /**
   * 위아래 추가로 보여 줄 Row 갯수
   *
   * 화면에 렌더링 된 갯수가 10개이고 bench가 1인 경우 총 12개, bench가 2인 경우 14개가 보임
   */
  bench: number;
  /**
   * 가상 스크롤 사용할 방향
   */
  direction: 'vertical' | 'horizontal';
}

/**
 * 스크롤 사각영역 좌표
 */
type ScrollRect = Pick<DOMRect, 'top' | 'right' | 'bottom' | 'left' | 'width' | 'height' | 'x' | 'y'>;

/**
 * 스크롤 이벤트 발생 시 callback 할 함수
 */
type ScrollCallBack = (e: Event) => void;

/**
 * Row Update 후 발생되는 return type
 */
type UpdateRowReturnType = {
  rendered: () => void;
};

/**
 * CSS 반환 타입
 */
interface StyleReturnType extends
  CSS.Properties<string | number>,
  CSS.PropertiesHyphen<string | number> {
    // https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
    // ...or allow any other property
    [index: string]: any;
  }

class MyVirtualScroll<R = any> {
  private options: Options<R>;
  private rows: Row<R>[] = [];

  // #region container (root, 스크롤 생성 영역)

  /** 가상스크롤을 적용 할 container (root, 스크롤 생성 영역) */
  private refContainer: HTMLElement;

  /** continaer 영역 좌표 */
  private containerRect!: ScrollRect;

  /** container styles */
  private containerStyles!: CSSStyleDeclaration;

  // #endregion

  // #region wrapper (body, contents 영역)

  /** 가상스크롤을 적용 할 wrapper (body, contents 영역) */
  private refWrapper: HTMLElement;

  /** wrapper styles */
  private wrapperStyles!: CSSStyleDeclaration;

  /** wrapper 가로 사이즈 */
  private wrapperWidth = 0;

  /** wrapper 좌측 padding */
  private wrapperPaddingLeft = 0;

  /**  wrapper 세로 사이즈 */
  private wrapperHeight = 0;

  /** wrapper 상단 padding */
  private wrapperPaddingTop = 0;

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
   * 스크롤 보정 영역
   *
   * 세로스크롤: container top - wrapper padding top
   * 가로스크롤: container left - wrapper padding left
   */
  private calibrationScroll = 0;

  /**
   * 화면에 표시하기 위해 계산 할 좌표 위치 속성 값
   *
   * 가로: left, right
   * 세로: top, bottom
   * 와 같이 사용함
   */
  private referenceCoordinates: ('top' | 'right' | 'bottom' | 'left')[];

  /**
   * 스크롤 이벤트
   */
  private bindHandleContainerScroll = this.handleContainerScroll.bind(this);

  /**
   * 스크롤 이벤트 발생 시 외부로 내보 낼 cb
   */
  private callback: ScrollCallBack | null = null;
  // #endregion

  constructor(container: HTMLElement, wrapper: HTMLElement, options?: Partial<Options<R>>) {
    this.refContainer = container;
    this.refWrapper = wrapper;
    this.options = {
      rowHeight: options?.rowHeight ?? 0,
      bench: options?.bench ?? 0,
      direction: options?.direction ?? 'vertical',
    };
    this.rows = options?.rows ?? [];

    if (this.isVerticalScroll()) this.referenceCoordinates = ['top', 'bottom'];
    else this.referenceCoordinates = ['left', 'right'];

    this.init();
  }

  /**
   * 초기화
   */
  private init() {
    this.initContainer();
    this.initWrapper();
    this.initRender();
  }

  // #region 공통
  /**
   * 세로 스크롤 사용여부 반환
   */
  private isVerticalScroll() {
    return 'vertical' === this.options.direction;
  }

  /**
   * 가로 스크롤 존재여부 반환
   */
  private hasHorizontalScroll() {
    return this.wrapperWidth > this.getContainerWidth();
  }

  /**
   * 세로 스크롤 존재여부 반환
   */
  private hasVerticalScroll() {
    return this.wrapperHeight > this.getContainerHeight();
  }

  /**
   * domRect => scrollRect 변환
   *
   * @param domrect DOMRect
   */
  private convertDOMRectToScrollRect(domrect: DOMRect) {
    const rect: ScrollRect = {
      top: domrect.top,
      right: domrect.right,
      bottom: domrect.bottom,
      left: domrect.left,
      width: domrect.width,
      height: domrect.height,
      x: domrect.x,
      y: domrect.y,
    };

    return rect;
  }
  // #endregion

  // #region container
  /**
   * container 초기화
   */
  private initContainer(): void {
    this.removeContainerEvent();
    this.addContainerEvent();
    this.containerRect = this.convertDOMRectToScrollRect(this.refContainer.getBoundingClientRect());
    this.containerStyles = window.getComputedStyle(this.refContainer);
    this.calibrationScroll = this.refContainer.scrollTop - this.wrapperPaddingTop;
  }

  /**
   * container 상하 여백 반환
   */
  public getContainerPaddingVertical(): number {
    const styles = this.containerStyles;
    const verticalPadding = Number.parseFloat(styles['paddingTop']) + Number.parseFloat(styles['paddingBottom']);

    return verticalPadding;
  }

  /**
   * container 상단 여백 반환
   */
  public getContainerPaddingTop(): number {
    const styles = this.containerStyles;
    const paddingTop = Number.parseFloat(styles['paddingTop']);

    return paddingTop;
  }

  /**
   * container 하단 여백
   */
  public getContainerPaddingBottom(): number {
    const styles = this.containerStyles;
    const paddingBottom = Number.parseFloat(styles['paddingBottom']);

    return paddingBottom;
  }

  /**
   * container 높이 반환
   */
  public getContainerHeight(): number {
    return this.refContainer.offsetHeight;
  }

  /**
   * container 넓이 반환
   */
  public getContainerWidth(): number {
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
  }

  /**
   * wrapper 스타일 반환
   */
  public getWrapperStyle(): StyleReturnType {
    const styles: StyleReturnType = {};

    if (this.isVerticalScroll()) {
      if (this.hasVerticalScroll()) {
        styles.transform = `translateY(${this.wrapperPaddingTop}px)`;
        styles.height = `${this.wrapperHeight - this.wrapperPaddingTop}px`;
      }
    }
    else {
      if (this.hasHorizontalScroll()) {
        styles.transform = `translateX(${this.wrapperPaddingLeft}px)`;
        styles.width = `${this.wrapperWidth}px`;
      }
    }

    return styles;
  }
  // #endregion

  // #region 가로
  /**
   * 화면에 표시 할 bench rows width 합
   *
   * @param firstRow
   */
  private getBeforeBenchWidth(firstRow: number): number {
    const [refFirstCoordinate, refLastCoordinate] = this.referenceCoordinates;
    const beforeBenchRows = this.getBeforeBenchRows(firstRow);
    const beforeBenchFirstRow = beforeBenchRows[0];
    const beforeBenchLastRow = beforeBenchRows.slice(-1)[0];

    return beforeBenchRows.length ? beforeBenchLastRow[refLastCoordinate] - beforeBenchFirstRow[refFirstCoordinate] : 0;
  }
  // #endregion

  // #region 세로
  /**
   * 화면에 표시 할 bench rows height 합
   *
   * @param firstRow
   */
  private getBeforeBenchHeight(scroll: number, firstRow: number): number {
    const [refFirstCoordinate] = this.referenceCoordinates;
    const firstRowRect = this.rowRects[firstRow];
    const beforeBenchRowsRect = this.getBeforeBenchRows(firstRow);
    const beforeBenchFirstRowRect = beforeBenchRowsRect[0];
    /** 첫번쨰 Row 가려진 높이 값 */
    const firstRowHideHeight = firstRowRect[refFirstCoordinate] - this.containerRect[refFirstCoordinate] - scroll + this.calibrationScroll;

    return beforeBenchRowsRect.length ? firstRowRect[refFirstCoordinate] - beforeBenchFirstRowRect[refFirstCoordinate] - firstRowHideHeight : -firstRowHideHeight;
  }

  // #endregion

  // #region rows
  /**
   * 화면에 표시할 동적 Rows 초기화
   */
  private initDynamicRenderRows(): void {
    this.renderRows = this.rows;
    this.rowRects = Array.from(this.refWrapper.children).map((v) => this.convertDOMRectToScrollRect(v.getBoundingClientRect()));
    this.wrapperWidth = this.refWrapper.offsetWidth;
    this.wrapperHeight = this.refWrapper.offsetHeight;

    this.execVerticalScroll(this.refContainer.scrollTop);

    if (this.hasVerticalScroll()) this.wrapperHeight += this.getContainerPaddingVertical();
  }

  /**
   * 화면에 표시 할 Rows 초기화
   */
  private initRenderRows(): void {
    const rowHeight = this.options.rowHeight;

    this.renderRows = this.rows;
    this.rowRects = Array.from(this.rows).map((v, i) => {
      const top = this.containerRect.top + rowHeight * i;
      // const left = this.containerRect.left + rowHeight * i;

      return {
        top,
        right: 0,
        bottom: top + rowHeight,
        left: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      };
    });
    this.wrapperWidth = this.refWrapper.offsetWidth;
    this.wrapperHeight = this.rows.length * rowHeight;

    this.execVerticalScroll(this.refContainer.scrollTop);

    if (this.hasVerticalScroll()) this.wrapperHeight += this.getContainerPaddingVertical();
  }

  /**
   * render 초기화
   */
  private initRender() {
    if (this.options.rowHeight) this.initRenderRows();
    else this.initDynamicRenderRows();
  }

  /**
   * rendering 할 rows
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
   * 화면에 표시 할 첫번째 row
   *
   * @param scroll 현재 스크롤
   */
  private getFirstRow(scroll: number): number {
    const [refFirstCoordinate, refLastCoordinate] = this.referenceCoordinates;
    const firstRow = this.rowRects.findIndex((v) => {
      return scroll <= v[refLastCoordinate] - this.containerRect[refFirstCoordinate] + this.calibrationScroll;
    });

    return Math.max(0, firstRow);
  }

  /**
   * 화면에 표시 할 첫번쨰 bench row
   *
   * @param firstRow 화면에 표시 할 첫번째 Row
   */
  private getFirstBenchRow(firstRow: number): number {
    return Math.max(0, firstRow - this.options.bench);
  }

  /**
   * 화면에 표시 할 bench rows
   *
   * @param firstRow 화면에 표시 할 첫번쨰 Row
   */
  private getBeforeBenchRows(firstRow: number): ScrollRect[] {
    return this.rowRects.slice(this.getFirstBenchRow(firstRow), firstRow);
  }

  /**
   * 화면에 표시 할 마지막 row
   *
   * @param scroll 현재 스크롤위치
   * @param fr 첫번째 row
   */
  private getLastRow(scroll: number, fr?: number): number {
    const containerSize = 'horizontal' === this.options.direction ? this.getContainerWidth() : this.getContainerHeight();
    const [refFirstCoordinate] = this.referenceCoordinates;
    const firstRow = fr ?? this.getFirstRow(scroll);
    let lastRow = this.rowRects.slice(firstRow, this.rows.length).findIndex((v) => {
      return scroll + containerSize <= v[refFirstCoordinate] - this.containerRect[refFirstCoordinate] + this.calibrationScroll;
    });

    lastRow = -1 === lastRow ? this.rows.length : firstRow + lastRow;

    return Math.min(this.rows.length, lastRow);
  }

  /**
   * 화면에 표시할 Rows 추가
   * @param children
   */
  public addRenderRows(children: HTMLCollection, height: number): void {
    this.wrapperHeight += height;
    this.rowRects = this.rowRects.concat(
      Array.from(children).map((v) => {
        const rect = this.convertDOMRectToScrollRect(v.getBoundingClientRect());

        return {
          ...rect,
          top: (this.wrapperHeight += rect.top),
          bottom: (this.wrapperHeight += rect.bottom),
        };
      }),
    );
    this.execVerticalScroll(this.refContainer.scrollTop);

    if (this.hasVerticalScroll()) this.wrapperHeight += this.getContainerPaddingVertical();
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
        this.init();
      },
    };
  }

  /**
   * 화면에 표시 할 마지막 bench row
   */
  private getLastBenchRow(lastRow: number): number {
    return Math.min(this.rows.length, lastRow + this.options.bench);
  }

  /**
   * 가상스크롤 실행(세로)
   *
   * @param scrollTop
   */
  private execVerticalScroll(scrollTop: number): void {
    const firstRow = this.getFirstRow(scrollTop);
    const firstBenchRow = this.getFirstBenchRow(firstRow);
    const lastRow = this.getLastRow(scrollTop, firstRow);
    const lastBenchRow = this.getLastBenchRow(lastRow);
    const beforeRowsHeight = this.getBeforeBenchHeight(scrollTop, firstRow);

    this.renderFirstRow = firstBenchRow;
    this.renderLastRow = lastBenchRow;
    this.renderRows = this.rows.slice(firstBenchRow, lastBenchRow);
    this.wrapperPaddingTop = scrollTop - beforeRowsHeight - this.getContainerPaddingBottom() / 2;
  }

  /**
   * Row가 있는 위치로 스크롤 이동
   *
   * @param row 이동 할 row
   */
  public moveVerticalScrollToRow(row: number): void {
    const [refFirstCoordinate] = this.referenceCoordinates;
    const rect = this.rowRects[row];
    const scrollTop = rect[refFirstCoordinate] - this.containerRect[refFirstCoordinate] + this.calibrationScroll;

    this.refContainer.scrollTo(this.refContainer.scrollLeft, scrollTop);
  }

  /**
   * 가로 스크롤에 따른 가상스크롤 실행
   */
  private execHorizontalScroll(scrollLeft: number): void {
    const firstRow = this.getFirstRow(scrollLeft);
    const firstBenchRow = this.getFirstBenchRow(firstRow);
    const lastRow = this.getLastRow(scrollLeft, firstRow);
    const lastBenchRow = this.getLastBenchRow(lastRow);
    const beforeRowsWidth = this.getBeforeBenchWidth(firstRow);

    this.renderRows = this.rows.slice(firstBenchRow, lastBenchRow);
    this.wrapperPaddingLeft = scrollLeft - beforeRowsWidth;
  }

  /**
   * 스크롤 이벤트 추가
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
  public handleContainerScroll(e: Event): void {
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