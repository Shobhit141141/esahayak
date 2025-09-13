import { useEffect, useState } from "react";
import { Card, Title, Button, Group, Loader, Text, Avatar } from "@mantine/core";
import Image from "next/image";

export default function HomeUsersLogin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);
  const handleLogin = async (user: any) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json();
      if (data.token) {
        import("js-cookie").then((Cookies) => {
          Cookies.default.set("token", data.token);
          window.location.href = "/buyers";
        });
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("Login error");
    }
  };
  return (
    <Card shadow="sm" padding="lg" radius="md" style={{ minWidth: 300, maxWidth: 400 }}>
      <Group justify="center" mb="md">
        <Image src="/db.png" alt="DB" width={64} height={64} />
      </Group>
      <Title order={3} mb="md">
        Login as User
      </Title>
      {loading ? (
        <Loader />
      ) : (
        <Group flex="column" gap="sm">
          {users.map((user) => (
            <Button
              key={user.id}
              fullWidth
              variant="light"
              onClick={() => handleLogin(user)}
              leftSection={
                <Avatar radius="xl" size={24}>
                  {user.name[0]}
                </Avatar>
              }
            >
              <Group justify="space-between" w="100%">
                <Text>{user.name}</Text>
                <Text size="xs" color="dimmed">
                  {user.role}
                </Text>
              </Group>
            </Button>
          ))}
        </Group>
      )}
    </Card>
  );
}
