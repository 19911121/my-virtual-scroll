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
   * 화면 업데이트
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
    const containerCount = 6;
    const options: Partial<MyVirtualScrollOptions>[] = [{
      rows: rows,
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
      rowSize: 50,
    }, {
      rows: rows,
      direction: 'horizontal',
      autoStyles: true,
    }];

    for (let i = 0; i < containerCount; i++) {
      const container = d.getElementById(`virtual-scroll-container-${i}`);
      const wrapper = d.getElementById(`virtual-scroll-wrapper-${i}`);
      const option = options[i];

      if (!container || !wrapper) continue;

      containers[i] = container;
      wrappers[i] = wrapper;
  
      // 동적 사이즈 계산일일 경우에는 모든 row를 렌더링
      if (!option.rowSize) render(i, rows);

      myVirtualScrolls[i] = new MyVirtualScroll(container, wrapper, option);
      myVirtualScrolls[i].addContainerScrollEvent((e) => {
        if (option.autoStyles) update(i);
        else updateWithStyles(i);
      });

      // 가상스크롤 생성 후 화면에 보이는 개수만큼 렌더링
      if (option.autoStyles) update(i);
      else updateWithStyles(i);

      // 로우 변경 예제
      setTimeout(() => {
        console.log('update rows', i);

        const newRows: Row[] = [...rows, ...Array.from({ length: 1000 }, (_, i): Row => {
          return {
            index: 1000 + i + 1,
            value: `v${1000 + i}`
          };
        })];

        // 동적 사이즈 계산일 경우 스타일 초기화 후 모든 row을 그려준다.
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