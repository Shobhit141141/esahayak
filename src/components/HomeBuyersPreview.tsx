import { useEffect, useState } from "react";
import { Table, Button, Group, Loader, Title, Text } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function HomeBuyersPreview() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/buyers?page=1&pageSize=5")
      .then((res) => res.json())
      .then((data) => {
        setBuyers(data.buyers || []);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ marginTop: 32 }}>
      <Title order={3} mb="sm">
        Recent Leads
      </Title>
      {loading ? (
        <Loader />
      ) : buyers.length === 0 ? (
        <Text>No leads found.</Text>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Phone</Table.Th>
              <Table.Th>City</Table.Th>
              <Table.Th>Property Type</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Updated At</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {buyers.map((buyer) => (
              <Table.Tr key={buyer.id}>
                <Table.Td>{buyer.fullName}</Table.Td>
                <Table.Td>{buyer.phone}</Table.Td>
                <Table.Td>{buyer.city}</Table.Td>
                <Table.Td>{buyer.propertyType}</Table.Td>
                <Table.Td>{buyer.status}</Table.Td>
                <Table.Td>{new Date(buyer.updatedAt).toLocaleString()}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      <Group justify="flex-end" mt="md">
        <Button onClick={() => router.push("/buyers")} variant="filled" color="violet">
          View All Leads
        </Button>
      </Group>
    </div>
  );
}
