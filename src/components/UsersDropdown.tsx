"use client";
import { useEffect, useState } from "react";
import { Menu, Button, Group, Text } from "@mantine/core";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

export default function UsersDropdown() {
  const {users} = useUser();
  return (
    <Menu shadow="md" width={260}>
      <Menu.Target>
        <Button variant="subtle">Users</Button>
      </Menu.Target>
      <Menu.Dropdown>
        {users.length === 0 ? (
          <Menu.Item disabled>No users</Menu.Item>
        ) : (
          users.map((user) => (
            <Menu.Item key={user.id} component={Link} href={`/users/${user.id}`}>
              <Group justify="space-between">
                <Text>{user.name}</Text>
                <Text size="xs" color="dimmed">
                  {user.role}
                </Text>
              </Group>
            </Menu.Item>
          ))
        )}
        <Menu.Divider />
        <Menu.Item component={Link} href="/users/new" color="blue">
          <Group justify="space-between">
            <Text>Create New User</Text>
            <Text size="xs" color="blue">
              +
            </Text>
          </Group>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
