import MyVirtualScroll from '../../../../../src/my-virtual-scroll';
import Commons from '../../../libs/commons';
import type { MyVirtualScrollOptions } from '../../../../../src/my-virtual-scroll';

interface Row {
  index: number;
  value: string;
}

interface CustomNode {
  template: Node;
  replaceNodes: Node[];
  originalNodes: Node[];
}

(function(w, d) {
  const commons = new Commons<Row>();
  const rows = Array.from({ length: 1000 }, (_, i): Row => {
    return {
      index: i,
      value: i.toString()
    };
  });
  const customNodesGroup: CustomNode[][] = [];

  let containers: HTMLElement[] = [];
  let wrappers: HTMLElement[] = [];
  let itemTemplate: HTMLTemplateElement | null = null;
  let myVirtualScrolls: MyVirtualScroll<Row>[] = [];

  itemTemplate = d.querySelector<HTMLTemplateElement>('#virtual-scroll-item');
  
  const render = (index: number, renderRows: Row[]) => {
    const wrapper = wrappers[index];

    if (wrapper && itemTemplate) {
      if (!customNodesGroup[index]) customNodesGroup[index] = [];

      const children = wrapper.children;
      const rowCount = Math.max(children.length, renderRows.length);
      const customNodes = customNodesGroup[index]; 

      for (let i = 0; i < rowCount + 1; i++) {
        const el = children[i];
        const customNode = customNodes[i];
        const row = renderRows[i];

        if (row) {
          if (!customNode) {
            const customReplaceNode = commons.createReplaceNode(itemTemplate, row);

            customNodes.push(customReplaceNode);

            if (el) el.replaceWith(customReplaceNode.template);
            else wrapper.appendChild(customReplaceNode.template);
          }
          else {
            for (let i = 0; i < customNode.replaceNodes.length; i++) {
              const replaceNode = customNode.replaceNodes[i];
              const originalNode = customNode.originalNodes[i];
  
              commons.updateNodeValue(replaceNode, originalNode, row);
            }
          }
        }
        else {
          if (el) {
            let j = i;

            while (rowCount > j) {
              children[i].remove();
              j++;
            }
  
            break;
          }
        }
      }

      customNodes.splice(renderRows.length);
    }
  };

  /**
   * ?????? ????????????
   */
  const update = (index: number) => {
    if (!wrappers[index]) return;

    const myVirtualScroll = myVirtualScrolls[index];
    const renderRows = myVirtualScroll.getRenderRows();

    render(index, renderRows);
  };

  const updateWithStyles = (index: number) => {
    if (!wrappers[index]) return;

    const myVirtualScroll = myVirtualScrolls[index];
    const wrapper = wrappers[index];
    const styles = myVirtualScroll.getWrapperStyle();
    const renderRows = myVirtualScroll.getRenderRows();

    render(index, renderRows);

    wrapper.style.cssText = Object.entries(styles).map(v => `${v[0]}: ${v[1]}`).join(';');
  };

  /**
   * ????????? ?????????
   */
  const resetStyles = (index: number) => {
    if (!wrappers[index]) return;

    const myVirtualScroll = myVirtualScrolls[index];
    const styles = myVirtualScroll.getWrapperStyle();

    wrappers[index].style.cssText = Object.entries(styles).map(v => `${v[0]}: ${v[1]}`).join(';');
  };

  w.addEventListener('DOMContentLoaded', () => {
    const containerCount = 8;
    const options: Partial<MyVirtualScrollOptions>[] = [{
      rows: rows,
      bench: 0,
    }, {
      rows: rows,
      bench: 0,
      autoStyles: true,
    }, {
      rows: rows,
      rowSize: 21,
    }, {
      rows: rows,
      rowSize: 21,
      autoStyles: true,
    }, {
      rows: rows,
      direction: 'horizontal'
    }, {
      rows: rows,
      direction: 'horizontal',
      autoStyles: true,
    }, {
      rows: rows,
      direction: 'horizontal',
      rowSize: 50,
    }, {
      rows: rows,
      direction: 'horizontal',
      rowSize: 50,
      autoStyles: true,
    }];

    for (let i = 0; i < containerCount; i++) {
      const container = d.getElementById(`virtual-scroll-container-${i}`);
      const wrapper = d.getElementById(`virtual-scroll-wrapper-${i}`);
      const option = options[i];

      if (!container || !wrapper) continue;

      containers[i] = container;
      wrappers[i] = wrapper;
  
      // ?????? ????????? ???????????? ???????????? ?????? row??? ?????????
      if (!option.rowSize) render(i, rows);

      myVirtualScrolls[i] = new MyVirtualScroll(container, wrapper, option);
      myVirtualScrolls[i].addContainerScrollEvent((e) => {
        if (option.autoStyles) update(i);
        else updateWithStyles(i);
      });

      // ??????????????? ?????? ??? ????????? ????????? ???????????? ?????????
      if (option.autoStyles) update(i);
      else updateWithStyles(i);

      // ?????? ?????? ??????

      setTimeout(() => {
        console.log('update rows', i);

        const newRows: Row[] = [...rows, ...Array.from({ length: 1000 }, (_, i): Row => {
          return {
            index: 1000 + i + 1,
            value: `v${1000 + i}`
          };
        })];

        // ?????? ????????? ????????? ?????? ????????? ????????? ??? ?????? row??? ????????????.
        if (!option.rowSize) {
          if (!option.autoStyles) resetStyles(i);

          render(i, newRows);
        }

        myVirtualScrolls[i].updateRows(newRows).rendered();

        if (option.autoStyles) update(i);
        else updateWithStyles(i);
      }, 3000);
    }
  });
})(window, document);