"use client";

import { useState } from "react";
import { TextInput, Select, NumberInput, Textarea, Button, Group, Stack, Card, Divider, Title, Text, CloseButton } from "@mantine/core";
import { toast } from "react-toastify";
import { CITY_OPTIONS, PROPERTY_TYPE_OPTIONS, BHK_OPTIONS, PURPOSE_OPTIONS, TIMELINE_OPTIONS, SOURCE_OPTIONS } from "../utils/leadOptions";
import { faker } from "@faker-js/faker";
import { MdAutoFixNormal, MdClear } from "react-icons/md";
import { leadFormSchema, LeadFormSchemaType } from "../utils/leadFormSchema";

export default function LeadForm() {
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
  const [form, setForm] = useState<LeadFormSchemaType>(initialForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const handleChange = (field: keyof LeadFormSchemaType, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

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
      } else {
        toast.error(data.error || "Failed to create lead");
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

  const clearForm = () => {
    setForm(initialForm);
    setErrors({});
  };

  return (
    <div className="shadow-sm p-6 rounded-md bg-transparent w-full max-w-2xl mx-auto">
      <Title order={2} mb="md">
        Create New Lead
      </Title>

      {/* buttons for accessibility */}
      <form onSubmit={handleSubmit} className="w-full">
        <Stack gap="md">
          <div className="flex items-baseline gap-2 w-full">
            <div className="flex flex-col items-start gap-2">
              <Button type="button" color="blue" variant="light" onClick={autofillForm} leftSection={<MdAutoFixNormal size={16} />}>
                Autofill with Fake Data
              </Button>
              <Text size="xs">For testing purposes only</Text>
            </div>
            <Button type="button" color="red" variant="light" leftSection={<MdClear size={16} />} onClick={clearForm}>
              Clear Form
            </Button>
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
              rightSection={<CloseButton aria-label="Clear input" onClick={() => handleChange("fullName", "")} style={{ display: form.fullName ? undefined : "none" }} />}
            />
            <TextInput
              label="Email"
              className="flex-1"
              placeholder="Enter email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              variant="filled"
              error={errors.email ?? ""}
              rightSection={<CloseButton aria-label="Clear input" onClick={() => handleChange("email", "")} style={{ display: form.email ? undefined : "none" }} />}
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
            rightSection={<CloseButton aria-label="Clear input" onClick={() => handleChange("phone", "")} style={{ display: form.phone ? undefined : "none" }} />}
          />
          {/* property details */}
          <Divider label="Property Details" labelPosition="center" my="sm" />
          <Group grow>
            <Select
              label="City"
              placeholder="Select city"
              clearable
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
              clearable
              value={form.propertyType || null}
              onChange={(v) => handleChange("propertyType", v || "")}
              variant="filled"
              error={errors.propertyType ?? ""}
            />
            {(form.propertyType === "Apartment" || form.propertyType === "Villa") && (
              <Select
                label="BHK"
                clearable
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
              clearable
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
              error={errors.budgetMin ?? ""}
            />
            <NumberInput
              label="Budget Max (INR)"
              placeholder="Max budget"
              value={form.budgetMax}
              onChange={(v) => handleChange("budgetMax", v)}
              min={0}
              variant="filled"
              error={errors.budgetMax ?? ""}
            />
          </Group>
          {/* Timeline & Source */}
          <Group grow>
            <Select
              label="Timeline"
              placeholder="Select timeline"
              data={TIMELINE_OPTIONS}
              clearable
              value={form.timeline || null}
              onChange={(v) => handleChange("timeline", v || "")}
              variant="filled"
              error={errors.timeline ?? ""}
            />
            <Select
              label="Source"
              placeholder="Lead source"
              data={SOURCE_OPTIONS}
              clearable
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
            rightSection={<CloseButton aria-label="Clear input" onClick={() => handleChange("notes", "")} style={{ display: form.notes ? undefined : "none" }} />}
          />
          {/* tags */}
          <TextInput
            label="Tags"
            placeholder="Type tag and press space"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              const value = e.currentTarget.value.trim();
              if (e.key === " " && value) {
                if (!(form.tags ?? []).includes(value)) {
                  handleChange("tags", [...(form.tags ?? []), value]);
                }
                setTagInput("");
                e.preventDefault();
              }
            }}
            onBlur={(e) => {
              const value = e.target.value.trim();
              if (value && !(form.tags ?? []).includes(value)) {
                handleChange("tags", [...(form.tags ?? []), value]);
              }
              setTagInput("");
            }}
            variant="filled"
          />
          {/* tags shown*/}
          <Group gap="xs" mt="0">
            {(form.tags ?? []).map((tag, idx) => (
              <Button
                key={tag + idx}
                size="xs"
                radius="xl"
                variant="light"
                color="violet"
                onClick={() =>
                  handleChange(
                    "tags",
                    (form.tags ?? []).filter((_, i) => i !== idx)
                  )
                }
              >
                {tag} <span style={{ marginLeft: 4 }}>×</span>
              </Button>
            ))}
          </Group>
          <Button type="submit" loading={loading} fullWidth mt="sm" size="md">
            Create Lead
          </Button>
        </Stack>
      </form>
    </div>
  );
}
