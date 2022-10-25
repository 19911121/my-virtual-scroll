interface CustomNode {
  template: Node;
  replaceNodes: Node[];
  originalNodes: Node[];
}

class Commons<R extends Record<any, any>> {
  public updateNodeValue(replaceNode: CustomNode['replaceNodes'][0], originalNode: CustomNode['originalNodes'][0], row: R) {
    if (Node.TEXT_NODE === replaceNode.nodeType && replaceNode.nodeValue && originalNode.nodeValue) {
      replaceNode.nodeValue = originalNode.nodeValue.replace(/{{([\S\s]+?)}}/g, (m, key) => {
        const k = key.trim();
        let value = row[k.trim().toString() as keyof R];

        return Reflect.has(row, k) ? value.toString() : '';
      });
    }
  }

  public createReplaceNode(template: HTMLTemplateElement, row: R): CustomNode {
    const clone = template.content.cloneNode(true);
    const replaceNodes = this.getReplaceNodes(clone.childNodes);
    const replaceOriginalNodes: CustomNode['originalNodes'] = [];

    for (const replaceNode of replaceNodes) {
      if (Node.TEXT_NODE === replaceNode.nodeType && replaceNode.nodeValue) {
        const originalNode = replaceNode.cloneNode(true);
        
        replaceOriginalNodes.push(originalNode);

        this.updateNodeValue(replaceNode,originalNode, row);
      }
    }

    return {
      template: clone,
      replaceNodes: replaceNodes,
      originalNodes: replaceOriginalNodes
    };
  };

  public getReplaceNodes(nodes: NodeList): Node[] {
    const replaceNodes: Node[] = [];

    for (const node of nodes) {
      if (Node.TEXT_NODE === node.nodeType && node.nodeValue) {
        if (/{{([\S\s]+?)}}/.test(node.nodeValue)) {
          replaceNodes.push(node);
        }
      }

      if (node.childNodes.length) replaceNodes.push(...this.getReplaceNodes(node.childNodes));
    }

    return replaceNodes;
  };
}

export default Commons;