export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div
        className="size-8 animate-spin rounded-full border-2 border-border border-t-accent"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
