import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";

const products: { title: string; href: string; description: string }[] = [
  {
    title: "Proteína",
    href: "",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Creatina",
    href: "",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Fat-Burner",
    href: "",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Aminoácido",
    href: "",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Vitamina",
    href: "",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Mineral",
    href: "",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

export default function Navbar() {
  return (
    <nav className="raleway w-full bg-white shadow-sm">
      <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="logo">
          <Link to={"/"} className="text-3xl font-bold">
            BIONUTREX
          </Link>
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="cursor-pointer ">
                Item One
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {products.map((component) => (
                    <ListItem
                      key={component.title}
                      title={component.title}
                      href={component.href}
                    >
                      {component.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

export { Navbar };
