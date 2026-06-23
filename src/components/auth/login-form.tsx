"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, Button, Input, Label, FieldError } from "@/components/ui";
import { loginSchema } from "@/lib/validation";
import { useLogin } from "@/hooks";
import { ApiClientError } from "@/lib/api-client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    login.mutate(result.data, {
      onError: (error) => {
        setFormError(
          error instanceof ApiClientError ? error.message : "Something went wrong. Please try again.",
        );
      },
    });
  }

  const redirectNotice = searchParams.get("redirect")
    ? "Sign in to continue."
    : null;

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-ink-primary">Welcome back</h1>
          <p className="text-sm text-ink-secondary">
            {redirectNotice ?? "Sign in to your NetWatch account."}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              hasError={Boolean(fieldErrors.email)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            <FieldError message={fieldErrors.email} />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              hasError={Boolean(fieldErrors.password)}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            <FieldError message={fieldErrors.password} />
          </div>

          {formError && (
            <p role="alert" className="rounded-(--radius-md) bg-danger-subtle px-3 py-2 text-sm text-danger">
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={login.isPending}>
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-ink-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-accent hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
