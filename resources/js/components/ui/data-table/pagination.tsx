import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface PaginationProps {
  data: {
    current_page: number;
    from: number;
    last_page: number;
    to: number;
    total: number;
  };
  routeName: string;
  params?: Record<string, string | number | boolean>;
  onPerPageChange?: (perPage: string) => void;
}

export function DataTablePagination({ data, routeName, params = {}, onPerPageChange }: PaginationProps) {
  const [perPage, setPerPage] = useState<string>(String(params.per_page || '10'));

  if (data.last_page <= 1) return null;

  const handlePerPageChange = (value: string) => {
    setPerPage(value);
    if (onPerPageChange) {
      onPerPageChange(value);
    }
  };

  const navigateToPage = (page: number) => {
    router.get(
      route(routeName, {
        ...params,
        page,
      }),
      {},
      { preserveState: true }
    );
  };

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground text-sm">
          Showing {data.from} to {data.to} of {data.total} items
        </div>
        {onPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Show</span>
            <Select value={perPage} onValueChange={handlePerPageChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue>{perPage}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground text-sm">per page</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        {data.current_page > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(data.current_page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}

        {/* Page Numbers */}
        {data.last_page <= 7
          ? // Show all pages if 7 or fewer
            [...Array(data.last_page)].map((_, i) => {
              const page = i + 1;
              const isActive = page === data.current_page;

              return (
                <Button
                  key={page}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!isActive) {
                      navigateToPage(Number(page));
                    }
                  }}
                >
                  {page}
                </Button>
              );
            })
          : // Show limited pages with ellipsis for large page counts
            (() => {
              const pages = [];
              const current = data.current_page;
              const last = data.last_page;

              // Always show first page
              pages.push(1);

              // Determine range around current page
              const start = Math.max(2, current - 1);
              const end = Math.min(last - 1, current + 1);

              // Add ellipsis if needed before middle pages
              if (start > 2) {
                pages.push("...");
              }

              // Add middle pages
              for (let i = start; i <= end; i++) {
                pages.push(i);
              }

              // Add ellipsis if needed after middle pages
              if (end < last - 1) {
                pages.push("...");
              }

              // Always show last page
              if (last > 1) {
                pages.push(last);
              }

              return pages.map((page, i) => {
                if (page === "...") {
                  return (
                    <span key={`ellipsis-${i}`} className="px-2">
                      ...
                    </span>
                  );
                }

                const isActive = page === current;
                return (
                  <Button
                    key={`page-${page}`}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (!isActive) {
                        navigateToPage(Number(page));
                      }
                    }}
                  >
                    {page}
                  </Button>
                );
              });
            })()}

        {/* Next Button */}
        {data.current_page < data.last_page && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(data.current_page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
