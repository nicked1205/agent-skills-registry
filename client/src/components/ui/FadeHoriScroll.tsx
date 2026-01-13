import { useEffect, useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function FadeHoriScroll({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // computes whether scrolling is possible left and right, tolerates fraction pixel confusion
    const update = () => {
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
    };

    update();

    el.addEventListener("scroll", update, { passive: true }); // update the state of scrolling whenever the user scroll the refed element

    // resize observer in case user resize window -> resize element
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [children]);

  return (
    <div className="relative">
      <div
        ref={ref}
        className={`overflow-x-auto overflow-y-hidden no-scrollbar ${className}`}
      >
        {children}
      </div>

      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-linear-to-r from-zinc-950 to-transparent" />
      )}

      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-linear-to-l from-zinc-950 to-transparent" />
      )}
    </div>
  );
}
