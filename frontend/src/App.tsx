import { useState } from "react";



interface Page {
  id:string;
  Name:"Исследования"|"Организации"|"кабинет";
  
}

import "./App.css";

function App() {

  return (
    <>



<div className="header-wrap" >
      <header className="header">
        
        <button type="button" className="brand" aria-label="Гипотеза — на главную">
          <span className="brand__name">SCloud - kickStarter</span>
          <span className="brand__tagline">
            наука с вашим<br />участием
          </span>
        </button>

        <nav className="nav" aria-label="Основная навигация">
          <a className="nav__link" href="#">Исследования</a>
          <a className="nav__link" href="#">Организации</a>
          <a className="nav__link" href="#">Кабинет</a>
        </nav>

        <div className="actions">
          <a className="actions__login" href="#">Войти</a>
          <button type="button" className="register">
            Регистрация <span className="register__arrow">→</span>
          </button>
        </div>
      </header>
    </div>

</>
  );
}

export default App;
