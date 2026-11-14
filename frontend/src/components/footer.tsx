function Footer({ onHome, onGuide }) {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <a
          className="footer__brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onHome();
          }}
        >
          гипотеза<span className="dot">.</span>
        </a>
        <span>От хорошего вопроса — к проверяемому результату.</span>
        <a
          className="text-link"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onGuide();
          }}
        >
          Как опубликовать исследование
        </a>
        <small>Frontend demo · React + Vite</small>
      </div>
    </footer>
  );
}

export default Footer;