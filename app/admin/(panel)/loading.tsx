/** Shown instantly while an admin page loads, so navigation never feels stuck. */
export default function AdminLoading() {
  return (
    <div className="admin-loading" aria-busy="true" aria-label="Loading">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="tiles">
        <div className="skeleton skeleton-tile" />
        <div className="skeleton skeleton-tile" />
        <div className="skeleton skeleton-tile" />
      </div>
    </div>
  );
}
