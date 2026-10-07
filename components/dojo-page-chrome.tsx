"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useCloud } from "./cloud-provider";

type Page = "home" | "dojo" | "about" | "philosophy" | "belts" | "my-dojo" | "account" | "owner";

export function DojoPageHeader({ brand, currentPage }: { brand: ReactNode; currentPage: Page }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 681px)");
    const close = () => setMenuOpen(false);
    desktop.addEventListener("change", close);
    window.addEventListener("hashchange", close);
    return () => {
      desktop.removeEventListener("change", close);
      window.removeEventListener("hashchange", close);
    };
  }, []);
  return <header className="dojo-page-header pixel-frame" data-menu-open={menuOpen} onKeyDown={event => {
    if (event.key === "Escape" && menuOpen) {
      setMenuOpen(false);
      menuButton.current?.focus({ preventScroll: true });
    }
  }}>
    {brand}
    <button ref={menuButton} type="button" className="dojo-menu-button" aria-expanded={menuOpen} aria-controls={menuId} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} onClick={() => setMenuOpen(open => !open)}>{menuOpen ? "CLOSE" : "MENU"} <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span></button>
    <nav id={menuId} className="dojo-primary-nav" aria-label="Main navigation" onClick={() => {
      setMenuOpen(false);
      if (menuOpen) menuButton.current?.focus({ preventScroll: true });
    }}>
      <a href="#" aria-current={currentPage === "home" ? "page" : undefined}>HOME</a>
      <a href="#about" aria-current={currentPage === "about" ? "page" : undefined}>ABOUT</a>
      <a href="#belts" aria-current={currentPage === "belts" ? "page" : undefined}>BELTS</a>
      <a href="#philosophy" aria-current={currentPage === "philosophy" ? "page" : undefined}>PHILOSOPHY</a>
      <a href="#my-dojo" aria-current={["my-dojo","account","owner"].includes(currentPage) ? "page" : undefined}>MY DOJO</a>
    </nav>
    <a className="pixel-button" href="#dojo" onClick={() => setMenuOpen(false)} aria-current={currentPage === "dojo" ? "page" : undefined}>ENTER THE DOJO <span aria-hidden="true">➜</span></a>
  </header>;
}

export function DojoPageFooter() {
  const cloud=useCloud();
  return <footer className="dojo-page-footer">
    <a href="#">BUSHIDO OPS / HOME</a>
    <span>ORDER. RESPECT. HONOR. / v0.5</span>
    <nav aria-label="Footer navigation"><a href="#about">ABOUT</a><a href="#belts">BELTS</a><a href="#philosophy">PHILOSOPHY</a><a href="#my-dojo">MY DOJO</a><a href="#account">{cloud.session?"ACCOUNT":"SIGN IN / JOIN"}</a>{cloud.owner&&<a href="#owner">OWNER</a>}{cloud.config?.supportEmail&&<a href={`mailto:${cloud.config.supportEmail}`}>SUPPORT</a>}<a href="#dojo">ENTER THE DOJO ➜</a></nav>
  </footer>;
}
