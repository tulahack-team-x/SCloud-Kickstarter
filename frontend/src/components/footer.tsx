import { Link } from "react-router-dom";

function Footer({ onGuide }: { onGuide: () => void }) {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <Link className="footer__brand" to="/">
          SCloud - KickStarter
        </Link>
        <button type="button" className="text-link" onClick={onGuide}>
          Как опубликовать исследование
        </button>
      </div>
    </footer>
  );
}

export default Footer;
