import { useEffect } from "react";
import Lenis from "lenis";

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2, // Duracion de la animacion
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing function
      smoothWheel: true, // Suaviza el scroll del mouse wheel
      smoothTouch: false, // Mejor rendimiento en mobile
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    //Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);
}
