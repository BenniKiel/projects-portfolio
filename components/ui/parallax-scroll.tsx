"use client";
import { useScroll, useTransform, motion, MotionValue, useSpring, useMotionValue } from "framer-motion";
import { useRef, useState, MouseEvent } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BackgroundBeams } from "@/components/ui/background-beams";

export interface ParallaxItemType {
  title: string;
  description: string;
  image?: string;
  video?: string;
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
    <div className={cn("w-full h-full relative bg-neutral-950", className)}>
      <BackgroundBeams />
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll overflow-x-hidden scroll-smooth relative z-10 bg-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-40">
          <div className="mb-16 relative">
             <h1 className="text-5xl font-bold text-white tracking-tight">
              Projects Lab
            </h1>
            <p className="text-neutral-300 mt-6 max-w-2xl text-xl leading-relaxed">
              Eine kuratierte Sammlung technischer Experimente. 
              <br />
              <span className="text-sm opacity-70">WebGL • C++ • WASM • Creative Coding</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start perspective-1000">
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
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial="initial"
      whileHover="hover"
      className="group/card relative h-[30rem] md:h-[35rem] w-full rounded-3xl"
      style={{
        perspective: "1000px",
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full w-full rounded-3xl bg-neutral-900 border border-white/10 shadow-xl transition-all duration-200 ease-linear"
      >
        {/* --- Hintergrund Ebene (Bild/Video) --- */}
        <div 
            className="absolute inset-0 h-full w-full rounded-3xl overflow-hidden"
            style={{ transform: "translateZ(0px)" }} // Basis-Ebene
        >
            {item.placeholderColor && (
                 <div className={cn("absolute inset-0 z-0 opacity-50", item.placeholderColor)} />
            )}
            
            {item.video ? (
                <video
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={item.image} 
                >
                    <source src={item.video} type="video/mp4" />
                </video>
            ) : item.image && (
                <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    unoptimized={item.image.endsWith(".gif")}
                    className="object-cover transition duration-700 ease-in-out group-hover/card:scale-105"
                />
            )}
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover/card:bg-black/20 transition-colors duration-500" />
        </div>

        {/* --- 3D Floating Ebene: Glass Panel --- */}
        {/* translateZ(60px) for depth */}
        <div 
            className="absolute bottom-0 w-full p-6 z-20"
            style={{ transform: "translateZ(60px)" }}
        >
            <Link href={item.href} className="block">
                <div className="
                    backdrop-blur-md 
                    bg-black/60 
                    border border-white/10 
                    rounded-2xl 
                    p-5
                    shadow-2xl
                    flex flex-col gap-2
                ">
                     <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/10">
                            {item.icon}
                        </div>
                        <h3 className="font-bold text-2xl text-white tracking-tight drop-shadow-md">
                            {item.title}
                        </h3>
                    </div>
                    
                    <p className="text-neutral-300 text-sm leading-relaxed line-clamp-3 drop-shadow-sm">
                        {item.description}
                    </p>
                    
                    <div 
                        className="mt-4 flex items-center text-sm font-bold text-blue-400 opacity-0 -translate-x-4 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-300"
                    >
                        Explore Project <span className="ml-2">→</span>
                    </div>
                </div>
            </Link>
        </div>

        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none z-30 bg-gradient-to-br from-white/10 to-transparent" style={{ transform: "translateZ(50px)" }} />
        
      </motion.div>
    </motion.div>
  );
};