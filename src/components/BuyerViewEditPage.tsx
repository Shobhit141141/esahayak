"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, Title, Button, Group, Loader, Text, Divider, Table, Badge, CopyButton, ActionIcon, Modal, Collapse, Stack, Avatar } from "@mantine/core";
import { toast } from "react-toastify";
import { MdPerson, MdPhone, MdLocationCity, MdHome, MdAttachMoney, MdAccessTime, MdSource, MdNotes, MdTag, MdExpandLess, MdExpandMore, MdAdd, MdEdit } from "react-icons/md";
import { timelineToLabel } from "../utils/map";
import LeadForm from "./LeadForm";
import { LuCopy, LuCopyCheck } from "react-icons/lu";

function FieldItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number | null | undefined }) {
  if (!value) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(String(value));
    toast.success(`${label} copied!`);
  };

  return (
    <Group justify="apart" mb="sm">
      <Group gap="xs" color="violet">
        {icon}
        <Text size="sm">
          <strong className="text-violet-400">{label}:</strong> {value}
        </Text>
      </Group>
      <CopyButton value={String(value)} timeout={1000}>
        {({ copied, copy }) => (
          <ActionIcon color={copied ? "teal" : "gray"} variant="subtle" onClick={copy}>
            {copied ? <LuCopyCheck size={16} /> : <LuCopy size={16} />}
          </ActionIcon>
        )}
      </CopyButton>
    </Group>
  );
}

