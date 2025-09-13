"use client";
import { useState, useEffect } from "react";
import { Group, Avatar, Menu, Button, Divider, Text } from "@mantine/core";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function SelectedUserDisplay() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;
    try {
      const [id, role] = Buffer.from(token, "base64").toString().split(":");
      fetch(`/api/users?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.users && data.users.length > 0) {
            setUser(data.users[0]);
          }
        });
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => setUsers(data.users || []));
    } catch {}
  }, []);

  if (!user) return null;

  return (
    <Menu shadow="md" width={240} opened={opened} onChange={setOpened}>
      <Menu.Target>
        <Button variant="subtle" style={{ padding: 0, background: "none" }}>
          <Group gap="xs">
            <Avatar radius="xl" size={30}>
              {user.name[0]}
            </Avatar>
            <div className="flex flex-col" style={{ textAlign: "left" }}>
              <Text size="sm">{user.name}</Text>
              <Text size="xs" color="dimmed">
                {user.role}
              </Text>
            </div>
          </Group>
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {users.filter((u) => u.id !== user.id).length === 0 ? (
          <Menu.Item disabled>No other users</Menu.Item>
        ) : (
          users
            .filter((u) => u.id !== user.id)
            .map((u) => (
              <Menu.Item
                key={u.id}
                onClick={() => {
                  Cookies.set("token", Buffer.from(`${u.id}:${u.role}`).toString("base64"));
                  window.location.reload();
                }}
              >
                <Group gap="xs">
                  <Avatar radius="xl" size={24}>
                    {u.name[0]}
                  </Avatar>
                  <div className="flex flex-col" style={{ textAlign: "left" }}>
                    <Text size="sm">{u.name}</Text>
                    <Text size="xs" color="dimmed">
                      {u.role}
                    </Text>
                  </div>
                </Group>
              </Menu.Item>
            ))
        )}
        <Divider my="xs" />
        <Menu.Item color="blue" onClick={() => (router.push('/users/new'))}>
          <p className="text-sm">Create New User</p>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
