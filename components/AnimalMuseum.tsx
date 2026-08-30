"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type WheelEvent } from "react";

type Locale = "en" | "zh";
type Habitat = "all" | "land" | "air" | "water";

type LocalizedText = { en: string; zh: string };

type Exhibit = {
  id: string;
  name: LocalizedText;
  group: Habitat;
  groupLabel: LocalizedText;
  period: LocalizedText;
  size: LocalizedText;
  diet: LocalizedText;
  glyph: string;
  color: string;
  story: LocalizedText;
  facts: LocalizedText[];
};

const exhibits: Exhibit[] = [
  { id: "tyrannosaurus", name: { en: "Tyrannosaurus", zh: "霸王龙" }, group: "land", groupLabel: { en: "Land", zh: "陆地" }, period: { en: "Late Cretaceous", zh: "白垩纪晚期" }, size: { en: "12 m long", zh: "约 12 米长" }, diet: { en: "Carnivore", zh: "肉食" }, glyph: "T-REX", color: "#d9ef73", story: { en: "A powerful hunter with a surprisingly gentle curiosity. Its binocular vision helped it read the landscape from a great distance.", zh: "强大的猎手，也有着出人意料的好奇心。双眼视觉让它能从很远的地方观察环境。" }, facts: [{ en: "Lived around 68–66 million years ago.", zh: "生活在约 6800 万至 6600 万年前。" }, { en: "Its name means tyrant lizard king.", zh: "名字的意思是“暴君蜥蜴之王”。" }] },
  { id: "triceratops", name: { en: "Triceratops", zh: "三角龙" }, group: "land", groupLabel: { en: "Land", zh: "陆地" }, period: { en: "Late Cretaceous", zh: "白垩纪晚期" }, size: { en: "9 m long", zh: "约 9 米长" }, diet: { en: "Herbivore", zh: "植食" }, glyph: "TRI", color: "#ffb39f", story: { en: "Three horns and a broad frill made this herbivore one of the most recognizable animals of the ancient plains.", zh: "三只角和宽大的颈盾，让它成为远古平原上最容易辨认的植食动物之一。" }, facts: [{ en: "Its frill may have helped with display and recognition.", zh: "颈盾可能用于展示和同类识别。" }, { en: "It had a parrot-like beak for clipping plants.", zh: "它有类似鹦鹉的喙，用来剪取植物。" }] },
  { id: "stegosaurus", name: { en: "Stegosaurus", zh: "剑龙" }, group: "land", groupLabel: { en: "Land", zh: "陆地" }, period: { en: "Late Jurassic", zh: "侏罗纪晚期" }, size: { en: "7 m long", zh: "约 7 米长" }, diet: { en: "Herbivore", zh: "植食" }, glyph: "STG", color: "#c8ff4d", story: { en: "Its upright plates and four tail spikes gave it a quiet, unmistakable silhouette in the Jurassic forest.", zh: "背部直立的骨板和尾端四根尖刺，让它在侏罗纪森林中拥有安静而独特的轮廓。" }, facts: [{ en: "The plates were arranged in two rows along its back.", zh: "背部骨板沿两侧排成两列。" }, { en: "It had a small brain relative to its body size.", zh: "相对于身体大小，它的脑部很小。" }] },
  { id: "velociraptor", name: { en: "Velociraptor", zh: "迅猛龙" }, group: "land", groupLabel: { en: "Land", zh: "陆地" }, period: { en: "Late Cretaceous", zh: "白垩纪晚期" }, size: { en: "2 m long", zh: "约 2 米长" }, diet: { en: "Carnivore", zh: "肉食" }, glyph: "VEL", color: "#b8b0ff", story: { en: "Small, quick and feathered, it was closer to a ground bird than the movie monsters suggest.", zh: "它体型小巧、行动迅速并覆有羽毛，比电影里的怪兽更接近一只地面鸟类。" }, facts: [{ en: "Its name means swift seizer.", zh: "名字的意思是“敏捷的捕捉者”。" }, { en: "Fossils show a large sickle-shaped toe claw.", zh: "化石显示它有一枚巨大的镰刀形趾爪。" }] },
  { id: "brachiosaurus", name: { en: "Brachiosaurus", zh: "腕龙" }, group: "land", groupLabel: { en: "Land", zh: "陆地" }, period: { en: "Late Jurassic", zh: "侏罗纪晚期" }, size: { en: "25 m tall", zh: "约 25 米高" }, diet: { en: "Herbivore", zh: "植食" }, glyph: "BRA", color: "#e6d59a", story: { en: "A high-browser built like a living lookout tower, reaching leaves that other dinosaurs could not.", zh: "它像一座会移动的瞭望塔，能吃到其他恐龙够不到的高处叶片。" }, facts: [{ en: "Its front legs were longer than its hind legs.", zh: "它的前肢比后肢更长。" }, { en: "Its long neck allowed it to browse high foliage.", zh: "长脖子帮助它取食高处的植物。" }] },
  { id: "ankylosaurus", name: { en: "Ankylosaurus", zh: "甲龙" }, group: "land", groupLabel: { en: "Land", zh: "陆地" }, period: { en: "Late Cretaceous", zh: "白垩纪晚期" }, size: { en: "8 m long", zh: "约 8 米长" }, diet: { en: "Herbivore", zh: "植食" }, glyph: "ANK", color: "#a6d8c9", story: { en: "A low, armored browser with a heavy tail club and a body shaped like a walking shield.", zh: "低矮、披甲的植食者，尾锤沉重，身体像一面会行走的盾牌。" }, facts: [{ en: "Bony plates protected its back and flanks.", zh: "骨质甲片保护着它的背部和侧面。" }, { en: "Its tail club was formed from fused vertebrae.", zh: "尾锤由融合的椎骨构成。" }] },
  { id: "pteranodon", name: { en: "Pteranodon", zh: "翼龙" }, group: "air", groupLabel: { en: "Air", zh: "天空" }, period: { en: "Late Cretaceous", zh: "白垩纪晚期" }, size: { en: "7 m wingspan", zh: "翼展约 7 米" }, diet: { en: "Fish eater", zh: "食鱼" }, glyph: "PTE", color: "#b9adff", story: { en: "A glider of the ancient coast, using ocean winds to travel far with very little effort.", zh: "远古海岸的滑翔者，借助海风就能轻松飞行很远。" }, facts: [{ en: "It was a pterosaur, not a dinosaur.", zh: "它属于翼龙，不是恐龙。" }, { en: "Its long crest may have helped with display and balance.", zh: "头冠可能用于展示和保持平衡。" }] },
  { id: "archaeopteryx", name: { en: "Archaeopteryx", zh: "始祖鸟" }, group: "air", groupLabel: { en: "Air", zh: "天空" }, period: { en: "Late Jurassic", zh: "侏罗纪晚期" }, size: { en: "0.5 m long", zh: "约 0.5 米长" }, diet: { en: "Omnivore", zh: "杂食" }, glyph: "ARC", color: "#ffc98c", story: { en: "Part bird, part dinosaur, its feathers preserve a beautiful snapshot of evolution in motion.", zh: "一半像鸟、一半像恐龙，羽毛记录了演化正在发生的珍贵瞬间。" }, facts: [{ en: "Fossils preserve flight feathers and teeth.", zh: "化石同时保留了飞羽和牙齿。" }, { en: "It lived in island forests and lagoons.", zh: "它生活在岛屿森林与泻湖环境中。" }] },
  { id: "quetzalcoatlus", name: { en: "Quetzalcoatlus", zh: "风神翼龙" }, group: "air", groupLabel: { en: "Air", zh: "天空" }, period: { en: "Late Cretaceous", zh: "白垩纪晚期" }, size: { en: "11 m wingspan", zh: "翼展约 11 米" }, diet: { en: "Opportunist", zh: "机会主义食性" }, glyph: "QUA", color: "#93d5e6", story: { en: "One of the largest flying animals ever known, it could stride across the ground as well as soar.", zh: "它是已知最大的飞行动物之一，也能在地面上迈步行走。" }, facts: [{ en: "Its wings were supported by an elongated fourth finger.", zh: "它的翅膀由延长的第四指支撑。" }, { en: "Its long neck helped it scan open landscapes.", zh: "长脖子帮助它观察开阔的地面。" }] },
  { id: "microraptor", name: { en: "Microraptor", zh: "小盗龙" }, group: "air", groupLabel: { en: "Air", zh: "天空" }, period: { en: "Early Cretaceous", zh: "白垩纪早期" }, size: { en: "0.8 m long", zh: "约 0.8 米长" }, diet: { en: "Omnivore", zh: "杂食" }, glyph: "MIC", color: "#d1c2ff", story: { en: "Four feathered wings gave this tiny dinosaur a remarkable shape, built for gliding between trees.", zh: "四片带羽毛的翼让这只小恐龙拥有奇特的体型，适合在树间滑翔。" }, facts: [{ en: "It had long flight feathers on its arms and legs.", zh: "它的前肢和后肢都有长长的飞羽。" }, { en: "Its dark feathers may have had a glossy sheen.", zh: "它的深色羽毛可能带有闪亮的光泽。" }] },
  { id: "mosasaurus", name: { en: "Mosasaurus", zh: "沧龙" }, group: "water", groupLabel: { en: "Water", zh: "水域" }, period: { en: "Late Cretaceous", zh: "白垩纪晚期" }, size: { en: "14 m long", zh: "约 14 米长" }, diet: { en: "Carnivore", zh: "肉食" }, glyph: "MOS", color: "#87d9d1", story: { en: "A marine lizard with paddle-like limbs and a flexible tail, perfectly at home in a warm Cretaceous sea.", zh: "拥有桨状四肢和灵活尾巴的海生蜥蜴，适应温暖的白垩纪海洋。" }, facts: [{ en: "It breathed air and had to surface.", zh: "它用肺呼吸，需要浮出水面。" }, { en: "Its tail supplied most of its swimming power.", zh: "尾巴为游泳提供了主要动力。" }] },
  { id: "ichthyosaurus", name: { en: "Ichthyosaurus", zh: "鱼龙" }, group: "water", groupLabel: { en: "Water", zh: "水域" }, period: { en: "Early Jurassic", zh: "侏罗纪早期" }, size: { en: "3 m long", zh: "约 3 米长" }, diet: { en: "Fish eater", zh: "食鱼" }, glyph: "ICH", color: "#91c9f0", story: { en: "Its dolphin-like body was shaped for speed, making it a graceful hunter of open water.", zh: "海豚般的身体为速度而生，是开阔海域中优雅的猎手。" }, facts: [{ en: "Its eyes were among the largest of any animal.", zh: "它的眼睛是所有动物中最大的之一。" }, { en: "Some species gave birth to live young.", zh: "一些种类会直接产下幼崽。" }] },
  { id: "dunkleosteus", name: { en: "Dunkleosteus", zh: "邓氏鱼" }, group: "water", groupLabel: { en: "Water", zh: "水域" }, period: { en: "Late Devonian", zh: "泥盆纪晚期" }, size: { en: "6 m long", zh: "约 6 米长" }, diet: { en: "Carnivore", zh: "肉食" }, glyph: "DUN", color: "#7fbfc5", story: { en: "A jawed fish protected by thick armor, it ruled the Devonian seas long before dinosaurs appeared.", zh: "披着厚重甲胄的有颌鱼，在恐龙出现前就统治着泥盆纪海洋。" }, facts: [{ en: "It had sharp bony jaw plates instead of teeth.", zh: "它没有普通牙齿，而是用锋利的骨质颌板。" }, { en: "It lived more than 360 million years ago.", zh: "它生活在 3.6 亿多年前。" }] },
  { id: "ammonite", name: { en: "Ammonite", zh: "菊石" }, group: "water", groupLabel: { en: "Water", zh: "水域" }, period: { en: "Mesozoic seas", zh: "中生代海洋" }, size: { en: "Shells from 1 cm", zh: "壳体从 1 厘米起" }, diet: { en: "Small hunter", zh: "小型捕食者" }, glyph: "AMM", color: "#f3c98e", story: { en: "A spiral shell is more than a pattern: it is a record of growth, chamber by chamber.", zh: "螺旋形的贝壳不只是图案，也是逐个隔室记录成长的年轮。" }, facts: [{ en: "Its shell was divided into buoyant chambers.", zh: "它的贝壳由帮助浮力的隔室组成。" }, { en: "Ammonites survived for hundreds of millions of years.", zh: "菊石在地球上延续了数亿年。" }] },
  { id: "plesiosaur", name: { en: "Plesiosaur", zh: "蛇颈龙" }, group: "water", groupLabel: { en: "Water", zh: "水域" }, period: { en: "Early Jurassic", zh: "侏罗纪早期" }, size: { en: "4 m long", zh: "约 4 米长" }, diet: { en: "Fish eater", zh: "食鱼" }, glyph: "PLE", color: "#a6d7d2", story: { en: "Four broad flippers turned this long-necked marine reptile into a precise underwater navigator.", zh: "四片宽大的鳍肢，让这种长颈海生爬行动物成为精准的水下航行者。" }, facts: [{ en: "Its long neck contained many small vertebrae.", zh: "它的长颈包含许多块小椎骨。" }, { en: "It was a marine reptile, not a dinosaur.", zh: "它是海生爬行动物，不是恐龙。" }] },
  { id: "elasmosaurus", name: { en: "Elasmosaurus", zh: "薄片龙" }, group: "water", groupLabel: { en: "Water", zh: "水域" }, period: { en: "Late Cretaceous", zh: "白垩纪晚期" }, size: { en: "10 m long", zh: "约 10 米长" }, diet: { en: "Fish eater", zh: "食鱼" }, glyph: "ELA", color: "#9bbfe8", story: { en: "A remarkably long neck and compact body helped it search the ancient inland seas for food.", zh: "修长的脖子与紧凑的身体，帮助它在远古内海中寻找食物。" }, facts: [{ en: "Its neck made up more than half its body length.", zh: "它的脖子超过身体长度的一半。" }, { en: "It used its flippers like underwater wings.", zh: "它像用水下翅膀一样使用鳍肢。" }] },
  { id: "diplodocus", name: { en: "Diplodocus", zh: "梁龙" }, group: "land", groupLabel: { en: "Land", zh: "陆地" }, period: { en: "Late Jurassic", zh: "侏罗纪晚期" }, size: { en: "27 m long", zh: "约 27 米长" }, diet: { en: "Herbivore", zh: "植食" }, glyph: "DIP", color: "#d2e58f", story: { en: "A long-tailed giant that moved through fern-rich floodplains in slow, steady steps.", zh: "它拖着长尾，在蕨类繁茂的洪泛平原上缓慢而稳定地前进。" }, facts: [{ en: "Its whip-like tail may have helped with communication.", zh: "鞭状尾巴可能用于交流。" }, { en: "Its peg-like teeth were suited to stripping plants.", zh: "钉状牙齿适合剥取植物。" }] },
  { id: "iguanodon", name: { en: "Iguanodon", zh: "禽龙" }, group: "land", groupLabel: { en: "Land", zh: "陆地" }, period: { en: "Early Cretaceous", zh: "白垩纪早期" }, size: { en: "10 m long", zh: "约 10 米长" }, diet: { en: "Herbivore", zh: "植食" }, glyph: "IGU", color: "#bbd99f", story: { en: "A sturdy plant eater with a thumb spike, it could browse on two legs or walk on all fours.", zh: "结实的植食者，拇指上有尖刺，既能用两足取食，也能四足行走。" }, facts: [{ en: "The famous thumb spike may have been defensive.", zh: "著名的拇指尖刺可能用于防御。" }, { en: "It was one of the first dinosaurs known to science.", zh: "它是最早被科学界认识的恐龙之一。" }] },
];

