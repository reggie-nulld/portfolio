"use client";

import { useState } from "react";
import type { FormState } from "@/lib/admin/validation";
import { FieldError, FormFooter, useAdminForm } from "./forms";

type Column = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "number" | "url";
  /** CSS grid track for this column, e.g. "90px" or "2fr". */
  width?: string;
};

type Row = { key: number; values: Record<string, string> };

let nextKey = 0;
const toRow = (values: Record<string, string>): Row => ({ key: nextKey++, values });

/**
 * An editable list (stats, skill groups, links). Every row repeats the same input
 * names, so the server reads each column with formData.getAll(name), in order.
 */
export default function RowsForm({
  action,
  columns,
  initialRows,
  max,
  addLabel,
  emptyText,
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  columns: Column[];
  initialRows: Record<string, string>[];
  max: number;
  addLabel: string;
  emptyText: string;
}) {
  const { state, errors, pending, dirty, markDirty, onInput, onSubmit } = useAdminForm(action);
  const [rows, setRows] = useState(() => initialRows.map(toRow));

  const update = (next: Row[]) => {
    setRows(next);
    markDirty();
  };
  const move = (i: number, by: number) => {
    const next = [...rows];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    update(next);
  };
  const template = `${columns.map((c) => c.width ?? "1fr").join(" ")} auto`;

  return (
    <form className="admin-form" onSubmit={onSubmit} onInput={onInput} noValidate>
      {rows.length === 0 && <p className="rows-empty">{emptyText}</p>}
      <ol className="rows">
        {rows.map((row, i) => (
          <li key={row.key} className="row" style={{ gridTemplateColumns: template }}>
            {columns.map((c) => (
              <label key={c.name} className="field" data-field={`${i}.${c.name}`}>
                <span className={i === 0 ? "" : "row-label"}>{c.label}</span>
                <input
                  name={c.name}
                  type={c.type === "number" ? "text" : c.type ?? "text"}
                  inputMode={c.type === "number" ? "numeric" : undefined}
                  defaultValue={row.values[c.name] ?? ""}
                  placeholder={c.placeholder}
                />
                <FieldError errors={errors} name={`${i}.${c.name}`} />
              </label>
            ))}
            <div className="row-actions">
              <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                ↑
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => move(i, 1)}
                disabled={i === rows.length - 1}
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="icon-btn danger"
                onClick={() => update(rows.filter((r) => r.key !== row.key))}
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ol>
      {rows.length < max && (
        <button
          type="button"
          className="btn btn-ghost btn-sm add-row"
          onClick={() => update([...rows, toRow({})])}
        >
          + {addLabel}
        </button>
      )}
      <FormFooter state={state} pending={pending} dirty={dirty} />
    </form>
  );
}
