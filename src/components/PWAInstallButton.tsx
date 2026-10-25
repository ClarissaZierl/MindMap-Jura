import React, { useState } from 'react';
import { Download, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        title="Install MinimalMap as a standalone app"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        title="Install MinimalMap PWA"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isIOS ? 'Install on iOS' : 'PWA Ready'}</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-modal-title"
        >
          <div className="w-full max-w-sm rounded-xl bg-white border border-slate-200 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3
                id="pwa-modal-title"
                className="text-base font-semibold text-slate-900"
              >
                Install MinimalMap PWA
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close PWA install guide"
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {isIOS ? (
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                1. Tap the <strong>Share</strong> button in your Safari toolbar.
                <br />
                2. Scroll down and select <strong>Add to Home Screen</strong>.
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                MinimalMap is offline-enabled with a registered Service Worker
                and Web App Manifest. To install on desktop, click the{' '}
                <strong>Install</strong> icon in your browser address bar, or
                open in a top-level browser tab.
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-5 w-full rounded-lg bg-slate-900 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed top-16 right-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white shadow-md"
    >
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Local changes saved automatically</span>
    </div>
  );
};
