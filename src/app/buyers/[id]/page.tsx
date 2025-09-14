"use client";
import AuthBoundary from "@/components/AuthBoundary";
import BuyerViewEditPage from "@/components/BuyerViewEditPage";
import { useUser } from "@/context/UserContext";

export default function BuyerPage() {
  const { user, token, loading } = useUser();
  if (!token) {
    return <AuthBoundary loading={loading} />;
  }
  return <BuyerViewEditPage />;
}
