import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/nav/mobile-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CartBadge } from "@/components/cart/cart-badge";
import { mainMenu, contentMenu } from "@/menu.config";
import { Section, Container } from "@/components/craft";
import { CartProvider } from "@/contexts/cart-context";

import Balancer from "react-wrap-balancer";
import Logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Metadata } from "next";

interface LayoutWrapperProps extends Metadata {
  children: React.ReactNode;
  isProxyAccess: boolean;
}
export function LayoutWrapper({ children, isProxyAccess, title, description }: LayoutWrapperProps) {
  const shouldHideLayout = isProxyAccess;

  return (
    <CartProvider>
      {!shouldHideLayout && <Nav title={title} />}
      {children}
      {!shouldHideLayout && <Footer title={title} description={description} />}
    </CartProvider>
  );
}

const Nav = ({ className, children, id, title, description }: { className?: string; children?: React.ReactNode; id?: string, title: Metadata['title'], description?: Metadata['description'] }) => {
  return (
    <nav
      className={cn("sticky z-50 top-0 bg-background", "border-b", className)}
      id={id}
    >
      <div
        id="nav-container"
        className="max-w-5xl mx-auto py-4 px-6 sm:px-8 flex justify-between items-center"
      >
        <Link
          className="hover:opacity-75 transition-all flex gap-4 items-center"
          href="/"
        >
          <Image
            src={Logo}
            alt="Logo"
            loading="eager"
            className="dark:invert"
            width={70}
          ></Image>
          <h2 className="text-sm" hidden>{title ?? ''}</h2>
        </Link>
        {children}
        <div className="flex items-center gap-2">
          <div className="mx-2 hidden md:flex">
            {Object.entries(mainMenu).map(([key, href]) => (
              <Button key={href} asChild variant="ghost" size="sm">
                <Link href={href}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Link>
              </Button>
            ))}
          </div>
          <CartBadge className="hidden md:flex" />
          <Button asChild className="hidden sm:flex">
            <Link href="https://github.com/9d8dev/next-wp">Get Started</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </nav>
  );
};

const Footer = ({description, title }: {description: Metadata['description'], title: Metadata['title']}) => {
  return (
    <footer>
      <Section>
        <Container className="grid md:grid-cols-[1.5fr_0.5fr_0.5fr] gap-12">
          <div className="flex flex-col gap-6 not-prose">
            <Link href="/">
              <h3 className="sr-only">{title ?? ''}</h3>
              <Image
                src={Logo}
                alt="Logo"
                className="dark:invert"
                width={70}
                height={26.44}
              ></Image>
            </Link>
            <p>
              <Balancer>
                <span dangerouslySetInnerHTML={{ __html: description ?? '' }}></span>
              </Balancer>
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h5 className="font-medium text-base">Website</h5>
            {Object.entries(mainMenu).map(([key, href]) => (
              <Link
                className="hover:underline underline-offset-4"
                key={href}
                href={href}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h5 className="font-medium text-base">Blog</h5>
            {Object.entries(contentMenu).map(([key, href]) => (
              <Link
                className="hover:underline underline-offset-4"
                key={href}
                href={href}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Link>
            ))}
          </div>
        </Container>
        <Container className="border-t not-prose flex flex-col md:flex-row md:gap-2 gap-6 justify-between md:items-center">
          <ThemeToggle />
          <p className="text-muted-foreground">
            &copy; <a href="https://9d8.dev">9d8</a>. All rights reserved.
            2025-present.
          </p>
        </Container>
      </Section>
    </footer>
  );
};
