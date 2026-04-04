import { WikiPageResDto } from '@core/services/wikiService/wiki.dto';

export interface WikiTreeNode extends WikiPageResDto {
  children: WikiTreeNode[];
}

export function buildTree(pages: WikiPageResDto[]): WikiTreeNode[] {
  const map = new Map<number, WikiTreeNode>();

  for (const page of pages) {
    map.set(page.id, { ...page, children: [] });
  }

  const roots: WikiTreeNode[] = [];

  for (const node of map.values()) {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      const parent = map.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  }

  return roots;
}
