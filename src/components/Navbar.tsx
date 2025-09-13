'use client';
import Link from "next/link";
import { Group, Button } from "@mantine/core";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { DarkModeSwitch } from "react-toggle-dark-mode";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/buyers/new", label: "Create Lead" },
];

export default function Navbar() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <div className="w-full flex items-center justify-between px-8 py-4 shadow-md">
      <div style={{ fontWeight: 700, fontSize: 20 }}>E-Sahayak</div>
      <Group>
        {navLinks.map((link) => (
          <Button key={link.href} component={Link} href={link.href} variant="subtle">
            {link.label}
          </Button>
        ))}
       <DarkModeSwitch
         checked={computedColorScheme === "dark"}
         onChange={() => setColorScheme(computedColorScheme === "light" ? "dark" : "light")}

         size={20}
       
       />
      </Group>
    </div>
  );
}
