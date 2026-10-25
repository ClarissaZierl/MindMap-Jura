import {
  MindMapExportData,
  MindMapNode,
  MindMapState,
  NestedMindMapNode,
  NodeShape,
  SearchMatch,
  StylePreset,
  ViewportState,
} from '../types/mindmap';

export const VALID_SHAPES: NodeShape[] = [
  'bubble',
  'box',
  'triangle',
  'diamond',
  'hexagon',
];

export const FIVE_DEFAULT_PRESETS: StylePreset[] = [
  {
    id: 'preset-bubble',
    name: 'Cloud Bubble',
    description: 'Soft pill bubble with crisp slate ink',
    shape: 'bubble',
    bubbleColor: '#FFFFFF',
    textColor: '#0F172A',
  },
  {
    id: 'preset-box',
    name: 'Studio Box',
    description: 'Structured warm amber rectangular box',
    shape: 'box',
    bubbleColor: '#FEF3C7',
    textColor: '#78350F',
  },
  {
    id: 'preset-triangle',
    name: 'Signal Triangle',
    description: 'Geometric rose triangle for key milestones',
    shape: 'triangle',
    bubbleColor: '#FFE4E6',
    textColor: '#881337',
  },
  {
    id: 'preset-diamond',
    name: 'Mint Diamond',
    description: 'Decision rhombus with deep emerald text',
    shape: 'diamond',
    bubbleColor: '#D1FAE5',
    textColor: '#064E3B',
  },
  {
    id: 'preset-hexagon',
    name: 'Cobalt Hexagon',
    description: 'Six-sided architectural module',
    shape: 'hexagon',
    bubbleColor: '#E0E7FF',
    textColor: '#1E3A8A',
  },
];

export const BUBBLE_COLOR_PALETTE: { label: string; value: string }[] = [
  { label: 'Pure White', value: '#FFFFFF' },
  { label: 'Soft Slate', value: '#F1F5F9' },
  { label: 'Warm Amber', value: '#FEF3C7' },
  { label: 'Rose Blush', value: '#FFE4E6' },
  { label: 'Mint Leaf', value: '#D1FAE5' },
  { label: 'Sky Mist', value: '#E0F2FE' },
  { label: 'Indigo Wash', value: '#E0E7FF' },
  { label: 'Lavender', value: '#F3E8FF' },
  { label: 'Peach Glow', value: '#FFEDD5' },
  { label: 'Deep Obsidian', value: '#0F172A' },
];

export const TEXT_COLOR_PALETTE: { label: string; value: string }[] = [
  { label: 'Obsidian Ink', value: '#0F172A' },
  { label: 'Charcoal', value: '#334155' },
  { label: 'Amber Espresso', value: '#78350F' },
  { label: 'Crimson Berry', value: '#881337' },
  { label: 'Forest Pine', value: '#064E3B' },
  { label: 'Ocean Cobalt', value: '#0C4A6E' },
  { label: 'Royal Indigo', value: '#1E3A8A' },
  { label: 'Deep Plum', value: '#581C87' },
  { label: 'Burnt Rust', value: '#9A3412' },
  { label: 'Pure Snow', value: '#FFFFFF' },
];

export function isValidShape(shape: unknown): shape is NodeShape {
  return typeof shape === 'string' && VALID_SHAPES.includes(shape as NodeShape);
}

