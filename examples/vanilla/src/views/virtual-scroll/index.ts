import MyVirtualScroll from '../../../../../src/my-virtual-scroll';
import Commons from '../../../libs/commons';

interface Row {
  rowIndex: number;
  value: number;
}

interface CustomNode {
  template: Node;
  replaceNodes: Node[];
  originalNodes: Node[];
}

(function(w, d) {
  console.log(w);

  const commons = new Commons<Row>();
  const rows = Array.from({ length: 1000 }, (_, i): Row => {
    return {
      rowIndex: i,
      value: i
    };
  });
  let container: HTMLElement  | null = null;
  let wrapper: HTMLElement  | null = null;
  let itemTemplate: HTMLTemplateElement  | null = null;
  let virtualScroll: MyVirtualScroll<Row>;
  
  const customNodes: CustomNode[] = [];

  const render = (renderRows: Row[]) => {
    if (wrapper && itemTemplate) {
      const children = wrapper.children;
      const rowCount = Math.max(children.length, renderRows.length);

      for (let i = 0; i < rowCount + 1; i++) {
        const el = children[i];
        const customNode = customNodes[i];
        const row = renderRows[i];

        if (!row && !customNode) {
          if (el) el.remove();

          continue;
        }

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
      }

      customNodes.splice(renderRows.length);
    }
  };

  const update = () => {
    if (!wrapper) return;

    const styles = virtualScroll.getWrapperStyle();
    const renderRows = virtualScroll.getRenderRows();

    render(renderRows);

    for (const [k, v] of Object.entries(styles)) {
      if (Reflect.has(wrapper.style, k)) wrapper.style.setProperty(k, v?.toString() ?? '');
    }
  };

  w.addEventListener('DOMContentLoaded', () => {
    container = d.getElementById('virtual-scroll-container-1');
    wrapper = d.getElementById('virtual-scroll-wrapper-1');
    itemTemplate = d.querySelector<HTMLTemplateElement>('#virtual-scroll-item');

    render(rows);

    if (container && wrapper) {
      virtualScroll = new MyVirtualScroll(container, wrapper, {
        rows: rows
      });
      virtualScroll.addContainerScrollEvent((e) => {
        update();
      });

      setTimeout(() => {
        update();
      }, 1000);

      setTimeout(() => {
        const addContainer = d.getElementById('virtual-scroll-wrapper-2');
        const children = addContainer?.children;

        if (children) virtualScroll.addRenderRows(children);
      }, 5000);
    }
  });
})(window, document);