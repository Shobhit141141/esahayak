"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@mantine/core";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import SelectedUserDisplay from "./User";
import { BiHome } from "react-icons/bi";
import { PiPlus } from "react-icons/pi";
import { WiMoonAltFirstQuarter } from "react-icons/wi";

const navLinks = [
  { href: "/", label: "Home", icon : <BiHome /> },
  { href: "/buyers/new", label: "Create Lead", icon : <PiPlus /> },
];

export default function Navbar() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark");

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === "dark" ? "light" : "dark");
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={`w-full shadow-md fixed top-0 z-50 backdrop-blur-lg`}>
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* logo */}
        <div className="font-bold text-xl">E-Sahayak</div>

        {/* mobile menu */}
        <div className="hidden md:flex items-center space-x-4">
          {navLinks.map((link) => (
            <Button key={link.href} component={Link} href={link.href} variant="subtle">
              {link.label}
            </Button>
          ))}
          <SelectedUserDisplay />
          
          <div className="ml-2" onClick={toggleColorScheme}>
            <WiMoonAltFirstQuarter size={26} />
          </div>
        </div>

        {/* icons */}
        <div className="flex items-center space-x-2 md:hidden">
          <SelectedUserDisplay />

          <DarkModeSwitch
            checked={colorScheme === "dark"}
            onChange={toggleColorScheme}
            size={20}
          />
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 dark:text-gray-200 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* nav links */}
      {isOpen && (
        <div className={`${colorScheme === "dark" ? "bg-gray-800" : "bg-white"} md:hidden px-4 pb-4 space-y-2`}>
          {navLinks.map((link) => (
            <Button key={link.href} component={Link} href={link.href} variant="subtle" fullWidth onClick={() => setIsOpen(false)}>
              {link.label}
            </Button>
          ))}
        </div>
      )}
    </nav>
  );
}