export function normalizeColor(color: unknown, fallback: string): string {
  if (typeof color !== 'string') return fallback;
  const trimmed = color.trim();
  if (/^#[0-9A-Fa-f]{3,8}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return fallback;
}

export function getActivePreset(
  presets: StylePreset[],
  activeDefaultId: string
): StylePreset {
  return (
    presets.find((p) => p.id === activeDefaultId) ||
    presets[0] ||
    FIVE_DEFAULT_PRESETS[0]
  );
}

export function createInitialMindMap(): MindMapState {
  const nodes: MindMapNode[] = [
    {
      id: 'root',
      parentId: null,
      text: 'Product Strategy',
      x: 0,
      y: 0,
      shape: 'bubble',
      bubbleColor: '#0F172A',
      textColor: '#FFFFFF',
    },
    {
      id: 'node-research',
      parentId: 'root',
      text: 'User Research',
      x: 270,
      y: -135,
      shape: 'box',
      bubbleColor: '#FEF3C7',
      textColor: '#78350F',
    },
    {
      id: 'node-interviews',
      parentId: 'node-research',
      text: 'Field Interviews',
      x: 530,
      y: -185,
      shape: 'bubble',
      bubbleColor: '#FFFFFF',
      textColor: '#0F172A',
    },
    {
      id: 'node-synthesis',
      parentId: 'node-research',
      text: 'Pain Point Matrix',
      x: 530,
      y: -85,
      shape: 'diamond',
      bubbleColor: '#D1FAE5',
      textColor: '#064E3B',
    },
    {
      id: 'node-design',
      parentId: 'root',
      text: 'Core Architecture',
      x: 270,
      y: 10,
      shape: 'hexagon',
      bubbleColor: '#E0E7FF',
      textColor: '#1E3A8A',
    },
    {
      id: 'node-offline',
      parentId: 'node-design',
      text: 'Offline PWA Sync',
      x: 530,
      y: 10,
      shape: 'bubble',
      bubbleColor: '#E0F2FE',
      textColor: '#0C4A6E',
    },
    {
      id: 'node-launch',
      parentId: 'root',
      text: 'Q4 Launch Target',
      x: 270,
      y: 140,
      shape: 'triangle',
      bubbleColor: '#FFE4E6',
      textColor: '#881337',
    },
    {
      id: 'node-metrics',
      parentId: 'root',
      text: 'Key Principles',
      x: -270,
      y: -55,
      shape: 'bubble',
      bubbleColor: '#FFFFFF',
      textColor: '#0F172A',
    },
    {
      id: 'node-minimal',
      parentId: 'node-metrics',
      text: 'Zero-Clutter Canvas',
      x: -530,
      y: -110,
      shape: 'box',
      bubbleColor: '#F1F5F9',
      textColor: '#334155',
    },
    {
      id: 'node-trackpad',
      parentId: 'node-metrics',
      text: 'Trackpad First',
      x: -530,
      y: 0,
      shape: 'bubble',
      bubbleColor: '#F3E8FF',
      textColor: '#581C87',
    },
  ];

  return {
    title: 'Product Strategy Map',
    nodes,
    selectedNodeId: 'root',
    editingNodeId: null,
    activeDefaultId: FIVE_DEFAULT_PRESETS[0].id,
    presets: FIVE_DEFAULT_PRESETS.map((p) => ({ ...p })),
    viewport: {
      panX: 0,
      panY: -45,
      zoom: 1,
    },
  };
}

let idCounter = 1;
export function generateNodeId(prefix = 'node'): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function computeChildPosition(
  nodes: MindMapNode[],
  parent: MindMapNode
): { x: number; y: number } {
  const existingChildren = nodes.filter((n) => n.parentId === parent.id);

  // Determine horizontal direction: if parent is left of root (x < -40), grow left; otherwise grow right
  const root = nodes.find((n) => n.parentId === null);
  let direction = 1;
  if (parent.parentId === null) {
    // Alternate right and left or favor right for first few, left when balanced
    const rightCount = existingChildren.filter((c) => c.x >= parent.x).length;
    const leftCount = existingChildren.filter((c) => c.x < parent.x).length;
    direction = rightCount <= leftCount + 1 ? 1 : -1;
  } else if (root && parent.x < root.x) {
    direction = -1;
  }

  const horizontalStep = 250 * direction;
  const targetX = parent.x + horizontalStep;

  const sameSideChildren = existingChildren.filter((c) =>
    direction > 0 ? c.x >= parent.x : c.x < parent.x
  );

  if (sameSideChildren.length === 0) {
    return { x: targetX, y: parent.y };
  }

  // Place below the lowest child on that side, or spread symmetrically
  const sortedY = sameSideChildren.map((c) => c.y).sort((a, b) => a - b);
  const maxY = sortedY[sortedY.length - 1];
  const candidateY = maxY + 110;

  return { x: targetX, y: candidateY };
}

export function addQuickChildNode(
  state: MindMapState,
  parentId?: string,
  customText?: string
): { state: MindMapState; newNode: MindMapNode } {
  const targetParentId =
    parentId ||
    state.selectedNodeId ||
    state.nodes.find((n) => n.parentId === null)?.id ||
    null;

  const parent = state.nodes.find((n) => n.id === targetParentId) || null;
  const preset = getActivePreset(state.presets, state.activeDefaultId);

  const pos = parent
    ? computeChildPosition(state.nodes, parent)
    : { x: 0, y: 0 };

  const newNode: MindMapNode = {
    id: generateNodeId('node'),
    parentId: parent ? parent.id : null,
    text: customText ?? 'New Idea',
    x: pos.x,
    y: pos.y,
    shape: preset.shape,
    bubbleColor: preset.bubbleColor,
    textColor: preset.textColor,
  };

  // Ensure parent is expanded if we add a child to it
  const updatedNodes = state.nodes.map((n) =>
    parent && n.id === parent.id && n.collapsed ? { ...n, collapsed: false } : n
  );

  return {
    newNode,
    state: {
      ...state,
      nodes: [...updatedNodes, newNode],
      selectedNodeId: newNode.id,
    },
  };
}

export function addQuickSiblingNode(
  state: MindMapState,
  referenceNodeId?: string,
  customText?: string
): { state: MindMapState; newNode: MindMapNode } {
  const refId = referenceNodeId || state.selectedNodeId;
  const refNode = state.nodes.find((n) => n.id === refId);

  if (!refNode || refNode.parentId === null) {
    // If root is selected, adding a sibling adds a child to root
    return addQuickChildNode(state, refNode?.id, customText);
  }

  const preset = getActivePreset(state.presets, state.activeDefaultId);
  const newNode: MindMapNode = {
    id: generateNodeId('node'),
    parentId: refNode.parentId,
    text: customText ?? 'New Idea',
    x: refNode.x,
    y: refNode.y + 110,
    shape: preset.shape,
    bubbleColor: preset.bubbleColor,
    textColor: preset.textColor,
  };

  return {
    newNode,
    state: {
      ...state,
      nodes: [...state.nodes, newNode],
      selectedNodeId: newNode.id,
    },
  };
}

export function addFloatingNodeAt(
  state: MindMapState,
  x: number,
  y: number,
  customText?: string
): { state: MindMapState; newNode: MindMapNode } {
  const preset = getActivePreset(state.presets, state.activeDefaultId);
  const root = state.nodes.find((n) => n.parentId === null);
  const newNode: MindMapNode = {
    id: generateNodeId('node'),
    parentId: root ? root.id : null,
    text: customText ?? 'New Idea',
    x: Math.round(x),
    y: Math.round(y),
    shape: preset.shape,
    bubbleColor: preset.bubbleColor,
    textColor: preset.textColor,
  };

  return {
    newNode,
    state: {
      ...state,
      nodes: [...state.nodes, newNode],
      selectedNodeId: newNode.id,
    },
  };
}

export function getDescendantIds(
  nodes: MindMapNode[],
  rootNodeId: string
): Set<string> {
  const descendants = new Set<string>();
  const queue: string[] = [rootNodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const node of nodes) {
      if (node.parentId === current && !descendants.has(node.id)) {
        descendants.add(node.id);
        queue.push(node.id);
      }
    }
  }
  return descendants;
}

