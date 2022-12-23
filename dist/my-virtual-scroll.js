'use strict';

const ScrollDirection = {
    Horizontal: 'horizontal',
    Vertical: 'vertical'
};
const convertDOMRectToScrollRect = (domrect) => {
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
};
const getContainerCurrentScroll = (container, direction) => {
    return 'horizontal' === direction ? container.scrollLeft : container.scrollTop;
};

const toCapitalize = (name) => {
    return name[0].toUpperCase() + name.slice(1);
};
const getStartDirectionName = (scrollRefCoordinates) => {
    const name = scrollRefCoordinates[0];
    return name[0].toUpperCase() + name.slice(1);
};
const getEndDirectionName = (scrollRefCoordinates) => {
    const name = scrollRefCoordinates[1];
    return toCapitalize(name);
};
const getStyleProp = (direction) => {
    return ScrollDirection.Horizontal === direction ? {
        transformFunctionName: 'translateX',
        size: 'width'
    } : {
        transformFunctionName: 'translateY',
        size: 'height'
    };
};
const wrapperStartOrEndStyleValue = (computedStyle, prop) => {
    const value = computedStyle[prop];
    return {
        value: () => value,
        number: () => value ? Number.parseFloat(value.toString()) : NaN,
    };
};
const getAppliedInlineStyles = (wrapper) => {
    const wrapperStylesText = wrapper.style.cssText;
    return wrapperStylesText
        ? Object.fromEntries(wrapperStylesText.split(';').slice(0, -1).map(v => {
            const [key, value] = v.split(':');
            return [key, value.trim()];
        }))
        : {};
};
const getWrapperStyle = (wrapper, styleProp, styleWrapper) => {
    const wrapperStyles = getAppliedInlineStyles(wrapper);
    const transform = wrapper.style.transform;
    const transformFunction = `${styleProp.transformFunctionName}(${(styleWrapper.current)}px)`;
    const regex = new RegExp(`${styleProp.transformFunctionName}(.+)`);
    const styles = {};
    for (const [k, v] of Object.entries(wrapperStyles)) {
        styles[k] = v;
    }
    styles.transform = transform
        ? wrapper.style.transform.replace(regex, transformFunction)
        : transformFunction;
    return styles;
};
const getResetWrapperStyles = (wrapper, styleProp) => {
    const transform = wrapper.style.transform;
    const transformFunction = `${styleProp.transformFunctionName}(0px)`;
    const regex = new RegExp(`${styleProp.transformFunctionName}(.+)`);
    const styles = {};
    styles.transform = transform
        ? wrapper.style.transform.replace(regex, transformFunction)
        : transformFunction;
    return styles;
};
const getWrapperSingleNameStartEmptySize = (args) => wrapperStartOrEndStyleValue(args[0], `${args[2]}${getStartDirectionName(args[1])}`).number();
const getWrapperSingleNameEndEmptySize = (args) => wrapperStartOrEndStyleValue(args[0], `${args[2]}${getEndDirectionName(args[1])}`).number();
const getWrapperPairNameStartEmptySize = (args) => wrapperStartOrEndStyleValue(args[0], `${args[2]}${getStartDirectionName(args[1])}${toCapitalize(args[3])}`).number();
const getWrapperPairNameEndEmptySize = (args) => wrapperStartOrEndStyleValue(args[0], `${args[2]}${getEndDirectionName(args[1])}${toCapitalize(args[3])}`).number();
const wrapperStyles = (computedStyle, scrollRefCoordinates) => {
    const args = [computedStyle, scrollRefCoordinates];
    return {
        getStartEmptySize: (name) => getWrapperSingleNameStartEmptySize([...args, name]),
        getEndEmptySize: (name) => getWrapperSingleNameEndEmptySize([...args, name]),
        getEmptySizeSum: (name) => getWrapperSingleNameStartEmptySize([...args, name]) + getWrapperSingleNameEndEmptySize([...args, name]),
        getPairStartEmptySize: (startName, endName) => getWrapperPairNameStartEmptySize([...args, startName, endName]),
        getPairEndEmptySize: (startName, endName) => getWrapperPairNameEndEmptySize([...args, startName, endName]),
        getPairEmptySizeSum: (startName, endName) => getWrapperPairNameStartEmptySize([...args, startName, endName]) + getWrapperPairNameEndEmptySize([...args, startName, endName]),
    };
};

