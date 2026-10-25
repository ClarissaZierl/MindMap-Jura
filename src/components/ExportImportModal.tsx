import React, { useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileJson,
  FileText,
  FolderTree,
  Upload,
  X,
} from 'lucide-react';
import { MindMapState } from '../types/mindmap';
import {
  SAMPLE_DEEP_NESTED_TEMPLATES,
  deserializeMindMap,
  exportToMarkdown,
  serializeMindMap,
} from '../utils/mindmapLogic';

interface ExportImportModalProps {
  isOpen: boolean;
  state: MindMapState;
  onClose: () => void;
  onImportState: (newState: MindMapState) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  state,
  onClose,
  onImportState,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown'>('json');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const serializedJson = serializeMindMap(state);
  const serializedMarkdown = exportToMarkdown(state);
  const currentExportContent =
    exportFormat === 'json' ? serializedJson : serializedMarkdown;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentExportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy if clipboard API restricted
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    const ext = exportFormat === 'json' ? 'json' : 'md';
    const mime =
      exportFormat === 'json' ? 'application/json' : 'text/markdown';
    const slug = (state.title || 'mindmap')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const blob = new Blob([currentExportContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug || 'minimalmap'}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExecuteImport = (rawJsonToParse: string) => {
    setImportError(null);
    if (!rawJsonToParse.trim()) {
      setImportError('Please paste JSON data or select a file/template first.');
      return;
    }
    try {
      const nextState = deserializeMindMap(rawJsonToParse, state);
      onImportState(nextState);
      onClose();
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Could not parse mind map JSON.'
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setImportText(text);
      setImportError(null);
    };
    reader.onerror = () => {
      setImportError('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-import-modal-title"
    >
      <div className="w-full max-w-2xl rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <h2
              id="export-import-modal-title"
              className="text-base font-bold text-slate-900"
            >
              Data Export & Import
            </h2>

            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('export');
                  setImportError(null);
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'export'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Export Data
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('import');
                  setImportError(null);
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'import'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Import Data
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close export and import modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'export' ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono tabular-nums font-medium text-slate-800">
                    {state.nodes.length} nodes
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Preserves nesting, shapes, bubble & text colors</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setExportFormat('json')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                      exportFormat === 'json'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    <span>Structured JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat('markdown')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                      exportFormat === 'markdown'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Markdown Outline</span>
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="export-data-preview"
                  className="block text-xs font-medium text-slate-600 mb-1.5"
                >
                  {exportFormat === 'json'
                    ? 'Full Mind Map JSON (includes flat nodes + recursive nested tree)'
                    : 'Hierarchical Markdown Outline'}
                </label>
                <textarea
                  id="export-data-preview"
                  readOnly
                  value={currentExportContent}
                  rows={12}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy {exportFormat.toUpperCase()}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    Download .{exportFormat === 'json' ? 'json' : 'md'} File
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Import File or Multi-Level Presets */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Load from JSON File or Deep-Nesting Presets
                  </p>
                  <p className="text-xs text-slate-500">
                    Supports both flat node lists and deeply nested recursive{' '}
                    <code className="font-mono text-slate-700">children</code>{' '}
                    trees.
                  </p>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="sr-only"
                    aria-label="Upload JSON file"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose .json File</span>
                  </button>
                </div>
              </div>

              {/* Sample Deep-Nesting Test Templates */}
              <div className="space-y-2">
                <span className="block text-xs font-medium text-slate-600">
                  Or load a multi-level nested test structure:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_DEEP_NESTED_TEMPLATES.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="rounded-lg border border-slate-200 p-3 flex flex-col justify-between gap-2 bg-slate-50/60"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                          <FolderTree className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span>{tpl.name}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setImportText(JSON.stringify(tpl.data, null, 2));
                            setImportError(null);
                          }}
                          className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          Preview JSON
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleExecuteImport(JSON.stringify(tpl.data))
                          }
                          className="px-2.5 py-1 rounded-md bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 cursor-pointer"
                        >
                          Import Preset
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw JSON Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="import-json-textarea"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Paste or Edit Mind Map JSON
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setImportText(serializedJson);
                      setImportError(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-900 underline cursor-pointer"
                  >
                    Load current map JSON into editor
                  </button>
                </div>
                <textarea
                  id="import-json-textarea"
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    if (importError) setImportError(null);
                  }}
                  placeholder='{"title": "My Map", "tree": [{"id": "root", "text": "Central Idea", "shape": "bubble", "bubbleColor": "#FFFFFF", "textColor": "#0F172A", "children": [...]}]}'
                  rows={8}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800 focus:outline-none focus:border-slate-900"
                />
              </div>

              {importError && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
                >
                  {importError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteImport(importText)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import JSON Data</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
