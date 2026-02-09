import React from "react";
import { Button } from "~/components/ui/button";

type Props = {
  table: any;
  pageSizeOptions?: number[];
};

export default function TablePagination({ table, pageSizeOptions = [10, 25, 50] }: Props) {
  if (!table) return null;
  const pageCount = table.getPageCount();
  if (pageCount === 0) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center sm:justify-between px-2 py-2 border-t border-border bg-background gap-2">
      {/* Left: rows per page (on small screens it appears first) */}
      <div className="flex items-center gap-3 order-1 sm:order-1">
        <label className="text-sm text-muted-foreground">Show</label>
        <div className="relative">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
            }}
            className="appearance-none border rounded-md px-3 py-1 text-sm bg-background  shadow-sm"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((s) => (
              <option  key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {/* <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M6 7l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg> */}
        </div>
        <label className="text-sm text-muted-foreground">rows per page</label>
      </div>

      {/* Middle: page info */}
      <div className="text-sm text-muted-foreground order-2">
        Page {table.getState().pagination.pageIndex + 1} of {pageCount}
      </div>

      {/* Right: navigation controls */}
      <div className="flex items-center gap-2 order-3 sm:order-3">
        <Button size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
          {"<<"}
        </Button>
        <Button size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Prev
        </Button>
        <Button size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
        <Button size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
          {">>"}
        </Button>
      </div>
    </div>
  );
}

