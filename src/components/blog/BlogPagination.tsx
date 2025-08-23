import Link from 'next/link';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  locale: string;
  basePath?: string;
}

export function BlogPagination({ 
  currentPage, 
  totalPages, 
  locale,
  basePath = `/${locale}/blog`
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 4) {
        // Show pages 2, 3, 4, 5, ..., last
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show 1, ..., last-4, last-3, last-2, last-1, last
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show 1, ..., current-1, current, current+1, ..., last
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const getPageUrl = (page: number) => {
    const url = new URL(`${basePath}?page=${page}`, 'http://localhost');
    return url.pathname + url.search;
  };

  return (
    <nav className="flex items-center justify-center space-x-2" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {locale === 'es' ? 'Anterior' : 'Previous'}
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground/50 bg-muted border border-border rounded-lg cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          {locale === 'es' ? 'Anterior' : 'Previous'}
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-10 h-10 text-muted-foreground"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          const pageNumber = page as number;
          const isCurrentPage = pageNumber === currentPage;

          return (
            <Link
              key={pageNumber}
              href={getPageUrl(pageNumber)}
              className={`
                flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-colors
                ${isCurrentPage
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground bg-background border border-border hover:bg-accent hover:text-accent-foreground'
                }
              `}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {pageNumber}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {locale === 'es' ? 'Siguiente' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground/50 bg-muted border border-border rounded-lg cursor-not-allowed">
          {locale === 'es' ? 'Siguiente' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </span>
      )}

      {/* Page Info */}
      <div className="hidden sm:flex items-center ml-4 text-sm text-muted-foreground">
        {locale === 'es' 
          ? `Página ${currentPage} de ${totalPages}`
          : `Page ${currentPage} of ${totalPages}`
        }
      </div>
    </nav>
  );
}