export function getVisibleNodes(nodes: MindMapNode[]): MindMapNode[] {
  const hiddenIds = new Set<string>();
  for (const node of nodes) {
    if (node.collapsed) {
      const desc = getDescendantIds(nodes, node.id);
      desc.forEach((id) => hiddenIds.add(id));
    }
  }
  return nodes.filter((n) => !hiddenIds.has(n.id));
}

export function deleteNodeAndDescendants(
  state: MindMapState,
  nodeId: string
): MindMapState {
  const target = state.nodes.find((n) => n.id === nodeId);
  if (!target) return state;

  // Prevent deleting the sole root node so the map is never broken; if root is deleted when other roots don't exist, keep root
  const roots = state.nodes.filter((n) => n.parentId === null);
  if (target.parentId === null && roots.length <= 1) {
    return state;
  }

  const toRemove = getDescendantIds(state.nodes, nodeId);
  toRemove.add(nodeId);

  const remaining = state.nodes.filter((n) => !toRemove.has(n.id));
  const nextSelected =
    target.parentId && remaining.some((n) => n.id === target.parentId)
      ? target.parentId
      : remaining[0]?.id || null;

  return {
    ...state,
    nodes: remaining,
    selectedNodeId: nextSelected,
    editingNodeId:
      state.editingNodeId && toRemove.has(state.editingNodeId)
        ? null
        : state.editingNodeId,
  };
}

export function updateNodeAttributes(
  state: MindMapState,
  nodeId: string,
  patch: Partial<
    Pick<
      MindMapNode,
      'text' | 'shape' | 'bubbleColor' | 'textColor' | 'x' | 'y' | 'collapsed' | 'notes'
    >
  >
): MindMapState {
  return {
    ...state,
    nodes: state.nodes.map((node) =>
      node.id === nodeId ? { ...node, ...patch } : node
    ),
  };
}

export function moveNodeWithSubtree(
  nodes: MindMapNode[],
  nodeId: string,
  deltaX: number,
  deltaY: number,
  includeSubtree = false
): MindMapNode[] {
  const idsToMove = includeSubtree
    ? getDescendantIds(nodes, nodeId)
    : new Set<string>();
  idsToMove.add(nodeId);

  return nodes.map((n) =>
    idsToMove.has(n.id)
      ? {
          ...n,
          x: Math.round(n.x + deltaX),
          y: Math.round(n.y + deltaY),
        }
      : n
  );
}

