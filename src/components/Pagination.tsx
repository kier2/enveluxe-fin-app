import React from "react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-t border-gray-100">
      <div className="text-xs text-gray-500 font-medium">
        Showing <span className="font-semibold text-gray-700">{startItem}</span> to{" "}
        <span className="font-semibold text-gray-700">{endItem}</span> of{" "}
        <span className="font-semibold text-gray-700">{totalItems}</span> entries
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous Page Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border transition-all text-xs font-semibold select-none cursor-pointer ${
              currentPage === 1
                ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 active:scale-95"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3.5 h-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Page numbers */}
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold select-none transition-all cursor-pointer ${
                currentPage === page
                  ? "bg-emerald-600 border-emerald-600 text-white font-bold shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Page Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border transition-all text-xs font-semibold select-none cursor-pointer ${
              currentPage === totalPages
                ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 active:scale-95"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3.5 h-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
