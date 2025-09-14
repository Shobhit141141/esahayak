"use client";
import { useUser } from "../context/UserContext";
import { FaCheckCircle } from "react-icons/fa";
import { Card, Loader, Text, Avatar, Badge, Divider, useComputedColorScheme } from "@mantine/core";
import { HiInformationCircle } from "react-icons/hi";
import { FaCloudMoon, FaPeopleGroup } from "react-icons/fa6";
import { BsClipboardDataFill } from "react-icons/bs";
import { GrDocumentCsv } from "react-icons/gr";
import { toast } from "react-toastify";

export default function HomeUsersLogin() {
  const { users, loading, userId } = useUser();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  const handleLogin = async (user: any) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json();
      if (data.token) {
        import("js-cookie").then((Cookies) => {
          Cookies.default.set("token", data.token);
          window.location.href = "/buyers";
        });
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      toast.error("Login error");
      console.error("Login error:", err);
    }
  };

 
  return (
    <div className="flex flex-col-reverse md:flex-row w-full min-h-screen px-8 md:px-12 items-center justify-evenly gap-12 py-10">
      {/* Left Section: Image + Features */}
      <div className="flex flex-col items-center w-full md:w-1/2">
        <img src="/db.png" alt="DB" className="w-3/4 h-auto object-contain" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          {[
            { title: "Manage Leads", description: "Easily add new leads to the database.", icon: <FaPeopleGroup /> },
            { title: "Sample Data", description: "Explore preloaded users & leads.", icon: <BsClipboardDataFill /> },
            { title: "Import/Export", description: "Import and export data using CSV files.", icon: <GrDocumentCsv /> },
            { title: "Theme toggle", description: "Switch between light and dark mode.", icon: <FaCloudMoon /> },
          ].map((feature, idx) => (
            <Card key={idx} className=" p-4 rounded-lg shadow hover:shadow-md transition-shadow bg-violet-500/50">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {" "}
                {feature.icon} {feature.title}
              </h3>
              <Text color={`${computedColorScheme === "dark" ? "dimmed" : ""}`} size="sm">
                {feature.description}
              </Text>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Section: Login Card */}
      <Card className={`flex flex-col w-full md:w-1/3 rounded-lg shadow-lg p-6 md:p-8 max-w-md mb-4 bg-[#2e2e2e]`}>
        <h2 className="text-2xl font-bold mb-4 text-center">Login as User</h2>

        {loading ? (
          <div className="flex justify-center">
            <Loader />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => handleLogin(u)}
                className={`flex justify-between items-center gap-4 w-full bg-violet-500/10 p-3 rounded-lg hover:bg-violet-500/20 cursor-pointer transition ${
                  userId === u.id ? "border-2 border-violet-500" : ""
                }`}
              >
                <div className="flex items-center gap-3 cursor-pointer">
                  <Avatar radius="xl" variant="filled" size={24} color="violet">
                    {u.name[0]}
                  </Avatar>
                  <span>{u.name}</span>
                  {userId == u.id && <FaCheckCircle color="green" title="Selected" />}
                </div>
                <Badge color={u.role === "ADMIN" ? "orange" : "yellow"} variant="filled" size="sm" radius="sm">
                  {u.role}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <Divider my="lg" label="Hassle Free Login" labelPosition="center" />

        {/* Info Section */}
        <div className=" text-center space-y-4">
          <div>
            <h3 className="font-semibold">Dummy Users</h3>
            <Text color={`${computedColorScheme === "dark" ? "dimmed" : ""}`} size="xs">
              Users and leads are preloaded for testing purposes. <br />
              Select a user to login. (it will set data for that user in cookies)
            </Text>
          </div>
          <div>
            <h3 className="font-semibold flex justify-center items-center gap-2">
              <HiInformationCircle /> Create Users
            </h3>
            <Text color={`${computedColorScheme === "dark" ? "dimmed" : ""}`} size="xs">
              Login as ADMIN to create new users.
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
