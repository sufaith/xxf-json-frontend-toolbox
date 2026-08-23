"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type DragEvent,
  type PointerEvent,
} from "react";

type Rect = { x: number; y: number; w: number; h: number };
type Photo = { id: string; name: string; url: string; width: number; height: number };
type PhotoTransform = { scale: number; x: number; y: number };
type Margins = { top: number; right: number; bottom: number; left: number };
type AnnotationType = "text" | "arrow" | "rectangle" | "circle";
type Annotation = {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  lineWidth: number;
  fontSize: number;
  text: string;
};
type CustomCell = { id: string; row: number; column: number; rowSpan: number; columnSpan: number };
type RatioPreset = { label: string; value: string; width: number; height: number; note?: string };

const ratios: RatioPreset[] = [
  { label: "1:1", value: "1:1", width: 1, height: 1 },
  { label: "16:9", value: "16:9", width: 16, height: 9 },
  { label: "9:16", value: "9:16", width: 9, height: 16 },
  { label: "16:10", value: "16:10", width: 16, height: 10 },
  { label: "4:3", value: "4:3", width: 4, height: 3 },
  { label: "3:4", value: "3:4", width: 3, height: 4 },
  { label: "2:3", value: "2:3", width: 2, height: 3, note: "6 in" },
  { label: "3:2", value: "3:2", width: 3, height: 2, note: "6 in wide" },
  { label: "5:7", value: "5:7", width: 5, height: 7, note: "7 in" },
  { label: "7:5", value: "7:5", width: 7, height: 5, note: "7 in wide" },
  { label: "4:5", value: "4:5", width: 4, height: 5, note: "8 in" },
  { label: "5:4", value: "5:4", width: 5, height: 4, note: "8 in wide" },
  { label: "A4", value: "210:297", width: 210, height: 297, note: "portrait" },
  { label: "A4 wide", value: "297:210", width: 297, height: 210, note: "landscape" },
];

const initialMargins: Margins = { top: 18, right: 18, bottom: 18, left: 18 };

function balancedRows(count: number, rows: number): Rect[] {
  const safeRows = Math.max(1, Math.min(rows, count));
  const base = Math.floor(count / safeRows);
  let remainder = count % safeRows;
  let cursor = 0;
  const result: Rect[] = [];
  for (let row = 0; row < safeRows; row += 1) {
    const rowCount = base + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;
    for (let column = 0; column < rowCount; column += 1) {
      result.push({ x: column / rowCount, y: row / safeRows, w: 1 / rowCount, h: 1 / safeRows });
      cursor += 1;
      if (cursor >= count) return result;
    }
  }
  return result;
}

function balancedColumns(count: number, columns: number): Rect[] {
  return balancedRows(count, columns).map((rect) => ({ x: rect.y, y: rect.x, w: rect.h, h: rect.w }));
}

function featureLayout(count: number, side: "left" | "top"): Rect[] {
  if (count === 1) return [{ x: 0, y: 0, w: 1, h: 1 }];
  const rest = balancedRows(count - 1, Math.ceil(Math.sqrt(count - 1)));
  if (side === "left") {
    return [
      { x: 0, y: 0, w: 0.56, h: 1 },
      ...rest.map((rect) => ({ x: 0.56 + rect.x * 0.44, y: rect.y, w: rect.w * 0.44, h: rect.h })),
    ];
  }
  return [
    { x: 0, y: 0, w: 1, h: 0.56 },
    ...rest.map((rect) => ({ x: rect.x, y: 0.56 + rect.y * 0.44, w: rect.w, h: rect.h * 0.44 })),
  ];
}

