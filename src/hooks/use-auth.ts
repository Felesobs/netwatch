"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import type { LoginInput, RegisterInput } from "@/lib/validation";
import type { User } from "@/types";
import { queryKeys } from "./query-keys";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => apiFetch<User>("/api/auth/me"),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<User>("/api/auth/login", { method: "POST", body: input }),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.currentUser, user);
      router.push("/dashboard");
      router.refresh();
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiFetch<User>("/api/auth/register", { method: "POST", body: input }),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.currentUser, user);
      router.push("/dashboard");
      router.refresh();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => apiFetch<{ loggedOut: true }>("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
  });
}
