import { ScrollRefCoordinates, getContainerCurrentScroll, convertDOMRectToScrollRect, ScrollDirection } from "./utils/scroll";
import { getWrapperStyle, getStyleProp, getResetWrapperStyles, wrapperStyles } from "./utils/styles";
import { createRowRect, createDynamicRowRect, getFirstRow, getLastRow, getFirstBenchRow, getLastBenchRow, getBeforeBenchSize } from "./utils/rows";
import type { ScrollOptions, ScrollCallBack, ScrollRect } from "./utils/scroll";
import type { StyleReturnType, StyleWrapper } from "./utils/styles";
import type { Row, RowOptions } from "./utils/rows";

/** 옵션 */
interface Options<R = Row> extends RowOptions, ScrollOptions {
  /**
   * 데이터를 표시 할 Row
   */
  rows?: Row<R>[];

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

/** Row Update 후 발생되는 return type */
type UpdateRowReturnType = {
  rendered: () => void;
};

class MyVirtualScroll<R = Row> {
  private rows: Row<R>[] = [];
  private options: Options<R>;

  // #region container (root, 스크롤 생성 영역)
  /** 가상스크롤을 적용 할 container (root, 스크롤 생성 영역) */
  private refContainer: HTMLElement;

  /** continaer 영역 좌표 */
  private containerRect!: ScrollRect;

  /** 영역 사이즈 계산을 위한 Element */
  private sizeAreaElement: HTMLElement | null = null;
  // #endregion

  // #region wrapper (body, contents 영역)
  /** 가상스크롤을 적용 할 wrapper (body, contents 영역) */
  private refWrapper: HTMLElement;

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
  /** {@link ScrollRefCoordinates} */
  private referenceCoordinates: ScrollRefCoordinates;

  /** 스크롤 이벤트 */
  private bindHandleContainerScroll = this.handleContainerScroll.bind(this);

  /** 스크롤 이벤트 발생 시 외부로 내보 낼 콜백 */
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
  }

  /**
   * 현재 스크롤 위치 반환
   */
  private getCurrentScroll(): number {
    return 'horizontal' === this.options.direction
      ? this.refContainer.scrollLeft
      : this.refContainer.scrollTop;
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
    return getWrapperStyle(this.refWrapper, getStyleProp(this.options.direction), this.wrapperPosition);
  }

  /**
   * wrapper styles을 업데이트 합니다.
   * 
   * @param reset 초기화 여부
   */
  private updateWrapperStyles = (reset = false) => {
    if (!this.options.autoStyles) return;

    const styles = reset
      ? getResetWrapperStyles(this.refWrapper, getStyleProp(this.options.direction))
      : getWrapperStyle(this.refWrapper, getStyleProp(this.options.direction), this.wrapperPosition);

    this.refWrapper.style.cssText = Object.entries(styles).map(v => `${v[0]}: ${v[1]}`).join(';');
  };
  // #endregion

  // #region rows
  /**
   * 화면에 표시 할 Rows 초기화
   */
  private initRenderRows(): void {
    const ws = wrapperStyles(this.wrapperStyles, this.referenceCoordinates);
    const rowSize = this.options.rowSize;
    const rowCount = this.rows.length;
    const startEmptySize = ws.getStartEmptySize('margin') + ws.getStartEmptySize('padding') + ws.getPairStartEmptySize('border', 'width');

    this.rowRects = createRowRect(rowCount, this.referenceCoordinates, startEmptySize, rowSize);
    this.wrapperPosition.size = rowCount * rowSize;
    this.execScroll(getContainerCurrentScroll(this.refContainer, this.options.direction));
  }

  /**
   * 화면에 표시할 동적 Rows 초기화
   */
  private initDynamicRenderRows(): void {
    const ws = wrapperStyles(this.wrapperStyles, this.referenceCoordinates);
    const scroll = this.getCurrentScroll();
    const wrapperStartEmptySize = ws.getStartEmptySize('margin') + ws.getStartEmptySize('padding');
    const hideSize = getBeforeBenchSize(this.rowRects, wrapperStartEmptySize, this.referenceCoordinates, scroll, getFirstRow(this.rowRects, this.referenceCoordinates, scroll), this.options.bench)
    const wrapperChildren = this.refWrapper.children;

    if (this.rows.length !== wrapperChildren.length) console.warn('렌더링 된 Row 개수와 전체 Row 개수가 일치하지 않아 정상적으로 표시되지 않을 수 있습니다.', `rows length ${this.rows.length}`, `child length ${wrapperChildren.length}`);

    this.rowRects = createDynamicRowRect(wrapperChildren, this.containerRect, this.referenceCoordinates, hideSize);
    this.wrapperPosition.size = 'horizontal' === this.options.direction
      ? this.refWrapper.offsetWidth - ws.getEmptySizeSum('padding')
      : this.refWrapper.offsetHeight - ws.getEmptySizeSum('padding')

    this.execScroll(getContainerCurrentScroll(this.refContainer, this.options.direction));
  }