export default function BuyerViewEditPage() {
  const { id } = useParams();
  const [buyer, setBuyer] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchBuyer = async () => {
    setLoading(true);
    fetch(`/api/buyers/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch buyer data");
        }
        return res.json();
      })
      .then((data) => {
        setBuyer(data.buyer);
        setForm(data.buyer);
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching buyer:", error);
        toast.error("Failed to load buyer data");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) {
      fetchBuyer();
    }
  }, [id]);

  if (loading || !form)
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <Loader size="md" />
      </div>
    );

  console.debug("Rendering BuyerViewEditPage with buyer:", JSON.stringify(buyer) === JSON.stringify(form) ? "No changes" : "Has changes");

  return (
    <Card shadow="sm" padding="lg" radius="md" style={{ maxWidth: 800, margin: "2rem auto" }}>
      <Group justify="apart" mb="md">
        <Title order={2}>Buyer Details</Title>
        <Button
          onClick={() => {
            if (isEditing) {
              if (JSON.stringify(form) !== JSON.stringify(buyer)) {
                setShowConfirm(true);
              } else {
                setIsEditing(false);
                fetchBuyer();
              }
            } else {
              setIsEditing(true);
            }
          }}
          disabled={saving}
          color="violet"
        >
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </Group>

      {!isEditing ? (
        <>
          {/* Profile Avatar */}
          <Group mb="md" align="center">
            <Avatar size={60} radius={30} color="violet" variant="light">
              {buyer.fullName.slice(0, 2).toUpperCase()}
            </Avatar>
            <Title order={3}>{buyer.fullName}</Title>
          </Group>

          {/* Fields */}
          <FieldItem icon={<MdPerson />} label="Email" value={buyer.email} />
          <FieldItem icon={<MdPhone />} label="Phone" value={buyer.phone} />
          <FieldItem icon={<MdLocationCity />} label="City" value={buyer.city} />
          <FieldItem icon={<MdHome />} label="Property Type" value={buyer.propertyType} />
          {buyer.bhk && <FieldItem icon={<MdHome />} label="BHK" value={buyer.bhk} />}
          <FieldItem icon={<MdAttachMoney />} label="Budget" value={`${buyer.budgetMin || ""} - ${buyer.budgetMax || ""}`} />
          <FieldItem icon={<MdAccessTime />} label="Timeline" value={timelineToLabel(buyer.timeline)} />
          <FieldItem icon={<MdSource />} label="Source" value={buyer.source} />
          <FieldItem icon={<MdNotes />} label="Notes" value={buyer.notes} />

          {/* Tags */}
          <div>
            <Group gap="xs" align="center" mb="md">
              <MdTag size={18} />
              <Text size="sm" w={500}>
                Tags:
              </Text>
              {buyer.tags?.length > 0 ? (
                <Group gap="xs">
                  {buyer.tags.map((tag: string, i: number) => (
                    <Badge key={i} color="violet" variant="light" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              ) : (
                <Text size="sm" color="dimmed">
                  No tags
                </Text>
              )}
            </Group>
          </div>
        </>
      ) : (
        <LeadForm
          mode="edit"
          initialData={form}
          onSave={() => {
            setIsEditing(false);
            fetchBuyer();
          }}
        />
      )}

      {!isEditing && (
        <>
          <Divider my="lg" label="Last 5 Changes History" labelPosition="center" />

          {history.length === 0 ? (
            <Card withBorder p="xl" radius="md" className="text-center">
              <Text c="dimmed" size="lg">
                No history found
              </Text>
              <Text c="dimmed" size="sm" mt="xs">
                Changes will appear here once edits are made
              </Text>
            </Card>
          ) : (
            <Stack gap="md">
              {history.map((h, i) => {
                const changes = Object.entries(h.diff || {}).filter(([field, change]: any) => field !== "updatedAt" && change.old !== undefined && change.new !== undefined);
                const isCreated = changes.length === 0;

                return (
                  <Card key={i} withBorder radius="md" p="lg" className="relative">
                    {/* Header */}
                    <Group justify="space-between" mb="md">
                      <Group>
                        <Avatar size="sm" radius="xl" color="green" variant="light">
                          {isCreated ? <MdAdd size={16} /> : <MdEdit size={16} />}
                        </Avatar>
                        <div>
                          <Text fw={500} size="sm">
                            {isCreated ? "Lead Created" : `${changes.length} field${changes.length > 1 ? "s" : ""} updated`}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {new Date(h.changedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </div>
                      </Group>

                      <Group>
                        <Group gap="xs">
                          <Avatar size="sm" radius="xl" color="grape">
                            <MdPerson size={12} />
                          </Avatar>
                          <Text size="sm" c="dimmed">
                            {h.changedByUser?.name || h.changedBy}
                          </Text>
                        </Group>

                        {!isCreated && (
                          <ActionIcon variant="subtle" size="sm" onClick={() => setExpanded(!expanded)}>
                            {expanded ? <MdExpandLess /> : <MdExpandMore />}
                          </ActionIcon>
                        )}
                      </Group>
                    </Group>

                    {/* Quick preview for collapsed state */}
                    {!isCreated && !expanded && (
                      <Group gap="xs" mb="sm">
                        {changes.slice(0, 3).map(([field]) => (
                          <Badge key={field} variant="light" size="xs" color="blue">
                            {field}
                          </Badge>
                        ))}
                        {changes.length > 3 && (
                          <Badge variant="light" size="xs" color="gray">
                            +{changes.length - 3} more
                          </Badge>
                        )}
                      </Group>
                    )}

                    {/* Detailed changes */}
                    <Collapse in={isCreated || expanded}>
                      {isCreated ? (
                        <Card withBorder radius="sm" p="md">
                          <Group>
                            <Text size="sm" fw={500}>
                              Initial lead creation
                            </Text>
                          </Group>
                        </Card>
                      ) : (
                        <Stack gap="md">
                          {changes.map(([field, change], index) => (
                            <div key={field}>
                              {index > 0 && <Divider my="xs" />}

                              <div className="space-y-3">
                                <Text fw={500} size="sm" tt="capitalize" c="blue.7">
                                  {field}
                                </Text>

                                {field === "tags" ? (
                                  <div className="space-y-2">
                                    {/* Old tags */}
                                    <div>
                                      <Text size="xs" c="dimmed" mb={4}>
                                        Before:
                                      </Text>
                                      <Group gap="xs">
                                        {(change as { old: string[]; new: string[] }).old?.length > 0 ? (
                                          (change as { old: string[]; new: string[] }).old.map((tag: string, i: number) => (
                                            <Badge key={i} color="violet" variant="light" size="sm">
                                              {tag}
                                            </Badge>
                                          ))
                                        ) : (
                                          <Text size="sm" c="dimmed" fs="italic">
                                            No tags
                                          </Text>
                                        )}
                                      </Group>
                                    </div>

                                    {/* New tags */}
                                    <div>
                                      <Text size="xs" c="dimmed" mb={4}>
                                        After:
                                      </Text>
                                      <Group gap="xs">
                                        {(change as { old: string[]; new: string[] }).new?.length > 0 ? (
                                          (change as { old: string[]; new: string[] }).new.map((tag: string, i: number) => (
                                            <Badge key={i} color="violet" variant="light" size="sm">
                                              {tag}
                                            </Badge>
                                          ))
                                        ) : (
                                          <Text size="sm" c="dimmed" fs="italic">
                                            No tags
                                          </Text>
                                        )}
                                      </Group>
                                    </div>
                                  </div>
                                ) : field === "notes" ? (
                                  <div className="space-y-2">
                                    <div>
                                      <Text size="xs" c="dimmed" mb={4}>
                                        Before:
                                      </Text>
                                      <div className="px-4 py-2 rounded">
                                        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                                          {(change as { old: string; new: string }).old || "Empty"}
                                        </Text>
                                      </div>
                                    </div>

                                    <div>
                                      <Text size="xs" c="dimmed" mb={4}>
                                        After:
                                      </Text>
                                      <div className="px-4 py-2 rounded">
                                        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                                          {(change as { old: string; new: string }).new || "Empty"}
                                        </Text>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <Card withBorder radius="sm" p="sm" className="flex-1">
                                      <Text size="sm" fw={500}>
                                        {(change as { old: string | number; new: string | number }).old}
                                      </Text>
                                    </Card>

                                    <Text size="xl" c="dimmed">
                                      →
                                    </Text>

                                    <Card withBorder radius="sm" p="sm" className="flex-1">
                                      <Text size="sm" fw={500}>
                                        {(change as { old: string | number; new: string | number }).new}
                                      </Text>
                                    </Card>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </Stack>
                      )}
                    </Collapse>
                  </Card>
                );
              })}
            </Stack>
          )}
        </>
      )}
      <Modal opened={showConfirm} onClose={() => setShowConfirm(false)} title="Discard Changes?" centered>
        <Text>You have unsaved changes. Do you really want to cancel?</Text>
        <Group justify="right" mt="md">
          <Button variant="default" onClick={() => setShowConfirm(false)}>
            Keep Editing
          </Button>
          <Button
            color="red"
            onClick={async () => {
              setShowConfirm(false);
              setIsEditing(false);
              setLoading(true);
              const res = await fetch(`/api/buyers/${id}`);
              const data = await res.json();
              setBuyer(data.buyer);
              setForm(data.buyer);
              setHistory(data.history || []);
              setLoading(false);
            }}
          >
            Discard Changes
          </Button>
        </Group>
      </Modal>
    </Card>
  );
}
