// Purely renders whatever rows are passed in as a plain table.
// No styling decisions here yet -- UI polish comes later.
export default function DataTable({ rows }) {
  if (!rows || rows.length === 0) return <div className="empty-state">No data found.</div>;

  const columns = Object.keys(rows[0]);

  return (
    <div className="table-wrap"><table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={row.id ?? row[columns[0]] ?? idx}>
            {columns.map((col) => (
              <td key={col}>
                {typeof row[col] === "object" && row[col] !== null
                  ? JSON.stringify(row[col])
                  : String(row[col] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table></div>
  );
}
