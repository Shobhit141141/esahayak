"use client";

import { useCallback, useState } from "react";
import { TextInput, Select, NumberInput, Textarea, Button, Group, Stack, Card, Divider, Title, Text, CloseButton } from "@mantine/core";
import { toast } from "react-toastify";
import { CITY_OPTIONS, PROPERTY_TYPE_OPTIONS, BHK_OPTIONS, PURPOSE_OPTIONS, TIMELINE_OPTIONS, SOURCE_OPTIONS } from "../utils/leadOptions";
import { faker } from "@faker-js/faker";
import { MdAutoFixNormal, MdClear } from "react-icons/md";
import { leadFormSchema, LeadFormSchemaType } from "../utils/leadFormSchema";
import { LeadFormType } from "@/types";

interface LeadFormProps {
  mode?: "create" | "edit";
  initialData?: LeadFormSchemaType & { id?: string };
  onSave?: (data: LeadFormSchemaType) => void;
}

export default function LeadForm({ mode = "create", initialData, onSave }: LeadFormProps) {
  const initialForm: LeadFormSchemaType = {
    fullName: "",
    email: "",
    phone: "",
    city: "",
    propertyType: "",
    bhk: "",
    purpose: "",
    budgetMin: undefined,
    budgetMax: undefined,
    timeline: "",
    source: "",
    notes: "",
    tags: [],
  };
  const [form, setForm] = useState<LeadFormSchemaType>(initialData || initialForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const handleChange = useCallback((field: keyof LeadFormSchemaType, value: any) => {
    setForm((prev) => {
      if (field === "propertyType" && value !== "Apartment" && value !== "Villa") {
        return { ...prev, [field]: value, bhk: null };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const validateForm = (data: LeadFormSchemaType) => {
    const result = leadFormSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.issues.forEach((err) => {
        if (typeof err.path[0] === "string") fieldErrors[err.path[0]] = err.message ?? "";
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    setLoading(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/buyers/new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Lead created successfully!");
          setForm(initialForm);
          setErrors({});
          if (onSave) onSave(form);
        } else {
          toast.error(data.error || "Failed to create lead");
        }
      } else {
        const payload = { ...form, bhk: form.bhk || null };
        const res = await fetch(`/api/buyers/${initialData?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Lead updated successfully!");
          if (onSave) onSave(form);
        } else {
          toast.error(data.error || "Failed to update lead");
        }
      }
    } catch (err) {
      toast.error("Server error");
    }
    setLoading(false);
  };

  const autofillForm = () => {
    const propertyType = faker.helpers.arrayElement(["Apartment", "Villa", "Plot", "Office", "Retail"]);
    const bhk = propertyType === "Apartment" || propertyType === "Villa" ? faker.helpers.arrayElement(["Studio", "1", "2", "3", "4"]) : "";
    const budgetMin = faker.number.int({ min: 1000000, max: 5000000 });
    const budgetMax = faker.number.int({ min: budgetMin, max: 20000000 });
    setForm({
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number().replace(/\D/g, "").slice(0, 10),
      city: faker.helpers.arrayElement(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
      propertyType,
      bhk,
      purpose: faker.helpers.arrayElement(["Buy", "Rent"]),
      budgetMin,
      budgetMax,
      timeline: faker.helpers.arrayElement(["0-3m", "3-6m", ">6m", "Exploring"]),
      source: faker.helpers.arrayElement(["Website", "Referral", "Walk-in", "Call", "Other"]),
      notes: faker.lorem.sentence(),
      tags: ["urgent", "follow-up", "premium", "budget", "investor"].filter(() => faker.datatype.boolean()),
    });
    setErrors({});
  };

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value.trim();
      if (e.key === " " && value) {
        if (value && !(form.tags ?? []).includes(value)) {
          const newTags = [...(form.tags ?? []), value];
          if (JSON.stringify(newTags) !== JSON.stringify(form.tags)) {
            handleChange("tags", newTags);
          }
        }

        setTagInput("");
        e.preventDefault();
      }
    },
    [form.tags, handleChange]
  );

  const handleTagBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      if (value && !(form.tags ?? []).includes(value)) {
        const newTags = [...(form.tags ?? []), value];
        if (JSON.stringify(newTags) !== JSON.stringify(form.tags)) {
          handleChange("tags", newTags);
        }
      }

      setTagInput("");
    },
    [form.tags, handleChange]
  );

  const removeTag = (index: number) => {
    const newTags = (form.tags ?? []).filter((_, i) => i !== index);
    if (JSON.stringify(newTags) !== JSON.stringify(form.tags)) {
      handleChange("tags", newTags);
    }
  };

  const clearForm = () => {
    setForm(initialForm);
    setErrors({});
  };

  const resetForm = () => {
    setForm(initialData || initialForm);
    setErrors({});
  };

  return (
    <div className="shadow-sm p-6 rounded-md bg-transparent w-full max-w-2xl mx-auto">
      <Title order={2} mb="md">
        {mode === "create" ? "Create New Lead" : "Edit Lead"}
      </Title>

      {/* buttons for accessibility */}
      <form onSubmit={handleSubmit} className="w-full">
        <Stack gap="md">
          <div className="flex items-baseline gap-2 w-full">
            {mode === "create" ? (
              <>
                <div className="flex flex-col items-start gap-2">
                  <Button type="button" color="blue" variant="light" onClick={autofillForm} leftSection={<MdAutoFixNormal size={16} />}>
                    Autofill with Fake Data
                  </Button>
                  <Text size="xs">For testing purposes only</Text>
                </div>
                <Button type="button" color="red" variant="light" leftSection={<MdClear size={16} />} onClick={clearForm}>
                  Clear Form
                </Button>
              </>
            ) : (
              <>
                <Button type="button" color="blue" variant="light" onClick={resetForm} leftSection={<MdAutoFixNormal size={16} />}>
                  Reset Form
                </Button>
              </>
            )}
          </div>
          {/* lead info */}
          <div className="flex gap-4 w-full">
            <TextInput
              label="Full Name"
              className="flex-1"
              placeholder="Enter full name"
              minLength={2}
              __clearable
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              variant="filled"
              error={errors.fullName ?? ""}
            />
            <TextInput
              label="Email"
              className="flex-1"
              placeholder="Enter email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              variant="filled"
              error={errors.email ?? ""}
            />
          </div>
          <TextInput
            label="Phone"
            placeholder="Enter phone number"
            className="w-1/2"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            variant="filled"
            error={errors.phone ?? ""}
          />
          {/* property details */}
          <Divider label="Property Details" labelPosition="center" my="sm" />
          <Group grow>
            <Select
              label="City"
              placeholder="Select city"
              data={CITY_OPTIONS}
              value={form.city || null}
              onChange={(v) => handleChange("city", v || "")}
              variant="filled"
              error={errors.city ?? ""}
            />
            <Select
              label="Property Type"
              placeholder="Select type"
              data={PROPERTY_TYPE_OPTIONS}
              value={form.propertyType || null}
              onChange={(v) => handleChange("propertyType", v || "")}
              variant="filled"
              error={errors.propertyType ?? ""}
            />
            {(form.propertyType === "Apartment" || form.propertyType === "Villa") && (
              <Select
                label="BHK"
                placeholder="Select BHK"
                data={BHK_OPTIONS}
                value={form.bhk || null}
                onChange={(v) => handleChange("bhk", v || "")}
                variant="filled"
                error={errors.bhk ?? ""}
              />
            )}
          </Group>
          {/* purpose and budget */}
          <Group grow>
            <Select
              label="Purpose"
              placeholder="Buy or Rent"
              data={PURPOSE_OPTIONS}
              value={form.purpose || null}
              onChange={(v) => handleChange("purpose", v || "")}
              variant="filled"
              error={errors.purpose ?? ""}
            />
            <NumberInput
              label="Budget Min (INR)"
              placeholder="Min budget"
              value={form.budgetMin}
              onChange={(v) => handleChange("budgetMin", v)}
              min={0}
              variant="filled"
              step={50000}
              max={form.budgetMax || undefined}
              error={errors.budgetMin ?? ""}
            />
            <NumberInput
              label="Budget Max (INR)"
              placeholder="Max budget"
              value={form.budgetMax}
              onChange={(v) => handleChange("budgetMax", v)}
              min={form.budgetMin || 0}
              variant="filled"
              step={50000}
              error={errors.budgetMax ?? ""}
            />
          </Group>
          {/* Timeline & Source */}
          <Group grow>
            <Select
              label="Timeline"
              placeholder="Select timeline"
              data={TIMELINE_OPTIONS}
              value={form.timeline || null}
              onChange={(v) => handleChange("timeline", v || "")}
              variant="filled"
              error={errors.timeline ?? ""}
            />
            <Select
              label="Source"
              placeholder="Lead source"
              data={SOURCE_OPTIONS}
              value={form.source || null}
              onChange={(v) => handleChange("source", v || "")}
              variant="filled"
              error={errors.source ?? ""}
            />
          </Group>
          {/* Notes */}
          <Textarea
            label="Notes"
            placeholder="Add notes (max 1000 chars)"
            __clearable
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            maxLength={1000}
            variant="filled"
            error={errors.notes ?? ""}
            minRows={3}
          />
          {/* tags */}
          <TextInput
            label="Tags"
            placeholder="Type tag and press space"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleTagBlur}
            variant="filled"
          />
          {/* tags shown*/}
          <Group gap="xs" mt="0">
            {(form.tags ?? []).map((tag, idx) => (
              <Button
                key={`${tag}-${idx}`} 
                size="xs"
                radius="xl"
                variant="light"
                color="violet"
                onClick={() => removeTag(idx)}
              >
                {tag} <span style={{ marginLeft: 4 }}>×</span>
              </Button>
            ))}
          </Group>
          <Button type="submit" loading={loading} fullWidth mt="sm" size="md">
            {mode === "create" ? "Create Lead" : "Update Lead"}
          </Button>
        </Stack>
      </form>
    </div>
  );
}