const createRowRect = (rowCount, scrollRefCoordinates, wrapperStartEmptySize, size) => {
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
const createDynamicRowRect = (children, conatinerRect, scrollRefCoordinates, calibrationScroll) => {
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
const getFirstRow = (rowRects, scrollRefCoordinates, scroll) => {
    const [, endCoordinateKey] = scrollRefCoordinates;
    const firstRow = rowRects.findIndex((v, i) => {
        return scroll < v[endCoordinateKey];
    });
    return Math.max(0, firstRow);
};
const getFirstBenchRow = (firstRow, bench = 0) => Math.max(0, firstRow - bench);
const getBeforeBenchRows = (rowRects, firstRow, bench = 0) => {
    return rowRects.slice(getFirstBenchRow(firstRow, bench), firstRow);
};
const getLastRow = (rowRects, containerRect, scrollRefCoordinates, scroll, fr) => {
    const [startCoordinateKey, endCoordinateKey] = scrollRefCoordinates;
    const containerSize = containerRect[endCoordinateKey] - containerRect[startCoordinateKey];
    const firstRow = fr ?? getFirstRow(rowRects, scrollRefCoordinates, scroll);
    let lastRow = rowRects.slice(firstRow, rowRects.length).findIndex(v => scroll + containerSize <= v[startCoordinateKey]);
    lastRow = -1 === lastRow ? rowRects.length : firstRow + lastRow;
    return Math.min(rowRects.length, lastRow);
};
const getLastBenchRow = (lastRow, rowCount, bench = 0) => Math.min(rowCount, lastRow + bench);
const getBeforeBenchSize = (rowRects, wrapperStartEmptySize, scrollRefCoordinates, scroll, firstRow, bench = 0) => {
    const [startCoordinateKey] = scrollRefCoordinates;
    const firstRowRect = rowRects[firstRow];
    const beforeBenchRowsRect = getBeforeBenchRows(rowRects, firstRow, bench);
    const beforeBenchFirstRowRect = beforeBenchRowsRect[0];
    const firstRowHideSize = scroll > wrapperStartEmptySize
        ? scroll - firstRowRect[startCoordinateKey]
        : 0;
    return beforeBenchRowsRect.length
        ? firstRowHideSize + firstRowRect[startCoordinateKey] - beforeBenchFirstRowRect[startCoordinateKey]
        : firstRowHideSize;
};

class MyVirtualScroll {
    rows = [];
    options;
    refContainer;
    containerRect;
    sizeAreaElement = null;
    refWrapper;
    wrapperStyles;
    wrapperPosition = {
        current: 0,
        size: 0,
    };
    renderRows = [];
    renderFirstRow = 0;
    renderLastRow = 0;
    rowRects = [];
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
    initContainer() {
        this.removeContainerEvent();
        this.addContainerEvent();
        this.containerRect = convertDOMRectToScrollRect(this.refContainer.getBoundingClientRect());
    }
    getCurrentScroll() {
        return 'horizontal' === this.options.direction
            ? this.refContainer.scrollLeft
            : this.refContainer.scrollTop;
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
    getWrapperStyle() {
        return getWrapperStyle(this.refWrapper, getStyleProp(this.options.direction), this.wrapperPosition);
    }
    updateWrapperStyles = (reset = false) => {
        if (!this.options.autoStyles)
            return;
        const styles = reset
            ? getResetWrapperStyles(this.refWrapper, getStyleProp(this.options.direction))
            : getWrapperStyle(this.refWrapper, getStyleProp(this.options.direction), this.wrapperPosition);
        this.refWrapper.style.cssText = Object.entries(styles).map(v => `${v[0]}: ${v[1]}`).join(';');
    };
    initRenderRows() {
        const ws = wrapperStyles(this.wrapperStyles, this.referenceCoordinates);
        const rowSize = this.options.rowSize;
        const rowCount = this.rows.length;
        const startEmptySize = ws.getStartEmptySize('margin') + ws.getStartEmptySize('padding') + ws.getPairStartEmptySize('border', 'width');
        this.rowRects = createRowRect(rowCount, this.referenceCoordinates, startEmptySize, rowSize);
        this.wrapperPosition.size = rowCount * rowSize;
        this.execScroll(getContainerCurrentScroll(this.refContainer, this.options.direction));
    }
    initDynamicRenderRows() {
        const ws = wrapperStyles(this.wrapperStyles, this.referenceCoordinates);
        const scroll = this.getCurrentScroll();
        const wrapperStartEmptySize = ws.getStartEmptySize('margin') + ws.getStartEmptySize('padding');
        const hideSize = getBeforeBenchSize(this.rowRects, wrapperStartEmptySize, this.referenceCoordinates, scroll, getFirstRow(this.rowRects, this.referenceCoordinates, scroll), this.options.bench);
        const wrapperChildren = this.refWrapper.children;
        if (this.rows.length !== wrapperChildren.length)
            console.warn('렌더링 된 Row 개수와 전체 Row 개수가 일치하지 않아 정상적으로 표시되지 않을 수 있습니다.', `rows length ${this.rows.length}`, `child length ${wrapperChildren.length}`);
        this.rowRects = createDynamicRowRect(wrapperChildren, this.containerRect, this.referenceCoordinates, hideSize);
        this.wrapperPosition.size = 'horizontal' === this.options.direction
            ? this.refWrapper.offsetWidth - ws.getEmptySizeSum('padding')
            : this.refWrapper.offsetHeight - ws.getEmptySizeSum('padding');
        this.execScroll(getContainerCurrentScroll(this.refContainer, this.options.direction));
    }
    initRender() {
        if (this.options.rowSize)
            this.initRenderRows();
        else
            this.initDynamicRenderRows();
        this.initSizeArea();
    }
    initSizeArea() {
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
    getRenderRows() {
        return this.renderRows;
    }
    getRenderFirstRow() {
        return this.renderFirstRow;
    }
    getRenderLastRow() {
        return this.renderLastRow;
    }
    addContainerScrollEvent(cb) {
        this.callback = cb;
    }
    removeContainerScrollEvent() {
        this.callback = null;
    }
    updateRows(rows) {
        this.rows = rows;
        return {
            rendered: () => {
                this.init();
            },
        };
    }
    moveVerticalScrollToRow(row) {
        console.warn('moveScrollToRow를 사용해 주세요! moveVerticalScrollToRow는 곧 삭제됩니다.');
        this.moveScrollToRow(row);
    }
    moveScrollToRow(row) {
        if (!this.rows.length) {
            console.warn('rows가 존재하지 않습니다.');
            return;
        }
        const [refFirstCoordinate] = this.referenceCoordinates;
        const rect = this.rowRects[row];
        const scroll = rect[refFirstCoordinate];
        if ('horizontal' === this.options.direction)
            this.refContainer.scrollTo(scroll, this.refContainer.scrollTop);
        else
            this.refContainer.scrollTo(this.refContainer.scrollLeft, scroll);
    }
    execScroll(scroll) {
        const ws = wrapperStyles(this.wrapperStyles, this.referenceCoordinates);
        const wrapperStartSizeSum = ws.getStartEmptySize('margin') + ws.getStartEmptySize('padding');
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
    handleContainerScroll(e) {
        const target = e.target;
        if (target instanceof HTMLElement)
            this.execScroll(getContainerCurrentScroll(target, this.options.direction));
        this.callback?.(e);
    }
}

module.exports = MyVirtualScroll;
