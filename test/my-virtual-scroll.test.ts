/**
 * @jest-environment jsdom
 */

import {describe, expect, test} from '@jest/globals';
import MyVirtualScroll from '../src/my-virtual-scroll';

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

  // test('dynamic load', () => {
  //   const body = document.body;
  //   const container = document.createElement('div');
  //   const wrapper = document.createElement('ul');
  //   const item = document.createElement('li');
  //   const rows: Record<string, any>[] = [];

  //   body.appendChild(container);
  //   container.appendChild(wrapper);

  //   for (let i = 0; i < 1000; i++) {
  //     const newItem = item.cloneNode();

  //     newItem.textContent = `${i + 1} 번째 항목입니다.`;

  //     wrapper.appendChild(newItem);
  //     rows.push({
  //       row: i,
  //       name: `${i + 1} 번째 항목입니다.`
  //     });
  //   }

  //   const myVirtualScroll = new MyVirtualScroll(container, wrapper, {
  //     rows
  //   });
  //   const renderRows = myVirtualScroll.getRenderRows();

  //   expect(renderRows.length).toBe(3);
  // });

  test('fixed load', () => {
    const rowCount = 1000;
    const rowHeight = 50;
    const body = document.body;
    const container = document.createElement('div');
    const wrapper = document.createElement('ul');
    const item = document.createElement('li');
    const rows: Record<string, any>[] = [];

    container.scrollTop = 500;
    body.appendChild(container);
    container.appendChild(wrapper);

    for (let i = 0; i < rowCount; i++) {
      const newItem = item.cloneNode();

      newItem.textContent = `${i + 1} 번째 항목입니다.`;

      wrapper.appendChild(newItem);
      rows.push({
        row: i,
        name: `${i + 1} 번째 항목입니다.`
      });
    }

    const myVirtualScroll = new MyVirtualScroll(container, wrapper, {
      rows,
      rowHeight,
    });

    expect(1).toBe(rowCount / rowHeight);
  });
});