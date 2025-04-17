"use client";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

interface MenuItem {
  title: string;
  url: string;
}

interface Navbar1Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
    };
  };
}

const Navbar1 = ({
  logo = {
    url: "/",
    src: "/logo.png",
    alt: "logo",
    title: "OTPMaya",
  },
  menu = [
    { title: "Home", url: "/" },
    { title: "Pricing", url: "/pricing" },
  ],
  auth = {
    login: { text: "Log in", url: "/login" },
    signup: { text: "Sign up", url: "/signup" },
  },
}: Navbar1Props) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <section className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2 bg-background/80 backdrop-blur-lg shadow-md' : 'py-3'}`}>
      <div className="container px-4 mx-auto">
        <nav className="hidden justify-between lg:flex h-10">
          <div className="flex items-center gap-6">
            <a href={logo.url} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-lg font-semibold">{logo.title}</span>
            </a>
            <div className="flex items-center gap-4">
              {menu.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                >
                  {item.title}
                </a>
              ))}
              <SignedIn>
                <a
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                >
                  Dashboard
                </a>
              </SignedIn>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <SignedOut>
              <Button asChild variant="outline" size="sm" className="hover:bg-primary/10 text-primary">
                <SignInButton />
              </Button>
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <SignUpButton />
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </nav>
        <div className="block lg:hidden">
          <div className="flex items-center justify-between h-10">
            <a href={logo.url} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-lg font-semibold">{logo.title}</span>
            </a>
            <div className="flex items-center gap-3">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <div className="hidden sm:block">
                  <Button asChild variant="outline" size="sm" className="hover:bg-primary/10 text-primary mr-2">
                    <SignInButton />
                  </Button>
                </div>
              </SignedOut>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-muted transition-colors">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>
                      <a href={logo.url} className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {logo.title}
                        </span>
                      </a>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="my-6 flex flex-col gap-4">
                    {menu.map((item) => (
                      <a
                        key={item.title}
                        href={item.url}
                        className="py-2 font-semibold hover:text-primary transition-colors"
                      >
                        {item.title}
                      </a>
                    ))}
                    <SignedIn>
                      <a
                        href="/dashboard"
                        className="py-2 font-semibold hover:text-primary transition-colors"
                      >
                        Dashboard
                      </a>
                    </SignedIn>
                    <div className="flex flex-col gap-3">
                      <SignedOut>
                        <Button asChild variant="outline" className="hover:bg-primary/10 text-primary">
                          <SignInButton />
                        </Button>
                        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                          <SignUpButton />
                        </Button>
                      </SignedOut>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Navbar1 };
