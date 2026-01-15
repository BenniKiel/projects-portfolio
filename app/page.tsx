import React from "react";
import { ParallaxScrollGallery, ParallaxItemType } from "@/components/ui/parallax-scroll";
import {
  IconBox,
  IconBrain,
  IconBrush,
  IconDeviceGamepad2,
  IconEye,
  IconRoute,
} from "@tabler/icons-react";

export default function Dashboard() {
  return (
    <ParallaxScrollGallery 
      items={items} 
      className="bg-neutral-50 dark:bg-neutral-950" 
    />
  );
}


const items: ParallaxItemType[] = [
  {
    title: "Doom Style Raycaster",
    description: "Eine 3D-Engine von Grund auf in reines JavaScript implementiert. Raycasting-Algorithmus ohne WebGL-Abhängigkeit.",
    video: "/projects/rochen.mp4",
    placeholderColor: "from-red-500 to-orange-600",
    icon: <IconEye className="h-5 w-5 text-neutral-500" />,
    href: "/projects/raycaster",
  },
  {
    title: "C++ / WASM Rasterizer",
    description: "High-Performance Grafik-Pipeline. C++ Code via Emscripten zu WebAssembly kompiliert für native Geschwindigkeit im Browser.",
    video: "/projects/bridge.mp4",
    placeholderColor: "from-green-500 to-emerald-600",
    icon: <IconBox className="h-5 w-5 text-neutral-500" />,
    href: "/projects/rasterizer",
  },
  {
    title: "p5.js Tetris",
    description: "Der Game-Klassiker, neu interpretiert mit p5.js. Fokus auf sauberes, objektorientiertes Design und State Management.",
    video: "/projects/fog_valley.mp4",
    placeholderColor: "from-blue-500 to-indigo-600",
    icon: <IconDeviceGamepad2 className="h-5 w-5 text-neutral-500" />,
    href: "/projects/tetris",
  },
  {
    title: "Spline Creator Tool",
    description: "Interaktives Mathe-Tool zur Berechnung und Visualisierung von Bézier- und B-Spline-Kurven mit Kontrollpunkten.",
    video: "/projects/coast.mp4",
    placeholderColor: "from-purple-500 to-pink-600",
    icon: <IconRoute className="h-5 w-5 text-neutral-500" />,
    href: "/projects/splines",
  },
  {
    title: "Logic Gate Simulator",
    description: "Visueller Simulator für digitale Logik. Baue Schaltungen aus AND, OR, NOT Gattern und beobachte den Signalfluss.",
    video: "/projects/cloud_valley.mp4",
    placeholderColor: "from-yellow-500 to-amber-600",
    icon: <IconBrain className="h-5 w-5 text-neutral-500" />,
    href: "/projects/logic-sim",
  },
  {
    title: "Digital Marbeling (Suminagashi)",
    description: "Physik-Simulation von Flüssigkeitsdynamik und Farbmischung auf einer Wasseroberfläche als generative Kunst.",
    video: "/projects/sunset_skyline.mp4",
    placeholderColor: "from-cyan-500 to-teal-600",
    icon: <IconBrush className="h-5 w-5 text-neutral-500" />,
    href: "/projects/marbeling",
  },
];