export function buildBreadcrumb(
  nodes: MindMapNode[],
  targetNode: MindMapNode
): string[] {
  const byId = new Map<string, MindMapNode>();
  nodes.forEach((n) => byId.set(n.id, n));

  const path: string[] = [];
  let current: MindMapNode | undefined = targetNode;
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current.text);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return path;
}

export function searchNodes(
  nodes: MindMapNode[],
  rawQuery: string
): SearchMatch[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const terms = query.split(/\s+/).filter(Boolean);
  const matches: SearchMatch[] = [];

  for (const node of nodes) {
    const haystack = `${node.text} ${node.notes || ''}`.toLowerCase();
    const isMatch = terms.every((term) => haystack.includes(term));
    if (isMatch) {
      const breadcrumb = buildBreadcrumb(nodes, node);
      matches.push({
        node,
        breadcrumb,
        depth: Math.max(0, breadcrumb.length - 1),
      });
    }
  }

  // Sort exact/prefix matches first, then by depth
  matches.sort((a, b) => {
    const aStarts = a.node.text.toLowerCase().startsWith(query) ? 0 : 1;
    const bStarts = b.node.text.toLowerCase().startsWith(query) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return a.depth - b.depth;
  });

  return matches;
}

export function buildNestedTree(nodes: MindMapNode[]): NestedMindMapNode[] {
  const childrenMap = new Map<string | null, MindMapNode[]>();
  const nodeIds = new Set(nodes.map((n) => n.id));

  for (const node of nodes) {
    const effectiveParent =
      node.parentId && nodeIds.has(node.parentId) && node.parentId !== node.id
        ? node.parentId
        : null;
    const list = childrenMap.get(effectiveParent) || [];
    list.push(node);
    childrenMap.set(effectiveParent, list);
  }

  const visited = new Set<string>();

  function toNested(node: MindMapNode): NestedMindMapNode {
    visited.add(node.id);
    const rawChildren = childrenMap.get(node.id) || [];
    const children = rawChildren
      .filter((child) => !visited.has(child.id))
      .map(toNested);

    return {
      id: node.id,
      text: node.text,
      shape: node.shape,
      bubbleColor: node.bubbleColor,
      textColor: node.textColor,
      x: node.x,
      y: node.y,
      ...(node.collapsed ? { collapsed: true } : {}),
      ...(node.notes ? { notes: node.notes } : {}),
      children,
    };
  }

  const roots = childrenMap.get(null) || [];
  const result = roots.map(toNested);

  // Recover any orphaned cycles if present
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      result.push(toNested(node));
    }
  }

  return result;
}

export function autoLayoutMindMap(nodes: MindMapNode[]): MindMapNode[] {
  if (nodes.length === 0) return [];
  const tree = buildNestedTree(nodes);
  const positioned = new Map<string, { x: number; y: number }>();

  const VERTICAL_GAP = 108;
  const HORIZONTAL_GAP = 265;

  function measureSubtreeHeight(node: NestedMindMapNode): number {
    if (!node.children || node.children.length === 0 || node.collapsed) {
      return VERTICAL_GAP;
    }
    return node.children.reduce(
      (sum, child) => sum + measureSubtreeHeight(child),
      0
    );
  }

  function layoutSubtree(
    node: NestedMindMapNode,
    depth: number,
    centerY: number,
    direction: 1 | -1
  ) {
    const x = depth === 0 ? 0 : depth * HORIZONTAL_GAP * direction;
    positioned.set(node.id, { x: Math.round(x), y: Math.round(centerY) });

    if (!node.children || node.children.length === 0) return;

    const totalHeight = measureSubtreeHeight(node);
    let currentTop = centerY - totalHeight / 2;

    for (const child of node.children) {
      const childHeight = measureSubtreeHeight(child);
      const childCenterY = currentTop + childHeight / 2;
      layoutSubtree(child, depth + 1, childCenterY, direction);
      currentTop += childHeight;
    }
  }

  let rootOffsetY = 0;
  for (const root of tree) {
    positioned.set(root.id, { x: 0, y: rootOffsetY });
    const children = root.children || [];
    if (children.length > 0) {
      // Split root's children into right and left branches when there are >= 4 children
      const rightChildren: NestedMindMapNode[] = [];
      const leftChildren: NestedMindMapNode[] = [];

      children.forEach((child, idx) => {
        if (children.length >= 4 && idx >= Math.ceil(children.length * 0.65)) {
          leftChildren.push(child);
        } else {
          rightChildren.push(child);
        }
      });

      const rightHeight = rightChildren.reduce(
        (sum, c) => sum + measureSubtreeHeight(c),
        0
      );
      let topRight = rootOffsetY - rightHeight / 2;
      for (const child of rightChildren) {
        const h = measureSubtreeHeight(child);
        layoutSubtree(child, 1, topRight + h / 2, 1);
        topRight += h;
      }

      const leftHeight = leftChildren.reduce(
        (sum, c) => sum + measureSubtreeHeight(c),
        0
      );
      let topLeft = rootOffsetY - leftHeight / 2;
      for (const child of leftChildren) {
        const h = measureSubtreeHeight(child);
        layoutSubtree(child, 1, topLeft + h / 2, -1);
        topLeft += h;
      }
    }
    rootOffsetY += Math.max(300, measureSubtreeHeight(root) + 120);
  }

  return nodes.map((n) => {
    const pos = positioned.get(n.id);
    return pos ? { ...n, x: pos.x, y: pos.y } : n;
  });
}

