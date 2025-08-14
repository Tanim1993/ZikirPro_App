import React, { useMemo, useState } from "react";
import type { Zikir } from "../types/zikir";
import { searchZikir } from "../lib/zikir";
import { Search, X } from "lucide-react";

type Props = {
  onSelect: (zikir: Zikir) => void;
  onClose?: () => void;
  className?: string;
};

export default function ZikirPicker({ onSelect, onClose, className = "" }: Props) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState<number | null>(null);

  const results = useMemo(() => searchZikir(q), [q]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocused(prev => 
        prev === null ? 0 : Math.min(prev + 1, results.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocused(prev => 
        prev === null ? results.length - 1 : Math.max(prev - 1, 0)
      );
    } else if (e.key === "Enter" && focused !== null) {
      e.preventDefault();
      onSelect(results[focused]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose?.();
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-2xl shadow-xl border border-gray-200 bg-white overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search zikir by English, Arabic, transliteration, or category..."
              className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              data-testid="input-zikir-search"
            />
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              data-testid="button-close-picker"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-h-[60vh] overflow-auto">
        {results.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {results.map((z, idx) => (
              <li
                key={z.id}
                onMouseEnter={() => setFocused(idx)}
                onMouseLeave={() => setFocused(null)}
                className={`p-4 cursor-pointer transition-colors min-h-[48px] ${
                  focused === idx ? "bg-green-50 border-l-4 border-green-500" : "hover:bg-gray-50"
                }`}
                onClick={() => onSelect(z)}
                data-testid={`option-zikir-${z.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{z.name}</h3>
                      <span className="text-xs rounded-full bg-gray-100 text-gray-600 px-2 py-1 font-medium">
                        {z.category}
                      </span>
                    </div>
                    <div className="mb-2 text-xl leading-8 text-right font-arabic" dir="rtl">
                      {z.arabic}
                    </div>
                    <div className="mb-1 text-sm text-gray-600 italic font-medium">
                      {z.transliteration}
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {z.translation}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">
              No zikir found matching "{q}". Try searching by Arabic text, transliteration, English translation, or category.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Use ↑↓ arrow keys to navigate, Enter to select, or click to choose
        </p>
      </div>
    </div>
  );
}