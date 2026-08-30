import type { Metadata } from "next";
import { AnimalMuseum } from "@/components/AnimalMuseum";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Prehistoric Animal Museum — Interactive Natural History",
  description: "Explore 18 prehistoric animals in a calm, interactive browser museum with English and Simplified Chinese field notes.",
  keywords: ["prehistoric animal museum", "dinosaur museum online", "interactive dinosaur exhibit", "paleontology for kids", "史前动物博物馆", "恐龙博物馆"],
  alternates: { canonical: "/animal/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", locale: "en_US", siteName: "XXF Tools", url: "https://xxf.app/animal/", title: "Prehistoric Animal Museum — XXF", description: "A calm, interactive browser museum for exploring 18 prehistoric animals.", images: [{ url: "/animal/museum-bg.jpg", width: 1800, height: 1000, alt: "Prehistoric animal museum exhibit" }, { url: "/animal-museum-hero.jpg", width: 1536, height: 1024, alt: "Prehistoric animal museum diorama" }] },
  twitter: { card: "summary_large_image", title: "Prehistoric Animal Museum — XXF", description: "Explore 18 prehistoric animals in a calm browser museum.", images: ["/animal/museum-bg.jpg"] },
};

export default function AnimalPage() {
  const canonical = "https://xxf.app/animal/";
  const exhibits = ["Tyrannosaurus", "Triceratops", "Stegosaurus", "Velociraptor", "Brachiosaurus", "Ankylosaurus", "Pteranodon", "Archaeopteryx", "Quetzalcoatlus", "Microraptor", "Mosasaurus", "Ichthyosaurus", "Dunkleosteus", "Ammonite", "Plesiosaur", "Elasmosaurus", "Diplodocus", "Iguanodon"];
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: "Prehistoric Animal Museum", description: "A calm, interactive browser museum for exploring 18 prehistoric animals.", inLanguage: ["en", "zh-Hans"], isPartOf: { "@id": "https://xxf.app/#website" }, mainEntity: { "@id": `${canonical}#collection` } },
    { "@type": "CollectionPage", "@id": `${canonical}#collection`, url: canonical, name: "Prehistoric Animal Museum Collection", description: "Explore 18 prehistoric animals with short field notes and facts.", isAccessibleForFree: true, inLanguage: ["en", "zh-Hans"], image: ["https://xxf.app/animal/museum-bg.jpg", "https://xxf.app/animal-museum-hero.jpg"], publisher: { "@id": "https://xxf.app/#organization" }, mainEntity: { "@type": "ItemList", numberOfItems: exhibits.length, itemListElement: exhibits.map((name, index) => ({ "@type": "ListItem", position: index + 1, name })) } },
    { "@type": "Organization", "@id": "https://xxf.app/#organization", name: "XXF Tools", url: "https://xxf.app/", logo: { "@type": "ImageObject", url: "https://xxf.app/icon-512.png", width: 512, height: 512 } },
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><AnimalMuseum /></>;
}

