'use strict';

class MyVirtualScroll {
    options;
    rows = [];
    refContainer;
    containerRect;
    containerStyles;
    refWrapper;
    wrapperStyles;
    wrapperWidth = 0;
    wrapperPaddingLeft = 0;
    wrapperHeight = 0;
    wrapperPaddingTop = 0;
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
            rowHeight: options?.rowHeight ?? 0,
            bench: options?.bench ?? 0,
            direction: options?.direction ?? 'vertical',
            autoStyles: options?.autoStyles ?? false,
        };
        this.rows = options?.rows ?? [];
        this.referenceCoordinates = ['top', 'bottom'];
        this.init();
    }
    init() {
        this.initContainer();
        this.initWrapper();
        this.initRender();
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
        this.containerStyles = window.getComputedStyle(this.refContainer);
        this.calibrationScroll = this.refContainer.scrollTop;
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
    getWrapperMarginBottom() {
        const styles = this.wrapperStyles;
        const marginBottom = Number.parseFloat(styles['marginBottom']);
        return marginBottom;
    }
    getWrapperMarginVertical() {
        const styles = this.wrapperStyles;
        const verticalMargin = Number.parseFloat(styles['marginTop']) + Number.parseFloat(styles['marginBottom']);
        return verticalMargin;
    }
    getWrapperPaddingTop() {
        const styles = this.wrapperStyles;
        const paddingTop = Number.parseFloat(styles['paddingTop']);
        return paddingTop;
    }
    getWrapperPaddingBottom() {
        const styles = this.wrapperStyles;
        const paddingBottom = Number.parseFloat(styles['paddingBottom']);
        return paddingBottom;
    }
    getWrapperPaddingVertical() {
        const styles = this.wrapperStyles;
        const verticalPadding = Number.parseFloat(styles['paddingTop']) + Number.parseFloat(styles['paddingBottom']);
        return verticalPadding;
    }
    getWrapperStyle() {
        const transform = this.wrapperStyles.getPropertyValue('transform');
        const styles = {};
        if (this.hasVerticalScroll()) {
            const translateY = `translateY(${this.wrapperPaddingTop}px)`;
            styles.transform = 'none' === transform
                ? translateY
                : this.refWrapper.style.transform.replace(/translateY(.*.)/, translateY);
            styles.height = `${this.wrapperHeight - this.wrapperPaddingTop}px`;
        }
        return styles;
    }
    resetWrapperStyles = () => {
        if (!this.options.autoStyles)
            return;
        const translateY = 'translateY(0px)';
        this.refWrapper.style.transform.replace(/translateY(.*.)/, translateY);
        this.refWrapper.style.transform = this.refWrapper.style.transform.replace(/translateY(.*.)/, translateY);
        this.refWrapper.style.height = 'auto';
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
    getBeforeBenchWidth(firstRow) {
        const [refFirstCoordinate, refLastCoordinate] = this.referenceCoordinates;
        const beforeBenchRows = this.getBeforeBenchRows(firstRow);
        const beforeBenchFirstRow = beforeBenchRows[0];
        const beforeBenchLastRow = beforeBenchRows.slice(-1)[0];
        return beforeBenchRows.length ? beforeBenchLastRow[refLastCoordinate] - beforeBenchFirstRow[refFirstCoordinate] : 0;
    }
    getBeforeBenchHeight(scroll, firstRow) {
        const [refFirstCoordinate] = this.referenceCoordinates;
        const firstRowRect = this.rowRects[firstRow];
        const beforeBenchRowsRect = this.getBeforeBenchRows(firstRow);
        const beforeBenchFirstRowRect = beforeBenchRowsRect[0];
        const firstRowHideHeight = firstRowRect[refFirstCoordinate] - this.containerRect[refFirstCoordinate] - scroll + this.calibrationScroll;
        return beforeBenchRowsRect.length ? firstRowRect[refFirstCoordinate] - beforeBenchFirstRowRect[refFirstCoordinate] - firstRowHideHeight : -firstRowHideHeight;
    }
    initDynamicRenderRows() {
        const wrapperElementChildren = this.refWrapper.children;
        if (this.rows.length !== wrapperElementChildren.length)
            console.warn('렌더링 된 Row 개수와 전체 Row 개수가 일치하지 않아 정상적으로 표시되지 않을 수 있습니다.');
        this.renderRows = this.rows;
        this.rowRects = Array.from(wrapperElementChildren).map((v) => this.convertDOMRectToScrollRect(v.getBoundingClientRect()));
        this.wrapperWidth = this.refWrapper.offsetWidth;
        this.wrapperHeight = this.refWrapper.offsetHeight;
        this.execVerticalScroll(this.refContainer.scrollTop);
        if (this.hasVerticalScroll())
            this.wrapperHeight += this.getWrapperPaddingVertical() + this.getWrapperMarginVertical();
    }
    initRenderRows() {
        const rowHeight = this.options.rowHeight;
        this.renderRows = this.rows;
        this.rowRects = Array.from(this.rows).map((v, i) => {
            const top = this.containerRect.top + rowHeight * i;
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
        if (this.hasVerticalScroll())
            this.wrapperHeight += this.getWrapperPaddingVertical() + this.getWrapperMarginVertical();
    }
    initRender() {
        this.resetWrapperStyles();
        if (this.options.rowHeight)
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
        const containerSize = this.getContainerHeight();
        const [refFirstCoordinate] = this.referenceCoordinates;
        const firstRow = fr ?? this.getFirstRow(scroll);
        let lastRow = this.rowRects.slice(firstRow, this.rows.length).findIndex((v) => {
            return scroll + containerSize <= v[refFirstCoordinate] - this.containerRect[refFirstCoordinate] + this.calibrationScroll;
        });
        lastRow = -1 === lastRow ? this.rows.length : firstRow + lastRow;
        return Math.min(this.rows.length, lastRow);
    }
    addRenderRows(children) {
        this.rowRects = this.rowRects.concat(Array.from(children).map((v) => {
            const rect = this.convertDOMRectToScrollRect(v.getBoundingClientRect());
            return {
                ...rect,
                top: (this.wrapperHeight += rect.top),
                bottom: (this.wrapperHeight += rect.bottom),
            };
        }));
        this.execVerticalScroll(this.refContainer.scrollTop);
        if (this.hasVerticalScroll())
            this.wrapperHeight += this.getWrapperPaddingVertical() + this.getWrapperMarginVertical();
    }
    updateRows(rows) {
        this.rows = rows;
        return {
            rendered: () => {
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
        const beforeRowsHeight = this.getBeforeBenchHeight(scrollTop, firstRow);
        this.renderFirstRow = firstBenchRow;
        this.renderLastRow = lastBenchRow;
        this.renderRows = this.rows.slice(firstBenchRow, lastBenchRow);
        this.wrapperPaddingTop = scrollTop - beforeRowsHeight - this.getWrapperPaddingTop() - this.getWrapperMarginTop();
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
    addContainerScrollEvent(cb) {
        this.callback = cb;
    }
    removeContainerScrollEvent() {
        this.callback = null;
    }
    handleContainerScroll(e) {
        const target = e.target;
        if (target instanceof HTMLElement) {
            this.execVerticalScroll(target.scrollTop);
        }
        this.callback?.(e);
    }
}

module.exports = MyVirtualScroll;