export function serializeMindMap(state: MindMapState): string {
  const payload: MindMapExportData = {
    format: 'minimalmap-v1',
    version: 1,
    exportedAt: new Date().toISOString(),
    title: state.title || 'Untitled Mind Map',
    activeDefaultId: state.activeDefaultId,
    presets: state.presets,
    viewport: state.viewport,
    nodes: state.nodes,
    tree: buildNestedTree(state.nodes),
  };

  return JSON.stringify(payload, null, 2);
}

export function flattenNestedTree(
  roots: NestedMindMapNode[]
): { nodes: MindMapNode[]; needsAutoLayout: boolean } {
  const flat: MindMapNode[] = [];
  let needsAutoLayout = false;
  const usedIds = new Set<string>();

  function walk(item: Record<string, unknown>, parentId: string | null) {
    let rawId =
      typeof item.id === 'string' && item.id.trim()
        ? item.id.trim()
        : generateNodeId('imp');
    if (usedIds.has(rawId)) {
      rawId = `${rawId}-${usedIds.size + 1}`;
    }
    usedIds.add(rawId);

    const text =
      typeof item.text === 'string' && item.text.trim().length > 0
        ? item.text
        : typeof item.label === 'string' && item.label.trim().length > 0
        ? item.label
        : 'Untitled Node';

    const shape: NodeShape = isValidShape(item.shape) ? item.shape : 'bubble';
    const bubbleColor = normalizeColor(item.bubbleColor, '#FFFFFF');
    const textColor = normalizeColor(item.textColor, '#0F172A');

    const hasValidX = typeof item.x === 'number' && Number.isFinite(item.x);
    const hasValidY = typeof item.y === 'number' && Number.isFinite(item.y);
    if (!hasValidX || !hasValidY) {
      needsAutoLayout = true;
    }

    const node: MindMapNode = {
      id: rawId,
      parentId,
      text,
      shape,
      bubbleColor,
      textColor,
      x: hasValidX ? Math.round(item.x as number) : 0,
      y: hasValidY ? Math.round(item.y as number) : 0,
      ...(item.collapsed === true ? { collapsed: true } : {}),
      ...(typeof item.notes === 'string' && item.notes
        ? { notes: item.notes }
        : {}),
    };

    flat.push(node);

    if (Array.isArray(item.children)) {
      for (const child of item.children) {
        if (child && typeof child === 'object') {
          walk(child as Record<string, unknown>, rawId);
        }
      }
    }
  }

  for (const root of roots) {
    if (root && typeof root === 'object') {
      walk(root as unknown as Record<string, unknown>, null);
    }
  }

  return { nodes: flat, needsAutoLayout };
}