const labels = {
  en: { back: "Back to XXF Tools", museum: "Prehistoric Animal Museum", meet: "Meet today’s friend", dinosaur: "dinosaur", listen: "Listen", guide: "Guide", backMuseum: "Back to museum", language: "Change language", fullscreen: "Fullscreen", exitFullscreen: "Exit fullscreen", reset: "Reset view", rotate: "Drag to turn · scroll to zoom", selected: "Selected specimen", period: "Period", size: "Scale", diet: "Diet", all: "All", land: "Land", air: "Air", water: "Water", fieldNote: "Field note", exhibits: "Exhibits", sceneView: "Scene view", modelView: "3D exhibit", guideTitle: "Field guide", close: "Close", next: "Next animal", previous: "Previous animal", intro: "A browser-first natural history room for curious minds." },
  zh: { back: "返回 XXF 工具箱", museum: "远古生命博物馆", meet: "今天遇见", dinosaur: "恐龙", listen: "聆听", guide: "导览", backMuseum: "返回展馆", language: "切换语言", fullscreen: "全屏观看", exitFullscreen: "退出全屏", reset: "重置视角", rotate: "拖动旋转 · 滚动缩放", selected: "当前展品", period: "年代", size: "尺度", diet: "食性", all: "全部", land: "陆地", air: "天空", water: "水域", fieldNote: "考察笔记", exhibits: "展品", sceneView: "场景视图", modelView: "3D 展品", guideTitle: "现场导览", close: "关闭", next: "下一个展品", previous: "上一个展品", intro: "一个直接在浏览器中运行的自然历史展厅。" },
} satisfies Record<Locale, Record<string, string>>;

