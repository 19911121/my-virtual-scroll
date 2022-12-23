/**
 * @jest-environment jsdom
 */
import { describe, expect, test } from '@jest/globals';
import MyVirtualScroll from '../src/my-virtual-scroll';
import { createRowRect, getBeforeBenchSize, getFirstRow } from '../src/utils/rows';
import { getWrapperStyle } from '../src/utils/styles';
import type { ScrollRefCoordinates } from '../src/utils/scroll';


describe('my virtual scroll', () => {
  test('empty load', () => {
    const body = document.body;
    const container = document.createElement('div');
    const wrapper = document.createElement('ul');

    body.appendChild(container);
    container.appendChild(wrapper);

    const myVirtualScroll = new MyVirtualScroll(container, wrapper);

    expect(myVirtualScroll.getRenderRows().length).toBe(0);
    expect(myVirtualScroll.getRenderFirstRow()).toBe(0);
    expect(myVirtualScroll.getRenderLastRow()).toBe(0);
  });

  // #region utils > rows
  test('[utils.rows] vertical first row with empty size test', () => {
    const scroll = 470;
    const rowSize = 50;
    const wrapperStartEmptySize = 100;
    const scrollRefCoordinates: ScrollRefCoordinates = ['top', 'bottom'];
    const rects = createRowRect(1000, ['top', 'bottom'], wrapperStartEmptySize, rowSize);
    const firstRow = getFirstRow(rects, scrollRefCoordinates, scroll); // 9

    expect(firstRow).toBe(7); // 7: 350 ~ 400
  });
  
  test('[utils.rows] vertical bench hide size test', () => {
    const scroll = 470;
    const rowSize = 50;
    const wrapperStartEmptySize = 0;
    const scrollRefCoordinates: ScrollRefCoordinates = ['top', 'bottom'];
    const rects = createRowRect(1000, ['top', 'bottom'], wrapperStartEmptySize, rowSize);
    const firstRow = getFirstRow(rects, scrollRefCoordinates, scroll);
    const hideSizeForBench0 = getBeforeBenchSize(rects, wrapperStartEmptySize, scrollRefCoordinates, scroll, firstRow, 0);
    const hideSizeForBench1 = getBeforeBenchSize(rects, wrapperStartEmptySize, scrollRefCoordinates, scroll, firstRow, 1);
    const hideSizeForBench2 = getBeforeBenchSize(rects, wrapperStartEmptySize, scrollRefCoordinates, scroll, firstRow, 2);
    const hideSizeForBench3 = getBeforeBenchSize(rects, wrapperStartEmptySize, scrollRefCoordinates, scroll, firstRow, 3);

    expect(firstRow).toBe(9); // 9: 450 ~ 500
    expect(hideSizeForBench0).toBe(20); // 20
    expect(hideSizeForBench1).toBe(70); // 50 + 20
    expect(hideSizeForBench2).toBe(120); // 100 + 20
    expect(hideSizeForBench3).toBe(170); // 150 + 20
  });

  test('[utils.rows] horizontal first with empty size', () => {
    const scroll = 527;
    const rowSize = 50;
    const wrapperStartEmptySize = 50;
    const scrollRefCoordinates: ScrollRefCoordinates = ['left', 'right'];
    const rects = createRowRect(1000, ['left', 'right'], wrapperStartEmptySize, rowSize);
    const firstRow = getFirstRow(rects, scrollRefCoordinates, scroll);

    expect(firstRow).toBe(9); // 9: 450 ~ 500
  });

  test('[utils.rows] horizontal bench hide size test', () => {
    const scroll = 527;
    const rowSize = 50;
    const wrapperStartEmptySize = 0;
    const scrollRefCoordinates: ScrollRefCoordinates = ['left', 'right'];
    const rects = createRowRect(1000, ['left', 'right'], wrapperStartEmptySize, rowSize);
    const firstRow = getFirstRow(rects, scrollRefCoordinates, scroll);
    const hideSizeForBench0 = getBeforeBenchSize(rects, wrapperStartEmptySize, scrollRefCoordinates, scroll, firstRow, 0);
    const hideSizeForBench1 = getBeforeBenchSize(rects, wrapperStartEmptySize, scrollRefCoordinates, scroll, firstRow, 1);
    const hideSizeForBench2 = getBeforeBenchSize(rects, wrapperStartEmptySize, scrollRefCoordinates, scroll, firstRow, 2);
    const hideSizeForBench3 = getBeforeBenchSize(rects, wrapperStartEmptySize, scrollRefCoordinates, scroll, firstRow, 3);

    expect(firstRow).toBe(10); // 9: 450 ~ 500
    expect(hideSizeForBench0).toBe(27); // 20
    expect(hideSizeForBench1).toBe(77); // 50 + 20
    expect(hideSizeForBench2).toBe(127); // 100 + 20
    expect(hideSizeForBench3).toBe(177); // 150 + 20
  });
  // #endregion

  // #region utils styles
  test('[utils.styles] getWrapperStyle test', () => {
    const body = document.body;
    const container = document.createElement('div');
    const wrapper = document.createElement('ul');

    body.appendChild(container);
    container.appendChild(wrapper);

    const myVirtualScroll = new MyVirtualScroll(container, wrapper);
    const styles = getWrapperStyle(wrapper, { transformFunctionName: 'translateY', size: 'height' }, { current: 100, size: 300 });
   
    expect(styles).toStrictEqual({ transform: 'translateY(100px)'}); // 150 + 20
  });
  // #endregion

});