export function deserializeMindMap(
  rawJson: string,
  currentState?: MindMapState
): MindMapState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    throw new Error(
      `Invalid JSON format: ${err instanceof Error ? err.message : 'Parse error'}`
    );
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Imported data must be a JSON object or array.');
  }

  const obj = parsed as Record<string, unknown>;
  let extractedNodes: MindMapNode[] = [];
  let needsLayout = false;

  // Case 1: Recursive tree array provided at obj.tree (and either obj.nodes is absent or tree has nodes)
  if (Array.isArray(obj.tree) && obj.tree.length > 0 && !Array.isArray(obj.nodes)) {
    const res = flattenNestedTree(obj.tree as NestedMindMapNode[]);
    extractedNodes = res.nodes;
    needsLayout = res.needsAutoLayout;
  } else if (Array.isArray(obj.nodes) && obj.nodes.length > 0) {
    // Case 2: Standard flat nodes array (which may ALSO exist alongside obj.tree)
    // Check if obj.tree has deeper/more recent edits or if obj.nodes is authoritative
    const usedIds = new Set<string>();
    for (const raw of obj.nodes) {
      if (!raw || typeof raw !== 'object') continue;
      const item = raw as Record<string, unknown>;
      let id =
        typeof item.id === 'string' && item.id.trim()
          ? item.id.trim()
          : generateNodeId('imp');
      if (usedIds.has(id)) {
        id = `${id}-${usedIds.size + 1}`;
      }
      usedIds.add(id);

      const hasX = typeof item.x === 'number' && Number.isFinite(item.x);
      const hasY = typeof item.y === 'number' && Number.isFinite(item.y);
      if (!hasX || !hasY) needsLayout = true;

      extractedNodes.push({
        id,
        parentId:
          typeof item.parentId === 'string' && item.parentId.trim()
            ? item.parentId.trim()
            : null,
        text:
          typeof item.text === 'string' && item.text.trim().length > 0
            ? item.text
            : 'Untitled Node',
        shape: isValidShape(item.shape) ? item.shape : 'bubble',
        bubbleColor: normalizeColor(item.bubbleColor, '#FFFFFF'),
        textColor: normalizeColor(item.textColor, '#0F172A'),
        x: hasX ? Math.round(item.x as number) : 0,
        y: hasY ? Math.round(item.y as number) : 0,
        ...(item.collapsed === true ? { collapsed: true } : {}),
        ...(typeof item.notes === 'string' && item.notes
          ? { notes: item.notes }
          : {}),
      });
    }
  } else if (Array.isArray(parsed)) {
    // Case 3: Top-level array of nested or flat nodes
    const hasChildrenProp = parsed.some(
      (item) => item && typeof item === 'object' && Array.isArray((item as Record<string, unknown>).children)
    );
    if (hasChildrenProp) {
      const res = flattenNestedTree(parsed as NestedMindMapNode[]);
      extractedNodes = res.nodes;
      needsLayout = res.needsAutoLayout;
    } else {
      return deserializeMindMap(JSON.stringify({ nodes: parsed }), currentState);
    }
  } else if (typeof obj.text === 'string' || Array.isArray(obj.children)) {
    // Case 4: Single root object with nested children
    const res = flattenNestedTree([obj as unknown as NestedMindMapNode]);
    extractedNodes = res.nodes;
    needsLayout = res.needsAutoLayout;
  }

  if (extractedNodes.length === 0) {
    throw new Error('No valid mind map nodes found in imported JSON.');
  }

  // Sanitize parent references so orphan parentIds become null (root)
  const validIdSet = new Set(extractedNodes.map((n) => n.id));
  extractedNodes = extractedNodes.map((n) => ({
    ...n,
    parentId:
      n.parentId && validIdSet.has(n.parentId) && n.parentId !== n.id
        ? n.parentId
        : null,
  }));

  // Ensure at least one root node exists (break cycle if every node had a parentId)
  if (!extractedNodes.some((n) => n.parentId === null)) {
    extractedNodes[0] = { ...extractedNodes[0], parentId: null };
  }

  if (needsLayout) {
    extractedNodes = autoLayoutMindMap(extractedNodes);
  }

  // Validate presets if provided
  let presets = currentState?.presets || FIVE_DEFAULT_PRESETS.map((p) => ({ ...p }));
  if (Array.isArray(obj.presets) && obj.presets.length >= 1) {
    const parsedPresets: StylePreset[] = [];
    for (const rawPreset of obj.presets) {
      if (!rawPreset || typeof rawPreset !== 'object') continue;
      const p = rawPreset as Record<string, unknown>;
      if (typeof p.id === 'string' && typeof p.name === 'string') {
        parsedPresets.push({
          id: p.id,
          name: p.name,
          description:
            typeof p.description === 'string' ? p.description : 'Custom preset',
          shape: isValidShape(p.shape) ? p.shape : 'bubble',
          bubbleColor: normalizeColor(p.bubbleColor, '#FFFFFF'),
          textColor: normalizeColor(p.textColor, '#0F172A'),
        });
      }
    }
    if (parsedPresets.length > 0) {
      presets = parsedPresets;
    }
  }

  const activeDefaultId =
    typeof obj.activeDefaultId === 'string' &&
    presets.some((p) => p.id === obj.activeDefaultId)
      ? obj.activeDefaultId
      : presets[0].id;

  let viewport: ViewportState = computeFitViewport(extractedNodes);
  if (obj.viewport && typeof obj.viewport === 'object') {
    const vp = obj.viewport as Record<string, unknown>;
    viewport = {
      panX: typeof vp.panX === 'number' && Number.isFinite(vp.panX) ? vp.panX : 0,
      panY: typeof vp.panY === 'number' && Number.isFinite(vp.panY) ? vp.panY : -45,
      zoom:
        typeof vp.zoom === 'number' && Number.isFinite(vp.zoom)
          ? Math.min(2.5, Math.max(0.25, vp.zoom))
          : 1,
    };
  }

  const rootNode =
    extractedNodes.find((n) => n.parentId === null) || extractedNodes[0];

  return {
    title:
      typeof obj.title === 'string' && obj.title.trim()
        ? obj.title.trim()
        : 'Imported Mind Map',
    nodes: extractedNodes,
    selectedNodeId: rootNode.id,
    editingNodeId: null,
    activeDefaultId,
    presets,
    viewport,
  };
}