function layoutPresets(count: number) {
  if (count === 1) return [{ id: "full", label: "Full", cells: balancedRows(1, 1) }];
  const squareRows = Math.max(1, Math.round(Math.sqrt(count)));
  const variants = [
    { id: "grid", label: "Grid", cells: balancedRows(count, squareRows) },
    { id: "rows", label: "Rows", cells: balancedRows(count, Math.min(3, count)) },
    { id: "columns", label: "Columns", cells: balancedColumns(count, Math.min(3, count)) },
    { id: "focus-left", label: "Focus left", cells: featureLayout(count, "left") },
    { id: "focus-top", label: "Focus top", cells: featureLayout(count, "top") },
  ];
  const seen = new Set<string>();
  return variants.filter((variant) => {
    const key = JSON.stringify(variant.cells);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.roundRect(x, y, width, height, safeRadius);
}

function cellPixels(rect: Rect, width: number, height: number, margins: Margins, gap: number) {
  const innerWidth = Math.max(1, width - margins.left - margins.right);
  const innerHeight = Math.max(1, height - margins.top - margins.bottom);
  const inset = gap / 2;
  return {
    x: margins.left + rect.x * innerWidth + inset,
    y: margins.top + rect.y * innerHeight + inset,
    w: Math.max(1, rect.w * innerWidth - gap),
    h: Math.max(1, rect.h * innerHeight - gap),
  };
}

function customSeed(rows: number, columns: number, count: number): CustomCell[] {
  return Array.from({ length: Math.min(count, rows * columns) }, (_, index) => ({
    id: crypto.randomUUID(),
    row: Math.floor(index / columns),
    column: index % columns,
    rowSpan: 1,
    columnSpan: 1,
  }));
}

function customRects(cells: CustomCell[], rows: number, columns: number): Rect[] {
  return cells.map((cell) => ({
    x: cell.column / columns,
    y: cell.row / rows,
    w: cell.columnSpan / columns,
    h: cell.rowSpan / rows,
  }));
}

function occupied(cell: CustomCell, row: number, column: number, ignoreId?: string) {
  return cell.id !== ignoreId
    && row >= cell.row
    && row < cell.row + cell.rowSpan
    && column >= cell.column
    && column < cell.column + cell.columnSpan;
}

export function PhotoCollageWorkbench() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const backgroundRef = useRef<HTMLInputElement>(null);
  const importLayoutRef = useRef<HTMLInputElement>(null);
  const imageElements = useRef(new Map<string, HTMLImageElement>());
  const objectUrls = useRef(new Set<string>());
  const dragState = useRef<
    | { mode: "photo"; index: number; startClientX: number; startClientY: number; startX: number; startY: number }
    | { mode: "annotation"; id: string; startClientX: number; startClientY: number; startX: number; startY: number }
    | null
  >(null);

  const [photoCount, setPhotoCount] = useState(4);
  const [layoutId, setLayoutId] = useState("grid");
  const [layoutCells, setLayoutCells] = useState<Rect[]>(() => layoutPresets(4)[0].cells);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [transforms, setTransforms] = useState<Record<number, PhotoTransform>>({});
  const [selectedCell, setSelectedCell] = useState(0);
  const [renderTick, setRenderTick] = useState(0);
  const [ratio, setRatio] = useState<RatioPreset>(ratios[0]);
  const [customRatio, setCustomRatio] = useState({ width: 1, height: 1 });
  const [margins, setMargins] = useState<Margins>(initialMargins);
  const [gap, setGap] = useState(10);
  const [radius, setRadius] = useState(8);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundPhoto, setBackgroundPhoto] = useState<Photo | null>(null);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkText, setWatermarkText] = useState("xxf.app");
  const [watermarkSize, setWatermarkSize] = useState(20);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.25);
  const [watermarkAngle, setWatermarkAngle] = useState(-28);
  const [watermarkDensity, setWatermarkDensity] = useState<"sparse" | "medium" | "dense">("medium");
  const [watermarkPosition, setWatermarkPosition] = useState("tile");
  const [exportMode, setExportMode] = useState<"high" | "standard" | "png">("high");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [message, setMessage] = useState("Add photos to begin — processing stays on this device.");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customRows, setCustomRows] = useState(3);
  const [customColumns, setCustomColumns] = useState(3);
  const [customCells, setCustomCells] = useState<CustomCell[]>(() => customSeed(3, 3, 4));
  const [selectedCustomCellId, setSelectedCustomCellId] = useState<string | null>(null);

  const selectedAnnotation = annotations.find((annotation) => annotation.id === selectedAnnotationId) ?? null;
  const presets = useMemo(() => layoutPresets(photoCount), [photoCount]);
  const canvasSize = useMemo(() => {
    const ratioWidth = ratio.value === "custom" ? customRatio.width : ratio.width;
    const ratioHeight = ratio.value === "custom" ? customRatio.height : ratio.height;
    const landscape = ratioWidth >= ratioHeight;
    const width = landscape ? 1400 : 1000;
    const height = Math.max(320, Math.round(width * ratioHeight / ratioWidth));
    return { width, height };
  }, [customRatio, ratio]);

  const updateTransform = useCallback((index: number, update: Partial<PhotoTransform>) => {
    setTransforms((current) => {
      const existing = current[index] ?? { scale: 1, x: 0, y: 0 };
      return { ...current, [index]: { ...existing, ...update } };
    });
  }, [setTransforms]);

  const drawCollage = useCallback((canvas: HTMLCanvasElement, exporting = false) => {
    const context = canvas.getContext("2d");
    if (!context) return;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (backgroundPhoto) {
      const backgroundImage = imageElements.current.get(backgroundPhoto.id);
      if (backgroundImage?.complete) {
        const scale = Math.max(canvas.width / backgroundImage.naturalWidth, canvas.height / backgroundImage.naturalHeight);
        const drawWidth = backgroundImage.naturalWidth * scale;
        const drawHeight = backgroundImage.naturalHeight * scale;
        context.save();
        context.globalAlpha = 0.72;
        context.drawImage(backgroundImage, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
        context.restore();
      }
    }

    layoutCells.forEach((cell, index) => {
      const pixel = cellPixels(cell, canvas.width, canvas.height, margins, gap);
      context.save();
      roundedRect(context, pixel.x, pixel.y, pixel.w, pixel.h, radius);
      context.clip();
      context.fillStyle = index % 2 ? "#e7e5dd" : "#efede6";
      context.fillRect(pixel.x, pixel.y, pixel.w, pixel.h);
      const photo = photos[index];
      const image = photo ? imageElements.current.get(photo.id) : undefined;
      if (image?.complete && image.naturalWidth) {
        const transform = transforms[index] ?? { scale: 1, x: 0, y: 0 };
        const coverScale = Math.max(pixel.w / image.naturalWidth, pixel.h / image.naturalHeight) * transform.scale;
        const drawWidth = image.naturalWidth * coverScale;
        const drawHeight = image.naturalHeight * coverScale;
        const drawX = pixel.x + (pixel.w - drawWidth) / 2 + transform.x * pixel.w;
        const drawY = pixel.y + (pixel.h - drawHeight) / 2 + transform.y * pixel.h;
        context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      } else if (!exporting) {
        context.fillStyle = "#73776f";
        context.font = `700 ${Math.max(18, Math.min(pixel.w, pixel.h) * 0.12)}px ui-monospace, monospace`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("+", pixel.x + pixel.w / 2, pixel.y + pixel.h / 2 - 7);
        context.font = `600 ${Math.max(8, Math.min(pixel.w, pixel.h) * 0.045)}px ui-monospace, monospace`;
        context.fillText(`PHOTO ${index + 1}`, pixel.x + pixel.w / 2, pixel.y + pixel.h / 2 + 20);
      }
      context.restore();
      if (!exporting && selectedCell === index && !selectedAnnotationId) {
        context.save();
        roundedRect(context, pixel.x + 2, pixel.y + 2, pixel.w - 4, pixel.h - 4, Math.max(0, radius - 2));
        context.strokeStyle = "#c8ff4d";
        context.lineWidth = 5;
        context.stroke();
        context.restore();
      }
    });

    annotations.forEach((annotation) => {
      const x = annotation.x * canvas.width;
      const y = annotation.y * canvas.height;
      const width = annotation.w * canvas.width;
      const height = annotation.h * canvas.height;
      context.save();
      context.strokeStyle = annotation.color;
      context.fillStyle = annotation.color;
      context.lineWidth = annotation.lineWidth;
      context.lineCap = "round";
      if (annotation.type === "text") {
        context.font = `800 ${annotation.fontSize}px ${getComputedStyle(document.body).fontFamily}`;
        context.textBaseline = "top";
        context.fillText(annotation.text || "Text", x, y);
      } else if (annotation.type === "rectangle") {
        context.strokeRect(x, y, width, height);
      } else if (annotation.type === "circle") {
        context.beginPath();
        context.ellipse(x + width / 2, y + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2);
        context.stroke();
      } else {
        const endX = x + width;
        const endY = y + height;
        const angle = Math.atan2(endY - y, endX - x);
        const head = Math.max(12, annotation.lineWidth * 4);
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(endX, endY);
        context.stroke();
        context.beginPath();
        context.moveTo(endX, endY);
        context.lineTo(endX - head * Math.cos(angle - Math.PI / 6), endY - head * Math.sin(angle - Math.PI / 6));
        context.lineTo(endX - head * Math.cos(angle + Math.PI / 6), endY - head * Math.sin(angle + Math.PI / 6));
        context.closePath();
        context.fill();
      }
      if (!exporting && annotation.id === selectedAnnotationId) {
        context.setLineDash([8, 7]);
        context.lineWidth = 2;
        context.strokeStyle = "#c8ff4d";
        context.strokeRect(x - 7, y - 7, Math.max(width, annotation.type === "text" ? 150 : width) + 14, Math.max(height, annotation.type === "text" ? annotation.fontSize * 1.4 : height) + 14);
      }
      context.restore();
    });

    if (watermarkEnabled && watermarkText.trim()) {
      context.save();
      context.globalAlpha = watermarkOpacity;
      context.fillStyle = "#121416";
      context.font = `700 ${watermarkSize}px ui-monospace, monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      const positions: Record<string, [number, number]> = {
        topLeft: [0.13, 0.1], topRight: [0.87, 0.1], center: [0.5, 0.5], bottomLeft: [0.13, 0.9], bottomRight: [0.87, 0.9],
      };
      if (watermarkPosition !== "tile") {
        const position = positions[watermarkPosition] ?? positions.center;
        context.translate(canvas.width * position[0], canvas.height * position[1]);
        context.rotate(watermarkAngle * Math.PI / 180);
        context.fillText(watermarkText, 0, 0);
      } else {
        const step = watermarkDensity === "sparse" ? 360 : watermarkDensity === "dense" ? 160 : 240;
        for (let y = -canvas.height; y < canvas.height * 2; y += step) {
          for (let x = -canvas.width; x < canvas.width * 2; x += step) {
            context.save();
            context.translate(x, y);
            context.rotate(watermarkAngle * Math.PI / 180);
            context.fillText(watermarkText, 0, 0);
            context.restore();
          }
        }
      }
      context.restore();
    }
  }, [annotations, backgroundColor, backgroundPhoto, canvasSize, gap, layoutCells, margins, photos, radius, selectedAnnotationId, selectedCell, transforms, watermarkAngle, watermarkDensity, watermarkEnabled, watermarkOpacity, watermarkPosition, watermarkSize, watermarkText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) drawCollage(canvas);
  }, [drawCollage, renderTick]);

  useEffect(() => {
    [...photos, ...(backgroundPhoto ? [backgroundPhoto] : [])].forEach((photo) => {
      if (imageElements.current.has(photo.id)) return;
      const image = new Image();
      image.onload = () => setRenderTick((current) => current + 1);
      image.src = photo.url;
      imageElements.current.set(photo.id, image);
    });
  }, [backgroundPhoto, photos]);

  useEffect(() => () => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    const listener = (event: globalThis.KeyboardEvent) => {
      if (!photos[selectedCell] || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const movement: Record<string, [number, number]> = {
        ArrowLeft: [-0.02, 0], ArrowRight: [0.02, 0], ArrowUp: [0, -0.02], ArrowDown: [0, 0.02],
      };
      const delta = movement[event.key];
      if (!delta) return;
      event.preventDefault();
      const current = transforms[selectedCell] ?? { scale: 1, x: 0, y: 0 };
      updateTransform(selectedCell, { x: current.x + delta[0], y: current.y + delta[1] });
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [photos, selectedCell, transforms, updateTransform]);

  async function photoFromFile(file: File): Promise<Photo> {
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = reject;
      image.src = url;
    });
    return { id: crypto.randomUUID(), name: file.name, url, ...dimensions };
  }

  async function addFiles(files: FileList | File[]) {
    const accepted = Array.from(files).filter((file) => file.type.startsWith("image/")).slice(0, 16);
    if (!accepted.length) {
      setMessage("Choose JPG, PNG, WebP, GIF or another browser-supported image.");
      return;
    }
    const next = await Promise.all(accepted.map(photoFromFile));
    const nextCount = Math.min(16, photos.length + next.length);
    setPhotos((current) => [...current, ...next].slice(0, 16));
    if (nextCount > photoCount) selectPhotoCount(nextCount);
    setMessage(`${next.length} photo${next.length === 1 ? "" : "s"} added locally.`);
  }

  function selectPhotoCount(count: number) {
    const next = layoutPresets(count)[0];
    setPhotoCount(count);
    setLayoutId(next.id);
    setLayoutCells(next.cells);
    setSelectedCell((current) => Math.min(current, count - 1));
    setSelectedAnnotationId(null);
  }

  function selectPreset(id: string, cells: Rect[]) {
    setLayoutId(id);
    setLayoutCells(cells);
    setSelectedCell((current) => Math.min(current, cells.length - 1));
  }

  async function replaceSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const photo = await photoFromFile(file);
    setPhotos((current) => {
      const next = [...current];
      if (selectedCell < next.length) next[selectedCell] = photo;
      else next.push(photo);
      return next;
    });
    const targetIndex = Math.min(selectedCell, photos.length);
    setSelectedCell(targetIndex);
    setTransforms((current) => ({ ...current, [targetIndex]: { scale: 1, x: 0, y: 0 } }));
    setMessage(selectedCell < photos.length ? `Photo ${selectedCell + 1} replaced.` : `Photo ${targetIndex + 1} added.`);
  }

  function removeSelectedPhoto() {
    if (!photos[selectedCell]) return;
    setPhotos((current) => current.filter((_, index) => index !== selectedCell));
    setTransforms({});
    setSelectedCell((current) => Math.max(0, Math.min(current, photos.length - 2)));
    setMessage("Selected photo removed.");
  }

  function shufflePhotos() {
    setPhotos((current) => [...current].sort(() => Math.random() - 0.5));
    setTransforms({});
    setMessage("Photo order shuffled.");
  }

  function addAnnotation(type: AnnotationType) {
    const annotation: Annotation = {
      id: crypto.randomUUID(), type, x: 0.34, y: 0.35, w: type === "text" ? 0.22 : 0.28, h: type === "text" ? 0.08 : 0.2,
      color: "#ff7252", lineWidth: 6, fontSize: 42, text: "Your text",
    };
    setAnnotations((current) => [...current, annotation]);
    setSelectedAnnotationId(annotation.id);
    setMessage(`${type[0].toUpperCase()}${type.slice(1)} annotation added.`);
  }

  function updateAnnotation(update: Partial<Annotation>) {
    if (!selectedAnnotationId) return;
    setAnnotations((current) => current.map((annotation) => annotation.id === selectedAnnotationId ? { ...annotation, ...update } : annotation));
  }

  function removeAnnotation() {
    if (!selectedAnnotationId) return;
    setAnnotations((current) => current.filter((annotation) => annotation.id !== selectedAnnotationId));
    setSelectedAnnotationId(null);
  }

  function canvasPoint(event: PointerEvent<HTMLCanvasElement> | DragEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * canvas.width / bounds.width,
      y: (event.clientY - bounds.top) * canvas.height / bounds.height,
      bounds,
    };
  }

  function canvasPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    const point = canvasPoint(event);
    if (!point) return;
    const annotation = selectedAnnotation;
    if (annotation) {
      const annotationX = annotation.x * canvasSize.width;
      const annotationY = annotation.y * canvasSize.height;
      const width = Math.max(annotation.w * canvasSize.width, annotation.type === "text" ? 170 : 0);
      const height = Math.max(annotation.h * canvasSize.height, annotation.type === "text" ? annotation.fontSize * 1.5 : 0);
      if (point.x >= annotationX - 12 && point.x <= annotationX + width + 12 && point.y >= annotationY - 12 && point.y <= annotationY + height + 12) {
        dragState.current = { mode: "annotation", id: annotation.id, startClientX: event.clientX, startClientY: event.clientY, startX: annotation.x, startY: annotation.y };
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }
    }
    const index = layoutCells.findIndex((cell) => {
      const pixel = cellPixels(cell, canvasSize.width, canvasSize.height, margins, gap);
      return point.x >= pixel.x && point.x <= pixel.x + pixel.w && point.y >= pixel.y && point.y <= pixel.y + pixel.h;
    });
    if (index < 0) return;
    setSelectedCell(index);
    setSelectedAnnotationId(null);
    const current = transforms[index] ?? { scale: 1, x: 0, y: 0 };
    dragState.current = { mode: "photo", index, startClientX: event.clientX, startClientY: event.clientY, startX: current.x, startY: current.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function canvasPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const drag = dragState.current;
    if (!drag) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const deltaX = (event.clientX - drag.startClientX) / bounds.width;
    const deltaY = (event.clientY - drag.startClientY) / bounds.height;
    if (drag.mode === "photo") updateTransform(drag.index, { x: drag.startX + deltaX * 2, y: drag.startY + deltaY * 2 });
    else setAnnotations((current) => current.map((annotation) => annotation.id === drag.id ? { ...annotation, x: Math.max(0, Math.min(0.95, drag.startX + deltaX)), y: Math.max(0, Math.min(0.95, drag.startY + deltaY)) } : annotation));
  }

  function canvasPointerUp(event: PointerEvent<HTMLCanvasElement>) {
    dragState.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  async function dropPhotos(event: DragEvent<HTMLCanvasElement>) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (!files.length) return;
    const point = canvasPoint(event);
    const target = point ? layoutCells.findIndex((cell) => {
      const pixel = cellPixels(cell, canvasSize.width, canvasSize.height, margins, gap);
      return point.x >= pixel.x && point.x <= pixel.x + pixel.w && point.y >= pixel.y && point.y <= pixel.y + pixel.h;
    }) : -1;
    if (target >= 0 && files.length === 1) {
      const photo = await photoFromFile(files[0]);
      setPhotos((current) => {
        const next = [...current];
        if (target < next.length) next[target] = photo;
        else next.push(photo);
        return next;
      });
      const targetIndex = Math.min(target, photos.length);
      setSelectedCell(targetIndex);
      updateTransform(targetIndex, { scale: 1, x: 0, y: 0 });
      setMessage(target < photos.length ? `Photo ${target + 1} replaced.` : `Photo ${targetIndex + 1} added.`);
      return;
    }
    await addFiles(files);
  }

  async function setBackground(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBackgroundPhoto(await photoFromFile(file));
    setMessage("Background image added.");
  }

  function resetSettings() {
    setRatio(ratios[0]);
    setCustomRatio({ width: 1, height: 1 });
    setMargins(initialMargins);
    setGap(10);
    setRadius(8);
    setBackgroundColor("#ffffff");
    setBackgroundPhoto(null);
    setWatermarkEnabled(false);
    setWatermarkText("xxf.app");
    setWatermarkSize(20);
    setWatermarkOpacity(0.25);
    setWatermarkAngle(-28);
    setWatermarkDensity("medium");
    setWatermarkPosition("tile");
    setExportMode("high");
    setMessage("Canvas settings restored.");
  }

  async function exportBlob() {
    const canvas = document.createElement("canvas");
    drawCollage(canvas, true);
    const type = exportMode === "png" ? "image/png" : "image/jpeg";
    const quality = exportMode === "standard" ? 0.76 : 0.94;
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  }

  async function downloadImage() {
    const blob = await exportBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `xxf-photo-collage.${exportMode === "png" ? "png" : "jpg"}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Collage downloaded.");
  }

  async function copyImage() {
    try {
      const blob = await exportBlob();
      if (!blob || !navigator.clipboard || typeof ClipboardItem === "undefined") throw new Error("Clipboard unavailable");
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setMessage("Collage copied to clipboard.");
    } catch {
      setMessage("Image copy is unavailable here. Download the collage instead.");
    }
  }

  function changeCustomGrid(rows: number, columns: number) {
    const safeRows = Math.max(1, Math.min(8, rows));
    const safeColumns = Math.max(1, Math.min(8, columns));
    setCustomRows(safeRows);
    setCustomColumns(safeColumns);
    setCustomCells(customSeed(safeRows, safeColumns, Math.min(photoCount, safeRows * safeColumns)));
    setSelectedCustomCellId(null);
  }

  function addCustomCell() {
    for (let row = 0; row < customRows; row += 1) {
      for (let column = 0; column < customColumns; column += 1) {
        if (!customCells.some((cell) => occupied(cell, row, column))) {
          const cell = { id: crypto.randomUUID(), row, column, rowSpan: 1, columnSpan: 1 };
          setCustomCells((current) => [...current, cell]);
          setSelectedCustomCellId(cell.id);
          return;
        }
      }
    }
    setMessage("The custom grid is already full.");
  }

  function fillCustomGrid() {
    const next = [...customCells];
    for (let row = 0; row < customRows; row += 1) {
      for (let column = 0; column < customColumns; column += 1) {
        if (!next.some((cell) => occupied(cell, row, column))) next.push({ id: crypto.randomUUID(), row, column, rowSpan: 1, columnSpan: 1 });
      }
    }
    setCustomCells(next);
  }

  function resizeCustomCell(rowSpan: number, columnSpan: number) {
    const selected = customCells.find((cell) => cell.id === selectedCustomCellId);
    if (!selected) return;
    const nextRowSpan = Math.max(1, Math.min(rowSpan, customRows - selected.row));
    const nextColumnSpan = Math.max(1, Math.min(columnSpan, customColumns - selected.column));
    for (let row = selected.row; row < selected.row + nextRowSpan; row += 1) {
      for (let column = selected.column; column < selected.column + nextColumnSpan; column += 1) {
        if (customCells.some((cell) => occupied(cell, row, column, selected.id))) {
          setMessage("That span overlaps another custom cell.");
          return;
        }
      }
    }
    setCustomCells((current) => current.map((cell) => cell.id === selected.id ? { ...cell, rowSpan: nextRowSpan, columnSpan: nextColumnSpan } : cell));
  }

  function applyCustomLayout() {
    if (!customCells.length) {
      setMessage("Add at least one custom cell.");
      return;
    }
    setPhotoCount(Math.min(16, customCells.length));
    setLayoutId("custom");
    setLayoutCells(customRects(customCells.slice(0, 16), customRows, customColumns));
    setSelectedCell(0);
    setCustomOpen(false);
    setMessage("Custom layout applied.");
  }

  function downloadLayout() {
    const payload = JSON.stringify({ version: 1, rows: customRows, columns: customColumns, cells: customCells }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "xxf-collage-layout.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importLayout(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as { rows: number; columns: number; cells: CustomCell[] };
      if (!Number.isInteger(parsed.rows) || !Number.isInteger(parsed.columns) || !Array.isArray(parsed.cells)) throw new Error("Invalid layout");
      setCustomRows(Math.max(1, Math.min(8, parsed.rows)));
      setCustomColumns(Math.max(1, Math.min(8, parsed.columns)));
      setCustomCells(parsed.cells.slice(0, 16).map((cell) => ({ ...cell, id: cell.id || crypto.randomUUID() })));
      setMessage("Custom layout imported.");
    } catch {
      setMessage("That layout JSON could not be imported.");
    }
  }

  const currentTransform = transforms[selectedCell] ?? { scale: 1, x: 0, y: 0 };
  const selectedCustomCell = customCells.find((cell) => cell.id === selectedCustomCellId) ?? null;
  const panelStyle = { "--custom-rows": customRows, "--custom-columns": customColumns } as CSSProperties;

  return (
    <section className={`photo-collage-workbench ${leftCollapsed ? "is-left-collapsed" : ""} ${rightCollapsed ? "is-right-collapsed" : ""}`} aria-label="Photo Collage Maker workspace">
      <header className="collage-topbar">
        <div><span className="collage-topbar__mark">PX</span><div><b>Photo Collage Maker</b><small>LOCAL CANVAS · NO UPLOADS</small></div></div>
        <span className="collage-topbar__status"><i /> {photos.length}/{photoCount} photos ready</span>
        <div className="collage-topbar__actions">
          <button type="button" onClick={() => uploadRef.current?.click()}>＋ Add photos</button>
          <button className="is-primary" type="button" onClick={() => void downloadImage()}>Download image ⇩</button>
        </div>
      </header>

      <div className="collage-layout">
        <aside className="collage-panel collage-panel--left" aria-label="Layout presets">
          <div className="collage-panel__head"><div><span>01</span><b>Layout presets</b></div><button type="button" onClick={() => setLeftCollapsed(true)} aria-label="Collapse layout panel">‹</button></div>
          <div className="collage-panel__scroll">
            <label className="collage-field"><span>Photo count</span><div className="collage-count-grid">{Array.from({ length: 16 }, (_, index) => index + 1).map((count) => <button key={count} type="button" className={photoCount === count ? "is-active" : ""} onClick={() => selectPhotoCount(count)}>{count}</button>)}</div></label>
            <div className="collage-layout-list">
              {presets.map((preset) => (
                <button key={preset.id} type="button" className={layoutId === preset.id ? "is-active" : ""} onClick={() => selectPreset(preset.id, preset.cells)} aria-label={`${preset.label} layout`}>
                  <span className="collage-layout-thumb">{preset.cells.map((cell, index) => <i key={index} style={{ left: `${cell.x * 100}%`, top: `${cell.y * 100}%`, width: `${cell.w * 100}%`, height: `${cell.h * 100}%` }} />)}</span>
                  <small>{preset.label}</small>
                </button>
              ))}
              <button type="button" className={layoutId === "custom" ? "is-active" : ""} onClick={() => setCustomOpen(true)} aria-label="Open custom layout editor"><span className="collage-layout-thumb collage-layout-thumb--custom">＋</span><small>Custom</small></button>
            </div>
            <div className="collage-local-note"><b>Private by default</b><p>Photos stay in this browser tab. XXF does not upload or store them.</p></div>
          </div>
        </aside>

        <div className="collage-canvas-column">
          {leftCollapsed && <button className="collage-panel-toggle collage-panel-toggle--left" type="button" onClick={() => setLeftCollapsed(false)}>Layouts ›</button>}
          {rightCollapsed && <button className="collage-panel-toggle collage-panel-toggle--right" type="button" onClick={() => setRightCollapsed(false)}>Settings ‹</button>}
          <div className="collage-toolbar" role="toolbar" aria-label="Collage tools">
            <div className="collage-toolbar__group"><button type="button" onClick={() => addAnnotation("text")}><b>T</b> Text</button><button type="button" onClick={() => addAnnotation("arrow")}><b>↗</b> Arrow</button><button type="button" onClick={() => addAnnotation("rectangle")}><b>□</b> Box</button><button type="button" onClick={() => addAnnotation("circle")}><b>○</b> Circle</button></div>
            <span />
            <div className="collage-toolbar__group"><button type="button" disabled={photos.length < 2} onClick={shufflePhotos}><b>⤨</b> Shuffle</button><button type="button" disabled={!photos.length && !annotations.length} onClick={() => { setPhotos([]); setTransforms({}); setAnnotations([]); setMessage("Canvas cleared."); }}><b>×</b> Clear</button></div>
          </div>

          <div className="collage-stage" onClick={() => !photos.length && uploadRef.current?.click()}>
            <canvas
              ref={canvasRef}
              tabIndex={0}
              onPointerDown={canvasPointerDown}
              onPointerMove={canvasPointerMove}
              onPointerUp={canvasPointerUp}
              onPointerCancel={canvasPointerUp}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => void dropPhotos(event)}
              aria-label="Interactive collage canvas. Drag a selected photo to reposition it and use arrow keys for fine movement."
            />
            {!photos.length && <div className="collage-empty"><span>＋</span><b>Drop photos here</b><p>or click anywhere to browse · up to 16 images</p><button type="button" onClick={(event) => { event.stopPropagation(); uploadRef.current?.click(); }}>Choose photos</button></div>}
          </div>

          <div className="collage-photo-controls" aria-label="Selected photo controls">
            <span>Photo {selectedCell + 1}</span>
            <button type="button" onClick={() => replaceRef.current?.click()} disabled={!photos.length}>Replace</button>
            <button type="button" onClick={removeSelectedPhoto} disabled={!photos[selectedCell]}>Delete</button>
            <button type="button" onClick={() => updateTransform(selectedCell, { scale: Math.min(4, currentTransform.scale + 0.12) })} disabled={!photos[selectedCell]}>＋ Zoom</button>
            <button type="button" onClick={() => updateTransform(selectedCell, { scale: Math.max(1, currentTransform.scale - 0.12) })} disabled={!photos[selectedCell]}>− Zoom</button>
            <button type="button" onClick={() => updateTransform(selectedCell, { scale: 1, x: 0, y: 0 })} disabled={!photos[selectedCell]}>Reset</button>
            <small>Drag to pan · arrows to nudge · drop a file to replace</small>
          </div>
        </div>

        <aside className="collage-panel collage-panel--right" aria-label="Canvas and export settings">
          <div className="collage-panel__head"><div><span>02</span><b>Canvas settings</b></div><button type="button" onClick={() => setRightCollapsed(true)} aria-label="Collapse settings panel">›</button></div>
          <div className="collage-panel__scroll">
            <button className="collage-reset" type="button" onClick={resetSettings}>↺ Restore defaults</button>
            <details open><summary>Canvas ratio <span>+</span></summary><div className="collage-detail-body">
              <div className="collage-ratio-grid">{ratios.map((item) => <button key={item.value} type="button" className={ratio.value === item.value ? "is-active" : ""} onClick={() => setRatio(item)}><b>{item.label}</b>{item.note && <small>{item.note}</small>}</button>)}</div>
              <div className="collage-custom-ratio"><span>Custom</span><input aria-label="Custom ratio width" type="number" min="1" max="1000" value={customRatio.width} onChange={(event) => { setCustomRatio((current) => ({ ...current, width: Number(event.target.value) || 1 })); setRatio({ label: "Custom", value: "custom", width: 1, height: 1 }); }} /><b>:</b><input aria-label="Custom ratio height" type="number" min="1" max="1000" value={customRatio.height} onChange={(event) => { setCustomRatio((current) => ({ ...current, height: Number(event.target.value) || 1 })); setRatio({ label: "Custom", value: "custom", width: 1, height: 1 }); }} /></div>
            </div></details>
            <details open><summary>Style <span>+</span></summary><div className="collage-detail-body">
              <label className="collage-field"><span>Border · top / right / bottom / left</span><div className="collage-four-inputs">{(["top", "right", "bottom", "left"] as const).map((side) => <input key={side} aria-label={`${side} border`} type="number" min="0" max="200" value={margins[side]} onChange={(event) => setMargins((current) => ({ ...current, [side]: Math.max(0, Number(event.target.value)) }))} />)}</div></label>
              <label className="collage-field"><span>Gap <b>{gap}px</b></span><input type="range" min="0" max="80" value={gap} onChange={(event) => setGap(Number(event.target.value))} /></label>
              <label className="collage-field"><span>Corner radius <b>{radius}px</b></span><input type="range" min="0" max="80" value={radius} onChange={(event) => setRadius(Number(event.target.value))} /></label>
              <label className="collage-field"><span>Background color</span><div className="collage-color-input"><input aria-label="Background color picker" type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} /><input aria-label="Background color value" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} /></div></label>
              <div className="collage-inline-actions"><button type="button" onClick={() => backgroundRef.current?.click()}>Background image</button><button type="button" onClick={() => setBackgroundPhoto(null)} disabled={!backgroundPhoto}>Remove</button></div>
            </div></details>
            <details><summary>Watermark <span>+</span></summary><div className="collage-detail-body">
              <label className="collage-switch"><input type="checkbox" checked={watermarkEnabled} onChange={(event) => setWatermarkEnabled(event.target.checked)} /><span>Enable watermark</span></label>
              <label className="collage-field"><span>Text</span><input value={watermarkText} onChange={(event) => setWatermarkText(event.target.value)} /></label>
              <label className="collage-field"><span>Size <b>{watermarkSize}px</b></span><input type="range" min="10" max="80" value={watermarkSize} onChange={(event) => setWatermarkSize(Number(event.target.value))} /></label>
              <label className="collage-field"><span>Opacity <b>{watermarkOpacity.toFixed(2)}</b></span><input type="range" min="0.05" max="0.9" step="0.05" value={watermarkOpacity} onChange={(event) => setWatermarkOpacity(Number(event.target.value))} /></label>
              <label className="collage-field"><span>Angle <b>{watermarkAngle}°</b></span><input type="range" min="-90" max="90" value={watermarkAngle} onChange={(event) => setWatermarkAngle(Number(event.target.value))} /></label>
              <div className="collage-segments">{(["sparse", "medium", "dense"] as const).map((value) => <button key={value} type="button" className={watermarkDensity === value ? "is-active" : ""} onClick={() => { setWatermarkDensity(value); setWatermarkPosition("tile"); }}>{value}</button>)}</div>
              <div className="collage-position-grid">{[["↖", "topLeft"], ["↗", "topRight"], ["•", "center"], ["↙", "bottomLeft"], ["↘", "bottomRight"]].map(([label, value]) => <button key={value} type="button" className={watermarkPosition === value ? "is-active" : ""} onClick={() => setWatermarkPosition(value)}>{label}</button>)}</div>
            </div></details>
            <details open><summary>Export <span>+</span></summary><div className="collage-detail-body">
              <div className="collage-export-options"><button type="button" className={exportMode === "high" ? "is-active" : ""} onClick={() => setExportMode("high")}><b>High JPG</b><small>94% quality</small></button><button type="button" className={exportMode === "standard" ? "is-active" : ""} onClick={() => setExportMode("standard")}><b>Standard JPG</b><small>smaller file</small></button><button type="button" className={exportMode === "png" ? "is-active" : ""} onClick={() => setExportMode("png")}><b>Lossless PNG</b><small>best detail</small></button></div>
              <button className="collage-copy" type="button" onClick={() => void copyImage()}>Copy to clipboard</button>
              <button className="collage-download" type="button" onClick={() => void downloadImage()}>Download image <span>⇩</span></button>
            </div></details>
            {selectedAnnotation && <details open><summary>Selected annotation <span>+</span></summary><div className="collage-detail-body">
              {selectedAnnotation.type === "text" && <label className="collage-field"><span>Text</span><input value={selectedAnnotation.text} onChange={(event) => updateAnnotation({ text: event.target.value })} /></label>}
              <label className="collage-field"><span>Color</span><input aria-label="Annotation color" type="color" value={selectedAnnotation.color} onChange={(event) => updateAnnotation({ color: event.target.value })} /></label>
              <label className="collage-field"><span>{selectedAnnotation.type === "text" ? "Font size" : "Line width"}</span><input type="range" min={selectedAnnotation.type === "text" ? 16 : 2} max={selectedAnnotation.type === "text" ? 120 : 24} value={selectedAnnotation.type === "text" ? selectedAnnotation.fontSize : selectedAnnotation.lineWidth} onChange={(event) => selectedAnnotation.type === "text" ? updateAnnotation({ fontSize: Number(event.target.value) }) : updateAnnotation({ lineWidth: Number(event.target.value) })} /></label>
              <label className="collage-field"><span>Horizontal position</span><input type="range" min="0" max="0.95" step="0.01" value={selectedAnnotation.x} onChange={(event) => updateAnnotation({ x: Number(event.target.value) })} /></label>
              <label className="collage-field"><span>Vertical position</span><input type="range" min="0" max="0.95" step="0.01" value={selectedAnnotation.y} onChange={(event) => updateAnnotation({ y: Number(event.target.value) })} /></label>
              <button className="collage-danger" type="button" onClick={removeAnnotation}>Delete annotation</button>
            </div></details>}
          </div>
        </aside>
      </div>

      <footer className="collage-status" role="status"><span>{message}</span><small>{canvasSize.width} × {canvasSize.height}px · {ratio.label}</small></footer>

      <input ref={uploadRef} className="sr-only" type="file" accept="image/*" multiple onChange={(event) => event.target.files && void addFiles(event.target.files)} />
      <input ref={replaceRef} className="sr-only" type="file" accept="image/*" onChange={(event) => void replaceSelected(event)} />
      <input ref={backgroundRef} className="sr-only" type="file" accept="image/*" onChange={(event) => void setBackground(event)} />
      <input ref={importLayoutRef} className="sr-only" type="file" accept="application/json,.json" onChange={(event) => void importLayout(event)} />

      {customOpen && <div className="collage-modal" role="dialog" aria-modal="true" aria-labelledby="custom-layout-title">
        <div className="collage-modal__card">
          <header><div><span>Custom grid</span><h2 id="custom-layout-title">Build your own collage layout.</h2></div><button type="button" onClick={() => setCustomOpen(false)} aria-label="Close custom layout editor">×</button></header>
          <div className="collage-modal__body">
            <aside>
              <label>Rows<input type="number" min="1" max="8" value={customRows} onChange={(event) => changeCustomGrid(Number(event.target.value), customColumns)} /></label>
              <label>Columns<input type="number" min="1" max="8" value={customColumns} onChange={(event) => changeCustomGrid(customRows, Number(event.target.value))} /></label>
              <button type="button" onClick={addCustomCell}>＋ Add cell</button><button type="button" onClick={fillCustomGrid}>Auto fill empty</button><button type="button" onClick={() => { setCustomCells(customSeed(customRows, customColumns, photoCount)); setSelectedCustomCellId(null); }}>Reset grid</button>
              <hr />
              <button type="button" onClick={() => importLayoutRef.current?.click()}>Import JSON</button><button type="button" onClick={downloadLayout}>Export JSON</button>
            </aside>
            <section>
              <div className="custom-grid-editor" style={panelStyle}>
                {customCells.map((cell, index) => <button key={cell.id} type="button" className={selectedCustomCellId === cell.id ? "is-active" : ""} style={{ gridRow: `${cell.row + 1} / span ${cell.rowSpan}`, gridColumn: `${cell.column + 1} / span ${cell.columnSpan}` }} onClick={() => setSelectedCustomCellId(cell.id)}><span>{index + 1}</span><small>{cell.rowSpan}×{cell.columnSpan}</small></button>)}
              </div>
              <p>Click a cell to select it. Use spans to merge available grid space.</p>
            </section>
            <aside>
              <h3>Selected cell</h3>
              {selectedCustomCell ? <>
                <label>Row span<input type="number" min="1" max={customRows - selectedCustomCell.row} value={selectedCustomCell.rowSpan} onChange={(event) => resizeCustomCell(Number(event.target.value), selectedCustomCell.columnSpan)} /></label>
                <label>Column span<input type="number" min="1" max={customColumns - selectedCustomCell.column} value={selectedCustomCell.columnSpan} onChange={(event) => resizeCustomCell(selectedCustomCell.rowSpan, Number(event.target.value))} /></label>
                <button className="collage-danger" type="button" onClick={() => { setCustomCells((current) => current.filter((cell) => cell.id !== selectedCustomCell.id)); setSelectedCustomCellId(null); }}>Delete cell</button>
              </> : <p>Select a cell to change its row and column span.</p>}
              <textarea readOnly value={JSON.stringify({ version: 1, rows: customRows, columns: customColumns, cells: customCells }, null, 2)} aria-label="Current layout JSON" />
            </aside>
          </div>
          <footer><span>{customCells.length} cells · {customRows} × {customColumns} grid</span><div><button type="button" onClick={() => setCustomOpen(false)}>Cancel</button><button className="is-primary" type="button" onClick={applyCustomLayout}>Use this layout</button></div></footer>
        </div>
      </div>}
    </section>
  );
}
