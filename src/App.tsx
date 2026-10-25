import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Crosshair,
  Plus,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { ExportImportModal } from './components/ExportImportModal';
import { NodeRenderer, ShapeIcon } from './components/NodeRenderer';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { ShortcutsModal } from './components/ShortcutsModal';
import { StyleDock } from './components/StyleDock';
import { MindMapNode, MindMapState, NodeShape, StylePreset } from './types/mindmap';
import {
  addFloatingNodeAt,
  addQuickChildNode,
  addQuickSiblingNode,
  autoLayoutMindMap,
  computeFitViewport,
  createInitialMindMap,
  deleteNodeAndDescendants,
  deserializeMindMap,
  getActivePreset,
  getDescendantIds,
  getNextNodeByDirection,
  getVisibleNodes,
  moveNodeWithSubtree,
  searchNodes,
  serializeMindMap,
  updateNodeAttributes,
} from './utils/mindmapLogic';

const STORAGE_KEY = 'minimalmap_pwa_state_v1';

export default function App() {
  const [state, setState] = useState<MindMapState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return deserializeMindMap(saved);
      }
    } catch {
      // Fallback to initial mind map
    }
    return createInitialMindMap();
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Dragging state refs for 60fps compositor movement
  const dragRef = useRef<{
    type: 'pan' | 'node' | null;
    nodeId?: string;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    moveSubtree: boolean;
    hasMoved: boolean;
  }>({
    type: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    moveSubtree: false,
    hasMoved: false,
  });

  const triggerToast = useCallback((msg: string) => {
    setStatusToast(msg);
  }, []);

  useEffect(() => {
    if (!statusToast) return;
    const timer = setTimeout(() => setStatusToast(null), 2400);
    return () => clearTimeout(timer);
  }, [statusToast]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeMindMap(state));
    } catch {
      // Ignore quota errors
    }
  }, [state]);

  // Compute search matches
  const searchMatches = useMemo(
    () => searchNodes(state.nodes, searchQuery),
    [state.nodes, searchQuery]
  );

  const searchMatchIds = useMemo(
    () => new Set(searchMatches.map((m) => m.node.id)),
    [searchMatches]
  );

  const activeSearchMatchId =
    searchMatches.length > 0
      ? searchMatches[activeMatchIndex % searchMatches.length]?.node.id || null
      : null;

  // Center viewport on a specific node
  const focusNodeOnCanvas = useCallback((nodeId: string) => {
    setState((prev) => {
      const target = prev.nodes.find((n) => n.id === nodeId);
      if (!target) return prev;

      // Also expand any collapsed ancestors so the target node is visible
      const ancestorIds = new Set<string>();
      let curr: MindMapNode | undefined = target;
      const byId = new Map<string, MindMapNode>(prev.nodes.map((n) => [n.id, n]));
      while (curr && curr.parentId) {
        ancestorIds.add(curr.parentId);
        curr = byId.get(curr.parentId);
      }

      const nextNodes = prev.nodes.map((n) =>
        ancestorIds.has(n.id) && n.collapsed ? { ...n, collapsed: false } : n
      );

      return {
        ...prev,
        nodes: nextNodes,
        selectedNodeId: nodeId,
        viewport: {
          ...prev.viewport,
          panX: -target.x * prev.viewport.zoom,
          panY: -target.y * prev.viewport.zoom,
        },
      };
    });
  }, []);

  // Trackpad two-finger glide (pan) & pinch-to-zoom handler
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Trackpad pinch-to-zoom sets e.ctrlKey = true in modern browsers
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect();
        const cursorX = e.clientX - rect.left - rect.width / 2;
        const cursorY = e.clientY - rect.top - rect.height / 2;

        setState((prev) => {
          const zoomDelta = -e.deltaY * 0.008;
          const nextZoom = Math.min(
            2.4,
            Math.max(0.3, Number((prev.viewport.zoom * (1 + zoomDelta)).toFixed(3)))
          );
          const scaleChange = nextZoom / prev.viewport.zoom;

          return {
            ...prev,
            viewport: {
              zoom: nextZoom,
              panX: Math.round(
                cursorX - (cursorX - prev.viewport.panX) * scaleChange
              ),
              panY: Math.round(
                cursorY - (cursorY - prev.viewport.panY) * scaleChange
              ),
            },
          };
        });
      } else {
        // Two-finger trackpad pan
        setState((prev) => ({
          ...prev,
          viewport: {
            ...prev.viewport,
            panX: Math.round(prev.viewport.panX - e.deltaX),
            panY: Math.round(prev.viewport.panY - e.deltaY),
          },
        }));
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Global keyboard shortcuts for fast navigation & node manipulation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // Search shortcut: Cmd/Ctrl + F or '/' when not typing in an input
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (isInputFocused) return;
      if (isExportImportOpen || isShortcutsOpen) {
        if (e.key === 'Escape') {
          setIsExportImportOpen(false);
          setIsShortcutsOpen(false);
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        setState((prev) => {
          const res = addQuickChildNode(prev);
          return { ...res.state, editingNodeId: res.newNode.id };
        });
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        setState((prev) => {
          const res = addQuickSiblingNode(prev);
          return { ...res.state, editingNodeId: res.newNode.id };
        });
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        setState((prev) =>
          prev.selectedNodeId
            ? { ...prev, editingNodeId: prev.selectedNodeId }
            : prev
        );
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        setState((prev) =>
          prev.selectedNodeId
            ? deleteNodeAndDescendants(prev, prev.selectedNodeId)
            : prev
        );
        return;
      }

      if (
        e.key === 'ArrowRight' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown'
      ) {
        e.preventDefault();
        const dirMap: Record<string, 'right' | 'left' | 'up' | 'down'> = {
          ArrowRight: 'right',
          ArrowLeft: 'left',
          ArrowUp: 'up',
          ArrowDown: 'down',
        };
        setState((prev) => {
          const nextId = getNextNodeByDirection(
            prev.nodes,
            prev.selectedNodeId,
            dirMap[e.key]
          );
          return nextId ? { ...prev, selectedNodeId: nextId } : prev;
        });
        return;
      }

      // Number keys 1-5 apply and switch among the 5 Quick Defaults
      if (['1', '2', '3', '4', '5'].includes(e.key) && !e.metaKey && !e.ctrlKey) {
        const idx = Number(e.key) - 1;
        setState((prev) => {
          const preset = prev.presets[idx];
          if (!preset) return prev;
          const nextNodes = prev.selectedNodeId
            ? prev.nodes.map((n) =>
                n.id === prev.selectedNodeId
                  ? {
                      ...n,
                      shape: preset.shape,
                      bubbleColor: preset.bubbleColor,
                      textColor: preset.textColor,
                    }
                  : n
              )
            : prev.nodes;
          return {
            ...prev,
            activeDefaultId: preset.id,
            nodes: nextNodes,
          };
        });
        return;
      }

      if (e.key.toLowerCase() === 'l' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          nodes: autoLayoutMindMap(prev.nodes),
          viewport: { panX: 0, panY: 0, zoom: 1 },
        }));
        triggerToast('Auto-arranged nested nodes');
        return;
      }

      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          viewport: {
            ...prev.viewport,
            zoom: Math.min(2.4, Number((prev.viewport.zoom + 0.15).toFixed(2))),
          },
        }));
        return;
      }

      if (e.key === '-') {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          viewport: {
            ...prev.viewport,
            zoom: Math.max(0.3, Number((prev.viewport.zoom - 0.15).toFixed(2))),
          },
        }));
        return;
      }

      if (e.key === '0') {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          viewport: { panX: 0, panY: 0, zoom: 1 },
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExportImportOpen, isShortcutsOpen, triggerToast]);

  // Pointer handlers for canvas panning and node dragging
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    dragRef.current = {
      type: 'pan',
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      moveSubtree: false,
      hasMoved: false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleNodeDragStart = useCallback(
    (nodeId: string, e: React.PointerEvent) => {
      e.stopPropagation();
      dragRef.current = {
        type: 'node',
        nodeId,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        moveSubtree: e.shiftKey,
        hasMoved: false,
      };
      setState((prev) => ({
        ...prev,
        selectedNodeId: nodeId,
        editingNodeId: prev.editingNodeId === nodeId ? nodeId : null,
      }));
    },
    []
  );

  const handleGlobalPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.type) return;

    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    if (
      Math.abs(e.clientX - drag.startX) > 3 ||
      Math.abs(e.clientY - drag.startY) > 3
    ) {
      drag.hasMoved = true;
    }

    drag.lastX = e.clientX;
    drag.lastY = e.clientY;

    if (drag.type === 'pan') {
      setState((prev) => ({
        ...prev,
        viewport: {
          ...prev.viewport,
          panX: Math.round(prev.viewport.panX + dx),
          panY: Math.round(prev.viewport.panY + dy),
        },
      }));
    } else if (drag.type === 'node' && drag.nodeId) {
      const targetId = drag.nodeId;
      const moveSub = drag.moveSubtree || e.shiftKey;
      setState((prev) => ({
        ...prev,
        nodes: moveNodeWithSubtree(
          prev.nodes,
          targetId,
          dx / prev.viewport.zoom,
          dy / prev.viewport.zoom,
          moveSub
        ),
      }));
    }
  };

  const handleGlobalPointerUp = () => {
    dragRef.current.type = null;
  };

  // Double-click empty canvas to create node at cursor coordinates
  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.canvasBg) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const worldX =
      (e.clientX - rect.left - rect.width / 2 - state.viewport.panX) /
      state.viewport.zoom;
    const worldY =
      (e.clientY - rect.top - rect.height / 2 - state.viewport.panY) /
      state.viewport.zoom;

    setState((prev) => {
      const res = addFloatingNodeAt(prev, worldX, worldY);
      return { ...res.state, editingNodeId: res.newNode.id };
    });
  };

  const visibleNodes = useMemo(
    () => getVisibleNodes(state.nodes),
    [state.nodes]
  );

  const visibleNodeMap = useMemo(
    () => new Map(visibleNodes.map((n) => [n.id, n])),
    [visibleNodes]
  );

  const childCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    for (const node of state.nodes) {
      if (node.parentId) {
        counts.set(node.parentId, (counts.get(node.parentId) || 0) + 1);
      }
    }
    return counts;
  }, [state.nodes]);

  const selectedNode = useMemo(
    () => state.nodes.find((n) => n.id === state.selectedNodeId) || null,
    [state.nodes, state.selectedNodeId]
  );

  const canDeleteSelected = useMemo(() => {
    if (!selectedNode) return false;
    if (selectedNode.parentId !== null) return true;
    return state.nodes.filter((n) => n.parentId === null).length > 1;
  }, [selectedNode, state.nodes]);

  const activePreset = useMemo(
    () => getActivePreset(state.presets, state.activeDefaultId),
    [state.presets, state.activeDefaultId]
  );

  // Handlers for StyleDock
  const handleSelectPreset = (
    preset: StylePreset,
    setAsDefaultOnly = false
  ) => {
    setState((prev) => {
      const nextNodes =
        !setAsDefaultOnly && prev.selectedNodeId
          ? prev.nodes.map((n) =>
              n.id === prev.selectedNodeId
                ? {
                    ...n,
                    shape: preset.shape,
                    bubbleColor: preset.bubbleColor,
                    textColor: preset.textColor,
                  }
                : n
            )
          : prev.nodes;

      return {
        ...prev,
        activeDefaultId: preset.id,
        nodes: nextNodes,
      };
    });
  };

  const handleUpdateShape = (shape: NodeShape) => {
    setState((prev) => {
      if (prev.selectedNodeId) {
        return updateNodeAttributes(prev, prev.selectedNodeId, { shape });
      }
      // If no node selected, update the active preset's shape
      return {
        ...prev,
        presets: prev.presets.map((p) =>
          p.id === prev.activeDefaultId ? { ...p, shape } : p
        ),
      };
    });
  };

  const handleUpdateBubbleColor = (bubbleColor: string) => {
    setState((prev) => {
      if (prev.selectedNodeId) {
        return updateNodeAttributes(prev, prev.selectedNodeId, { bubbleColor });
      }
      return {
        ...prev,
        presets: prev.presets.map((p) =>
          p.id === prev.activeDefaultId ? { ...p, bubbleColor } : p
        ),
      };
    });
  };

  const handleUpdateTextColor = (textColor: string) => {
    setState((prev) => {
      if (prev.selectedNodeId) {
        return updateNodeAttributes(prev, prev.selectedNodeId, { textColor });
      }
      return {
        ...prev,
        presets: prev.presets.map((p) =>
          p.id === prev.activeDefaultId ? { ...p, textColor } : p
        ),
      };
    });
  };

  const handleSaveSelectedStyleToDefault = () => {
    if (!selectedNode) return;
    setState((prev) => ({
      ...prev,
      presets: prev.presets.map((p) =>
        p.id === prev.activeDefaultId
          ? {
              ...p,
              shape: selectedNode.shape,
              bubbleColor: selectedNode.bubbleColor,
              textColor: selectedNode.textColor,
            }
          : p
      ),
    }));
    triggerToast(`Saved style to "${activePreset.name}" default`);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#F8FAFC] select-none">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="relative z-30 flex items-center justify-between gap-8 px-6 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#canvas"
          onClick={(e) => {
            e.preventDefault();
            setState((prev) => ({
              ...prev,
              viewport: { panX: 0, panY: 0, zoom: 1 },
            }));
          }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          MinimalMap
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Workspace actions"
          className="flex items-center gap-6 text-xs font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => {
              setState((prev) => {
                const laidOut = autoLayoutMindMap(prev.nodes);
                return {
                  ...prev,
                  nodes: laidOut,
                  viewport: computeFitViewport(laidOut),
                };
              });
              triggerToast('Auto-arranged mind map hierarchy');
            }}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Auto-Layout
          </button>
          <button
            type="button"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                viewport: computeFitViewport(prev.nodes),
              }))
            }
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Reset View
          </button>
          <button
            type="button"
            onClick={() => setIsExportImportOpen(true)}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Export & Import
          </button>
          <button
            type="button"
            onClick={() => setIsShortcutsOpen(true)}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Shortcuts
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setState((prev) => {
                const res = addQuickChildNode(prev);
                return { ...res.state, editingNodeId: res.newNode.id };
              });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Add Idea</span>
          </button>
        </div>
      </header>

      <OfflineIndicator />

      {/* Toast Notification */}
      {statusToast && (
        <div
          role="status"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-40 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-md"
        >
          {statusToast}
        </div>
      )}

      {/* Floating Top-Left Bar: Map Title + Word Search */}
      <div className="fixed top-16 left-4 z-30 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        <div className="flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-2 shadow-xs">
          <input
            type="text"
            aria-label="Mind map title"
            value={state.title}
            onChange={(e) =>
              setState((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-36 text-xs font-semibold text-slate-900 bg-transparent border-r border-slate-200 pr-2 focus:outline-none truncate"
          />

          {/* Search Input */}
          <div className="relative flex-1 flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1.5" />
            <input
              ref={searchInputRef}
              type="search"
              aria-label="Search words in mind map"
              placeholder="Search words (/)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveMatchIndex(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchMatches.length > 0) {
                  e.preventDefault();
                  const nextIdx = e.shiftKey
                    ? (activeMatchIndex - 1 + searchMatches.length) %
                      searchMatches.length
                    : (activeMatchIndex + 1) % searchMatches.length;
                  setActiveMatchIndex(nextIdx);
                  focusNodeOnCanvas(searchMatches[nextIdx].node.id);
                } else if (e.key === 'Escape') {
                  setSearchQuery('');
                  searchInputRef.current?.blur();
                }
              }}
              className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search query"
                onClick={() => {
                  setSearchQuery('');
                  setActiveMatchIndex(0);
                }}
                className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {searchQuery.trim().length > 0 && (
          <div
            role="region"
            aria-label="Search results"
            className="rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500">
              <span className="font-mono tabular-nums">
                {searchMatches.length === 0
                  ? '0 matches'
                  : `${(activeMatchIndex % searchMatches.length) + 1} of ${
                      searchMatches.length
                    } matches`}
              </span>
              {searchMatches.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous search match"
                    onClick={() => {
                      const prevIdx =
                        (activeMatchIndex - 1 + searchMatches.length) %
                        searchMatches.length;
                      setActiveMatchIndex(prevIdx);
                      focusNodeOnCanvas(searchMatches[prevIdx].node.id);
                    }}
                    className="p-0.5 hover:text-slate-900 cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next search match"
                    onClick={() => {
                      const nextIdx =
                        (activeMatchIndex + 1) % searchMatches.length;
                      setActiveMatchIndex(nextIdx);
                      focusNodeOnCanvas(searchMatches[nextIdx].node.id);
                    }}
                    className="p-0.5 hover:text-slate-900 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {searchMatches.length > 0 && (
              <ul className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                {searchMatches.map((match, idx) => {
                  const isCurrent =
                    idx === activeMatchIndex % searchMatches.length;
                  return (
                    <li key={match.node.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMatchIndex(idx);
                          focusNodeOnCanvas(match.node.id);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start gap-2 transition-colors cursor-pointer ${
                          isCurrent ? 'bg-amber-50/90' : 'hover:bg-slate-50'
                        }`}
                      >
                        <ShapeIcon
                          shape={match.node.shape}
                          fill={match.node.bubbleColor}
                          stroke={match.node.textColor}
                          className="w-4 h-4 mt-0.5 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {match.node.text}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {match.breadcrumb.join(' · ')}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Floating Top-Right Bar: Zoom Controls & PWA Install */}
      <div className="fixed top-16 right-4 z-30 flex items-center gap-2">
        <PWAInstallButton />

        <div className="flex items-center bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-xs">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                viewport: {
                  ...prev.viewport,
                  zoom: Math.max(
                    0.3,
                    Number((prev.viewport.zoom - 0.15).toFixed(2))
                  ),
                },
              }))
            }
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Reset zoom to 100%"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                viewport: { ...prev.viewport, zoom: 1 },
              }))
            }
            className="px-2 text-xs font-mono tabular-nums font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            {Math.round(state.viewport.zoom * 100)}%
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                viewport: {
                  ...prev.viewport,
                  zoom: Math.min(
                    2.4,
                    Number((prev.viewport.zoom + 0.15).toFixed(2))
                  ),
                },
              }))
            }
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {selectedNode && (
            <button
              type="button"
              aria-label="Center canvas on selected node"
              title="Center on selected node"
              onClick={() => focusNodeOnCanvas(selectedNode.id)}
              className="p-1.5 text-slate-600 hover:text-slate-900 border-l border-slate-100 ml-0.5 cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Infinite Canvas Surface */}
      <main
        id="canvas"
        ref={canvasRef}
        data-testid="infinite-canvas"
        data-node-count={state.nodes.length}
        data-active-default={state.activeDefaultId}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleGlobalPointerMove}
        onPointerUp={handleGlobalPointerUp}
        onPointerCancel={handleGlobalPointerUp}
        onDoubleClick={handleCanvasDoubleClick}
        onClick={(e) => {
          if (
            !dragRef.current.hasMoved &&
            (e.target === e.currentTarget ||
              (e.target as HTMLElement).dataset.canvasBg)
          ) {
            setState((prev) => ({
              ...prev,
              selectedNodeId: null,
              editingNodeId: null,
            }));
          }
        }}
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1.25px, transparent 1.25px)`,
          backgroundSize: `${Math.round(24 * state.viewport.zoom)}px ${Math.round(
            24 * state.viewport.zoom
          )}px`,
          backgroundPosition: `calc(50% + ${state.viewport.panX}px) calc(50% + ${state.viewport.panY}px)`,
        }}
        className="relative flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {/* World Origin Container centered at 50% / 50% */}
        <div
          data-canvas-bg="true"
          style={{
            transform: `translate3d(${state.viewport.panX}px, ${state.viewport.panY}px, 0) scale(${state.viewport.zoom})`,
            transformOrigin: '0 0',
          }}
          className="absolute top-1/2 left-1/2 w-0 h-0"
        >
          {/* SVG Connections Layer */}
          <svg
            className="pointer-events-none overflow-visible absolute top-0 left-0"
            width="1"
            height="1"
          >
            {visibleNodes.map((node) => {
              if (!node.parentId) return null;
              const parent = visibleNodeMap.get(node.parentId);
              if (!parent) return null;

              const dx = node.x - parent.x;
              const controlOffset = Math.max(60, Math.abs(dx) * 0.48);
              const c1x =
                dx >= 0 ? parent.x + controlOffset : parent.x - controlOffset;
              const c2x =
                dx >= 0 ? node.x - controlOffset : node.x + controlOffset;
              const pathData = `M ${parent.x} ${parent.y} C ${c1x} ${parent.y}, ${c2x} ${node.y}, ${node.x} ${node.y}`;

              const isHighlighted =
                state.selectedNodeId === node.id ||
                state.selectedNodeId === parent.id;

              return (
                <path
                  key={`edge-${parent.id}-${node.id}`}
                  d={pathData}
                  fill="none"
                  stroke={isHighlighted ? '#475569' : '#CBD5E1'}
                  strokeWidth={isHighlighted ? 2.25 : 1.75}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Nodes Layer */}
          {visibleNodes.map((node) => (
            <NodeRenderer
              key={node.id}
              node={node}
              isSelected={state.selectedNodeId === node.id}
              isEditing={state.editingNodeId === node.id}
              isSearchMatch={searchMatchIds.has(node.id)}
              isActiveSearchMatch={activeSearchMatchId === node.id}
              childCount={childCountMap.get(node.id) || 0}
              onSelect={(id) =>
                setState((prev) => ({
                  ...prev,
                  selectedNodeId: id,
                  editingNodeId:
                    prev.editingNodeId === id ? id : null,
                }))
              }
              onStartEdit={(id) =>
                setState((prev) => ({
                  ...prev,
                  selectedNodeId: id,
                  editingNodeId: id,
                }))
              }
              onCommitEdit={(id, newText) =>
                setState((prev) => ({
                  ...updateNodeAttributes(prev, id, { text: newText }),
                  editingNodeId: null,
                }))
              }
              onQuickAddChild={(id) =>
                setState((prev) => {
                  const res = addQuickChildNode(prev, id);
                  return { ...res.state, editingNodeId: res.newNode.id };
                })
              }
              onToggleCollapse={(id) =>
                setState((prev) => {
                  const target = prev.nodes.find((n) => n.id === id);
                  if (!target) return prev;
                  return updateNodeAttributes(prev, id, {
                    collapsed: !target.collapsed,
                  });
                })
              }
              onDragStart={handleNodeDragStart}
            />
          ))}
        </div>
      </main>

      {/* Bottom Floating Style & 5 Defaults Dock */}
      <StyleDock
        selectedNode={selectedNode}
        presets={state.presets}
        activeDefaultId={state.activeDefaultId}
        canDeleteSelected={canDeleteSelected}
        onSelectPresetForNodeAndDefault={handleSelectPreset}
        onUpdateNodeShape={handleUpdateShape}
        onUpdateNodeBubbleColor={handleUpdateBubbleColor}
        onUpdateNodeTextColor={handleUpdateTextColor}
        onSaveSelectedStyleToActiveDefault={handleSaveSelectedStyleToDefault}
        onQuickAddChild={() =>
          setState((prev) => {
            const res = addQuickChildNode(prev);
            return { ...res.state, editingNodeId: res.newNode.id };
          })
        }
        onQuickAddSibling={() =>
          setState((prev) => {
            const res = addQuickSiblingNode(prev);
            return { ...res.state, editingNodeId: res.newNode.id };
          })
        }
        onStartEditSelected={() =>
          setState((prev) =>
            prev.selectedNodeId
              ? { ...prev, editingNodeId: prev.selectedNodeId }
              : prev
          )
        }
        onDeleteSelected={() =>
          setState((prev) =>
            prev.selectedNodeId
              ? deleteNodeAndDescendants(prev, prev.selectedNodeId)
              : prev
          )
        }
      />

      {/* Export / Import Modal */}
      <ExportImportModal
        isOpen={isExportImportOpen}
        state={state}
        onClose={() => setIsExportImportOpen(false)}
        onImportState={(newState) => {
          setState(newState);
          triggerToast(
            `Imported "${newState.title}" (${newState.nodes.length} nodes)`
          );
        }}
      />

      {/* Shortcuts & Trackpad Guide Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
