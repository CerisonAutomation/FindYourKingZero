import React, {useCallback, useMemo} from 'react';
import {ChevronLeft, ChevronRight, MoreHorizontal} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {type PaginationConfig, paginationUtils, useEnterprisePagination} from '@/lib/pagination/EnterprisePagination';

interface EnterprisePaginationProps<T = any> {
  // Pagination state
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  isLoading?: boolean;
  isFetching?: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Navigation callbacks
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRefresh?: () => void;
  
  // Configuration
  pageSizeOptions?: number[];
  maxVisiblePages?: number;
  showPageInfo?: boolean;
  showPageSizeSelector?: boolean;
  showRefreshButton?: boolean;
  showJumpButtons?: boolean;
  
  // Styling
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  
  // Accessibility
  ariaLabel?: string;
  disableAccessibility?: boolean;
  
  // Advanced features
  enableKeyboardNavigation?: boolean;
  enableVirtualScrolling?: boolean;
  itemHeight?: number;
  containerHeight?: number;
  
  // Custom rendering
  renderPageButton?: (page: number, isActive: boolean, onClick: () => void) => React.ReactNode;
  renderPageInfo?: (info: { start: number; end: number; total: number }) => React.ReactNode;
}

const EnterprisePaginationComponent = <T = any>({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  isLoading = false,
  isFetching = false,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  pageSizeOptions = [10, 20, 50, 100],
  maxVisiblePages = 7,
  showPageInfo = true,
  showPageSizeSelector = true,
  showRefreshButton = false,
  showJumpButtons = true,
  className,
  size = 'md',
  variant = 'default',
  ariaLabel = 'Pagination navigation',
  disableAccessibility = false,
  enableKeyboardNavigation = true,
  renderPageButton,
  renderPageInfo,
  ...props
}: EnterprisePaginationProps<T>) => {
  
  // Generate page numbers with smart ellipsis
  const pageNumbers = useMemo(() => {
    return paginationUtils.generatePageNumbers(currentPage, totalPages, maxVisiblePages);
  }, [currentPage, totalPages, maxVisiblePages]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalCount);
    return { start, end };
  }, [currentPage, pageSize, totalCount]);

  // Size configurations
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          buttonClass: 'h-8 px-2 text-xs',
          selectClass: 'h-8 text-xs',
          iconClass: 'h-3 w-3',
        };
      case 'lg':
        return {
          buttonClass: 'h-12 px-4 text-base',
          selectClass: 'h-12 text-base',
          iconClass: 'h-5 w-5',
        };
      default:
        return {
          buttonClass: 'h-10 px-3 text-sm',
          selectClass: 'h-10 text-sm',
          iconClass: 'h-4 w-4',
        };
    }
  }, [size]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!enableKeyboardNavigation) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        if (hasPreviousPage) {
          onPageChange(currentPage - 1);
        }
        break;
      case 'ArrowRight':
        if (hasNextPage) {
          onPageChange(currentPage + 1);
        }
        break;
      case 'Home':
        onPageChange(1);
        break;
      case 'End':
        onPageChange(totalPages);
        break;
      case 'PageUp':
        event.preventDefault();
        onPageChange(Math.max(1, currentPage - 1));
        break;
      case 'PageDown':
        event.preventDefault();
        onPageChange(Math.min(totalPages, currentPage + 1));
        break;
    }
  }, [enableKeyboardNavigation, hasPreviousPage, hasNextPage, currentPage, totalPages, onPageChange]);

  // Render page button with custom support
  const renderPage = useCallback((page: number) => {
    const isActive = page === currentPage;
    const isDisabled = isLoading || isFetching;
    
    if (renderPageButton) {
      return renderPageButton(page, isActive, () => !isDisabled && onPageChange(page));
    }
    
    if (page === '...') {
      return (
        <span className={cn('flex items-center justify-center', sizeConfig.buttonClass)}>
          <MoreHorizontal className={sizeConfig.iconClass} />
        </span>
      );
    }
    
    return (
      <Button
        variant={isActive ? 'default' : variant}
        size={size}
        disabled={isDisabled}
        onClick={() => onPageChange(page)}
        className={cn(
          'min-w-[2.5rem]',
          isActive && 'ring-2 ring-offset-2',
          sizeConfig.buttonClass
        )}
        aria-current={isActive ? 'page' : undefined}
        aria-label={`Go to page ${page}`}
      >
        {page}
      </Button>
    );
  }, [currentPage, isLoading, isFetching, renderPageButton, variant, size, sizeConfig, onPageChange]);

  // Render page info with custom support
  const renderInfo = useCallback(() => {
    if (renderPageInfo) {
      return renderPageInfo({ start: visibleRange.start, end: visibleRange.end, total: totalCount });
    }
    
    return (
      <p className={cn('text-sm text-muted-foreground', size === 'sm' && 'text-xs')}>
        Showing {visibleRange.start}-{visibleRange.end} of {totalCount.toLocaleString()} items
      </p>
    );
  }, [renderPageInfo, visibleRange, totalCount, size]);

  return (
    <nav
      className={cn('flex flex-col gap-4', className)}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      tabIndex={enableKeyboardNavigation ? 0 : -1}
      {...(!disableAccessibility && {
        role: 'navigation',
        'aria-label': ariaLabel,
      })}
      {...props}
    >
      {/* Page size selector and info */}
      <div className="flex items-center justify-between">
        {showPageInfo && (
          <div className="flex items-center gap-2">
            {renderInfo()}
            {isFetching && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Updating...
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-4">
          {showPageSizeSelector && (
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-sm font-medium">
                Rows per page:
              </label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => onPageSizeChange(Number(value))}
                disabled={isLoading}
              >
                <SelectTrigger className={cn('w-20', sizeConfig.selectClass)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {showRefreshButton && onRefresh && (
            <Button
              variant="outline"
              size={size}
              onClick={onRefresh}
              disabled={isLoading || isFetching}
              className={sizeConfig.buttonClass}
            >
              Refresh
            </Button>
          )}
        </div>
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center justify-center gap-1">
        {/* First page button */}
        {showJumpButtons && totalPages > 1 && (
          <Button
            variant={variant}
            size={size}
            disabled={!hasPreviousPage || isLoading}
            onClick={() => onPageChange(1)}
            className={cn(sizeConfig.buttonClass)}
            aria-label="Go to first page"
          >
            <ChevronLeft className={cn(sizeConfig.iconClass, 'mr-1')} />
            <ChevronLeft className={sizeConfig.iconClass} />
          </Button>
        )}
        
        {/* Previous page button */}
        <Button
          variant={variant}
          size={size}
          disabled={!hasPreviousPage || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className={cn(sizeConfig.buttonClass)}
          aria-label="Go to previous page"
        >
          <ChevronLeft className={sizeConfig.iconClass} />
        </Button>
        
        {/* Page numbers */}
        <div className="flex items-center gap-1" role="group" aria-label="Page numbers">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={`page-${page}-${index}`}>
              {renderPage(page as number | '...')}
            </React.Fragment>
          ))}
        </div>
        
        {/* Next page button */}
        <Button
          variant={variant}
          size={size}
          disabled={!hasNextPage || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className={cn(sizeConfig.buttonClass)}
          aria-label="Go to next page"
        >
          <ChevronRight className={sizeConfig.iconClass} />
        </Button>
        
        {/* Last page button */}
        {showJumpButtons && totalPages > 1 && (
          <Button
            variant={variant}
            size={size}
            disabled={!hasNextPage || isLoading}
            onClick={() => onPageChange(totalPages)}
            className={cn(sizeConfig.buttonClass)}
            aria-label="Go to last page"
          >
            <ChevronRight className={sizeConfig.iconClass} />
            <ChevronRight className={cn(sizeConfig.iconClass, 'ml-1')} />
          </Button>
        )}
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            Loading...
          </div>
        </div>
      )}
    </nav>
  );
};

// Hook-based pagination component
export function EnterprisePagination<T = any>({
  fetchFunction,
  config,
  ...paginationProps
}: {
  fetchFunction: (page: number, pageSize: number, signal?: AbortSignal) => Promise<{
    data: T[];
    totalCount: number;
    hasMore?: boolean;
  }>;
  config?: Partial<PaginationConfig>;
} & Omit<EnterprisePaginationProps<T>, keyof EnterprisePaginationState>) {
  const pagination = useEnterprisePagination(fetchFunction, config);
  
  return (
    <EnterprisePaginationComponent
      {...paginationProps}
      {...pagination}
    />
  );
}

// Export both components
export { EnterprisePaginationComponent as EnterprisePaginationUI };
export default EnterprisePagination;
