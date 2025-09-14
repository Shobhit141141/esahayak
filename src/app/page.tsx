"use client";
import { TextInput } from "@mantine/core";
import HomeUsersLogin from "../components/HomeUsersLogin";
import { useState } from "react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <>
      <HomeUsersLogin />
    </>
  );
}
