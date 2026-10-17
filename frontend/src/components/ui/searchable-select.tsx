"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X, User } from "lucide-react";
import { Badge, BadgeVariant } from "./badge";

export interface SearchableOption {
  value: string;
  label: string;
  subLabel?: string;
  badge?: string;
  badgeVariant?: BadgeVariant;
  metadata?: unknown;
}

export interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string, option?: SearchableOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  allowCustom?: boolean;
  clearable?: boolean;
  customPlaceholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "-- ກະລຸນາເລືອກ --",
  searchPlaceholder = "ພິມເພື່ອຄົ້ນຫາ (ຊື່, ລະຫັດ, ພາກວິຊາ)...",
  disabled = false,
  allowCustom = true,
  clearable = true,
  customPlaceholder = "+ ປ້ອນຂໍ້ມູນນີ້ເອງ: ",
  className = "",
  icon,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Filter options based on query
  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase().trim();
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchSub = opt.subLabel ? opt.subLabel.toLowerCase().includes(q) : false;
      const matchBadge = opt.badge ? opt.badge.toLowerCase().includes(q) : false;
      const matchVal = opt.value.toLowerCase().includes(q);
      return matchLabel || matchSub || matchBadge || matchVal;
    });
  }, [options, query]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  const handleSelect = (val: string, opt?: SearchableOption) => {
    onChange(val, opt);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={containerRef} className={`relative font-sans text-xs ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
          disabled
            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            : isOpen
            ? "border-sky-500 ring-2 ring-sky-100 bg-white text-slate-900 shadow-xs"
            : value
            ? "border-slate-300 bg-white text-slate-900 hover:border-slate-400"
            : "border-slate-300 bg-white text-slate-400 hover:border-slate-400"
        }`}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {icon ? icon : <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
          <div className="truncate flex-1">
            {selectedOption ? (
              <span className="font-semibold text-slate-900">{selectedOption.label}</span>
            ) : value ? (
              <span className="font-semibold text-slate-900">{value}</span>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </div>
          {selectedOption?.badge && (
            <Badge variant={selectedOption.badgeVariant || "slate"} className="shrink-0 text-[10px] py-0 px-1.5">
              {selectedOption.badge}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && clearable && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              title="ລຶບຄ່າທີ່ເລືອກ"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180 text-sky-600" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Floating Panel */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden py-1"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Results Count & Guidance */}
          <div className="px-3 py-1 bg-slate-100/50 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>
              {query.trim()
                ? `ພົບ ${filteredOptions.length} ລາຍການທີ່ຕົກກັບ "${query}"`
                : `ລາຍການທັງໝົດ ${options.length} ລາຍການ`}
            </span>
            <span className="text-slate-400">ພິມເພື່ອຄັດຕອງ</span>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-5 px-3 text-center text-slate-400">
                <p className="text-xs">ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບຄຳຄົ້ນຫາ</p>
                {allowCustom && query.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSelect(query.trim())}
                    className="mt-2 text-xs font-semibold text-sky-600 hover:text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 inline-flex items-center gap-1"
                  >
                    {customPlaceholder} &ldquo;{query.trim()}&rdquo;
                  </button>
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value || opt.label === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value, opt)}
                    className={`flex items-start justify-between gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-sky-50 text-sky-950 font-semibold"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <Badge variant={opt.badgeVariant || "slate"} className="text-[10px] py-0 px-1.5 shrink-0">
                            {opt.badge}
                          </Badge>
                        )}
                      </div>
                      {opt.subLabel && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                          {opt.subLabel}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                );
              })
            )}

            {/* Custom Option button at bottom if query provided */}
            {allowCustom && query.trim() && filteredOptions.length > 0 && (
              <div
                onClick={() => handleSelect(query.trim())}
                className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer flex items-center gap-1.5 font-semibold text-xs border-t border-slate-100 mt-1"
              >
                <span>{customPlaceholder} &ldquo;{query.trim()}&rdquo;</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
