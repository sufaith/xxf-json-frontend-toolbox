"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { tools } from "@/lib/tools";

type DockPoint = { x: number; y: number };
type DragState = { pointerId: number; pointerX: number; pointerY: number; startX: number; startY: number };

export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const switcherRef = useRef<HTMLDetailsElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const positionRef = useRef<DockPoint | null>(null);
  const [position, setPosition] = useState<DockPoint | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState("site-header--menu-left site-header--menu-bottom");

  const placeMenu = useCallback((point: DockPoint, width: number, height: number) => {
    const horizontal = point.x + width / 2 < window.innerWidth / 2 ? "site-header--menu-right" : "site-header--menu-left";
    const centerY = point.y + height / 2;
    const vertical = centerY < window.innerHeight * .38
      ? "site-header--menu-top"
      : centerY > window.innerHeight * .62
        ? "site-header--menu-bottom"
        : "site-header--menu-center";
    setMenuPlacement(`${horizontal} ${vertical}`);
  }, []);

  const clampPoint = useCallback((x: number, y: number) => {
    const rect = headerRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 38;
    const height = rect?.height ?? 132;
    const point = {
      x: Math.min(Math.max(8, x), Math.max(8, window.innerWidth - width - 8)),
      y: Math.min(Math.max(28, y), Math.max(28, window.innerHeight - height - 8)),
    };
    placeMenu(point, width, height);
    return point;
  }, [placeMenu]);

  const updatePosition = useCallback((point: DockPoint) => {
    positionRef.current = point;
    setPosition(point);
  }, []);

  useEffect(() => {
    const resize = () => {
      if (!positionRef.current) return;
      updatePosition(clampPoint(positionRef.current.x, positionRef.current.y));
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [clampPoint, updatePosition]);

  useEffect(() => {
    const closeOnOutsideClick = (event: globalThis.PointerEvent) => {
      const switcher = switcherRef.current;
      if (!switcher?.open || !(event.target instanceof Node) || switcher.contains(event.target)) return;
      switcher.open = false;
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      const switcher = switcherRef.current;
      if (event.key !== "Escape" || !switcher?.open) return;
      switcher.open = false;
      switcher.querySelector<HTMLElement>("summary")?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    const rect = headerRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, pointerX: event.clientX, pointerY: event.clientY, startX: rect.left, startY: rect.top };
    updatePosition({ x: rect.left, y: rect.top });
    setIsDragging(true);
  }

  function moveDock(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    updatePosition(clampPoint(drag.startX + event.clientX - drag.pointerX, drag.startY + event.clientY - drag.pointerY));
  }

  function finishDrag(event: PointerEvent<HTMLButtonElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function moveDockWithKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    const directions: Record<string, DockPoint> = {
      ArrowLeft: { x: -10, y: 0 }, ArrowRight: { x: 10, y: 0 }, ArrowUp: { x: 0, y: -10 }, ArrowDown: { x: 0, y: 10 },
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const rect = headerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = clampPoint(rect.left + direction.x, rect.top + direction.y);
    updatePosition(next);
  }

  function resetDock() {
    positionRef.current = null;
    setPosition(null);
    setMenuPlacement("site-header--menu-left site-header--menu-bottom");
  }

  const dockStyle = position
    ? { left: `${position.x}px`, top: `${position.y}px`, right: "auto", bottom: "auto" } as CSSProperties
    : undefined;

  if (pathname === "/" || pathname.startsWith("/n/") || pathname.startsWith("/animal")) return null;

  return (
    <header ref={headerRef} className={`site-header ${menuPlacement} ${isDragging ? "site-header--dragging" : ""}`} style={dockStyle}>
      <button
        className="site-header__drag-handle"
        type="button"
        aria-label="移动悬浮导航"
        title="拖动移动，双击复位"
        onPointerDown={startDrag}
        onPointerMove={moveDock}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onKeyDown={moveDockWithKeyboard}
        onDoubleClick={resetDock}
      ><span aria-hidden="true">⠿</span></button>
      <div className="site-header__inner">
        <nav aria-label="Primary navigation">
          <Link href="/" aria-label="XXF Tools home"><span aria-hidden="true">⌂</span><small>Home</small></Link>
          <details ref={switcherRef} className="dock-tool-switcher">
            <summary aria-label="Switch tool"><span aria-hidden="true">{`{}`}</span><small>Switch tool</small></summary>
            <div className="dock-tool-menu">
              <div className="dock-tool-menu__head"><b>Switch tool</b><span>{tools.length} local tools</span></div>
              <div className="dock-tool-menu__list">
                {tools.map((tool) => <Link href={`/tools/${tool.slug}/`} key={tool.slug} onClick={() => { if (switcherRef.current) switcherRef.current.open = false; }}><span>{tool.name}</span><em>{tool.category}</em></Link>)}
              </div>
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__minimal">
        <span>© 2026 XXF Tools</span>
        <nav aria-label="Footer navigation">
          <Link href="/site-map/">Sitemap</Link>
          <Link href="/about/">About</Link>
          <Link href="/contact/">Contact</Link>
          <Link href="/terms/">Terms</Link>
          <Link href="/privacy/">Privacy Policy</Link>
        </nav>
      </div>
    </footer>
  );
}
