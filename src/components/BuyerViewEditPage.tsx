"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import { useParams, useRouter } from "next/navigation";
import { Card, Title, Button, Group, Loader, Text, Divider, Badge, CopyButton, ActionIcon, Modal, Collapse, Stack, Avatar } from "@mantine/core";
import { toast } from "react-toastify";
import {
  MdPerson,
  MdPhone,
  MdLocationCity,
  MdHome,
  MdAttachMoney,
  MdAccessTime,
  MdSource,
  MdNotes,
  MdTag,
  MdExpandLess,
  MdExpandMore,
  MdAdd,
  MdEdit,
  MdCancel,
} from "react-icons/md";
import { bhkToLabel, timelineToLabel } from "../utils/map";
import { LeadForm, LeadFormRef } from "./LeadForm";
import { LuCopy, LuCopyCheck } from "react-icons/lu";
import { BiTrash } from "react-icons/bi";
import AuthBoundary from "./AuthBoundary";
import { FaUserGear } from "react-icons/fa6";

function FieldItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number | null | undefined }) {
  if (!value) return null;

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
  const { userId, user, token } = useUser();
  const { id } = useParams();
  const [buyer, setBuyer] = useState<any>(null);
  const [createdBy, setCreatedBy] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const leadFormRef = useRef<LeadFormRef>(null);
  if (!token) {
    return <AuthBoundary loading={loading} />;
  }

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
        if (data.buyer && data.buyer.updatedAt) {
          data.buyer.updatedAt = new Date(data.buyer.updatedAt);
        }

        setBuyer(data.buyer);
        setCreatedBy(data.createdBy);
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching buyer:", error);
        toast.error("Failed to load buyer data");
        setLoading(false);
      });
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/buyers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete buyer");
      }
      toast.success("Buyer deleted");
      router.push("/buyers");
    } catch (error) {
      toast.error("Failed to delete buyer");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBuyer();
    }
  }, [id]);

  const handleCancelClick = () => {
    if (leadFormRef.current?.isDirty) {
      setShowConfirm(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleDiscardChanges = () => {
    leadFormRef.current?.reset(buyer);
    setShowConfirm(false);
    setIsEditing(false);
  };

  if (loading || !buyer)
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

  const canEdit = buyer?.creatorId === userId || user?.role === "ADMIN";
  return (
    <Card className=" w-full max-w-2xl mx-auto p-6" mt={"100px"}>
      <div className="mb-6 flex items-center justify-between">
        {<Title order={2}>Buyer Details</Title>}
        <div className="flex gap-3">
          {canEdit && (
            <Button
              onClick={() => {
                if (isEditing) {
                  handleCancelClick();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={saving}
              color="violet"
              leftSection={isEditing ? <MdCancel size={18} /> : <MdEdit size={18} />}
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          )}

          {(user?.role === "ADMIN" || buyer.creatorId == userId) && (
            <Button
              size="sm"
              variant="filled"
              color="red"
              onClick={async () => {
                setShowDeleteConfirm(true);
              }}
              leftSection={<BiTrash size={18} />}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {!isEditing ? (
        <>
          <Group mb="md" align="center">
            <Avatar size={60} radius={30} color="violet" variant="light">
              {buyer.fullName.slice(0, 2).toUpperCase()}
            </Avatar>
            <Title order={3}>{buyer.fullName}</Title>
          </Group>

        <div className="flex justify-start items-center gap-2 mb-4">
          <p>Created By :</p>
            <div className="bg-orange-500/20 w-fit rounded-sm px-4 py-1 flex items-center gap-2"><FaUserGear size={18} /> {createdBy?.name}</div>
        </div>

          <FieldItem icon={<MdPerson />} label="Email" value={buyer.email} />
          <FieldItem icon={<MdPhone />} label="Phone" value={buyer.phone} />
          <FieldItem icon={<MdLocationCity />} label="City" value={buyer.city} />
          <FieldItem icon={<MdHome />} label="Property Type" value={buyer.propertyType} />
          {buyer.bhk && <FieldItem icon={<MdHome />} label="BHK" value={bhkToLabel(buyer.bhk)} />}
          <FieldItem icon={<MdAttachMoney />} label="Budget" value={`${buyer.budgetMin || ""} - ${buyer.budgetMax || ""}`} />
          <FieldItem icon={<MdAccessTime />} label="Timeline" value={timelineToLabel(buyer.timeline)} />
          <FieldItem icon={<MdSource />} label="Source" value={buyer.source} />
          <FieldItem icon={<MdNotes />} label="Notes" value={buyer.notes} />
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
          ref={leadFormRef}
          mode="edit"
          initialData={buyer}
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
              setHistory(data.history || []);
              setLoading(false);
            }}
          >
            Discard Changes
          </Button>
        </Group>
      </Modal>

      <Modal opened={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Buyer?" centered>
        <Text>Are you sure you want to delete this buyer?</Text>
        <Group justify="right" mt="md">
          <Button variant="default" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={async () => {
              // setLoading(true);
              await handleDelete();
              setShowDeleteConfirm(false);
            }}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </Card>
  );
}
