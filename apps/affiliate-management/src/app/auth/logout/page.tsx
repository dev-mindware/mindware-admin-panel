"use client";
import { useEffect } from "react";
import { logoutAction } from "@/actions/login";
import { Loader } from "@/contexts/loader";

export default function LogoutPage() {
  useEffect(() => {
    logoutAction();
  }, []);

  return <Loader />;
}
