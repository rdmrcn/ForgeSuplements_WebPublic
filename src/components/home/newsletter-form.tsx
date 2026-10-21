"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

const schema = z.object({
  email: z.string().trim().min(1, "Enter your email address.").max(120).pipe(z.email("Enter a valid email address.")),
});
type Values = z.infer<typeof schema>;

export function NewsletterForm({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  if (done) {
    return (
      <div role="status" className="border border-current/30 p-5">
        <p className="display text-2xl">Thanks. That looks valid.</p>
        <p className="mt-2 text-sm opacity-75">
          This is a demo: your address was validated in the browser but not stored, and no email will be sent.
        </p>
        <button type="button" className="mt-3 text-sm underline underline-offset-4" onClick={() => { reset(); setDone(false); }}>
          Try another address
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(() => setDone(true))} className="flex flex-col gap-3 sm:flex-row sm:items-start" aria-label="Newsletter signup">
      <div className={`flex-1 ${tone === "dark" ? "[&_label]:text-bone [&_input]:bg-bone/10 [&_input]:text-bone [&_input]:border-bone/30 [&_input]:focus:bg-bone/15 [&_input]:focus:border-bone [&_input::placeholder]:text-bone/50 [&_p]:text-bone/70 [&_p[role=alert]]:text-[#ff9b8f]" : ""}`}>
        <TextField label="Email address" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
      </div>
      <Button type="submit" variant={tone === "dark" ? "accent" : "primary"} className="sm:mt-[1.65rem]">
        Join the list
      </Button>
    </form>
  );
}
