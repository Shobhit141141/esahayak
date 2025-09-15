"use client";
import AuthBoundary from "@/components/auth/AuthBoundary";
import BuyerViewEditPage from "@/components/buyers/BuyerViewEditPage";
import { useUser } from "@/context/UserContext";

export default function BuyerPage() {
  const { token, loading } = useUser();
  if (!token) {
    return <AuthBoundary loading={loading} />;
  }
  return (
    <div className="px-6 md:px-8 lg:px-16 pb-6">
      <BuyerViewEditPage />
    </div>
  );
}
