"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Card, CardContent, Button, Input, Label, FieldError } from "@/components/ui";
import { registerSchema } from "@/lib/validation";
import { useRegister } from "@/hooks";
import { ApiClientError } from "@/lib/api-client";

export function RegisterForm() {
  const register = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const result = registerSchema.safeParse({ name, email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    register.mutate(result.data, {
      onError: (error) => {
        setFormError(
          error instanceof ApiClientError ? error.message : "Something went wrong. Please try again.",
        );
      },
    });
  }

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-ink-primary">Create your account</h1>
          <p className="text-sm text-ink-secondary">Start tracking your internet usage in minutes.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              hasError={Boolean(fieldErrors.name)}
              aria-invalid={Boolean(fieldErrors.name)}
            />
            <FieldError message={fieldErrors.name} />
          </div>

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
            />
            <FieldError message={fieldErrors.email} />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              hasError={Boolean(fieldErrors.password)}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <FieldError message={fieldErrors.password} />
            <p className="mt-1.5 text-xs text-ink-tertiary">At least 8 characters.</p>
          </div>

          {formError && (
            <p role="alert" className="rounded-(--radius-md) bg-danger-subtle px-3 py-2 text-sm text-danger">
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={register.isPending}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-ink-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
