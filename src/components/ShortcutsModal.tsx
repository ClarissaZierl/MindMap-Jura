import React from 'react';
import { Keyboard, MousePointer, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KEYBOARD_SHORTCUTS = [
  { keys: 'Tab', description: 'Add a child node using active Quick Default' },
  { keys: 'Enter', description: 'Add a sibling node on the same level' },
  { keys: 'F2 / Double-Click', description: 'Edit text of the selected node' },
  { keys: 'Arrow Keys', description: 'Navigate spatially between nodes' },
  { keys: 'Delete / Backspace', description: 'Delete selected node & branch' },
  { keys: '/ or Cmd + F', description: 'Focus word search bar' },
  { keys: '1 – 5', description: 'Apply & switch among the 5 Quick Defaults' },
  { keys: '+ / - / 0', description: 'Zoom in, zoom out, or reset canvas view' },
];

const TRACKPAD_GESTURES = [
  {
    gesture: 'Two-Finger Glide',
    description: 'Smoothly pan across the infinite canvas in any direction',
  },
  {
    gesture: 'Two-Finger Pinch',
    description: 'Zoom in and out anchored at your cursor position',
  },
  {
    gesture: 'Space + Drag / Empty Drag',
    description: 'Pan canvas with single finger or mouse drag',
  },
  {
    gesture: 'Double-Click Canvas',
    description: 'Create a new node at that exact spot using Quick Default',
  },
  {
    gesture: 'Shift + Drag Node',
    description: 'Move a parent node together with its entire nested subtree',
  },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div className="w-full max-w-xl rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2
            id="shortcuts-modal-title"
            className="text-base font-bold text-slate-900"
          >
            Trackpad & Keyboard Navigation
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts guide"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Trackpad Optimization Section */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-3">
              <MousePointer className="w-4 h-4 text-slate-700" />
              <span>Trackpad & Infinite Canvas Gestures</span>
            </div>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {TRACKPAD_GESTURES.map((item) => (
                <div
                  key={item.gesture}
                  className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                >
                  <span className="font-semibold text-slate-800">
                    {item.gesture}
                  </span>
                  <span className="text-slate-500 text-right">
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts Section */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-3">
              <Keyboard className="w-4 h-4 text-slate-700" />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {KEYBOARD_SHORTCUTS.map((item) => (
                <div
                  key={item.keys}
                  className="flex items-center justify-between px-3.5 py-2 text-xs"
                >
                  <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] font-medium text-slate-800">
                    {item.keys}
                  </kbd>
                  <span className="text-slate-500 text-right">
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
