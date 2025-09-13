"use client";
import { Container, Title, Text } from "@mantine/core";
import { ActionIcon, Button, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { BsFillSunFill as IconSun } from "react-icons/bs";
import { HiOutlineMoon as IconMoon } from "react-icons/hi";
import { toast } from "react-toastify";
import HomeBuyersPreview from "../components/HomeBuyersPreview";
import HomeUsersLogin from "../components/HomeUsersLogin";

export default function Home() {
  const { setColorScheme, clearColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <Container size="xl" py="xl">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 350 }}>
          <Title order={1} mb="md">
            Welcome to E-Sahayak
          </Title>
          <Text mb="md">Your platform for managing property leads and buyers.</Text>
          <Text>Use the navigation bar above to create a new lead or explore features.</Text>
          <HomeBuyersPreview />
        </div>
        <div style={{ flex: "0 0 400px", minWidth: 300 }}>
          <HomeUsersLogin />
        </div>
      </div>
    </Container>
  );
}
