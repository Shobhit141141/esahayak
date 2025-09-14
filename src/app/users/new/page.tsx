"use client";
import UserForm from "../../../components/UserForm";
import { useUser } from "../../../context/UserContext";
import { Button, Card, Text, Title } from "@mantine/core";

export default function NewUserPage() {
  const { user, users } = useUser();
  if (users.length !== 0 && user?.role !== "ADMIN") {
    return (
      <div className="pt-20 flex justify-center">
        <Card shadow="sm" p="xl" radius="md" mt={40} mx="auto" maw={400}>
          <Title order={3} mb="md">
            Access Denied
          </Title>
          <Text>You do not have permission to create new users.</Text>

          <Button variant="light" mt="md" onClick={() => window.history.back()} leftSection={<span>←</span>}>
            Go Back to home page
          </Button>
        </Card>
      </div>
    );
  }
  return (
    <div className="pt-20 ">
      <UserForm />
    </div>
  );
}
