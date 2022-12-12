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
          if (customNode || el) {
            let j = i;

            while (rowCount > j) {
              children[i]?.remove?.();
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
   * 화면 업데이트
   */
  const update = (index: number) => {
    if (!wrappers[index]) return;

    const myVirtualScroll = myVirtualScrolls[index];
    const wrapper = wrappers[index];
    const styles = myVirtualScroll.getWrapperStyle();
    const renderRows = myVirtualScroll.getRenderRows();

    render(index, renderRows);

    for (const [k, v] of Object.entries(styles)) {
      if (Reflect.has(wrapper.style, k)) wrapper.style.setProperty(k, v?.toString() ?? '');
    }
  };

  /**
   * 스타일 초기화
   */
  const resetStyles = (index: number) => {
    if (!wrappers[index]) return;

    const myVirtualScroll = myVirtualScrolls[index];
    const styles = myVirtualScroll.getWrapperStyle();

    for (const [k, v] of Object.entries(styles)) {
      if (Reflect.has(wrappers[index].style, k)) wrappers[index].style.removeProperty(k);
    }
  };

  w.addEventListener('DOMContentLoaded', () => {
    const containerCount = 4;
    const options: Partial<MyVirtualScrollOptions>[] = [{
      rows: rows,
    }, {
      rows: rows,
      rowSize: 21,
    }, {
      rows: rows,
      direction: 'horizontal'
    }, {
      rows: rows,
      direction: 'horizontal',
      rowSize: 50,
    }];

    itemTemplate = d.querySelector<HTMLTemplateElement>('#virtual-scroll-item');

    for (let i = 0; i < containerCount; i++) {
      const container = d.getElementById(`virtual-scroll-container-${i}`);
      const wrapper = d.getElementById(`virtual-scroll-wrapper-${i}`);
      const option = options[i];

      if (!container || !wrapper) continue;

      containers[i] = container;
      wrappers[i] = wrapper;
  
      if (!option.rowSize) render(i, rows);

      if (container && wrapper) {
        myVirtualScrolls[i] = new MyVirtualScroll(container, wrapper, option);
        myVirtualScrolls[i].addContainerScrollEvent((e) => {
          update(i);
        });
  
        update(i);
  
        setTimeout(() => {
          console.log('update rows');
  
          const newRows: Row[] = [...rows, ...Array.from({ length: 1000 }, (_, i): Row => {
            return {
              index: 1000 + i + 1,
              value: `v${1000 + i}`
            };
          })];

          if (!option.rowSize) {
            resetStyles(i);
            render(i, newRows);
          }

          const updateRow = myVirtualScrolls[i].updateRows(newRows);

          updateRow.rendered();
  
          update(i);
        }, 3000);
      }
    }
  });
})(window, document);