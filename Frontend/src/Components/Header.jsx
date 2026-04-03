import React from "react";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand">
          <div className="header__logo">
            <span className="header__logo-bracket">[</span>
            <span className="header__logo-text">ASM</span>
            <span className="header__logo-bracket">]</span>
          </div>
          <div className="header__title-group">
            <h1 className="header__title">ASSEMBLER</h1>
            <p className="header__subtitle">Computer Organization &amp; Architecture · Encoder v1.0</p>
          </div>
        </div>
        <div className="header__status">
          <span className="header__status-dot" />
          <span className="header__status-text">SERVER: localhost:5000</span>
        </div>
      </div>
      <div className="header__bar" />
    </header>
  );
}

export default Header;
