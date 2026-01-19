"use client";

export default function ExploreLayout({ children }) {
  return (
    <>
      {children}
      {/* Footer is intentionally excluded from the explore page */}
      <style jsx global>{`
        footer {
          display: none !important;
        }
      `}</style>
    </>
  );
}
