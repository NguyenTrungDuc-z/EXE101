import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page-stack">
      <h1>Page not found</h1>
      <p>This route is outside the rebuilt admin and user flows.</p>
      <Link className="button primary" to="/">
        Back to home
      </Link>
    </div>
  );
}
