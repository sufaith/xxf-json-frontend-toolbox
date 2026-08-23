"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { tools } from "@/lib/tools";

type DockPoint = { x: number; y: number };
type DragState = { pointerId: number; pointerX: number; pointerY: number; startX: number; startY: number };

const dockPositionKey = "xxf-dock-position";

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
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
    let frame = 0;
    try {
      const saved = window.localStorage.getItem(dockPositionKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as DockPoint;
      if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
        frame = window.requestAnimationFrame(() => updatePosition(clampPoint(parsed.x, parsed.y)));
      }
    } catch {
      window.localStorage.removeItem(dockPositionKey);
    }
    return () => window.cancelAnimationFrame(frame);
  }, [clampPoint, updatePosition]);

  useEffect(() => {
    const resize = () => {
      if (!positionRef.current) return;
      updatePosition(clampPoint(positionRef.current.x, positionRef.current.y));
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [clampPoint, updatePosition]);

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
    if (positionRef.current) window.localStorage.setItem(dockPositionKey, JSON.stringify(positionRef.current));
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
    window.localStorage.setItem(dockPositionKey, JSON.stringify(next));
  }

  function resetDock() {
    positionRef.current = null;
    setPosition(null);
    setMenuPlacement("site-header--menu-left site-header--menu-bottom");
    window.localStorage.removeItem(dockPositionKey);
  }

  const dockStyle = position
    ? { left: `${position.x}px`, top: `${position.y}px`, right: "auto", bottom: "auto" } as CSSProperties
    : undefined;

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
          <details className="dock-tool-switcher">
            <summary aria-label="Switch tool"><span aria-hidden="true">{`{}`}</span><small>Switch tool</small></summary>
            <div className="dock-tool-menu">
              <div className="dock-tool-menu__head"><b>Switch tool</b><span>{tools.length} local tools</span></div>
              <div className="dock-tool-menu__list">
                {tools.map((tool) => <Link href={`/tools/${tool.slug}/`} key={tool.slug}><span>{tool.name}</span><em>{tool.category}</em></Link>)}
              </div>
            </div>
          </details>
          <Link href="/#guides"><span aria-hidden="true">≡</span><small>Guides</small></Link>
          <Link href="/about/"><span aria-hidden="true">i</span><small>About</small></Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div>
          <Link className="brand brand--footer" href="/">
            <span className="brand__mark">X<span>X</span>F</span>
            <span className="brand__copy"><b>XXF Tools</b><small>JSON + FRONTEND</small></span>
          </Link>
          <p>Fast developer converters that keep your data on your device.</p>
        </div>
        <div>
          <strong>Popular tools</strong>
          <Link href="/tools/json-formatter/">JSON Formatter</Link>
          <Link href="/tools/json-to-typescript/">JSON to TypeScript</Link>
          <Link href="/tools/json-to-yaml/">JSON to YAML</Link>
          <Link href="/tools/jwt-decoder/">JWT Decoder</Link>
          <Link href="/tools/photo-collage-maker/">Photo Collage Maker</Link>
        </div>
        <div>
          <strong>XXF</strong>
          <Link href="/about/">About</Link>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/terms/">Terms</Link>
          <Link href="/sitemap.xml">Sitemap</Link>
        </div>
      </div>
      <div className="shell site-footer__bottom"><span>© 2026 XXF Tools</span><span>Built for the browser · No sign-up · No uploads</span></div>
    </footer>
  );
}
