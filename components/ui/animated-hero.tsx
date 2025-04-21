"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";
import { SignedIn, SignedOut, UserButton   } from "@clerk/nextjs";
function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["amazing", "new", "wonderful", "beautiful", "smart"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container px-4 mx-auto">
        <div className="flex gap-4 sm:gap-8 py-12 sm:py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-2 sm:gap-4 text-xs sm:text-sm">
              Read our launch article <MoveRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
          <div className="flex gap-3 sm:gap-4 flex-col">
            <h1 className="text-3xl sm:text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-spektr-cyan-50">This is something</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center px-2 sm:px-0">
              Managing a small business today is already tough. Avoid further
              complications by ditching outdated, tedious trade methods. Our
              goal is to streamline SMB trade, making it easier and faster than
              ever.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center items-center">
            <SignedOut>
              <Button asChild size="lg" className="gap-2 sm:gap-4 w-full sm:w-auto">
                <SignUpButton>
                  <span className="flex items-center gap-2">
                    Get Started <MoveRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </span>
                </SignUpButton>
              </Button>
            </SignedOut>

            <SignedIn>
            
              <UserButton />
            </SignedIn>
           
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