function copy(text: LocalizedText, locale: Locale) {
  return text[locale];
}

export function AnimalMuseum() {
  const [locale, setLocale] = useState<Locale>("en");
  const [habitat, setHabitat] = useState<Habitat>("all");
  const [selectedId, setSelectedId] = useState("stegosaurus");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, x: 0, y: 0, rotationX: 0, rotationY: 0 });
  const t = labels[locale];
  const filteredExhibits = useMemo(() => habitat === "all" ? exhibits : exhibits.filter((exhibit) => exhibit.group === habitat), [habitat]);
  const selected = exhibits.find((exhibit) => exhibit.id === selectedId) ?? exhibits[0];

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function selectExhibit(id: string) {
    setSelectedId(id);
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  }

  function changeHabitat(next: Habitat) {
    setHabitat(next);
    if (next !== "all" && selected.group !== next) {
      const first = exhibits.find((exhibit) => exhibit.group === next);
      if (first) selectExhibit(first.id);
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    dragRef.current = { active: true, x: event.clientX, y: event.clientY, rotationX: rotation.x, rotationY: rotation.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    setRotation({ x: Math.max(-12, Math.min(12, dragRef.current.rotationX - (event.clientY - dragRef.current.y) * 0.12)), y: dragRef.current.rotationY + (event.clientX - dragRef.current.x) * 0.18 });
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    dragRef.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    setZoom((value) => Math.max(.82, Math.min(1.25, value - event.deltaY * .0008)));
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await stageRef.current?.requestFullscreen();
  }

  function resetView() {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  }

  function listen() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${selected.name.en}. ${selected.story.en}`);
    utterance.lang = locale === "zh" ? "zh-CN" : "en-US";
    window.speechSynthesis.speak(utterance);
  }

  const scenePosition = selected.id === "stegosaurus" ? "center" : selected.group === "air" ? "26% 20%" : selected.group === "water" ? "20% 70%" : "72% 60%";
  const showModel = selected.id === "stegosaurus";
  const modelStyle = { "--model-rotate-x": `${rotation.x}deg`, "--model-rotate-y": `${rotation.y}deg`, "--model-scale": zoom } as CSSProperties;

  return (
    <main className="animal-museum-page" id="top">
      <div className="animal-museum-viewer" ref={stageRef}>
        <Image className="animal-museum-viewer__background" src="/animal/museum-bg.jpg" alt="A prehistoric animal museum diorama" fill priority sizes="100vw" style={{ objectPosition: scenePosition }} />
        <div className="animal-museum-viewer__wash" aria-hidden="true" />

        <header className="animal-museum-viewer__topbar">
          <Link className="animal-museum-viewer__brand" href="/" aria-label={t.back}><span className="animal-museum-viewer__brand-mark">XXF</span><span>{t.museum}</span></Link>
          <div className="animal-museum-viewer__tools">
            <button type="button" onClick={() => setLocale(locale === "en" ? "zh" : "en")} aria-label={`${t.language} / 中文`}><span aria-hidden="true">文</span> {locale.toUpperCase()}</button>
            <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? t.exitFullscreen : t.fullscreen}><span aria-hidden="true">↗</span><b>{isFullscreen ? "×" : "⛶"}</b></button>
            <button type="button" onClick={resetView} aria-label={t.reset}>↻</button>
          </div>
        </header>

        <section className="animal-museum-viewer__info" aria-labelledby="animal-museum-title">
          <div className="animal-museum-viewer__info-brand"><span className="animal-museum-viewer__leaf">◒</span><strong>{t.museum}</strong><span>· XXF</span></div>
          <p className="animal-museum-viewer__eyebrow">{t.meet} <i>|</i> {copy(selected.groupLabel, locale)} {t.dinosaur}</p>
          <h1 id="animal-museum-title">{copy(selected.name, locale)}</h1>
          <p className="animal-museum-viewer__field-note"><span aria-hidden="true">◉</span>{copy(selected.facts[0], locale)}</p>
          <div className="animal-museum-viewer__actions">
            <button type="button" className="is-primary" onClick={listen}><span aria-hidden="true">◖</span>{t.listen}</button>
            <button type="button" onClick={() => setGuideOpen(!guideOpen)}><span aria-hidden="true">▱</span>{guideOpen ? t.close : t.guide}</button>
          </div>
          {guideOpen && <div className="animal-museum-viewer__guide"><strong>{t.guideTitle}</strong><p>{copy(selected.facts[0], locale)}</p><p>{copy(selected.facts[1], locale)}</p></div>}
          <button className="animal-museum-viewer__back" type="button" onClick={() => document.getElementById("animal-collection")?.scrollIntoView({ behavior: "smooth" })}><span aria-hidden="true">▦</span>{t.backMuseum}</button>
        </section>

        <div className="animal-museum-viewer__model-stage" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onWheel={onWheel} role="region" aria-label={`${copy(selected.name, locale)} ${showModel ? t.modelView : t.sceneView}`}>
          <div className="animal-museum-viewer__model-glow" aria-hidden="true" />
          {showModel && <Image className="animal-museum-viewer__model" src="/animal/stegosaurus.webp" alt="3D-style Stegosaurus museum specimen" width={720} height={469} style={modelStyle} priority />}
          {!showModel && <div className="animal-museum-viewer__scene-tag"><span>{t.sceneView}</span><strong>{selected.glyph}</strong></div>}
          <span className="animal-museum-viewer__hint">{t.rotate}</span>
        </div>

        <div className="animal-museum-viewer__side-controls" aria-label="Exhibit controls">
          <button type="button" onClick={resetView} aria-label={t.reset}>⌂</button>
          <button type="button" onClick={() => setZoom((value) => Math.min(1.25, value + .08))} aria-label="Zoom in">＋</button>
          <button type="button" onClick={() => setZoom((value) => Math.max(.82, value - .08))} aria-label="Zoom out">−</button>
        </div>

        <section className="animal-museum-viewer__carousel" id="animal-collection" aria-label={t.exhibits}>
          <button type="button" className="animal-museum-viewer__carousel-arrow" onClick={() => { const index = Math.max(0, filteredExhibits.findIndex((item) => item.id === selected.id) - 1); selectExhibit(filteredExhibits[index].id); }} aria-label={t.previous}>‹</button>
          <div className="animal-museum-viewer__carousel-list">
            {filteredExhibits.map((exhibit, index) => <button type="button" key={exhibit.id} className={`animal-museum-viewer__carousel-item ${selected.id === exhibit.id ? "is-selected" : ""}`} onClick={() => selectExhibit(exhibit.id)} aria-pressed={selected.id === exhibit.id}>
              <span className="animal-museum-viewer__thumb" style={{ "--thumb-color": exhibit.color } as CSSProperties}><span>{exhibit.glyph}</span></span>
              <strong>{copy(exhibit.name, locale)}</strong><small>{String(index + 1).padStart(2, "0")}</small>
            </button>)}
          </div>
          <button type="button" className="animal-museum-viewer__carousel-arrow" onClick={() => { const index = (filteredExhibits.findIndex((item) => item.id === selected.id) + 1) % filteredExhibits.length; selectExhibit(filteredExhibits[index].id); }} aria-label={t.next}>›</button>
        </section>
      </div>
    </main>
  );
}

