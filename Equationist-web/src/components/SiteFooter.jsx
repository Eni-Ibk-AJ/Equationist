export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} equationist<span className="brand-dot">.</span> · Made for curious minds.</span>
      <span>One little aha at a time <span className="footer-heart">♥</span></span>
    </footer>
  );
}
