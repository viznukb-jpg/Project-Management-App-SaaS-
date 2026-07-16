import { Button } from './Button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) {
      pages.push('...');
    }
    if (currentPage === 1 || currentPage === 2) {
      pages.push(2, 3, 4);
    } else if (currentPage === totalPages || currentPage === totalPages - 1) {
      pages.push(totalPages - 3, totalPages - 2, totalPages - 1);
    } else {
      pages.push(currentPage - 1, currentPage, currentPage + 1);
    }
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mr-2"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>

      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <div
              key={`ellipsis-${index}`}
              className="px-2 flex items-center justify-center text-slate-500"
            >
              <MoreHorizontal className="w-4 h-4" />
            </div>
          );
        }

        const isCurrent = page === currentPage;

        return (
          <Button
            key={`page-${page}`}
            variant={isCurrent ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(page as number)}
            className={`w-9 h-9 p-0 ${
              isCurrent ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''
            }`}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="ml-2"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
