import { useRef, useState } from "react";
import { Button, Group, Table, Text, FileInput, Modal, Loader } from "@mantine/core";
import Papa from "papaparse";
import { leadFormSchema } from "../utils/leadFormSchema";
import { CITY_OPTIONS, PROPERTY_TYPE_OPTIONS, PURPOSE_OPTIONS, TIMELINE_OPTIONS, SOURCE_OPTIONS, BHK_OPTIONS } from "../utils/leadOptions";
import { TbFileExport, TbFileImport, TbFileTypeCsv } from "react-icons/tb";
import { PiExportBold } from "react-icons/pi";
import { BiExport, BiImport } from "react-icons/bi";
import { FaFileCsv } from "react-icons/fa6";

const HEADERS = ["fullName", "email", "phone", "city", "propertyType", "bhk", "purpose", "budgetMin", "budgetMax", "timeline", "source", "notes", "tags", "status"];

function transformRow(row: any) {
  return {
    ...row,
    budgetMin: row.budgetMin ? Number(row.budgetMin) : undefined,
    budgetMax: row.budgetMax ? Number(row.budgetMax) : undefined,
    tags: row.tags
      ? String(row.tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
  };
}

function validateRow(row: any, idx: number) {
  const cityValues = CITY_OPTIONS.map((o) => o.value);
  const propertyTypeValues = PROPERTY_TYPE_OPTIONS.map((o) => o.value);
  const purposeValues = PURPOSE_OPTIONS.map((o) => o.value);
  const timelineValues = TIMELINE_OPTIONS.map((o) => o.value);
  const sourceValues = SOURCE_OPTIONS.map((o) => o.value);
  const bhkValues = BHK_OPTIONS.map((o) => o.value);
  const statusValues = ["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"];

  const transformed = transformRow(row);

  if (!cityValues.includes(transformed.city)) return `Row ${idx + 1}: Unknown city`;
  if (!propertyTypeValues.includes(transformed.propertyType)) return `Row ${idx + 1}: Unknown propertyType`;
  if (transformed.bhk && !bhkValues.includes(transformed.bhk)) return `Row ${idx + 1}: Unknown bhk`;
  if (!purposeValues.includes(transformed.purpose)) return `Row ${idx + 1}: Unknown purpose`;
  if (!timelineValues.includes(transformed.timeline)) return `Row ${idx + 1}: Unknown timeline`;
  if (!sourceValues.includes(transformed.source)) return `Row ${idx + 1}: Unknown source`;
  if (!statusValues.includes(transformed.status)) return `Row ${idx + 1}: Unknown status`;

  const result = leadFormSchema.safeParse(transformed);
  if (!result.success) return `Row ${idx + 1}: ${result.error.issues.map((e) => e.message).join(", ")}`;
  return null;
}

export default function BuyersImportExport({ filters }: { filters: any }) {
  const [importModal, setImportModal] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const res = await fetch(`/api/buyers?${new URLSearchParams({ ...filters, page: "1", pageSize: "1000" })}`);
    const data = await res.json();
    const buyers = data.buyers || [];
    const csv = Papa.unparse(buyers, { columns: HEADERS });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buyers.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    setImportLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        if (rows.length > 200) {
          setImportErrors(["Max 200 rows allowed"]);
          setImportLoading(false);
          return;
        }
        const errors: string[] = [];
        const validRows: any[] = [];
        rows.forEach((row, idx) => {
          const err = validateRow(row, idx);
          if (err) errors.push(err);
          else validRows.push(transformRow(row));
        });
        setImportErrors(errors);
        if (validRows.length > 0) {
          const res = await fetch("/api/buyers/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyers: validRows }),
          });
          if (!res.ok) errors.push("Server error during import");
        }
        setImportLoading(false);
      },
    });
  };

  return (
    <Group gap="md">
      <Button onClick={handleExport} variant="light" color="violet" leftSection={<BiExport size={16} />}>
        Export CSV
      </Button>
      <Button onClick={() => setImportModal(true)} variant="light" color="blue" leftSection={<BiImport size={16} />}>
        Import CSV
      </Button>
      <Modal opened={importModal} onClose={() => {
        
        setImportModal(false);
        setImportErrors([]);

      }} title="Import Buyers CSV" size="lg" centered>
        <FileInput label="CSV File" accept=".csv" placeholder="Upload CSV file" onChange={handleImport} disabled={importLoading} leftSection={<FaFileCsv size={16} />} />
        {!importLoading && <div className="w-full flex justify-center h-[50px]">
          <Loader mt="md" />
          </div>}
        {importErrors.length > 0 && (
          <Table mt="md" striped withTableBorder highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Row Error</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {importErrors.map((err, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{err}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Modal>
    </Group>
  );
}
