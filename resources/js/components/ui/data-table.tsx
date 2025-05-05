"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
  Column,
  Table as ReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EyeOff, ArrowDown, ArrowUp, ChevronsUpDown, ChevronsRight, ChevronRight, ChevronLeft, ChevronsLeft, MoreHorizontal, Lock, ColumnsIcon, FilterIcon } from "lucide-react"
import { cn, formatPatternToText } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CheckUserPermission from "./check-user-permission"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

/**
 * Data Table Column Header
 *
 * This component is used to display the header of a column in the DataTable.
 * It is used to sort and hide the column.
 *
 * @param column - The column to display the header for.
 * @param title - The title of the column.
 * @param className - The className of the column.
 * @returns A div with the title of the column.
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp />
            ) : (
              <ChevronsUpDown />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {column.getCanSort() && (
            <>
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          </>
          )}
          {column.getCanSort() && column.getCanHide() && (<DropdownMenuSeparator />)}
          {column.getCanHide() && (
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff className="h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


export interface DataTableActionType {
  permission: string | string[];
  title: string;
  icon: React.ReactNode;
  link?: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
  separatorAfter?: boolean;
}

interface DataTableActionsProps {
  actions: DataTableActionType[];
  fallbackText?: string;
}

/**
 * Data Table Actions
 *
 * This component is used to display the actions of a row in the DataTable.
 * It is used to display the actions of a row in the DataTable.
 *
 * @param actions - The actions to display.
 * @param fallbackText - The text to display if the user does not have permission.
 */
export function DataTableActions({ actions, fallbackText = "Access Denied" }: DataTableActionsProps) {
    const permissions = actions.map(action =>
      Array.isArray(action.permission) ? action.permission : [action.permission]
    ).flat()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <CheckUserPermission
          permission={permissions}
          fallback={
            <DropdownMenuItem>
              <Lock className="mr-2 size-4" />
              {fallbackText}
            </DropdownMenuItem>
          }
        >
          {actions.map((action, index) => (
            <CheckUserPermission key={index} permission={action.permission}>
                <>
                {action.separatorBefore && <DropdownMenuSeparator />}
                <DropdownMenuItem
                    asChild={!!action.link}
                    onClick={action.onClick}
                    className={action.danger ? "text-red-600 focus:text-red-600" : ""}
                    disabled={action.disabled}
                >
                    {action.link ? (
                    <a href={action.link} className="flex w-full items-center">
                        {action.icon}
                        {action.title}
                    </a>
                    ) : (
                    <div className="flex w-full items-center">
                        {action.icon}
                        {action.title}
                    </div>
                    )}
                </DropdownMenuItem>
                {action.separatorAfter && <DropdownMenuSeparator />}
                </>
            </CheckUserPermission>
            ))}

        </CheckUserPermission>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


interface DataTablePaginationProps<TData> {
  table: ReactTable<TData>
}

function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center w-full flex-col md:flex-row justify-between px-2">
        <div className="flex items-center gap-4">
            <div className="text-muted-foreground text-sm">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + table.getState().pagination.pageSize} of {table.getFilteredRowModel().rows.length} items.
            </div>
            <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows</p>
            <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                table.setPageSize(Number(value))
                }}
            >
                <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                {[10, 50, 100, 200, 500].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            <p className="text-sm font-medium">per page</p>
        </div>
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

export interface DataTableFilter {
    label: string;
    type: "select" | "input" | "global";
    options?: { label: string; value: string }[];
    placeholder?: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filters?: Record<string, DataTableFilter>
  initialHiddenColumns?: string[]
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  initialHiddenColumns,
}: DataTableProps<TData, TValue>) {
   const [sorting, setSorting] = useState<SortingState>([])
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialHiddenColumns?.reduce((acc, column) => {
    acc[column] = false
    return acc
   }, {} as Record<string, boolean>) || {})
   const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
   const [showFilters, setShowFilters] = useState(false)
   const [globalFilter, setGlobalFilter] = useState<string>("")


  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "auto",
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  return (
    <>
    <div className="flex items-center py-4 gap-2">
        {/* Render filters based on the filters prop */}
        {filters && Object.entries(filters).length > 0 && (
          <div className={cn("flex flex-wrap items-center gap-2", showFilters ? "block" : "hidden md:flex")}>
            {Object.entries(filters).map(([key, filter]) => {
              const column = table.getColumn(key)

              if (!column) return null

              return (
                <div key={key} className="flex items-center gap-2">
                  {filter.type === "input" && (
                    <Input
                      placeholder={filter.placeholder ?? `Filter by ${filter.label.toLowerCase()}...`}
                      value={(column.getFilterValue() as string) ?? ""}
                      onChange={(event) => column.setFilterValue(event.target.value)}
                      className="w-full md:max-w-[200px] mb-2"
                    />
                  )}
                {filter.type === "global" && (
                    <Input
                      placeholder={filter.placeholder ?? `Filter by ${filter.label.toLowerCase()}...`}
                      value={globalFilter}
                      onChange={(event) => setGlobalFilter(event.target.value)}
                      className="w-full md:max-w-[200px] mb-2"
                    />
                  )}
                  {/* TODO: Select Filter Not Working. Fix it. */}
                  {filter.type === "select" && filter.options && (
                    <Select
                      value={(column.getFilterValue() as string) ?? ""}
                      onValueChange={(value) =>
                        column.setFilterValue(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger className="w-full md:w-[180px] mb-2">
                        <SelectValue placeholder={filter.placeholder ?? `Filter by ${filter.label.toLowerCase()}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Show/hide filters on mobile */}
        {filters && Object.entries(filters).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <FilterIcon className="mr-2 size-4" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
        )}

        {/* Column visibility dropdown */}
        {table.getAllColumns().some(column => column.getCanHide()) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <ColumnsIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(
                (column) => column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {formatPatternToText(column.id)}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    <div className="flex items-center justify-end space-x-2 py-4">
        <DataTablePagination table={table} />
      </div>
    </>
  )
}
