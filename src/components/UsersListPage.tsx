"use client";
import { useEffect, useState } from "react";
import { Table, Loader, Title, Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function UsersListPage() {
  const router = useRouter();
  const { users, user, loading } = useUser();
  return (
    <div style={{ maxWidth: 700, margin: "2rem auto" }} className="pt-20">
      <Title order={2} mb="md">
        All Users
      </Title>
      {loading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>{user.name}</Table.Td>
                <Table.Td>{user.email}</Table.Td>
                <Table.Td>{user.role}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      <Button mt="lg" onClick={() => router.push("/users/new")}>
        Create New User
      </Button>
    </div>
  );
}
