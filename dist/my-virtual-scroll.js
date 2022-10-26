'use strict';

class MyVirtualScroll {
    constructor(container, wrapper, options) {
        var _a, _b, _c, _d;
        this.rows = [];
        this.wrapperWidth = 0;
        this.wrapperPaddingLeft = 0;
        this.wrapperHeight = 0;
        this.wrapperPaddingTop = 0;
        this.renderRows = [];
        this.renderFirstRow = 0;
        this.renderLastRow = 0;
        this.rowRects = [];
        this.calibrationScroll = 0;
        this.bindHandleContainerScroll = this.handleContainerScroll.bind(this);
        this.callback = null;
        this.refContainer = container;
        this.refWrapper = wrapper;
        this.options = {
            rowHeight: (_a = options === null || options === void 0 ? void 0 : options.rowHeight) !== null && _a !== void 0 ? _a : 0,
            bench: (_b = options === null || options === void 0 ? void 0 : options.bench) !== null && _b !== void 0 ? _b : 0,
            direction: (_c = options === null || options === void 0 ? void 0 : options.direction) !== null && _c !== void 0 ? _c : 'vertical',
        };
        this.rows = (_d = options === null || options === void 0 ? void 0 : options.rows) !== null && _d !== void 0 ? _d : [];
        if (this.isVerticalScroll())
            this.referenceCoordinates = ['top', 'bottom'];
        else
            this.referenceCoordinates = ['left', 'right'];
        this.init();
    }
    init() {
        this.initContainer();
        this.initWrapper();
        this.initRender();
    }
    isVerticalScroll() {
        return 'vertical' === this.options.direction;
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
        this.containerStyles = window.getComputedStyle(this.refContainer);
        this.calibrationScroll = this.refContainer.scrollTop - this.wrapperPaddingTop;
    }
    getContainerPaddingVertical() {
        const styles = this.containerStyles;
        const verticalPadding = Number.parseFloat(styles['paddingTop']) + Number.parseFloat(styles['paddingBottom']);
        return verticalPadding;
    }
    getContainerPaddingTop() {
        const styles = this.containerStyles;
        const paddingTop = Number.parseFloat(styles['paddingTop']);
        return paddingTop;
    }
    getContainerPaddingBottom() {
        const styles = this.containerStyles;
        const paddingBottom = Number.parseFloat(styles['paddingBottom']);
        return paddingBottom;
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
        const verticalMarginTop = Number.parseFloat(styles['marginTop']);
        return verticalMarginTop;
    }
    getWrapperMarginVertical() {
        const styles = this.wrapperStyles;
        const verticalMarginBottom = Number.parseFloat(styles['marginBottom']);
        return verticalMarginBottom;
    }
    getWrapperStyle() {
        const styles = {};
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
        const firstRowHideHeight = firstRowRect[refFirstCoordinate] - this.containerRect[refFirstCoordinate] - scroll - this.getWrapperMarginTop() + this.calibrationScroll;
        return beforeBenchRowsRect.length ? firstRowRect[refFirstCoordinate] - beforeBenchFirstRowRect[refFirstCoordinate] - firstRowHideHeight : -firstRowHideHeight;
    }
    initDynamicRenderRows() {
        this.renderRows = this.rows;
        this.rowRects = Array.from(this.refWrapper.children).map((v) => this.convertDOMRectToScrollRect(v.getBoundingClientRect()));
        this.wrapperWidth = this.refWrapper.offsetWidth;
        this.wrapperHeight = this.refWrapper.offsetHeight;
        this.execVerticalScroll(this.refContainer.scrollTop);
        if (this.hasVerticalScroll())
            this.wrapperHeight += this.getContainerPaddingVertical();
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
            this.wrapperHeight += this.getContainerPaddingVertical();
    }
    initRender() {
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
        const containerSize = 'horizontal' === this.options.direction ? this.getContainerWidth() : this.getContainerHeight();
        const [refFirstCoordinate] = this.referenceCoordinates;
        const firstRow = fr !== null && fr !== void 0 ? fr : this.getFirstRow(scroll);
        let lastRow = this.rowRects.slice(firstRow, this.rows.length).findIndex((v) => {
            return scroll + containerSize <= v[refFirstCoordinate] - this.containerRect[refFirstCoordinate] + this.calibrationScroll;
        });
        lastRow = -1 === lastRow ? this.rows.length : firstRow + lastRow;
        return Math.min(this.rows.length, lastRow);
    }
    addRenderRows(children, height) {
        this.wrapperHeight += height;
        this.rowRects = this.rowRects.concat(Array.from(children).map((v) => {
            const rect = this.convertDOMRectToScrollRect(v.getBoundingClientRect());
            return Object.assign(Object.assign({}, rect), { top: (this.wrapperHeight += rect.top), bottom: (this.wrapperHeight += rect.bottom) });
        }));
        this.execVerticalScroll(this.refContainer.scrollTop);
        if (this.hasVerticalScroll())
            this.wrapperHeight += this.getContainerPaddingVertical();
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
    moveVerticalScrollToRow(row) {
        const [refFirstCoordinate] = this.referenceCoordinates;
        const rect = this.rowRects[row];
        const scrollTop = rect[refFirstCoordinate] - this.containerRect[refFirstCoordinate] + this.calibrationScroll;
        this.refContainer.scrollTo(this.refContainer.scrollLeft, scrollTop);
    }
    execHorizontalScroll(scrollLeft) {
        const firstRow = this.getFirstRow(scrollLeft);
        const firstBenchRow = this.getFirstBenchRow(firstRow);
        const lastRow = this.getLastRow(scrollLeft, firstRow);
        const lastBenchRow = this.getLastBenchRow(lastRow);
        const beforeRowsWidth = this.getBeforeBenchWidth(firstRow);
        this.renderRows = this.rows.slice(firstBenchRow, lastBenchRow);
        this.wrapperPaddingLeft = scrollLeft - beforeRowsWidth;
    }
    addContainerScrollEvent(cb) {
        this.callback = cb;
    }
    removeContainerScrollEvent() {
        this.callback = null;
    }
    handleContainerScroll(e) {
        var _a;
        const target = e.target;
        if (target instanceof HTMLElement) {
            if ('horizontal' === this.options.direction)
                this.execHorizontalScroll(target.scrollLeft);
            else
                this.execVerticalScroll(target.scrollTop);
        }
        (_a = this.callback) === null || _a === void 0 ? void 0 : _a.call(this, e);
    }
}

module.exports = MyVirtualScroll;
