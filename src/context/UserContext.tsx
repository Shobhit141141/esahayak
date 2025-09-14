"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";

interface UserContextType {
  userId: string | null;
  user: any | null;
  users: any[];
  loading: boolean;
}

const UserContext = createContext<UserContextType>({ userId: null, user: null, users: [], loading: true });

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    const username = Cookies.get("username");
    const role = Cookies.get("role");
    setLoading(true);
    fetch("/api/users")
      .then((res) => res.json())
      .then((allUsers) => {
        setUsers(allUsers.users || []);
        if (token) {
          const id = Buffer.from(token, "base64").toString().split(":")[0];
          const matchedUser = allUsers.users?.find((u: any) => String(u.id) === String(id));
          setUser(matchedUser || { id, name: username, role });
          setUserId(id);
        } else {
          setUser(null);
          setUserId(null);
        }
        setLoading(false);
      });
  }, [Cookies.get("token"), Cookies.get("username"), Cookies.get("role")]);

  return <UserContext.Provider value={{ userId, user, users, loading }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