export function computeFitViewport(nodes: MindMapNode[]): ViewportState {
  if (nodes.length === 0) return { panX: 0, panY: -45, zoom: 1 };
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const n of nodes) {
    if (n.x - 130 < minX) minX = n.x - 130;
    if (n.x + 130 > maxX) maxX = n.x + 130;
    if (n.y - 60 < minY) minY = n.y - 60;
    if (n.y + 60 > maxY) maxY = n.y + 60;
  }

  const spanX = Math.max(400, maxX - minX);
  const spanY = Math.max(300, maxY - minY);
  const zoomX = 1240 / spanX;
  const zoomY = 580 / spanY;
  const zoom = Math.min(1, Math.max(0.45, Number(Math.min(zoomX, zoomY).toFixed(2))));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    panX: Math.round(-centerX * zoom),
    panY: Math.round(-centerY * zoom - 40),
    zoom,
  };
}

export function exportToMarkdown(state: MindMapState): string {
  const tree = buildNestedTree(state.nodes);
  const lines: string[] = [`# ${state.title || 'Mind Map'}`, ''];

  function walk(node: NestedMindMapNode, depth: number) {
    const indent = '  '.repeat(depth);
    const meta = `[shape: ${node.shape}, bubble: ${node.bubbleColor}, text: ${node.textColor}]`;
    lines.push(`${indent}- **${node.text}** \`${meta}\``);
    for (const child of node.children) {
      walk(child, depth + 1);
    }
  }

  for (const root of tree) {
    walk(root, 0);
  }

  return lines.join('\n');
}

export function getNextNodeByDirection(
  nodes: MindMapNode[],
  currentId: string | null,
  direction: 'up' | 'down' | 'left' | 'right'
): string | null {
  const visible = getVisibleNodes(nodes);
  if (visible.length === 0) return null;
  const current = visible.find((n) => n.id === currentId);
  if (!current) return visible[0].id;

  // First try spatial directionalcone matching
  let bestId: string | null = null;
  let bestScore = Infinity;

  for (const candidate of visible) {
    if (candidate.id === current.id) continue;
    const dx = candidate.x - current.x;
    const dy = candidate.y - current.y;

    let isInDirection = false;
    let primaryDist = 0;
    let secondaryDist = 0;

    if (direction === 'right' && dx > 30) {
      isInDirection = true;
      primaryDist = dx;
      secondaryDist = Math.abs(dy);
    } else if (direction === 'left' && dx < -30) {
      isInDirection = true;
      primaryDist = -dx;
      secondaryDist = Math.abs(dy);
    } else if (direction === 'down' && dy > 25) {
      isInDirection = true;
      primaryDist = dy;
      secondaryDist = Math.abs(dx);
    } else if (direction === 'up' && dy < -25) {
      isInDirection = true;
      primaryDist = -dy;
      secondaryDist = Math.abs(dx);
    }

    if (isInDirection) {
      // Bonus if parent or child or sibling
      const isRelated =
        candidate.parentId === current.id ||
        current.parentId === candidate.id ||
        (candidate.parentId !== null && candidate.parentId === current.parentId);
      const relationFactor = isRelated ? 0.65 : 1.15;
      const score = (primaryDist + secondaryDist * 1.6) * relationFactor;
      if (score < bestScore) {
        bestScore = score;
        bestId = candidate.id;
      }
    }
  }

  return bestId || current.id;
}

