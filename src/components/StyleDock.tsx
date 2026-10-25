import React, { useState } from 'react';
import {
  Check,
  CornerDownRight,
  GitBranchPlus,
  Palette,
  Pin,
  Plus,
  Trash2,
  Type,
} from 'lucide-react';
import { MindMapNode, NodeShape, StylePreset } from '../types/mindmap';
import {
  BUBBLE_COLOR_PALETTE,
  TEXT_COLOR_PALETTE,
  VALID_SHAPES,
} from '../utils/mindmapLogic';
import { ShapeIcon } from './NodeRenderer';

interface StyleDockProps {
  selectedNode: MindMapNode | null;
  presets: StylePreset[];
  activeDefaultId: string;
  canDeleteSelected: boolean;
  onSelectPresetForNodeAndDefault: (
    preset: StylePreset,
    setAsDefaultOnly?: boolean
  ) => void;
  onUpdateNodeShape: (shape: NodeShape) => void;
  onUpdateNodeBubbleColor: (color: string) => void;
  onUpdateNodeTextColor: (color: string) => void;
  onSaveSelectedStyleToActiveDefault: () => void;
  onQuickAddChild: () => void;
  onQuickAddSibling: () => void;
  onStartEditSelected: () => void;
  onDeleteSelected: () => void;
}

const SHAPE_LABELS: Record<NodeShape, string> = {
  bubble: 'Bubble',
  box: 'Box',
  triangle: 'Triangle',
  diamond: 'Diamond',
  hexagon: 'Hexagon',
};

