"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconDeviceGamepad2,
  IconCpu,
  IconPalette,
  IconUserBolt,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: (
        <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Games",
      href: "#",
      icon: (
        <IconDeviceGamepad2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Graphics / C++",
      href: "#",
      icon: (
        <IconCpu className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Creative Coding",
      href: "#",
      icon: (
        <IconPalette className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Back to Main Site",
      href: "https://benjamin-kiel.de",
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <div
      className={cn(
        // LAYOUT TRICK: 
        // 1. Hintergrundfarbe = Sidebar Farbe (neutral-800).
        // 2. h-screen sorgt für volle Höhe.
        "flex flex-col md:flex-row bg-neutral-100 dark:bg-neutral-800 w-full h-screen overflow-hidden"
      )}
    >
      {/* SIDEBAR WRAPPER (Overlay):
        Z-Index 50 sorgt dafür, dass sie über dem Content schwebt, wenn sie aufgeht.
        'absolute' sorgt dafür, dass sie den Content NICHT verschiebt -> Kein Ruckeln!
      */}
      <div className="hidden md:block absolute top-0 left-0 h-full z-50">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 bg-transparent">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>
            <div>
              <SidebarLink
                link={{
                  label: "Benjamin Kiel",
                  href: "https://benjamin-kiel.de",
                  icon: (
                    <div className="h-7 w-7 flex-shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center">
                       <IconUserBolt size={16} className="text-neutral-500"/>
                    </div>
                  ),
                }}
              />
            </div>
          </SidebarBody>
        </Sidebar>
      </div>

      {/* MOBILE SIDEBAR (Normaler Flow) */}
      <div className="md:hidden flex w-full bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-700">
         <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody>
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                   <Logo />
                   <div className="mt-8 flex flex-col gap-2">
                     {links.map((link, idx) => (
                       <SidebarLink key={idx} link={link} />
                     ))}
                   </div>
                </div>
            </SidebarBody>
         </Sidebar>
      </div>

      {/* MAIN CONTENT:
        1. md:pl-[60px]: Wir reservieren links Platz für die zugeklappte Sidebar.
        2. rounded-tl-3xl: Erzeugt die runde Ecke oben links.
        3. border: Erzeugt den feinen Rahmen.
        4. Das "Loch" der runden Ecke zeigt den grauen Hintergrund (neutral-800) von oben.
      */}
      <main className="flex-1 w-full h-full md:pl-[60px] relative z-10">
        <div className="w-full h-full bg-white dark:bg-neutral-950 rounded-tl-3xl border-l border-t border-neutral-200 dark:border-neutral-700 overflow-hidden relative shadow-2xl">
            {children}
        </div>
      </main>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Projects Lab
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};