  /**
   * render 초기화
   */
  private initRender() {
    if (this.options.rowSize) this.initRenderRows();
    else this.initDynamicRenderRows();

    this.initSizeArea();
  }

  /**
   * 사이즈 영역 초기화
   */
  private initSizeArea() {
    const ws = wrapperStyles(this.wrapperStyles, this.referenceCoordinates);
    const emptySize = this.wrapperPosition.size + ws.getEmptySizeSum('margin') + ws.getEmptySizeSum('padding') + ws.getPairEmptySizeSum('border', 'width');
    const styles = `
      position: absolute;
      padding-${this.referenceCoordinates[0]}: ${emptySize}px;
      ${ScrollDirection.Horizontal === this.options.direction ? 'height' : 'width'}: 0.1px;
    `.trim();

    if (this.sizeAreaElement) {
      this.sizeAreaElement.style.cssText = styles;
    }
    else {
      const sizeAreaElement = document.createElement('div');
  
      sizeAreaElement.className = `${this.constructor.name.replace(/(?!^)([A-Z])/g, "-$1").toLowerCase()}-height`;
      sizeAreaElement.style.cssText = styles;
  
      this.sizeAreaElement = sizeAreaElement;
    }

    this.refContainer.insertAdjacentElement('afterbegin', this.sizeAreaElement);
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
   * rows 정보가 업데이트
   * 
   * @param rows 새로운 Row {@link Row}
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
        // if (!this.options.rowSize) this.updateWrapperStyles(true);

        this.init();
      },
    };
  }

  /**
   * Row가 있는 위치로 스크롤 이동
   *
   * @param row 이동 할 row
   */
  public moveVerticalScrollToRow(row: number): void {
    console.warn('moveScrollToRow를 사용해 주세요! moveVerticalScrollToRow는 곧 삭제됩니다.');

    this.moveScrollToRow(row);
  }

  /**
   * Row가 있는 위치로 스크롤 이동
   *
   * @param row 이동 할 row
   */
  public moveScrollToRow(row: number): void {
    if (!this.rows.length) {
      console.warn('rows가 존재하지 않습니다.');

      return;
    }

    const [refFirstCoordinate] = this.referenceCoordinates;
    const rect = this.rowRects[row];
    const scroll = rect[refFirstCoordinate];

    if ('horizontal' === this.options.direction) this.refContainer.scrollTo(scroll, this.refContainer.scrollTop);
    else this.refContainer.scrollTo(this.refContainer.scrollLeft, scroll);
  }

  /**
   * 스크롤 실행
   * 
   * @param scroll 스크롤 위치
   */
  private execScroll(scroll: number): void {
    const ws = wrapperStyles(this.wrapperStyles, this.referenceCoordinates);
    const wrapperStartSizeSum = ws.getStartEmptySize('margin') + ws.getStartEmptySize('padding'); //  + ws.getPairStartEmptySize('border', 'width')
    const firstRow = getFirstRow(this.rowRects, this.referenceCoordinates, scroll);
    const firstBenchRow = getFirstBenchRow(firstRow, this.options.bench);
    const lastRow = getLastRow(this.rowRects, this.containerRect, this.referenceCoordinates, scroll, firstRow);
    const lastBenchRow = getLastBenchRow(lastRow, this.rowRects.length, this.options.bench);
    const beforeRowsSize = getBeforeBenchSize(this.rowRects, wrapperStartSizeSum, this.referenceCoordinates, scroll, firstRow, this.options.bench);

    this.renderFirstRow = firstBenchRow;
    this.renderLastRow = lastBenchRow;
    this.renderRows = this.rows.slice(firstBenchRow, lastBenchRow);
    this.wrapperPosition.current = wrapperStartSizeSum >= scroll
      ? 0
      : scroll - beforeRowsSize - wrapperStartSizeSum;

    this.updateWrapperStyles();
  }

  /**
   * 1. container 스크롤 이벤트 발생 시 호출
   *
   * @param e 
   */
  private handleContainerScroll(e: Event): void {
    const target = e.target;
    
    if (target instanceof HTMLElement) this.execScroll(getContainerCurrentScroll(target, this.options.direction));

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