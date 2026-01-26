"use client";
import Container from "./Container";
import Link from "next/link";
import { House, BadgePlus, User, Settings, MessageCircleCode } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

const navigationItems = [
    {
        id: 1,
        icon: House,
        href: "/",
    },
    {
        id: 2,
        icon: BadgePlus,
        href: "/create-post",
    },
    {
        id: 3,
        icon: User,
        href: "/user",
    },
    {
        id: 4,
        icon: Settings,
        href: "/setting",
    },
    {
        id: 5,
        icon: MessageCircleCode,
        href: "/chat",
    },
    {
        id: 6,
        icon: Settings,
        href: "/setting",
    },
];

const Navbar = () => {
    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <NavigationMenu className="bg-background/80 backdrop-blur-md border rounded-2xl shadow-2xl p-2">
                <NavigationMenuList className="flex justify-between gap-2">
                    {navigationItems.map(({ id, icon: Icon, href }) => (
                        <NavigationMenuItem key={id}>
                            <NavigationMenuLink asChild>
                                <Link href={href} className="flex items-center justify-center h-12 w-14 rounded-xl hover:bg-muted transition [&_svg]:h-7! [&_svg]:w-7!">
                                    <Icon />
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
        </nav>
    );
};

export default Navbar;
