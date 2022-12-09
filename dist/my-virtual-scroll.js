'use strict';

class MyVirtualScroll {
    options;
    rows = [];
    refContainer;
    containerRect;
    refWrapper;
    wrapperStyles;
    wrapperWidth = 0;
    wrapperMarginLeft = 0;
    wrapperHeight = 0;
    wrapperMarginTop = 0;
    renderRows = [];
    renderFirstRow = 0;
    renderLastRow = 0;
    rowRects = [];
    calibrationScroll = 0;
    referenceCoordinates;
    bindHandleContainerScroll = this.handleContainerScroll.bind(this);
    callback = null;
    constructor(container, wrapper, options) {
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
        if ('horizontal' === this.options.direction)
            this.referenceCoordinates = ['left', 'right'];
        else
            this.referenceCoordinates = ['top', 'bottom'];
        this.init();
        if (this.options.rowHeight)
            console.warn('rowHeight 대신 rowSize를 사용해 주세요! rowHeight는 곧 삭제됩니다.');
    }
    init() {
        this.initContainer();
        this.initWrapper();
        this.initRender();
    }
    hasHorizontalScroll() {
        return this.wrapperWidth > this.getContainerWidth();
    }
    hasVerticalScroll() {
        return this.wrapperHeight > this.getContainerHeight();
    }
    convertDOMRectToScrollRect(domrect) {
        const rect = {
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
    initContainer() {
        this.removeContainerEvent();
        this.addContainerEvent();
        this.containerRect = this.convertDOMRectToScrollRect(this.refContainer.getBoundingClientRect());
        this.calibrationScroll = 'horizontal' === this.options.direction
            ? this.refContainer.scrollLeft
            : this.refContainer.scrollTop;
    }
    getContainerHeight() {
        return this.refContainer.offsetHeight;
    }
    getContainerWidth() {
        return this.refContainer.offsetWidth;
    }
    addContainerEvent() {
        this.refContainer.addEventListener('scroll', this.bindHandleContainerScroll);
    }
    removeContainerEvent() {
        this.refContainer.removeEventListener('scroll', this.bindHandleContainerScroll);
    }
    initWrapper() {
        this.wrapperStyles = window.getComputedStyle(this.refWrapper);
    }
    getWrapperMarginTop() {
        const styles = this.wrapperStyles;
        const marginTop = Number.parseFloat(styles['marginTop']);
        return marginTop;
    }
    getWrapperMarginLeft() {
        const styles = this.wrapperStyles;
        const marginLeft = Number.parseFloat(styles['marginLeft']);
        return marginLeft;
    }
    getWrapperPaddingTop() {
        const styles = this.wrapperStyles;
        const paddingTop = Number.parseFloat(styles['paddingTop']);
        return paddingTop;
    }
    getWrapperPaddingLeft() {
        const styles = this.wrapperStyles;
        const paddingLeft = Number.parseFloat(styles['paddingLeft']);
        return paddingLeft;
    }
    getWrapperRealMarginTop() {
        return this.getWrapperMarginTop() + this.getWrapperPaddingTop();
    }
    getWrapperRealMarginLeft() {
        return this.getWrapperMarginLeft() + this.getWrapperPaddingLeft();
    }
    getWrapperRealMarginAccordingToDirection = () => {
        return 'horizontal' === this.options.direction
            ? this.getWrapperRealMarginLeft()
            : this.getWrapperRealMarginTop();
    };
    getWrapperStyle() {
        const transform = this.wrapperStyles.getPropertyValue('transform');
        const styles = {};
        if ('horizontal' === this.options.direction) {
            if (this.hasHorizontalScroll()) {
                const translateX = `translateX(${this.wrapperMarginLeft}px)`;
                styles.transform = 'none' === transform
                    ? translateX
                    : this.refWrapper.style.transform.replace(/translateX(.+)/, translateX);
                styles.width = `${this.wrapperWidth - this.wrapperMarginLeft}px`;
            }
        }
        else {
            if (this.hasVerticalScroll()) {
                const translateY = `translateY(${this.wrapperMarginTop}px)`;
                styles.transform = 'none' === transform
                    ? translateY
                    : this.refWrapper.style.transform.replace(/translateY(.+)/, translateY);
                styles.height = `${this.wrapperHeight - this.wrapperMarginTop}px`;
            }
        }
        return styles;
    }
    resetWrapperStyles = () => {
        if (!this.options.autoStyles)
            return;
        if ('horizontal' === this.options.direction) {
            const translateX = 'translateX(0px)';
            this.refWrapper.style.transform.replace(/translateX(.+)/, translateX);
            this.refWrapper.style.transform = this.refWrapper.style.transform.replace(/translateX(.+)/, translateX);
            this.refWrapper.style.width = 'auto';
        }
        else {
            const translateY = 'translateY(0px)';
            this.refWrapper.style.transform.replace(/translateY(.+)/, translateY);
            this.refWrapper.style.transform = this.refWrapper.style.transform.replace(/translateY(.+)/, translateY);
            this.refWrapper.style.height = 'auto';
        }
    };
    updateWrapperStyles = () => {
        if (!this.options.autoStyles)
            return;
        const styles = this.getWrapperStyle();
        for (const [k, v] of Object.entries(styles)) {
            if (Reflect.has(this.refWrapper.style, k))
                this.refWrapper.style.setProperty(k, v?.toString() ?? '');
        }
    };
    getBeforeBenchSize(scroll, firstRow) {
        const [refFirstCoordinate] = this.referenceCoordinates;
        const firstRowRect = this.rowRects[firstRow];
        const beforeBenchRowsRect = this.getBeforeBenchRows(firstRow);
        const beforeBenchFirstRowRect = beforeBenchRowsRect[0];
        const wrapperMargin = this.getWrapperRealMarginAccordingToDirection();
        const firstRowHideSize = firstRowRect[refFirstCoordinate] + this.calibrationScroll - this.containerRect[refFirstCoordinate] - wrapperMargin - scroll;
        return beforeBenchRowsRect.length
            ? firstRowRect[refFirstCoordinate] - beforeBenchFirstRowRect[refFirstCoordinate] - firstRowHideSize
            : -firstRowHideSize;
    }
    initDynamicRenderRows() {
        const wrapperElementChildren = this.refWrapper.children;
        if (this.rows.length !== wrapperElementChildren.length)
            console.warn('렌더링 된 Row 개수와 전체 Row 개수가 일치하지 않아 정상적으로 표시되지 않을 수 있습니다.', `rows length ${this.rows.length}`, `child length ${wrapperElementChildren.length}`);
        this.renderRows = this.rows;
        this.rowRects = Array.from(wrapperElementChildren).map((v) => this.convertDOMRectToScrollRect(v.getBoundingClientRect()));
        this.wrapperWidth = this.refWrapper.offsetWidth;
        this.wrapperHeight = this.refWrapper.offsetHeight;
        if ('horizontal' === this.options.direction)
            this.execHorizontalScroll(this.refContainer.scrollLeft);
        else
            this.execVerticalScroll(this.refContainer.scrollTop);
    }
    initRenderRows() {
        const wrapperMargin = this.getWrapperRealMarginAccordingToDirection();
        const rowSize = this.options.rowSize;
        this.renderRows = this.rows;
        if ('horizontal' === this.options.direction) {
            this.rowRects = Array.from(this.rows).map((v, i) => {
                const left = this.containerRect.left - this.calibrationScroll + wrapperMargin + (rowSize * i);
                return {
                    top: 0,
                    right: left + rowSize,
                    bottom: 0,
                    left,
                    width: 0,
                    height: 0,
                    x: 0,
                    y: 0,
                };
            });
            this.wrapperWidth = this.rows.length * rowSize;
            this.wrapperHeight = this.refWrapper.offsetHeight;
            this.execHorizontalScroll(this.refContainer.scrollLeft);
        }
        else {
            this.rowRects = Array.from(this.rows).map((v, i) => {
                const top = this.containerRect.top - this.calibrationScroll + wrapperMargin + (rowSize * i);
                return {
                    top,
                    right: 0,
                    bottom: top + rowSize,
                    left: 0,
                    width: 0,
                    height: 0,
                    x: 0,
                    y: 0,
                };
            });
            this.wrapperWidth = this.refWrapper.offsetWidth;
            this.wrapperHeight = this.rows.length * rowSize;
            this.execVerticalScroll(this.refContainer.scrollTop);
        }
    }
    initRender() {
        if (this.options.rowSize)
            this.initRenderRows();
        else
            this.initDynamicRenderRows();
    }
    getRenderRows() {
        return this.renderRows;
    }
    getRenderFirstRow() {
        return this.renderFirstRow;
    }
    getRenderLastRow() {
        return this.renderLastRow;
    }
    getFirstRow(scroll) {
        const [refFirstCoordinate, refLastCoordinate] = this.referenceCoordinates;
        const firstRow = this.rowRects.findIndex((v) => {
            return scroll <= v[refLastCoordinate] - this.containerRect[refFirstCoordinate] + this.calibrationScroll;
        });
        return Math.max(0, firstRow);
    }
    getFirstBenchRow(firstRow) {
        return Math.max(0, firstRow - this.options.bench);
    }
    getBeforeBenchRows(firstRow) {
        return this.rowRects.slice(this.getFirstBenchRow(firstRow), firstRow);
    }
    getLastRow(scroll, fr) {
        const containerSize = 'horizontal' === this.options.direction ? this.getContainerWidth() : this.getContainerHeight();
        const [refFirstCoordinate] = this.referenceCoordinates;
        const firstRow = fr ?? this.getFirstRow(scroll);
        let lastRow = this.rowRects.slice(firstRow, this.rows.length).findIndex((v) => {
            return scroll + containerSize <= v[refFirstCoordinate] - this.containerRect[refFirstCoordinate] + this.calibrationScroll;
        });
        lastRow = -1 === lastRow ? this.rows.length : firstRow + lastRow;
        return Math.min(this.rows.length, lastRow);
    }
    addRenderRows(children) {
        if ('horizontal' === this.options.direction) {
            this.rowRects = this.rowRects.concat(Array.from(children).map((v) => {
                const rect = this.convertDOMRectToScrollRect(v.getBoundingClientRect());
                return {
                    ...rect,
                    left: (this.wrapperWidth += rect.left),
                    right: (this.wrapperWidth += rect.right),
                };
            }));
            this.execHorizontalScroll(this.refContainer.scrollTop);
        }
        else {
            this.rowRects = this.rowRects.concat(Array.from(children).map((v) => {
                const rect = this.convertDOMRectToScrollRect(v.getBoundingClientRect());
                return {
                    ...rect,
                    top: (this.wrapperHeight += rect.top),
                    bottom: (this.wrapperHeight += rect.bottom),
                };
            }));
            this.execVerticalScroll(this.refContainer.scrollTop);
        }
    }
    updateRows(rows) {
        this.rows = rows;
        return {
            rendered: () => {
                if (!this.options.rowSize)
                    this.resetWrapperStyles();
                this.init();
            },
        };
    }
    getLastBenchRow(lastRow) {
        return Math.min(this.rows.length, lastRow + this.options.bench);
    }
    execVerticalScroll(scrollTop) {
        if (!this.rows.length)
            return;
        const firstRow = this.getFirstRow(scrollTop);
        const firstBenchRow = this.getFirstBenchRow(firstRow);
        const lastRow = this.getLastRow(scrollTop, firstRow);
        const lastBenchRow = this.getLastBenchRow(lastRow);
        const beforeRowsHeight = this.getBeforeBenchSize(scrollTop, firstRow);
        this.renderFirstRow = firstBenchRow;
        this.renderLastRow = lastBenchRow;
        this.renderRows = this.rows.slice(firstBenchRow, lastBenchRow);
        this.wrapperMarginTop = scrollTop - beforeRowsHeight;
        this.updateWrapperStyles();
    }
    moveVerticalScrollToRow(row) {
        if (!this.rows.length) {
            console.warn('rows가 존재하지 않습니다.');
            return;
        }
        const [refFirstCoordinate] = this.referenceCoordinates;
        const rect = this.rowRects[row];
        const scrollTop = rect[refFirstCoordinate] - this.containerRect[refFirstCoordinate] + this.calibrationScroll;
        this.refContainer.scrollTo(this.refContainer.scrollLeft, scrollTop);
    }
    execHorizontalScroll(scrollLeft) {
        if (!this.rows.length)
            return;
        const firstRow = this.getFirstRow(scrollLeft);
        const firstBenchRow = this.getFirstBenchRow(firstRow);
        const lastRow = this.getLastRow(scrollLeft, firstRow);
        const lastBenchRow = this.getLastBenchRow(lastRow);
        const beforeRowsWidth = this.getBeforeBenchSize(scrollLeft, firstRow);
        this.renderFirstRow = firstBenchRow;
        this.renderLastRow = lastBenchRow;
        this.renderRows = this.rows.slice(firstBenchRow, lastBenchRow);
        this.wrapperMarginLeft = scrollLeft - beforeRowsWidth;
        this.updateWrapperStyles();
    }
    addContainerScrollEvent(cb) {
        this.callback = cb;
    }
    removeContainerScrollEvent() {
        this.callback = null;
    }
    handleContainerScroll(e) {
        const target = e.target;
        if (target instanceof HTMLElement) {
            if ('horizontal' === this.options.direction)
                this.execHorizontalScroll(target.scrollLeft);
            else
                this.execVerticalScroll(target.scrollTop);
        }
        this.callback?.(e);
    }
}

module.exports = MyVirtualScroll;
