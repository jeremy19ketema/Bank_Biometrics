"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-[color:var(--line)]">
      <p className="text-[11px] text-[color:var(--ledger-paper-dim)] font-mono">
        Showing <span className="text-[color:var(--ledger-paper)] font-semibold">{from}–{to}</span> of{" "}
        <span className="text-[color:var(--ledger-paper)] font-semibold">{totalItems}</span> records
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] text-[color:var(--ledger-paper-dim)] hover:text-[color:var(--ledger-paper)] hover:border-[color:var(--brass)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-[color:var(--ledger-paper-dim)] text-xs select-none">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`min-w-[30px] h-[30px] rounded-lg text-xs font-semibold transition-all border ${
                page === currentPage
                  ? "bg-[color:var(--brass)]/20 border-[color:var(--brass)]/50 text-[color:var(--brass)]"
                  : "bg-[color:var(--vault-charcoal)] border-[color:var(--line)] text-[color:var(--ledger-paper-dim)] hover:text-[color:var(--ledger-paper)] hover:border-[color:var(--brass)]"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] text-[color:var(--ledger-paper-dim)] hover:text-[color:var(--ledger-paper)] hover:border-[color:var(--brass)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}