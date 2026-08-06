export default function StatusMessage({ status, error }) {
  if (status === "loading") return <div className="status status-loading">Loading...</div>;

  if (status === "failed" && error) {
    const message = typeof error === "string" ? error : error.message;
    const fieldErrors = typeof error === "object" ? error.fieldErrors : null;

    return (
      <div className="status status-error" role="alert">
        <p>Error: {message}</p>
        {fieldErrors && (
          <ul>
            {Object.entries(fieldErrors).map(([field, msg]) => (
              <li key={field}>
                <strong>{field}</strong>: {msg}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return null;
}