export const SAMPLE_DEEP_NESTED_TEMPLATES: {
  id: string;
  name: string;
  description: string;
  data: Record<string, unknown>;
}[] = [
  {
    id: 'deep-architecture',
    name: '5-Level Systems Architecture (All Shapes & Colors)',
    description:
      'Deeply nested 5-level hierarchy testing Bubble, Box, Triangle, Diamond, and Hexagon nodes with custom text & bubble colors.',
    data: {
      title: 'Distributed Cloud Engine (5-Level Nesting)',
      activeDefaultId: 'preset-hexagon',
      tree: [
        {
          id: 'arch-root',
          text: 'Global Edge Platform',
          shape: 'hexagon',
          bubbleColor: '#0F172A',
          textColor: '#FFFFFF',
          children: [
            {
              id: 'arch-l1-ingest',
              text: 'Ingestion Layer',
              shape: 'box',
              bubbleColor: '#FEF3C7',
              textColor: '#78350F',
              children: [
                {
                  id: 'arch-l2-gateway',
                  text: 'API Gateway TLS 1.3',
                  shape: 'diamond',
                  bubbleColor: '#D1FAE5',
                  textColor: '#064E3B',
                  children: [
                    {
                      id: 'arch-l3-ratelimit',
                      text: 'Token Bucket Limiter',
                      shape: 'triangle',
                      bubbleColor: '#FFE4E6',
                      textColor: '#881337',
                      children: [
                        {
                          id: 'arch-l4-redis',
                          text: 'Redis Cluster Shard A',
                          shape: 'bubble',
                          bubbleColor: '#E0F2FE',
                          textColor: '#0C4A6E',
                          children: [],
                        },
                        {
                          id: 'arch-l4-fallback',
                          text: 'In-Memory LRU Fallback',
                          shape: 'box',
                          bubbleColor: '#F3E8FF',
                          textColor: '#581C87',
                          children: [],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'arch-l2-webhook',
                  text: 'Event Stream Router',
                  shape: 'bubble',
                  bubbleColor: '#FFFFFF',
                  textColor: '#0F172A',
                  children: [],
                },
              ],
            },
            {
              id: 'arch-l1-storage',
              text: 'Storage Engine',
              shape: 'diamond',
              bubbleColor: '#E0E7FF',
              textColor: '#1E3A8A',
              children: [
                {
                  id: 'arch-l2-wal',
                  text: 'Write-Ahead Log',
                  shape: 'triangle',
                  bubbleColor: '#FFEDD5',
                  textColor: '#9A3412',
                  children: [
                    {
                      id: 'arch-l3-checksum',
                      text: 'CRC32C Frame Verifier',
                      shape: 'hexagon',
                      bubbleColor: '#D1FAE5',
                      textColor: '#064E3B',
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'botanical-taxonomy',
    name: 'Botanical Taxonomy (Multi-Branch Hierarchy)',
    description:
      'Nested scientific classification tree with diverse node shapes and high-contrast color combinations.',
    data: {
      title: 'Plantae Kingdom Taxonomy',
      activeDefaultId: 'preset-diamond',
      tree: [
        {
          id: 'tax-root',
          text: 'Kingdom Plantae',
          shape: 'bubble',
          bubbleColor: '#064E3B',
          textColor: '#FFFFFF',
          children: [
            {
              id: 'tax-vascular',
              text: 'Tracheophytes (Vascular)',
              shape: 'box',
              bubbleColor: '#D1FAE5',
              textColor: '#064E3B',
              children: [
                {
                  id: 'tax-angio',
                  text: 'Angiosperms (Flowering)',
                  shape: 'diamond',
                  bubbleColor: '#FFE4E6',
                  textColor: '#881337',
                  children: [
                    {
                      id: 'tax-monocot',
                      text: 'Monocotyledons',
                      shape: 'triangle',
                      bubbleColor: '#FEF3C7',
                      textColor: '#78350F',
                      children: [],
                    },
                    {
                      id: 'tax-dicot',
                      text: 'Eudicotyledons',
                      shape: 'hexagon',
                      bubbleColor: '#E0E7FF',
                      textColor: '#1E3A8A',
                      children: [],
                    },
                  ],
                },
                {
                  id: 'tax-gymno',
                  text: 'Gymnosperms (Conifers)',
                  shape: 'bubble',
                  bubbleColor: '#FFEDD5',
                  textColor: '#9A3412',
                  children: [],
                },
              ],
            },
            {
              id: 'tax-bryo',
              text: 'Bryophytes (Non-Vascular)',
              shape: 'triangle',
              bubbleColor: '#E0F2FE',
              textColor: '#0C4A6E',
              children: [
                {
                  id: 'tax-moss',
                  text: 'Bryophyta (Mosses)',
                  shape: 'Bubble' as unknown as NodeShape, // Tests resilient shape normalization too
                  bubbleColor: '#FFFFFF',
                  textColor: '#0F172A',
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  },
];
