import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
        copied
          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
      } ${className}`}
      title="Copy to Clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-slate-400" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
