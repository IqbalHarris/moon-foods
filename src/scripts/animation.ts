import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function mountAnimation() {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.querySelector<HTMLElement>(".animated-scene");
  const journey = document.querySelector<HTMLElement>(".journey");
  if (!root || !journey) return;
  const q = gsap.utils.selector(root);
  const mm = gsap.matchMedia();
  mm.add(
    "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    () => {
      // One continuous, deterministic timeline. Native sticky pins the composition.
      // Every stage is derived from the same scroll progress and reverses exactly.
      gsap.set(
        q(
          ".pastry-back, .pastry-left, .pastry-right, .crisp, .steam, .chutney, .chilli, .filling",
        ),
        { opacity: 0 },
      );
      gsap.set(q(".moon-frame"), {
        opacity: 0.9,
        rotate: -18,
        transformOrigin: "350px 350px",
      });
      gsap.set(q(".ingredient"), { transformOrigin: "50% 50%" });
      gsap.set(q(".scene-progress span"), {
        scaleX: 0,
        transformOrigin: "0 50%",
      });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: journey,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo(
        q(".ingredient"),
        {
          x: (i: number) => [-40, 50, 10, 45, -30][i],
          y: (i: number) => [-60, -50, -30, 25, 40][i],
          rotation: -12,
        },
        { x: 0, y: 0, rotation: 0, duration: 1.2 },
        0,
      )
        .to(q(".filling"), { opacity: 1, duration: 0.8 }, 0.7)
        .to(
          q(".ingredient"),
          {
            x: (i: number) => [85, -100, -65, -155, 145][i],
            y: (i: number) => [160, 115, 220, 50, 0][i],
            scale: 0.65,
            opacity: 0,
            duration: 1,
          },
          1.2,
        )
        .fromTo(
          q(".pastry-back"),
          { x: 25, y: -125, rotate: 12 },
          { opacity: 1, x: 0, y: 0, rotate: 0, duration: 0.9 },
          2,
        )
        .fromTo(
          q(".pastry-left"),
          { x: -150, y: 15, rotate: -28, transformOrigin: "375px 536px" },
          { opacity: 1, x: 0, y: 0, rotate: 0, duration: 1 },
          2.7,
        )
        .fromTo(
          q(".pastry-right"),
          { x: 145, y: 25, rotate: 30, transformOrigin: "375px 536px" },
          { opacity: 1, x: 0, y: 0, rotate: 0, duration: 1 },
          3.2,
        )
        .to(q(".crisp"), { opacity: 1, duration: 1 }, 4.1)
        .to(
          q(".pastry-left > path:first-child"),
          { fill: "#ffc358", duration: 1 },
          4.1,
        )
        .fromTo(q(".steam"), { y: 35 }, { opacity: 0.8, y: 0, duration: 1 }, 5)
        .fromTo(
          q(".chutney"),
          { x: 70, y: 45, rotation: 8, transformOrigin: "50% 50%" },
          { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.9 },
          5.7,
        )
        .fromTo(
          q(".chilli"),
          { x: 60, y: -50, rotation: 15 },
          { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1 },
          6,
        )
        .to(q(".moon-frame"), { opacity: 1, rotate: 0, duration: 1.2 }, 6.4)
        .to(
          q(".orbit-spice"),
          { rotate: 8, transformOrigin: "350px 350px", duration: 7.6 },
          0,
        )
        .to(q(".scene-progress span"), { scaleX: 1, duration: 7.6 }, 0);
      root.dataset.motion = "scrubbed";
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => {
        delete root.dataset.motion;
      };
    },
  );
  window.addEventListener("pagehide", () => mm.revert(), { once: true });
}
