export type NodeShape = 'bubble' | 'box' | 'triangle' | 'diamond' | 'hexagon';

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  shape: NodeShape;
  bubbleColor: string;
  textColor: string;
}

export interface MindMapNode {
  id: string;
  parentId: string | null;
  text: string;
  x: number;
  y: number;
  shape: NodeShape;
  bubbleColor: string;
  textColor: string;
  collapsed?: boolean;
  notes?: string;
}

export interface NestedMindMapNode {
  id: string;
  text: string;
  shape: NodeShape;
  bubbleColor: string;
  textColor: string;
  x?: number;
  y?: number;
  collapsed?: boolean;
  notes?: string;
  children: NestedMindMapNode[];
}

export interface ViewportState {
  panX: number;
  panY: number;
  zoom: number;
}

export interface MindMapState {
  title: string;
  nodes: MindMapNode[];
  selectedNodeId: string | null;
  editingNodeId: string | null;
  activeDefaultId: string;
  presets: StylePreset[];
  viewport: ViewportState;
}

export interface MindMapExportData {
  format: 'minimalmap-v1';
  version: number;
  exportedAt: string;
  title: string;
  activeDefaultId: string;
  presets: StylePreset[];
  viewport: ViewportState;
  nodes: MindMapNode[];
  tree: NestedMindMapNode[];
}

export interface SearchMatch {
  node: MindMapNode;
  breadcrumb: string[];
  depth: number;
}
