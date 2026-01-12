"use client";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BackgroundBeams } from "@/components/ui/background-beams";

export interface ParallaxItemType {
  title: string;
  description: string;
  image?: string; // Für JPG, PNG, GIF
  video?: string; // NEU: Für MP4, WebM
  placeholderColor?: string;
  icon?: React.ReactNode;
  href: string;
}

export const ParallaxScrollGallery = ({
  items,
  className,
}: {
  items: ParallaxItemType[];
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  const splitItems = (items: any[], numCols: number) => {
    const cols: any[][] = Array.from({ length: numCols }, () => []);
    items.forEach((item, i) => cols[i % numCols].push(item));
    return cols;
  };

  const [col1, col2, col3] = splitItems(items, 3);

  return (
    // WRAPPER: Dieser hält Hintergrund und Scrollbereich zusammen
    <div className={cn("w-full h-full relative bg-neutral-950", className)}>
      
      {/* 1. LAYER: Die Background Beams (Fixiert) */}
      <BackgroundBeams />

      {/* 2. LAYER: Der Scrollbare Inhalt */}
      {/* WICHTIG: 'bg-transparent' und 'relative z-10', damit wir durchsehen können */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll overflow-x-hidden scroll-smooth relative z-10 bg-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-40">
          
          <div className="mb-16 relative"> {/* relative für z-index sicherheit */}
             <h1 className="text-5xl font-bold text-white tracking-tight"> {/* Farbe auf reines Weiß gezwungen */}
              Projects Lab
            </h1>
            <p className="text-neutral-300 mt-6 max-w-2xl text-xl leading-relaxed">
              Eine kuratierte Sammlung technischer Experimente. 
              <br />
              <span className="text-sm opacity-70">WebGL • C++ • WASM • Creative Coding</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            <Column items={col1} y={y1} />
            <Column items={col2} y={y2} className="hidden md:flex" />
            <Column items={col3} y={y3} className="hidden lg:flex" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Column = ({
  items,
  y,
  className,
}: {
  items: ParallaxItemType[];
  y: MotionValue<number>;
  className?: string;
}) => {
  return (
    <motion.div style={{ y }} className={cn("flex flex-col gap-8", className)}>
      {items.map((item, idx) => (
        <ProjectCard key={idx} item={item} />
      ))}
    </motion.div>
  );
};

const ProjectCard = ({ item }: { item: ParallaxItemType }) => {
  return (
    <Link
      href={item.href}
      className="group/card relative flex flex-col h-[30rem] md:h-[35rem] w-full rounded-3xl overflow-hidden hover:shadow-2xl transition duration-500 transform"
    >
      {/* Hintergrund Container */}
      <div className={cn("absolute inset-0 h-full w-full z-0", item.placeholderColor)}>
        
        {/* FALL 1: VIDEO (Hat Vorrang, wenn angegeben) */}
        {item.video ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            // Poster ist das Vorschaubild, falls Video lädt (optional, nutzen wir item.image dafür)
            poster={item.image} 
          >
            <source src={item.video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          /* FALL 2: BILD / GIF */
          item.image && (
            <Image
              src={item.image}
              alt={item.title}
              fill
              // unoptimized ist wichtig für animierte GIFs, damit Next.js sie nicht einfriert!
              unoptimized={item.image.endsWith(".gif")}
              className="object-cover group-hover/card:scale-110 transition duration-700 ease-in-out"
            />
          )
        )}

        {/* Leichter Gradient Overlay für Lesbarkeit */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* --- Inhalt (Glass Panel) bleibt gleich wie vorher --- */}
      <div className="relative z-10 mt-auto">
        <div className="
            backdrop-blur-xl 
            bg-white/10 dark:bg-black/40 
            border-t border-white/20 
            p-6 
            flex flex-col gap-2
            transition-all duration-300
            group-hover/card:bg-white/20 dark:group-hover/card:bg-black/60
        ">
            <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-full bg-white/10 text-white backdrop-blur-sm">
                    {item.icon}
                </div>
                <h3 className="font-bold text-2xl text-white tracking-tight">
                    {item.title}
                </h3>
            </div>
            <p className="text-neutral-200 text-sm leading-relaxed line-clamp-3">
                {item.description}
            </p>
            <div className="mt-4 flex items-center text-sm font-medium text-white/90 opacity-0 -translate-x-4 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-300">
                Explore Project <span className="ml-2">→</span>
            </div>
        </div>
      </div>
    </Link>
  );
};