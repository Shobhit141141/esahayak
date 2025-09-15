"use client";
import { useState } from "react";
import { Group, Avatar, Menu, Button, Divider, Text } from "@mantine/core";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { IoAddCircle } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import { useUser } from "@/context/UserContext";
import { BiChevronDown } from "react-icons/bi";

export default function SelectedUserDisplay() {
  const router = useRouter();

  const [opened, setOpened] = useState(false);

  const { user, users, loading } = useUser();

  return (
    <Menu shadow="md" width={240} opened={opened} onChange={setOpened}>
      <Menu.Target>
        <Button variant="subtle" style={{ padding: 0, background: "none" }}>
          <Group gap="xs">
            <Avatar radius="xl" size={30} variant="filled" color="violet">
              {user?.name ? user.name.charAt(0).toUpperCase() : "NA"}
            </Avatar>

            <div className="flex flex-col" style={{ textAlign: "left" }}>
              <Text size="sm">{loading ? "user" : user?.name || "none"}</Text>
              <Text size="xs" color="dimmed">
                {loading ? "Loading..." : user?.role || "none"}
              </Text>
            </div>

            <BiChevronDown />
          </Group>
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {users.length === 0 ? (
          <Menu.Item disabled>No other users</Menu.Item>
        ) : (
          users.map((u) => (
            <Menu.Item
              key={u.id}
              onClick={() => {
                Object.keys(Cookies.get()).forEach((key) => {
                  Cookies.remove(key);
                });
                Cookies.set("token", Buffer.from(`${u.id}:${u.role}`).toString("base64"));
                window.location.reload();
              }}
            >
              <Group gap="xs">
                <Avatar radius="xl" variant="filled" size={24} color="violet">
                  {u.name ? u.name.charAt(0).toUpperCase() : "N"}
                </Avatar>

                <div className="flex flex-col" style={{ textAlign: "left" }}>
                  <Text size="sm">{u.name}</Text>
                  <Text size="xs" color="dimmed">
                    {u.role}
                  </Text>
                </div>
                {user?.id === u.id && <FaCheckCircle color="green" title="Selected" />}
              </Group>
            </Menu.Item>
          ))
        )}
        <Divider my="xs" />
        <Menu.Item color="blue" onClick={() => router.push("/users/new")}>
          <p className="text-sm flex ">
            <IoAddCircle className="inline-block mr-1 text-lg" />
            Create New User
          </p>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