export const StyleDock: React.FC<StyleDockProps> = ({
  selectedNode,
  presets,
  activeDefaultId,
  canDeleteSelected,
  onSelectPresetForNodeAndDefault,
  onUpdateNodeShape,
  onUpdateNodeBubbleColor,
  onUpdateNodeTextColor,
  onSaveSelectedStyleToActiveDefault,
  onQuickAddChild,
  onQuickAddSibling,
  onStartEditSelected,
  onDeleteSelected,
}) => {
  const [activeColorTab, setActiveColorTab] = useState<'bubble' | 'text'>(
    'bubble'
  );

  const activePreset =
    presets.find((p) => p.id === activeDefaultId) || presets[0];

  const currentShape = selectedNode ? selectedNode.shape : activePreset.shape;
  const currentBubbleColor = selectedNode
    ? selectedNode.bubbleColor
    : activePreset.bubbleColor;
  const currentTextColor = selectedNode
    ? selectedNode.textColor
    : activePreset.textColor;

  return (
    <aside
      aria-label="Node style and quick defaults toolbar"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 w-[calc(100vw-2rem)] max-w-4xl rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg px-3.5 py-2.5 flex flex-col gap-2"
    >
      {/* Top Row: 5 Curated Defaults + Quick Add Default Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            5 Quick Defaults
          </span>
          <span className="text-xs text-slate-400" aria-hidden="true">
            ·
          </span>
          <span className="text-xs text-slate-500">
            Click to apply · Pin sets default for new nodes
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((preset, index) => {
            const isDefault = preset.id === activeDefaultId;
            return (
              <div
                key={preset.id}
                className={`inline-flex items-center rounded-lg border transition-colors ${
                  isDefault
                    ? 'border-slate-900 bg-slate-900/5'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectPresetForNodeAndDefault(preset, false)}
                  aria-label={`Apply preset ${index + 1}: ${preset.name} (${
                    preset.shape
                  })`}
                  title={`${preset.name} — Click to apply style and set as Quick-Add Default`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium cursor-pointer whitespace-nowrap"
                >
                  <ShapeIcon
                    shape={preset.shape}
                    fill={preset.bubbleColor}
                    stroke={preset.textColor}
                    className="w-3.5 h-3.5 shrink-0"
                  />
                  <span style={{ color: '#0F172A' }}>{preset.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPresetForNodeAndDefault(preset, true)}
                  aria-label={`Set ${preset.name} as quick-add default`}
                  title={
                    isDefault
                      ? 'Active Quick-Add Default'
                      : 'Set as Quick-Add Default without changing selected node'
                  }
                  className={`px-1.5 py-1 border-l text-[11px] font-mono cursor-pointer transition-colors rounded-r-lg ${
                    isDefault
                      ? 'border-slate-300 bg-slate-900 text-white'
                      : 'border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isDefault ? 'Default' : <Pin className="w-3 h-3" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Form (Shape) Selector, Independent Bubble & Text Colors, and Node Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* 1. Form / Shape Picker (Bubble, Box, Triangle, Diamond, Hexagon) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {VALID_SHAPES.map((shape) => {
            const active = currentShape === shape;
            return (
              <button
                key={shape}
                type="button"
                onClick={() => onUpdateNodeShape(shape)}
                aria-label={`Shape: ${SHAPE_LABELS[shape]}`}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShapeIcon
                  shape={shape}
                  fill={active ? currentBubbleColor : 'none'}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                />
                <span>{SHAPE_LABELS[shape]}</span>
              </button>
            );
          })}
        </div>

        {/* 2. Independent Bubble Color vs Text Color Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Switch between Bubble Fill Color & Text Color */}
          <div
            role="group"
            aria-label="Color target selector"
            className="flex items-center bg-slate-100 p-1 rounded-lg"
          >
            <button
              type="button"
              onClick={() => setActiveColorTab('bubble')}
              aria-pressed={activeColorTab === 'bubble'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeColorTab === 'bubble'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Bubble Color</span>
              <span
                className="w-3 h-3 rounded-full border border-slate-300"
                style={{ backgroundColor: currentBubbleColor }}
              />
            </button>
            <button
              type="button"
              onClick={() => setActiveColorTab('text')}
              aria-pressed={activeColorTab === 'text'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeColorTab === 'text'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text Color</span>
              <span
                className="w-3 h-3 rounded-full border border-slate-300"
                style={{ backgroundColor: currentTextColor }}
              />
            </button>
          </div>

          {/* Color Swatches for the Active Target */}
          <div className="flex items-center gap-1.5">
            {(activeColorTab === 'bubble'
              ? BUBBLE_COLOR_PALETTE
              : TEXT_COLOR_PALETTE
            ).map((swatch) => {
              const isCurrent =
                (activeColorTab === 'bubble'
                  ? currentBubbleColor
                  : currentTextColor
                ).toUpperCase() === swatch.value.toUpperCase();
              return (
                <button
                  key={swatch.value}
                  type="button"
                  onClick={() =>
                    activeColorTab === 'bubble'
                      ? onUpdateNodeBubbleColor(swatch.value)
                      : onUpdateNodeTextColor(swatch.value)
                  }
                  aria-label={`Set ${activeColorTab} color to ${swatch.label} (${swatch.value})`}
                  title={`${swatch.label} (${swatch.value})`}
                  style={{ backgroundColor: swatch.value }}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-transform cursor-pointer ${
                    isCurrent
                      ? 'border-slate-900 scale-110 ring-2 ring-slate-900/20'
                      : 'border-slate-300 hover:scale-105'
                  }`}
                >
                  {isCurrent && (
                    <Check
                      className={`w-3 h-3 ${
                        swatch.value === '#0F172A' ||
                        swatch.value === '#334155' ||
                        swatch.value === '#064E3B' ||
                        swatch.value === '#1E3A8A' ||
                        swatch.value === '#881337' ||
                        swatch.value === '#581C87' ||
                        swatch.value === '#78350F' ||
                        swatch.value === '#0C4A6E' ||
                        swatch.value === '#9A3412'
                          ? 'text-white'
                          : 'text-slate-900'
                      }`}
                    />
                  )}
                </button>
              );
            })}

            {/* Custom Hex Color Input */}
            <label
              className="relative inline-flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-slate-400 hover:border-slate-700 cursor-pointer overflow-hidden"
              title={`Custom ${activeColorTab} hex color`}
            >
              <input
                type="color"
                aria-label={`Custom ${activeColorTab} hex color`}
                value={
                  activeColorTab === 'bubble'
                    ? currentBubbleColor
                    : currentTextColor
                }
                onChange={(e) =>
                  activeColorTab === 'bubble'
                    ? onUpdateNodeBubbleColor(e.target.value.toUpperCase())
                    : onUpdateNodeTextColor(e.target.value.toUpperCase())
                }
                className="sr-only"
              />
              <span
                className="w-4 h-4 rounded-full"
                style={{
                  background:
                    'conic-gradient(#ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ef4444)',
                }}
              />
            </label>
          </div>
        </div>

        {/* 3. Node Operations */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onQuickAddChild}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            title="Add child node with active Quick Default (Tab)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Child</span>
          </button>

          <button
            type="button"
            onClick={onQuickAddSibling}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            title="Add sibling node (Enter)"
          >
            <GitBranchPlus className="w-3.5 h-3.5" />
            <span>Sibling</span>
          </button>

          {selectedNode && (
            <>
              <button
                type="button"
                onClick={onStartEditSelected}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                title="Rename selected node (F2 or Double-click)"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>Edit Text</span>
              </button>

              <button
                type="button"
                onClick={onSaveSelectedStyleToActiveDefault}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                title="Save this node's shape & colors into the active Quick-Add Default"
              >
                <span>Save as Default</span>
              </button>

              <button
                type="button"
                onClick={onDeleteSelected}
                disabled={!canDeleteSelected}
                aria-label="Delete selected node"
                title={
                  canDeleteSelected
                    ? 'Delete node and its children (Delete / Backspace)'
                    : 'Root node cannot be deleted'
                }
                className={`p-1.5 rounded-lg border transition-colors ${
                  canDeleteSelected
                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer'
                    : 'border-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
