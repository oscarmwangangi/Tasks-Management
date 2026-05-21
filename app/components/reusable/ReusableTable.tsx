
 export interface Column<T>{
    header: string,
    render: (item: T) => React.ReactNode
}

interface PaginationData {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

interface ReusableTableProps<T>{
    title:String,
    data: T[] | undefined,
    columns:Column<T>[],
    pagination?: PaginationData;
    onPageChange?: (updateFn: (prev: number) => number) => void;

}
export function ReusableTable<T>({
  title,
  data = [],
  columns,
  pagination,
  onPageChange,
}: ReusableTableProps<T>) {
  
  return (
    <div className="mt-8 group rounded-3xl border border-white/5 bg-white/3 p-5 transition-all hover:border-emerald-500/20 hover:bg-white/5 hover:shadow-xl hover:shadow-black/20 overflow-hidden">
      
      {/* Header Section */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {pagination && (
          <span className="text-slate-400 text-sm">
            {pagination.totalItems} items
          </span>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-225">
          <thead className="bg-white/5">
            <tr className="text-left text-slate-400 text-sm">
              {columns.map((col, index) => (
                <th key={index} className="p-5">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-t border-white/5 hover:bg-white/5 transition-all"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="p-5">
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-10 text-center text-slate-500 italic">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section (Only renders if pagination props are provided) */}
      {pagination && onPageChange && (
        <div className="p-5 border-t border-white/10 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => onPageChange((prev) => Math.max(prev - 1, 1))}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40"
            >
              Previous
            </button>

            <button
              onClick={() => onPageChange((prev) => prev + 1)}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}