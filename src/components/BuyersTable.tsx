"use client";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { Table, TextInput, Select, Button, Group, Pagination, Loader, Badge, Text } from "@mantine/core";
import { useState as useReactState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CITY_OPTIONS, PROPERTY_TYPE_OPTIONS, TIMELINE_OPTIONS } from "../utils/leadOptions";
import { MdClear } from "react-icons/md";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { bhkToLabel, timelineToLabel } from "../utils/map";
import BuyersImportExport from "./BuyersImportExport";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { fields } from "@hookform/resolvers/ajv/src/__tests__/__fixtures__/data.js";
import AuthBoundary from "./AuthBoundary";

const STATUS_OPTIONS = [
  { value: "New", label: "New" },
  { value: "Qualified", label: "Qualified" },
  { value: "Contacted", label: "Contacted" },
  { value: "Visited", label: "Visited" },
  { value: "Negotiation", label: "Negotiation" },
  { value: "Converted", label: "Converted" },
  { value: "Dropped", label: "Dropped" },
];

const PAGE_SIZE = 10;

type Buyer = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  propertyType: string;
  budgetMin?: number;
  budgetMax?: number;
  bhk?: string;
  timeline: string;
  status: string;
  updatedAt: string;
};

export default function BuyersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    propertyType: searchParams.get("propertyType") || "",
    status: searchParams.get("status") || "",
    timeline: searchParams.get("timeline") || "",
    search: searchParams.get("search") || "",
  });
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState(filters.search);
  const [sort, setSort] = useState<{ field: string | null; direction: "asc" | "desc" | null }>({
    field: "updatedAt",
    direction: "desc",
  });

  useEffect(() => {
    const params = new URLSearchParams({ ...filters, page: String(page) });
    router.replace(`/buyers?${params.toString()}`);
  }, [filters, page]);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/buyers?${new URLSearchParams({ ...filters, page: String(page), pageSize: String(pageSize) })}`);
      const data = await res.json();
      setBuyers(data.buyers || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching buyers:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setLoading(true);
    fetchBuyers();
  }, [filters, page, pageSize]);

  const sortedBuyers = [...buyers].sort((a, b) => {
    const { field, direction } = sort;
    let aValue: string | number = "";
    let bValue: string | number = "";
    if (field === "budget") {
      aValue = a.budgetMin ?? 0;
      bValue = b.budgetMin ?? 0;
    } else if (field === "bhk") {
      const bhkOrder: Record<string, number> = {
        Studio: 0,
        STUDIO: 0,
        "1": 1,
        ONE: 1,
        "2": 2,
        TWO: 2,
        "3": 3,
        THREE: 3,
        "4": 4,
        FOUR: 4,
      };
      aValue = bhkOrder[String(a.bhk).toUpperCase()] ?? -1;
      bValue = bhkOrder[String(b.bhk).toUpperCase()] ?? -1;
    } else if (field === "updatedAt") {
      aValue = new Date(a.updatedAt).getTime();
      bValue = new Date(b.updatedAt).getTime();
    } else if (field) {
      aValue = (a as any)[field] ?? "";
      bValue = (b as any)[field] ?? "";
    } else {
      aValue = "";
      bValue = "";
    }
    if (typeof aValue === "string" && typeof bValue === "string") {
      return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const handleSort = (field: string) => {
    setSort((prev) => {
      if (prev.field !== field) {
        return { field, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { field, direction: "desc" };
      }
      if (prev.direction === "desc") {
        return { field: null, direction: null };
      }
      return { field, direction: "asc" };
    });
  };

  const statusColors: Record<string, string> = {
    New: "pink",
    Qualified: "blue",
    Contacted: "cyan",
    Visited: "yellow",
    Negotiation: "orange",
    Converted: "green",
    Dropped: "red",
  };
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      search: filters.search,
    },
  });

  const { userId: loggedInUserId, user, token } = useUser();
  const [statusUpdating, setStatusUpdating] = useReactState<string | null>(null);
  const handleStatusChange = async (buyerId: string, newStatus: string) => {
    setStatusUpdating(buyerId);
    try {
      const res = await fetch(`/api/buyers/${buyerId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success("Status updated");
      } else {
        toast.error("Error updating status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    } finally {
      setStatusUpdating(null);
    }
    setLoading(true);
    fetch(`/api/buyers?${new URLSearchParams({ ...filters, page: String(page), pageSize: String(pageSize) })}`)
      .then((res) => res.json())
      .then((data) => {
        setBuyers(data.buyers || []);
        setTotal(data.total || 0);
        setLoading(false);
      });
  };

   if (!token) {
      return (
       <AuthBoundary loading={loading} />
      );
    }

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-full">
  //       <Loader size="md" />
  //     </div>
  //   );
  // }

  // if (!loading && buyers.length === 0) {
  //   return (
  //     <div className="flex items-center justify-center h-full">
  //       <p>No buyers found 😔</p>
  //     </div>
  //   );
  // }

  return (
    <div className="">
      <Group mb="md" gap="md" wrap="wrap" align="end">
        <form onSubmit={handleSubmit((data) => setFilters((f) => ({ ...f, search: data.search })))} className="flex flex-row items-end gap-2">
          <Controller
            name="search"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextInput
                label="Search"
                placeholder="Name, Phone, Email"
                {...field}
                variant="filled"
                rightSection={<MdClear className="cursor-pointer" onClick={() => field.onChange("")} size={16} />}
              />
            )}
          />
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <Button type="submit" disabled={!field.value.trim()}>
                Search
              </Button>
            )}
          />
        </form>

        <Select
          label="City"
          placeholder="Select city"
          data={CITY_OPTIONS}
          value={filters.city}
          onChange={(v) => setFilters((f) => ({ ...f, city: v || "" }))}
          clearable
          variant="filled"
        />
        <Select
          label="Property Type"
          placeholder="Select property type"
          data={PROPERTY_TYPE_OPTIONS}
          value={filters.propertyType}
          onChange={(v) => setFilters((f) => ({ ...f, propertyType: v || "" }))}
          variant="filled"
          clearable
        />
        <Select
          label="Status"
          placeholder="Select status"
          data={STATUS_OPTIONS}
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v || "" }))}
          variant="filled"
          clearable
        />
        <Select
          label="Timeline"
          placeholder="Select timeline"
          data={TIMELINE_OPTIONS}
          value={filters.timeline}
          onChange={(v) => setFilters((f) => ({ ...f, timeline: v || "" }))}
          variant="filled"
          clearable
        />

        <Button
          onClick={() => {
            setFilters({ city: "", propertyType: "", status: "", timeline: "", search: "" });
            reset();
          }}
          variant="light"
          color="red"
          leftSection={<MdClear size={14} />}
          disabled={!filters.city && !filters.propertyType && !filters.status && !filters.timeline}
        >
          Clear Filters
        </Button>
        <BuyersImportExport filters={{ ...filters, pageSize }} onImport={fetchBuyers} />
      </Group>
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader size="md" />
        </div>
      ) : buyers.length === 0 ? (
        <div className="flex justify-center py-10">
          <p>No buyers found 😔</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                {[
                  { key: "id", label: "ID" },
                  { key: "fullName", label: "Name" },
                  { key: "phone", label: "Phone" },
                  { key: "city", label: "City" },
                  { key: "propertyType", label: "Property Type" },
                  { key: "bhk", label: "BHK" },
                  { key: "budget", label: "Budget" },
                  { key: "timeline", label: "Timeline" },
                  { key: "status", label: "Status" },
                  { key: "updatedAt", label: "Updated At" },
                ].map((col) => (
                  <Table.Th key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: "pointer" }} className="select-none">
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {col.label}
                      {sort.field === col.key ? sort.direction === "asc" ? <FaSortUp /> : <FaSortDown /> : <FaSort />}
                    </div>
                  </Table.Th>
                ))}
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedBuyers.map((buyer: any, index: number) => (
                <Table.Tr key={buyer.id}>
                  <Table.Td>{index}</Table.Td>
                  <Table.Td>{buyer.fullName}</Table.Td>
                  <Table.Td>{buyer.phone}</Table.Td>
                  <Table.Td>{buyer.city}</Table.Td>
                  <Table.Td>{buyer.propertyType}</Table.Td>
                  <Table.Td>{buyer.bhk ? bhkToLabel(buyer.bhk) : "-"}</Table.Td>
                  <Table.Td>
                    ₹ {buyer.budgetMin}–{buyer.budgetMax}
                  </Table.Td>
                  <Table.Td>{timelineToLabel(buyer.timeline)}</Table.Td>
                  <Table.Td>
                    <Badge color={statusColors[buyer.status]}>{buyer.status}</Badge>
                    {( user?.role === "ADMIN" || buyer.creatorId === loggedInUserId) && (
                      <Select
                        value={buyer.status}
                        data={STATUS_OPTIONS}
                        onChange={(v) => v && handleStatusChange(buyer.id, v)}
                        disabled={statusUpdating === buyer.id}
                        size="xs"
                        style={{ minWidth: 120 }}
                        variant="filled"
                        pt={"sm"}
                      />
                    )}
                  </Table.Td>
                  <Table.Td>{new Date(buyer.updatedAt).toLocaleString()}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button size="xs" variant="filled" color="violet" component="a" href={`/buyers/${buyer.id}`}>
                        {(buyer.creatorId == loggedInUserId || user?.role === "ADMIN" )? "View / Edit" : "View"}
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}
      <div className="w-full flex flex-row items-end justify-between mt-4 px-4 space-y-2 md:space-y-0 fixed bottom-2 left-0 py-2 shadow-md">
        <Pagination value={page} onChange={setPage} total={Math.ceil(total / pageSize)} />
        <Select
          label="Page Size"
          data={[
            { value: "5", label: "5" },
            { value: "10", label: "10" },
            { value: "20", label: "20" },
            { value: "50", label: "50" },
          ]}
          value={String(pageSize)}
          variant="filled"
          onChange={(v) => setPageSize(Number(v))}
        />
      </div>
    </div>
  );
}
