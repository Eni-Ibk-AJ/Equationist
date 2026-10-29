export default function SectionLabel({ children, className = "" }) {
  return (
    <span className={`section-kicker ${className}`}>
      <span className="kicker-line" />
      {children}
    </span>
  );
}
