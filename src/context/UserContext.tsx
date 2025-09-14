"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

interface UserContextType {
  userId: string | null;
  user: any | null;
  users: any[];
  loading: boolean;
  setUser: (user: any) => void;
  setUsers: (users: any[]) => void;
  token?: string | null;
}

const UserContext = createContext<UserContextType>({ userId: null, user: null, users: [], loading: true, setUser: () => {}, setUsers: () => {}, token: null });

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("token") || null;

  useEffect(() => {
    const fetchUsers = async () => {
    
      const username = Cookies.get("username");
      const role = Cookies.get("role");
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users || []);
        if (token) {
          const id = Buffer.from(token, "base64").toString().split(":")[0];
          const matchedUser = data.users?.find((u: any) => String(u.id) === String(id));
          setUser(matchedUser || { id, name: username, role });
          setUserId(id);
        } else {
          setUser(null);
          setUserId(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };
    fetchUsers();
  }, [Cookies.get("token"), Cookies.get("username"), Cookies.get("role")]);

  return <UserContext.Provider value={{ userId, user, users, loading, setUser, setUsers, token }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
