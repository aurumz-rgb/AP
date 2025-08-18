import { useEffect } from "preact/hooks";

export default function ProgressBar() {
  useEffect(() => {
    const bar = document.createElement("div");
    bar.id = "progress-bar";
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: #0a66c2;
      z-index: 9999;
      transition: width 0.2s ease-out, opacity 0.3s ease-out;
    `;
    document.body.appendChild(bar);

    // Animate from 0% → 100% over 1s
    let width = 0;
    const duration = 1000; // total animation duration
    const step = 20; // ms per frame
    const increment = 100 / (duration / step);

    const interval = setInterval(() => {
      width += increment;
      if (width >= 100) {
        width = 100;
        clearInterval(interval);
        bar.style.width = "100%";
        bar.style.opacity = "0";
        setTimeout(() => bar.remove(), 300); // fade out
      } else {
        bar.style.width = width + "%";
      }
    }, step);

    return () => {
      clearInterval(interval);
      bar.remove();
    };
  }, []);

  return null;
}
