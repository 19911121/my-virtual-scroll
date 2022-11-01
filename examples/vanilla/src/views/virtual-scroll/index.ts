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
  const commons = new Commons<Row>();
  const rows = Array.from({ length: 100 }, (_, i): Row => {
    return {
      rowIndex: i,
      value: i
    };
  });
  const virtualScrolls: MyVirtualScroll<Row>[] = [];
  const itemNodes: CustomNode[][] = [];
  let containers: HTMLElement[] = [];
  let wrappers: HTMLElement[] = [];
  let itemTemplate: HTMLTemplateElement | null = null;

  const render = (vsIndex: number, renderRows: Row[]) => {
    const wrapper = wrappers[vsIndex];
    const renderNodes = itemNodes[vsIndex];
    
    if (wrapper && itemTemplate) {
      const children = wrapper.children;
      const rowCount = Math.max(children.length, renderRows.length);

      for (let i = 0; i < rowCount; i++) {
        const el = children[i];
        const row = renderRows[i];
        const renderNode = renderNodes[i];

        if (row) {
          if (renderNode) {
            for (let i = 0; i < renderNode.replaceNodes.length; i++) {
              const replaceNode = renderNode.replaceNodes[i];
              const originalNode = renderNode.originalNodes[i];
  
              commons.updateNodeValue(replaceNode, originalNode, row);
            }
          }
          else {
            const customReplaceNode = commons.createReplaceNode(itemTemplate, row);

            renderNodes.push(customReplaceNode);

            if (el) el.replaceWith(customReplaceNode.template);
            else wrapper.appendChild(customReplaceNode.template);
          }
        }
        else {
          Array.from(children).slice(i).forEach(v => v.remove());

          break;
        }
      }

      renderNodes.splice(renderRows.length);
    }
  };

  const update = (vsIndex: number) => {
    const wrapper = wrappers[vsIndex];

    if (!wrapper) return;

    const virtualScroll = virtualScrolls[vsIndex];
    const renderRows = virtualScroll.getRenderRows();

    render(vsIndex, renderRows);

    if (0 !== vsIndex) {
      const styles = virtualScroll.getWrapperStyle();

      for (const [k, v] of Object.entries(styles)) {
        if (Reflect.has(wrapper.style, k)) wrapper.style.setProperty(k, v?.toString() ?? '');
      }
    }
  };

  w.addEventListener('DOMContentLoaded', () => {
    itemTemplate = d.querySelector<HTMLTemplateElement>('#virtual-scroll-item');

    for (let i = 0; i < 2; i++) {
      const container = d.getElementById(`virtual-scroll-container-${i + 1}`);
      const wrapper = d.getElementById(`virtual-scroll-wrapper-${i + 1}`);

      if (container && wrapper) {
        containers.push(container);
        wrappers.push(wrapper);
        itemNodes[i] = [];

        render(i, rows);

        const virtualScroll = new MyVirtualScroll(container, wrapper, {
          rows: rows,
          autoStyles: 0 === i
        });
        virtualScroll.addContainerScrollEvent(_ => {
          update(i);
        });

        virtualScrolls.push(virtualScroll);
        
        update(i);
      } 
    }
  });
})(window, document);