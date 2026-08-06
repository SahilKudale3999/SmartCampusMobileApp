import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <section className="page"><div className="panel restricted-card"><p className="eyebrow">Restricted</p><h2>Access Restricted</h2><p className="page-subtitle">You don't have permission to view this page.</p><Link className="button restricted-button" to="/">Back to Dashboard</Link></div></section>
  );
}
