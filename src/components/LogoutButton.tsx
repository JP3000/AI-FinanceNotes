"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logOutAction } from "@/actions/users";

export default function LogOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    // 模拟加载过程
    const { errorMessage } = await logOutAction();

    if (!errorMessage) {
      toast.success("Logged out", {
        description: "You have been logged out successfully.",
      });
      router.push("/");
    } else {
      toast.error("Error logging out", {
        description: errorMessage,
      });
    }

    setLoading(false);
  };

  return (
    <Button
      variant={"outline"}
      className="w-24"
      disabled={loading}
      onClick={handleLogout}
    >
      {loading ? <Loader2 className="animate-spin" /> : "Log Out"}
    </Button>
  );
}
