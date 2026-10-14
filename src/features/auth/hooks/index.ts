"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { signIn, signOut } from "../services";

export function useSignIn(next = "/") {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      queryClient.clear();
      router.replace(next.startsWith("/") && !next.startsWith("//") ? next : "/");
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });
}

/** "Switch" — end the mocked session and return to the account picker. */
export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });
}
