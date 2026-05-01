/* ─── Skeleton satır ──────────────────────────────────────────────────────── */
function SkeletonRow({ colCount }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 rounded-full bg-gray-100 animate-pulse"
            style={{ width: i === 0 ? "60%" : "40%" }} />
        </td>
      ))}
    </tr>
  );
}

/* ─── Boş durum ───────────────────────────────────────────────────────────── */
function EmptyState({ colCount, text }) {
  return (
    <tr>
      <td colSpan={colCount} className="px-5 py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            className="w-10 h-10" style={{ color: "#B8D0EE" }}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <p className="text-sm font-medium text-gray-400 font-gilroy">{text}</p>
        </div>
      </td>
    </tr>
  );
}

/* ─── Checkbox ────────────────────────────────────────────────────────────── */
function Checkbox({ checked, indeterminate, onChange, label }) {
  return (
    <label className="flex items-center justify-center cursor-pointer" aria-label={label}>
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => { if (el) el.indeterminate = !!indeterminate; }}
        onChange={onChange}
        className="w-4 h-4 rounded accent-[#1B3F84] cursor-pointer"
      />
    </label>
  );
}

/* ─── DataGrid ────────────────────────────────────────────────────────────── */
export default function DataGrid({
  columns    = [],
  data       = [],
  isLoading  = false,
  emptyText  = "Henüz kayıt bulunmuyor.",
  rowKey     = null,
  selectable = false,
  selected   = [],
  onSelectRow,
  onSelectAll,
}) {
  const getKey = (row, idx) => {
    if (typeof rowKey === "function") return rowKey(row);
    if (rowKey)                       return row[rowKey];
    return row._id ?? row.id ?? idx;
  };

  const SKELETON_COUNT = 5;
  const allSelected    = data.length > 0 && selected.length === data.length;
  const someSelected   = selected.length > 0 && !allSelected;

  const effectiveCols = selectable
    ? [{ key: "__checkbox", header: "", width: "40px", align: "center" }, ...columns]
    : columns;

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[#DDE9F8] bg-white shadow-sm font-gilroy">
      <table className="w-full border-collapse text-sm">

        {/* ── Başlık ──────────────────────────────────────────────────────── */}
        <thead>
          <tr style={{ background: "#1B3F84" }}>
            {effectiveCols.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{ width: col.width ?? "auto" }}
                className={[
                  "px-5 py-3.5 text-xs font-semibold tracking-wide uppercase",
                  "text-white whitespace-nowrap select-none",
                  col.align === "right"  ? "text-right"  :
                  col.align === "center" ? "text-center" : "text-left",
                ].join(" ")}
              >
                {col.key === "__checkbox" ? (
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={() => onSelectAll?.(allSelected ? [] : data.map((r) => getKey(r)))}
                    label="Tümünü seç"
                  />
                ) : col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Gövde ───────────────────────────────────────────────────────── */}
        <tbody className="divide-y divide-[#EFF5FC]">
          {isLoading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonRow key={i} colCount={effectiveCols.length} />
            ))
          ) : data.length === 0 ? (
            <EmptyState colCount={effectiveCols.length} text={emptyText} />
          ) : (
            data.map((row, idx) => {
              const key        = getKey(row, idx);
              const isSelected = selected.includes(key);
              return (
                <tr
                  key={key}
                  className="group transition-colors duration-150"
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#F4F9FF"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = ""; }}
                  style={isSelected ? { background: "#EEF5FF" } : {}}
                >
                  {effectiveCols.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        "px-5 py-3.5 text-gray-700",
                        col.align === "right"  ? "text-right"  :
                        col.align === "center" ? "text-center" : "text-left",
                        col.noWrap ? "whitespace-nowrap" : "",
                      ].join(" ")}
                    >
                      {col.key === "__checkbox" ? (
                        <Checkbox
                          checked={isSelected}
                          onChange={() => onSelectRow?.(key, !isSelected)}
                          label={`Satır seç`}
                        />
                      ) : col.render
                        ? col.render(row, idx)
                        : row[col.key] ?? <span className="text-gray-300">—</span>}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
