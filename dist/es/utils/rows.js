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

export { createDynamicRowRect, createRowRect, getBeforeBenchSize, getFirstBenchRow, getFirstRow, getLastBenchRow, getLastRow };
