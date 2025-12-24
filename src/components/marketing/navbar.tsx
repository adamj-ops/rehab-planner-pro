"use client";
import React, { useState } from "react";
import { Logo } from "./logo";
import { Container } from "./container";
import Link from "next/link";
import { MarketingButton } from "./marketing-button";
import { IconLayoutSidebar, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";

const navlinks = [
  {
    title: "Features",
    href: "#features",
  },
  {
    title: "Pricing",
    href: "#pricing",
  },
  {
    title: "FAQs",
    href: "#faqs",
  },
];

export const Navbar = () => {
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800">
      <DesktopNavbar />
      <MobileNavbar />
    </div>
  );
};

export const MobileNavbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex md:hidden px-4 py-2 justify-between relative">
      <Logo />
      <button onClick={() => setOpen(!open)}>
        <IconLayoutSidebar className="size-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              backdropFilter: "blur(15px)",
            }}
            exit={{
              opacity: 0,
              backdropFilter: "blur(0px)",
            }}
            transition={{
              duration: 0.2,
            }}
            className="fixed inset-0 h-full w-full z-50 px-4 py-1.5 flex flex-col justify-between bg-background/80"
          >
            <div>
              <div className="flex justify-between">
                <Logo />
                <button onClick={() => setOpen(false)}>
                  <IconX />
                </button>
              </div>

              <div className="flex flex-col gap-6 my-10">
                {navlinks.map((item, index) => (
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: -4,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.1,
                    }}
                    key={index + item.title}
                  >
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="text-2xl text-neutral-600 dark:text-neutral-400 font-medium"
                    >
                      {item.title}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-end gap-4 pb-4">
                <Link
                  href="/login"
                  className="text-sm px-4 inline-block py-2 rounded-md text-neutral-600 dark:text-neutral-400 font-medium"
                >
                  Sign In
                </Link>
                <MarketingButton asChild>
                  <Link href="/signup">Get Started</Link>
                </MarketingButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DesktopNavbar = () => {
  return (
    <Container className="py-4 items-center justify-between hidden lg:flex">
      <Logo />
      <div className="flex items-center gap-10">
        {navlinks.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="text-sm text-neutral-600 dark:text-neutral-400 font-medium hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {item.title}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm px-4 inline-block py-2 rounded-md text-neutral-600 dark:text-neutral-400 font-medium hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          Sign In
        </Link>
        <MarketingButton asChild>
          <Link href="/signup">Get Started</Link>
        </MarketingButton>
      </div>
    </Container>
  );
};

