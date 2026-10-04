import type { ReactNode } from "react";

type Page = "home" | "dojo" | "about" | "philosophy" | "belts";

export function DojoPageHeader({ brand, currentPage }: { brand: ReactNode; currentPage: Page }) {
  return <header className="dojo-page-header pixel-frame">
    {brand}
    <nav aria-label="Main navigation">
      <a href="#" aria-current={currentPage === "home" ? "page" : undefined}>HOME</a>
      <a href="#about" aria-current={currentPage === "about" ? "page" : undefined}>ABOUT</a>
      <a href="#belts" aria-current={currentPage === "belts" ? "page" : undefined}>BELTS</a>
      <a href="#philosophy" aria-current={currentPage === "philosophy" ? "page" : undefined}>PHILOSOPHY</a>
    </nav>
    <a className="pixel-button" href="#dojo" aria-current={currentPage === "dojo" ? "page" : undefined}>ENTER THE DOJO <span aria-hidden="true">➜</span></a>
  </header>;
}

export function DojoPageFooter() {
  return <footer className="dojo-page-footer">
    <a href="#">BUSHIDO OPS / HOME</a>
    <span>ORDER. RESPECT. HONOR.</span>
    <nav aria-label="Footer navigation"><a href="#about">ABOUT</a><a href="#belts">BELTS</a><a href="#philosophy">PHILOSOPHY</a><a href="#dojo">ENTER THE DOJO ➜</a></nav>
  </footer>;
}
