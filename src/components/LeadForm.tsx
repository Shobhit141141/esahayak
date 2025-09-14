"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput, Select, NumberInput, Textarea, Button, Group, Stack, Title } from "@mantine/core";
import { toast } from "react-toastify";
import { CITY_OPTIONS, PROPERTY_TYPE_OPTIONS, BHK_OPTIONS, PURPOSE_OPTIONS, TIMELINE_OPTIONS, SOURCE_OPTIONS } from "../utils/leadOptions";
import { faker } from "@faker-js/faker";
import { MdAutoFixNormal, MdClear, MdRestartAlt } from "react-icons/md";
import { leadFormSchema, LeadFormSchemaType } from "../utils/leadFormSchema";
import { useUser } from "@/context/UserContext";
import AuthBoundary from "./AuthBoundary";

const defaultValues: LeadFormSchemaType = {
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

interface LeadFormProps {
  initialData?: LeadFormSchemaType;
  mode?: "create" | "edit";
  onSave?: () => void;
}

export interface LeadFormRef {
  isDirty: boolean;
  reset: (data: any) => void;
}
export const LeadForm = forwardRef<LeadFormRef, LeadFormProps>(({ initialData, mode = "create", onSave }: LeadFormProps, ref: React.Ref<LeadFormRef>) => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<LeadFormSchemaType>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: initialData || defaultValues,
  });

  useImperativeHandle(ref, () => ({
    isDirty,
    reset,
  }));
  const propertyType = watch("propertyType");
  const budgetMin = watch("budgetMin");
  const budgetMax = watch("budgetMax");

  const { token } = useUser();

  const onValidationErrors = (errors: any) => {
    console.error("❌ ZOD VALIDATION FAILED", errors);
    toast.error("There are validation errors in the form. Please check the console.");
  };

  const onSubmit = async (data: LeadFormSchemaType) => {
    setLoading(true);
    try {
      let response;
      if (mode === "edit") {
        //  if nothing changed, do not send request
        if (!isDirty) {
          toast.info("No changes made");
          setLoading(false);
          return;
        }
        const payload = {
          ...data,
          id: initialData?.id,
          updatedAt: initialData?.updatedAt,
        };
        // UPDATE
        response = await fetch(`/api/buyers/${initialData?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // CREATE
        response = await fetch("/api/buyers/new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      const result = await response.json();

      if (response.ok) {
        const successMessage = mode === "edit" ? "Lead updated successfully!" : "Lead created successfully!";
        toast.success(successMessage);
        if (mode === "create") {
          reset(defaultValues);
        }
        if (onSave) {
          onSave();
        }
      } else {
        toast.error(result.error || `Failed to ${mode} lead`);
      }
    } catch (err) {
      console.error("Error submitting lead form:", err);
      toast.error("Server error");
    }
    setLoading(false);
  };

  const autofillForm = () => {
    const propertyType = faker.helpers.arrayElement(["Apartment", "Villa", "Plot", "Office", "Retail"]);
    const bhk = propertyType === "Apartment" || propertyType === "Villa" ? faker.helpers.arrayElement(BHK_OPTIONS.map((option) => option.value)) : "";
    const budgetMin = faker.number.int({ min: 1000000, max: 5000000 });
    const budgetMax = faker.number.int({ min: budgetMin, max: 20000000 });

    reset({
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number().replace(/\D/g, "").slice(0, 10),
      city: faker.helpers.arrayElement(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
      propertyType,
      bhk,
      purpose: faker.helpers.arrayElement(["Buy", "Rent"]),
      budgetMin,
      budgetMax,
      timeline: faker.helpers.arrayElement(TIMELINE_OPTIONS.map((option) => option.value)),
      source: faker.helpers.arrayElement(SOURCE_OPTIONS.map((option) => option.value)),
      notes: faker.lorem.sentence(),
      tags: ["urgent", "follow-up", "premium", "budget", "investor"].filter(() => faker.datatype.boolean()),
    });
  };

  const handleResetOrClear = () => {
    if (mode === "edit") {
      reset(initialData);
    } else {
      reset(defaultValues);
    }
  };

  if (!token) {
    return <AuthBoundary loading={loading} />;
  }

  return (
    <div className={`shadow-sm rounded-md bg-transparent w-full max-w-2xl mx-auto ${mode === "create" ? "pt-20 p-6 " : ""}`}>
      <Title order={2} mb="md">
        {mode === "create" ? "Create New Lead" : "Edit Lead"}
      </Title>

      <form onSubmit={handleSubmit(onSubmit, onValidationErrors)} className="w-full" noValidate>
        <Stack gap="md">
          {/* Action Buttons */}
          <div className="flex items-baseline gap-4 w-full">
            {mode === "create" && (
              <div className="flex flex-col items-start gap-2">
                <Button type="button" color="blue" variant="light" onClick={autofillForm} leftSection={<MdAutoFixNormal size={16} />}>
                  Autofill
                </Button>
              </div>
            )}
            <Button
              type="button"
              color={mode === "edit" ? "orange" : "red"}
              variant="light"
              leftSection={mode === "edit" ? <MdRestartAlt size={16} /> : <MdClear size={16} />}
              onClick={handleResetOrClear}
            >
              {mode === "edit" ? "Reset Changes" : "Clear Form"}
            </Button>
          </div>

          {/* Lead Info */}
          <div className="flex gap-4 w-full">
            <TextInput label="Full Name" className="flex-1" placeholder="Enter full name" variant="filled" {...register("fullName")} error={errors.fullName?.message} required />
            <TextInput label="Email" className="flex-1" placeholder="Enter email" variant="filled" {...register("email")} error={errors.email?.message} />
          </div>
          <TextInput label="Phone" placeholder="Enter phone number" className="w-1/2" variant="filled" {...register("phone")} error={errors.phone?.message} required />

          {/* Property Details */}
          <Group grow>
            <Controller
              name="city"
              control={control}
              render={({ field }) => <Select label="City" placeholder="Select city" data={CITY_OPTIONS} variant="filled" {...field} error={errors.city?.message} required />}
            />
            <Controller
              name="propertyType"
              control={control}
              render={({ field }) => (
                <Select label="Property Type" placeholder="Select type" data={PROPERTY_TYPE_OPTIONS} variant="filled" {...field} error={errors.propertyType?.message} required />
              )}
            />
            {(propertyType === "Apartment" || propertyType === "Villa") && (
              <Controller
                name="bhk"
                control={control}
                render={({ field }) => <Select label="BHK" placeholder="Select BHK" data={BHK_OPTIONS} variant="filled" {...field} error={errors.bhk?.message} required />}
              />
            )}
          </Group>

          {/* Purpose and Budget */}
          <Group grow>
            <Controller
              name="purpose"
              control={control}
              render={({ field }) => (
                <Select label="Purpose" placeholder="Buy or Rent" data={PURPOSE_OPTIONS} variant="filled" {...field} error={errors.purpose?.message} required />
              )}
            />
            <Controller
              name="budgetMin"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Budget Min (INR)"
                  placeholder="Min budget"
                  min={0}
                  step={50000}
                  max={budgetMax || undefined}
                  variant="filled"
                  {...field}
                  error={errors.budgetMin?.message}
                  aria-invalid={errors.budgetMin ? "true" : "false"}
                  aria-describedby="budgetMin-error"
                  required
                />
              )}
            />
            <Controller
              name="budgetMax"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Budget Max (INR)"
                  placeholder="Max budget"
                  min={budgetMin || 0}
                  step={50000}
                  variant="filled"
                  {...field}
                  error={errors.budgetMax?.message}
                  required
                />
              )}
            />
          </Group>

          {/* Timeline & Source */}
          <Group grow>
            <Controller
              name="timeline"
              control={control}
              render={({ field }) => (
                <Select label="Timeline" placeholder="Select timeline" data={TIMELINE_OPTIONS} variant="filled" {...field} error={errors.timeline?.message} required />
              )}
            />
            <Controller
              name="source"
              control={control}
              render={({ field }) => <Select label="Source" placeholder="Lead source" data={SOURCE_OPTIONS} variant="filled" {...field} error={errors.source?.message} required />}
            />
          </Group>

          <Textarea label="Notes" placeholder="Add notes (max 1000 chars)" variant="filled" minRows={3} {...register("notes")} error={errors.notes?.message} />

          <Controller
            name="tags"
            control={control}
            render={({ field }) => {
              const [tagInput, setTagInput] = useState("");
              const tags = field.value ?? [];

              const addTag = (tag: string) => {
                if (tag && !tags.includes(tag)) {
                  field.onChange([...tags, tag]);
                }
              };

              const removeTag = (idx: number) => {
                const newTags = tags.filter((_, i) => i !== idx);
                field.onChange(newTags);
              };

              const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  const newTag = tagInput.trim();
                  if (newTag) {
                    addTag(newTag);
                    setTagInput("");
                  }
                }
              };

              const handleTagBlur = () => {
                const newTag = tagInput.trim();
                if (newTag) {
                  addTag(newTag);
                  setTagInput("");
                }
              };

              return (
                <>
                  <TextInput
                    label="Tags"
                    placeholder="Type tag and press space"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={handleTagBlur}
                    variant="filled"
                    error={errors.tags?.message}
                  />
                  <Group gap="xs" mt="0">
                    {tags.map((tag: string, idx: number) => (
                      <Button key={`${tag}-${idx}`} size="xs" radius="xl" variant="light" color="violet" onClick={() => removeTag(idx)}>
                        {tag} <span style={{ marginLeft: 4 }}>×</span>
                      </Button>
                    ))}
                  </Group>
                </>
              );
            }}
          />

          <Button
            type="submit"
            loading={loading}
            mt="md"
            onClick={() => {
              console.log(watch());
            }}
          >
            {mode === "create" ? "Create Lead" : "Save Changes"}
          </Button>
        </Stack>
      </form>
    </div>
  );
});
