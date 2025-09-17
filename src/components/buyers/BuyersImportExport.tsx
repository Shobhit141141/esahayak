import { useState } from "react";
import {
  Button,
  Group,
  Table,
  FileInput,
  Modal,
  Loader,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import Papa from "papaparse";
import { leadFormSchema } from "../../utils/leadFormSchema";
import {
  CITY_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  PURPOSE_OPTIONS,
  TIMELINE_OPTIONS,
  SOURCE_OPTIONS,
  BHK_OPTIONS,
} from "../../utils/leadOptions";
import { BiDownload, BiExport, BiImport } from "react-icons/bi";
import { FaFileCsv } from "react-icons/fa6";
import { toast } from "react-toastify";

const HEADERS = [
  "fullName",
  "email",
  "phone",
  "city",
  "propertyType",
  "bhk",
  "purpose",
  "budgetMin",
  "budgetMax",
  "timeline",
  "source",
  "notes",
  "tags",
  "status",
];

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
  const statusValues = [
    "New",
    "Qualified",
    "Contacted",
    "Visited",
    "Negotiation",
    "Converted",
    "Dropped",
  ];

  const transformed = transformRow(row);

  if (!cityValues.includes(transformed.city))
    return `Row ${idx + 1}: Unknown city ${transformed.city}`;
  if (!propertyTypeValues.includes(transformed.propertyType))
    return `Row ${idx + 1}: Unknown propertyType ${transformed.propertyType}`;
  if (transformed.bhk && !bhkValues.includes(transformed.bhk))
    return `Row ${idx + 1}: Unknown bhk ${transformed.bhk}`;
  if (!purposeValues.includes(transformed.purpose))
    return `Row ${idx + 1}: Unknown purpose ${transformed.purpose}`;
  if (!timelineValues.includes(transformed.timeline))
    return `Row ${idx + 1}: Unknown timeline ${transformed.timeline}`;
  if (!sourceValues.includes(transformed.source))
    return `Row ${idx + 1}: Unknown source ${transformed.source}`;
  if (!statusValues.includes(transformed.status))
    return `Row ${idx + 1}: Unknown status ${transformed.status}`;

  // Check for problematic characters in notes
  if (typeof transformed.notes === "string" && /,|"/.test(transformed.notes))
    return `Row ${idx + 1}: Notes contain comma or quote which may distort CSV`;

  if (
    typeof row.tags === "string" &&
    row.tags.trim() !== "" &&
    !/^\s*\[.*\]\s*$/.test(row.tags)
  ) {
    return `Row ${idx + 1}: Tags should be a JSON array, e.g. ["family","follow-up"]`;
  }
  if (
    typeof row.tags === "string" &&
    row.tags.trim() !== ""
  ) {
    try {
      const parsedTags = JSON.parse(row.tags);
      if (!Array.isArray(parsedTags)) {
        return `Row ${idx + 1}: Tags should be a JSON array, e.g. ["family","follow-up"]`;
      }
    } catch {
      return `Row ${idx + 1}: Tags should be a valid JSON array, e.g. ["family","follow-up"]`;
    }
  }

  const result = leadFormSchema.safeParse(transformed);
  if (!result.success)
    return `Row ${idx + 1}: ${result.error.issues
      .map((e) => e.message)
      .join(", ")}`;
  return null;
}

export default function BuyersImportExport({
  filters,
  onImport,
}: {
  filters: any;
  onImport: () => void;
}) {
  const [importModal, setImportModal] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importLoading, setImportLoading] = useState(false);

  const handleExport = async () => {
    const res = await fetch(
      `/api/buyers?${new URLSearchParams({
        ...filters,
        page: "1",
        pageSize: "1000",
      })}`
    );
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
          try {
            const res = await fetch("/api/buyers/import", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ buyers: validRows }),
            });

            if (!res.ok) {
              errors.push("Server error during import");
            }
          } catch (e) {
            errors.push("Network or server error during import");
          }
        }
        if (validRows.length === rows.length && errors.length === 0) {
          toast.success("All leads imported successfully");
          setImportModal(false);
        } else if (validRows.length > 0 && errors.length > 0) {
          toast.warning(
            `${validRows.length} leads imported, ${errors.length} failed`
          );
        } else {
          toast.error("Import failed. No leads were added.");
        }
        onImport();
        setImportLoading(false);
      },
    });
  };

  return (
    <Group gap="md">
      <Button
        onClick={handleExport}
        variant="filled"
        color="violet"
        leftSection={<BiExport size={16} />}
      >
        Export CSV
      </Button>
      <Button
        onClick={() => setImportModal(true)}
        variant="filled"
        color="blue"
        leftSection={<BiImport size={16} />}
      >
        Import CSV
      </Button>
      <Tooltip label="Download sample CSV" withArrow>
        <ActionIcon
          variant="filled"
          color="blue"
          onClick={() => {
            const sampleCsc = "/buyers-data.csv";
            const a = document.createElement("a");
            a.href = sampleCsc;
            a.download = "buyers-data.csv";
            a.click();
          }}
          size="lg"
        >
          <BiDownload />
        </ActionIcon>
      </Tooltip>
      <Modal
        opened={importModal}
        onClose={() => {
          setImportModal(false);
          setImportErrors([]);
        }}
        title="Import Buyers CSV"
        size="lg"
        centered
      >
        <FileInput
          label="CSV File"
          accept=".csv"
          placeholder="Upload CSV file"
          onChange={handleImport}
          disabled={importLoading}
          leftSection={<FaFileCsv size={16} />}
        />
        {importLoading && (
          <div className="w-full flex justify-center h-[50px]">
            <Loader mt="md" />
          </div>
        )}
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
