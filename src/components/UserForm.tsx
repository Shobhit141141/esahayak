"use client";
import { useState } from "react";
import { Card, Title, TextInput, Button, Group, Select } from "@mantine/core";
import { toast } from "react-toastify";

function validate(form: { name: string; email: string; role: string }) {
  const errors: { name?: string; email?: string } = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
    errors.email = "Invalid email address";
  }
  return errors;
}

export default function UserForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "AGENT",
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("User created!");
      setForm({ name: "", email: "", role: "AGENT" });
      setErrors({});
    } else {
      toast.error(data.error || "Error creating user");
    }
    setLoading(false);
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" style={{ maxWidth: 400, margin: "2rem auto" }}>
      <Title order={2} mb="md">
        Create New User
      </Title>
      <form onSubmit={handleSubmit} noValidate>
        <TextInput
          label="Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
          mb="md"
          error={errors.name}
        />
        <TextInput
          label="Email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
          mb="md"
          error={errors.email}
        />
        <Select
          label="Role"
          data={[
            { value: "ADMIN", label: "Admin" },
            { value: "AGENT", label: "Agent" },
          ]}
          value={form.role}
          onChange={(v) => handleChange("role", v)}
          required
          mb="md"
        />
        <Button type="submit" loading={loading} fullWidth mt="md">
          Create User
        </Button>
      </form>
    </Card>
  );
}
