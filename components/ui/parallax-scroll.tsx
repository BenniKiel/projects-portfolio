"use client";
import { useScroll, useTransform, motion, MotionValue, useSpring, useMotionValue } from "framer-motion";
import { useRef, MouseEvent } from "react";
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

  // Desktop Parallax values
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  const splitItems = (items: any[], numCols: number) => {
    const cols: any[][] = Array.from({ length: numCols }, () => []);
    items.forEach((item, i) => cols[i % numCols].push(item));
    return cols;
  };

  const [col1, col2, col3] = splitItems(items, 3);
  const [tabletCol1, tabletCol2] = splitItems(items, 2);

  return (
    <div className={cn("w-full h-full relative bg-neutral-950", className)}>
      <BackgroundBeams />
      
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll overflow-x-hidden scroll-smooth relative z-10 bg-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-20 md:pt-32 pb-40">
          <div className="mb-10 md:mb-16 relative">
             <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Projects Lab
            </h1>
            <p className="text-neutral-300 mt-4 md:mt-6 max-w-2xl text-lg md:text-xl leading-relaxed">
              Eine kuratierte Sammlung technischer Experimente. 
              <br />
              <span className="text-sm opacity-70">WebGL • C++ • WASM • Creative Coding</span>
            </p>
          </div>
          
          {/* MOBILE VIEW */}
          <div className="flex flex-col gap-8 md:hidden">
            {items.map((item, idx) => (
              <ProjectCard key={idx} item={item} isMobile={true} />
            ))}
          </div>

          {/* TABLET VIEW */}
          <div className="hidden md:grid lg:hidden grid-cols-2 gap-8 items-start perspective-1000">
            <Column items={tabletCol1} y={y1} />
            <Column items={tabletCol2} y={y2} />
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden lg:grid grid-cols-3 gap-8 items-start perspective-1000">
            <Column items={col1} y={y1} />
            <Column items={col2} y={y2} />
            <Column items={col3} y={y3} />
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
        <ProjectCard key={idx} item={item} isMobile={false} />
      ))}
    </motion.div>
  );
};

const ProjectCard = ({ item, isMobile }: { item: ParallaxItemType, isMobile: boolean }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    
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
    if (isMobile) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial="initial"
      whileHover="hover"
      className="group/card relative h-96 md:h-[30rem] lg:h-[35rem] w-full rounded-3xl"
      style={{
        perspective: isMobile ? "none" : "1000px",
      }}
    >
      <motion.div
        style={{
          rotateX: isMobile ? 0 : rotateX,
          rotateY: isMobile ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full w-full rounded-3xl bg-neutral-900 border border-white/10 shadow-xl transition-all duration-200 ease-linear"
      >
        {/* Background Layer */}
        <div 
            className="absolute inset-0 h-full w-full rounded-3xl overflow-hidden"
            style={{ transform: "translateZ(0px)" }}
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
            <div className="absolute inset-0 bg-black/40 group-hover/card:bg-black/20 transition-colors duration-500" />
        </div>

        {/* Glow Effekt Layer for Desktop */}
        {!isMobile && (
          <div 
            className="absolute inset-0 rounded-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none z-30" 
            style={{ 
              transform: "translateZ(40px)",
              background: "linear-gradient(115deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)"
            }} 
          />
        )}

        {/* Content Layer (Glass) */}
        <div 
            className="absolute bottom-0 w-full p-4 md:p-6 z-20"
            style={{ transform: isMobile ? "translateZ(0px)" : "translateZ(60px)" }}
        >
            <Link href={item.href} className="block">
                <div className="
                    backdrop-blur-md 
                    bg-black/60 
                    border border-white/10 
                    rounded-2xl 
                    p-4 md:p-5
                    shadow-2xl
                    flex flex-col gap-2
                ">
                     <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/10">
                            {item.icon}
                        </div>
                        <h3 className="font-bold text-xl md:text-2xl text-white tracking-tight drop-shadow-md">
                            {item.title}
                        </h3>
                    </div>
                    
                    <p className="text-neutral-300 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-3 drop-shadow-sm">
                        {item.description}
                    </p>
                    
                    <div 
                        className="
                            mt-2 md:mt-4 
                            flex items-center text-sm font-bold text-blue-400 
                            opacity-100 translate-x-0 
                            md:opacity-0 md:-translate-x-4 
                            md:group-hover/card:opacity-100 md:group-hover/card:translate-x-0 
                            transition-all duration-300
                        "
                    >
                        Explore Project <span className="ml-2">→</span>
                    </div>
                </div>
            </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};