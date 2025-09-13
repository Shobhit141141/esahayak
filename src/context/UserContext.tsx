"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";

interface UserContextType {
  userId: string | null;
  user: any | null;
}

const UserContext = createContext<UserContextType>({ userId: null, user: null });

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const [id] = Buffer.from(token, "base64").toString().split(":");
      setUserId(id);
      fetch(`/api/users?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.users && data.users.length > 0) {
            setUser(data.users[0]);
          }
        });
    }
  }, []);

  return <UserContext.Provider value={{ userId, user }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
