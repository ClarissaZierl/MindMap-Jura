import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { MindMapNode, NodeShape } from '../types/mindmap';

interface NodeRendererProps {
  node: MindMapNode;
  isSelected: boolean;
  isEditing: boolean;
  isSearchMatch: boolean;
  isActiveSearchMatch: boolean;
  childCount: number;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onStartEdit: (id: string) => void;
  onCommitEdit: (id: string, newText: string) => void;
  onQuickAddChild: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onDragStart: (id: string, e: React.PointerEvent) => void;
}

export function getShapeDimensions(
  shape: NodeShape,
  textLength: number
): { width: number; height: number; contentPaddingClass: string } {
  const baseWidth = Math.min(260, Math.max(148, 110 + textLength * 5.2));
  switch (shape) {
    case 'triangle':
      return {
        width: Math.max(216, baseWidth + 58),
        height: 110,
        contentPaddingClass: 'pt-10 pb-2 px-10',
      };
    case 'diamond':
      return {
        width: Math.max(186, baseWidth + 32),
        height: 104,
        contentPaddingClass: 'px-8 py-4',
      };
    case 'hexagon':
      return {
        width: Math.max(170, baseWidth + 18),
        height: 76,
        contentPaddingClass: 'px-6 py-3',
      };
    case 'box':
      return {
        width: baseWidth,
        height: 64,
        contentPaddingClass: 'px-4 py-2.5',
      };
    case 'bubble':
    default:
      return {
        width: baseWidth,
        height: 64,
        contentPaddingClass: 'px-5 py-2.5',
      };
  }
}

export const ShapeIcon: React.FC<{
  shape: NodeShape;
  fill?: string;
  stroke?: string;
  className?: string;
}> = ({
  shape,
  fill = 'currentColor',
  stroke = 'currentColor',
  className = 'w-4 h-4',
}) => {
  switch (shape) {
    case 'bubble':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect
            x="2.5"
            y="5.5"
            width="19"
            height="13"
            rx="6.5"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.75"
          />
        </svg>
      );
    case 'box':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect
            x="3"
            y="5.5"
            width="18"
            height="13"
            rx="2.5"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.75"
          />
        </svg>
      );
    case 'triangle':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <polygon
            points="12,3.5 21.5,19.5 2.5,19.5"
            strokeLinejoin="round"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.75"
          />
        </svg>
      );
    case 'diamond':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <polygon
            points="12,2.5 21.5,12 12,21.5 2.5,12"
            strokeLinejoin="round"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.75"
          />
        </svg>
      );
    case 'hexagon':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <polygon
            points="6.5,4.5 17.5,4.5 22,12 17.5,19.5 6.5,19.5 2,12"
            strokeLinejoin="round"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.75"
          />
        </svg>
      );
  }
};

