"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/field";

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(80),
  email: z.string().trim().min(1, "Enter your email address.").max(120).pipe(z.email("Enter a valid email address.")),
  topic: z.enum(["order", "product", "shipping", "other"], { message: "Choose a topic." }),
  message: z.string().trim().min(10, "Write at least a few words (10 characters).").max(1500, "Keep it under 1,500 characters."),
});
type Values = z.input<typeof schema>;

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", topic: "order", message: "" },
  });

  if (sent) {
    return (
      <div role="status" className="border border-line-strong p-6">
        <p className="display text-3xl">Message checked, not sent</p>
        <p className="mt-2 text-ink/75">This is a demo: the form passed validation but nothing was transmitted or stored, and nobody will reply. For a real store this would create a support ticket.</p>
        <button type="button" className="mt-4 text-sm underline underline-offset-4" onClick={() => setSent(false)}>Write another</button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(() => setSent(true))} className="grid gap-4" aria-label="Contact form">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      </div>
      <SelectField label="Topic" error={errors.topic?.message} {...register("topic")}>
        <option value="order">An order</option>
        <option value="product">A product</option>
        <option value="shipping">Shipping or delivery</option>
        <option value="other">Something else</option>
      </SelectField>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-[0.8125rem] font-medium">Message</label>
        <textarea
          id="contact-message"
          rows={6}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`w-full border bg-white/60 p-3.5 text-[0.9375rem] focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember ${errors.message ? "border-danger" : "border-line-strong"}`}
          {...register("message")}
        />
        {errors.message && <p id="contact-message-error" role="alert" className="text-xs font-medium text-danger">{errors.message.message}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit">Send message</Button>
        <p className="text-xs text-stone">Demo form: validated in your browser, never sent.</p>
      </div>
    </form>
  );
}