export const NodeRenderer: React.FC<NodeRendererProps> = ({
  node,
  isSelected,
  isEditing,
  isSearchMatch,
  isActiveSearchMatch,
  childCount,
  onSelect,
  onStartEdit,
  onCommitEdit,
  onQuickAddChild,
  onToggleCollapse,
  onDragStart,
}) => {
  const [draftText, setDraftText] = useState(node.text);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraftText(node.text);
  }, [node.text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const { width, height, contentPaddingClass } = getShapeDimensions(
    node.shape,
    (isEditing ? draftText : node.text).length
  );

  const strokeColor = isActiveSearchMatch
    ? '#D97706'
    : isSearchMatch
    ? '#F59E0B'
    : isSelected
    ? '#0F172A'
    : '#CBD5E1';

  const strokeWidth =
    isActiveSearchMatch || isSelected ? 2.5 : isSearchMatch ? 2.2 : 1.5;

  const renderShapeSvg = () => {
    const w = width;
    const h = height;
    const pad = 3;

    switch (node.shape) {
      case 'triangle': {
        const pts = `${w / 2},${pad + 2} ${w - pad},${h - pad - 2} ${pad},${h - pad - 2}`;
        return (
          <polygon
            points={pts}
            fill={node.bubbleColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );
      }
      case 'diamond': {
        const pts = `${w / 2},${pad} ${w - pad},${h / 2} ${w / 2},${h - pad} ${pad},${h / 2}`;
        return (
          <polygon
            points={pts}
            fill={node.bubbleColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );
      }
      case 'hexagon': {
        const inset = Math.round(w * 0.14);
        const pts = `${inset},${pad} ${w - inset},${pad} ${w - pad},${h / 2} ${w - inset},${h - pad} ${inset},${h - pad} ${pad},${h / 2}`;
        return (
          <polygon
            points={pts}
            fill={node.bubbleColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );
      }
      case 'box':
        return (
          <rect
            x={pad}
            y={pad}
            width={w - pad * 2}
            height={h - pad * 2}
            rx={10}
            fill={node.bubbleColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      case 'bubble':
      default:
        return (
          <rect
            x={pad}
            y={pad}
            width={w - pad * 2}
            height={h - pad * 2}
            rx={(h - pad * 2) / 2}
            fill={node.bubbleColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
    }
  };

  return (
    <div
      data-testid={`node-${node.id}`}
      data-node-id={node.id}
      data-node-shape={node.shape}
      data-bubble-color={node.bubbleColor}
      data-text-color={node.textColor}
      style={{
        transform: `translate3d(${Math.round(node.x - width / 2)}px, ${Math.round(
          node.y - height / 2
        )}px, 0)`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      className={`group absolute top-0 left-0 select-none ${
        isSelected ? 'z-20' : isSearchMatch ? 'z-15' : 'z-10'
      }`}
    >
      {/* Search Match Halo */}
      {isSearchMatch && (
        <div
          className={`pointer-events-none absolute -inset-2 rounded-2xl border-2 ${
            isActiveSearchMatch
              ? 'border-amber-500 bg-amber-400/15 shadow-sm'
              : 'border-amber-400/70 bg-amber-300/10'
          }`}
        />
      )}

      {/* Selection Focus Outline */}
      {isSelected && !isSearchMatch && (
        <div className="pointer-events-none absolute -inset-1.5 rounded-2xl border border-slate-900/35" />
      )}

      {/* Main Interactive Node Surface */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Node: ${node.text} (${node.shape})`}
        aria-selected={isSelected}
        onPointerDown={(e) => {
          if (isEditing) return;
          onDragStart(node.id, e);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id, e);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onStartEdit(node.id);
        }}
        onKeyDown={(e) => {
          if (isEditing) return;
          if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            onStartEdit(node.id);
          }
        }}
        className={`relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing focus:outline-none ${contentPaddingClass}`}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="pointer-events-none absolute inset-0 drop-shadow-xs transition-transform duration-150"
        >
          {renderShapeSvg()}
        </svg>

        {/* Node Label or Inline Editor */}
        <div className="relative z-10 w-full flex items-center justify-center text-center">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              aria-label={`Edit text for ${node.text}`}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onCommitEdit(
                    node.id,
                    draftText.trim() || 'Untitled Idea'
                  );
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setDraftText(node.text);
                  onCommitEdit(node.id, node.text);
                }
              }}
              onBlur={() => {
                onCommitEdit(node.id, draftText.trim() || 'Untitled Idea');
              }}
              style={{ color: node.textColor }}
              className="w-full bg-transparent text-center text-sm font-semibold focus:outline-none border-b border-current/40 px-1"
            />
          ) : (
            <span
              style={{ color: node.textColor }}
              className="block text-sm font-semibold leading-snug tracking-tight line-clamp-2 break-words"
            >
              {node.text}
            </span>
          )}
        </div>
      </div>

      {/* Quick Add Child Action Button on Right Edge */}
      <button
        type="button"
        aria-label={`Add child to ${node.text}`}
        title="Quick add child node (Tab)"
        onClick={(e) => {
          e.stopPropagation();
          onQuickAddChild(node.id);
        }}
        className={`absolute -right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 text-white shadow-sm flex items-center justify-center transition-opacity cursor-pointer hover:bg-slate-700 ${
          isSelected
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
        }`}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Subtree Collapse/Expand Button if Node has Children */}
      {childCount > 0 && (
        <button
          type="button"
          aria-label={
            node.collapsed
              ? `Expand ${childCount} children of ${node.text}`
              : `Collapse children of ${node.text}`
          }
          title={
            node.collapsed
              ? `Expand ${childCount} hidden children`
              : 'Collapse branch'
          }
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse(node.id);
          }}
          className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md border text-[11px] font-mono tabular-nums flex items-center gap-0.5 shadow-2xs transition-colors cursor-pointer ${
            node.collapsed
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-300 opacity-0 group-hover:opacity-100 focus:opacity-100'
          }`}
        >
          <span>{childCount}</span>
          <ChevronRight
            className={`w-3 h-3 transition-transform ${
              node.collapsed ? '' : 'rotate-90'
            }`}
          />
        </button>
      )}
    </div>
  );
};
