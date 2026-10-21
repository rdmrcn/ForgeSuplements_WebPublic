"use client";

import { AlertTriangle, Check, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { shippingCountries, type CountryCode } from "@/config/shipping";
import { checkoutFormSchema, emptyAddress, type CheckoutFormValues } from "@/domain/checkout";
import { describeEta } from "@/domain/shipping";
import { getVariant } from "@/domain/catalog";
import { formatMoney } from "@/lib/format";
import { zodResolver } from "@/lib/zod-resolver";
import { Button, LinkButton } from "@/components/ui/button";
import { CheckboxField, TextField } from "@/components/ui/field";
import { PackShot } from "@/components/product/pack-shot";
import { DiscountForm } from "@/components/cart/discount-form";
import { OrderTotals } from "@/components/cart/order-totals";
import { useCartStore } from "@/store/cart";
import { useDestinationStore } from "@/store/destination";
import { useCartPricing } from "@/store/hooks";
import { AddressFields } from "./address-fields";

const steps = ["Information", "Delivery", "Review"] as const;
type Step = 0 | 1 | 2;

const stepFields: Record<Step, ("email" | "phone" | "shipping" | "billingSame" | "billing" | "shippingMethodId" | "acceptDemoTerms")[]> = {
  0: ["email", "phone", "shipping", "billingSame", "billing"],
  1: ["shippingMethodId"],
  2: ["acceptDemoTerms"],
};

function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <section className="border-t border-line pt-6">
      <h2 className="display text-3xl">{title}</h2>
      {hint && <p className="mt-1 text-sm text-stone">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const destinationCountry = useDestinationStore((s) => s.country);
  const destinationMethod = useDestinationStore((s) => s.methodId);
  const setDestinationCountry = useDestinationStore((s) => s.setCountry);
  const setDestinationMethod = useDestinationStore((s) => s.setMethod);
  const clear = useCartStore((s) => s.clear);
  const hydrated = useCartStore((s) => s.hydrated);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      phone: "",
      shipping: emptyAddress(destinationCountry),
      billingSame: true,
      billing: emptyAddress(destinationCountry),
      shippingMethodId: destinationMethod,
      acceptDemoTerms: false,
    },
  });
  const { register, watch, setValue, handleSubmit, trigger, getValues, setError, formState: { errors } } = form;

  const control = form.control;
  const country = (useWatch({ control, name: "shipping.country" }) ?? destinationCountry) as CountryCode;
  const methodId = useWatch({ control, name: "shippingMethodId" }) ?? "standard";
  const billingSame = useWatch({ control, name: "billingSame" });
  const { pricing } = useCartPricing(country, methodId);
  const countryConfig = shippingCountries[country];

  const initialised = useRef(false);
  useEffect(() => {
    if (hydrated && !initialised.current) {
      initialised.current = true;
      setValue("shipping.country", destinationCountry);
      setValue("billing.country", destinationCountry);
      setValue("shippingMethodId", destinationMethod);
    }
  }, [hydrated, destinationCountry, destinationMethod, setValue]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  if (!hydrated) {
    return (
      <div className="container-x py-16" aria-busy="true" aria-label="Loading checkout">
        <div className="skeleton h-14 w-1/2" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="skeleton h-96" />
          <div className="skeleton h-96" />
        </div>
      </div>
    );
  }

  if (pricing.lines.length === 0) {
    return (
      <div className="container-x flex min-h-[50vh] flex-col items-start justify-center py-16" data-testid="checkout-empty">
        <p className="eyebrow text-stone">Checkout</p>
        <h1 className="display mt-2 text-[clamp(3rem,9vw,7rem)]">Your cart is empty</h1>
        <p className="mt-4 max-w-md text-ink/70">Add something to your cart before checking out.</p>
        <LinkButton href="/shop" className="mt-6">Shop all products</LinkButton>
      </div>
    );
  }

  async function next() {
    setServerError(null);
    const ok = await trigger(stepFields[step], { shouldFocus: true });
    if (ok) setStep((s) => Math.min(2, s + 1) as Step);
  }

  async function onSubmit(values: CheckoutFormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkout: { ...values, discountCode: pricing.discount.status === "applied" ? pricing.discount.config.code : undefined },
          items: pricing.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
          expectedTotalCents: pricing.totalCents,
        }),
      });
      const data = (await res.json()) as { id?: string; message?: string; code?: string; fieldErrors?: Record<string, string> };
      if (res.ok && data.id) {
        clear();
        router.push(`/order/${data.id}`);
        return;
      }
      if (data.fieldErrors) {
        for (const [path, message] of Object.entries(data.fieldErrors)) {
          setError(path as never, { type: "server", message });
        }
        setStep(0);
      }
      setServerError(data.message ?? "We could not create the demo order.");
    } catch {
      setServerError("Network error. Your cart is safe; please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const values = getValues();
  const eta = pricing.shipping ? describeEta(pricing.shipping.etaBusinessDays) : "";

  return (
    <div className="container-x pb-10 pt-6 sm:pt-10">
      <div className="mb-8 border border-ember bg-ember/10 p-4 text-sm" role="note" data-testid="demo-banner">
        <p className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <span>
            <strong>Demo checkout.</strong> No payment is taken, no card details are collected and nothing will be shipped. Submitting creates a local demo order marked as unpaid.
          </span>
        </p>
      </div>

      <ol className="mb-8 flex flex-wrap gap-x-8 gap-y-2" aria-label="Checkout steps">
        {steps.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined} className={`flex items-center gap-2 ${i === step ? "text-ink" : "text-stone"}`}>
            <span className={`flex size-6 items-center justify-center text-xs font-bold ${i < step ? "bg-ink text-bone" : i === step ? "bg-ember text-ink" : "border border-line-strong"}`}>
              {i < step ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <span className="eyebrow">{label}</span>
          </li>
        ))}
      </ol>

      <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] xl:gap-20">
        <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Checkout" className="space-y-8" data-testid="checkout-form">
          <h1 ref={headingRef} tabIndex={-1} className="display text-[clamp(2.5rem,6vw,4.5rem)] outline-none">
            {step === 0 ? "Where should it go?" : step === 1 ? "How should it travel?" : "Check and confirm"}
          </h1>

          {serverError && (
            <p role="alert" className="flex items-start gap-3 border border-danger bg-danger/8 p-4 text-sm text-danger" data-testid="server-error">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden /> {serverError}
            </p>
          )}

          {step === 0 && (
            <>
              <Section title="Contact">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Email address" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
                  <TextField label="Phone number" type="tel" autoComplete="tel" hint={`For the courier. Example: ${countryConfig.phoneDialCode} ...`} error={errors.phone?.message} {...register("phone")} />
                </div>
              </Section>
              <Section title="Delivery address" hint="Fields follow the format of the destination country.">
                <AddressFields
                  prefix="shipping"
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  onCountryChange={(c) => {
                    setDestinationCountry(c);
                    if (getValues("billingSame")) setValue("billing.country", c);
                  }}
                />
                <ul className="mt-4 space-y-1 text-xs text-stone">
                  {countryConfig.notices.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </Section>
              <Section title="Billing address">
                <CheckboxField label="Billing address is the same as the delivery address" {...register("billingSame")} />
                {!billingSame && (
                  <div className="mt-5">
                    <AddressFields prefix="billing" register={register} watch={watch} setValue={setValue} errors={errors} />
                  </div>
                )}
              </Section>
            </>
          )}

          {step === 1 && (
            <Section title="Delivery method" hint={`Destination: ${countryConfig.name}. Rates are illustrative demo values, not live carrier quotes.`}>
              <fieldset>
                <legend className="sr-only">Delivery method</legend>
                <div className="space-y-3" role="radiogroup">
                  {pricing.quotes.map((q) => (
                    <label key={q.methodId} className="block cursor-pointer">
                      <input
                        type="radio"
                        value={q.methodId}
                        className="peer sr-only"
                        {...register("shippingMethodId", { onChange: (e) => setDestinationMethod(e.target.value) })}
                      />
                      <span className="flex items-center justify-between gap-4 border border-line-strong p-4 transition-colors peer-checked:border-ink peer-checked:bg-white peer-checked:shadow-[inset_0_0_0_1px_var(--color-ink)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ember">
                        <span>
                          <span className="display block text-2xl">{q.label}</span>
                          <span className="block text-sm text-stone">{q.description} Estimated {describeEta(q.etaBusinessDays)}.</span>
                          <span className="eyebrow mt-1 block text-stone">Illustrative demo rate</span>
                        </span>
                        <span className="text-lg font-semibold tabular-nums">{q.free ? "Free" : formatMoney(q.costCents)}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {errors.shippingMethodId && <p role="alert" className="mt-2 text-xs font-medium text-danger">{errors.shippingMethodId.message}</p>}
              </fieldset>
              <p className="mt-4 text-xs text-stone">Customs, import duties and taxes are not calculated. Availability of supplements in your country must be verified before a real purchase.</p>
            </Section>
          )}

          {step === 2 && (
            <>
              <Section title="Your details">
                <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2" data-testid="review">
                  <div>
                    <dt className="eyebrow text-stone">Contact</dt>
                    <dd className="mt-1">{values.email}<br />{values.phone}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-stone">Delivery method</dt>
                    <dd className="mt-1">{pricing.shipping?.label}, {eta}<br /><span className="text-stone">Illustrative rate: {pricing.shipping?.free ? "Free" : formatMoney(pricing.shippingCents)}</span></dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-stone">Deliver to</dt>
                    <dd className="mt-1">
                      {values.shipping.firstName} {values.shipping.lastName}<br />
                      {[values.shipping.address1, values.shipping.houseNumber].filter(Boolean).join(" ")}
                      {values.shipping.address2 && <><br />{values.shipping.address2}</>}
                      <br />
                      {[values.shipping.postalCode, values.shipping.district || values.shipping.city].filter(Boolean).join(" ")}
                      {values.shipping.region && values.shipping.country !== "TR" ? `, ${values.shipping.region}` : ""}
                      {values.shipping.country === "TR" && values.shipping.region ? ` / ${values.shipping.region}` : ""}
                      <br />{shippingCountries[values.shipping.country].name}
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-stone">Billing</dt>
                    <dd className="mt-1">{values.billingSame ? "Same as delivery address" : `${values.billing?.firstName ?? ""} ${values.billing?.lastName ?? ""}, ${values.billing?.address1 ?? ""}`}</dd>
                  </div>
                </dl>
                <button type="button" onClick={() => setStep(0)} className="mt-4 text-sm underline underline-offset-4">Edit details</button>
              </Section>
              <Section title="Payment">
                <div className="border border-line-strong bg-white/50 p-5 text-sm" data-testid="payment-demo">
                  <p className="display text-2xl">Demo payment</p>
                  <p className="mt-2 text-ink/80">
                    No card number, CVV or other payment credential is requested or stored by this app. A real store would hand off to a payment provider here. This order will be saved as <strong>unpaid (demo)</strong>.
                  </p>
                </div>
                <CheckboxField
                  className="mt-5"
                  label={<>I understand this is a demo order: no money will be charged and nothing will be shipped. I have read the <Link href="/policies/terms" className="underline underline-offset-2" target="_blank">terms</Link>.</>}
                  error={errors.acceptDemoTerms?.message}
                  {...register("acceptDemoTerms")}
                />
              </Section>
            </>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}>Back</Button>
            ) : (
              <Link href="/cart" className="text-sm underline underline-offset-4">Return to cart</Link>
            )}
            {step < 2 ? (
              <Button size="lg" variant="accent" onClick={next} data-testid="continue">Continue</Button>
            ) : (
              <Button type="submit" size="lg" variant="accent" disabled={submitting} data-testid="place-order">
                {submitting ? "Creating demo order..." : `Place demo order · ${formatMoney(pricing.totalCents)}`}
              </Button>
            )}
          </div>
        </form>

        <aside aria-label="Order summary" className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
          <div className="border border-line bg-sand/40 p-5 sm:p-6">
            <h2 className="display text-3xl">Order summary</h2>
            <ul className="mt-4 divide-y divide-line">
              {pricing.lines.map((l) => {
                const entry = getVariant(l.variantId);
                return (
                  <li key={l.variantId} className="flex gap-3 py-3">
                    <span className="relative block size-16 shrink-0 overflow-hidden bg-sand">
                      {entry && <PackShot product={entry.product} variant={entry.variant} bare className="absolute inset-0 size-full scale-125" />}
                      <span className="absolute -right-0 top-0 flex size-5 items-center justify-center bg-ink text-[0.6875rem] font-bold text-bone">{l.quantity}</span>
                    </span>
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="display block text-lg leading-tight">{l.productTitle}</span>
                      <span className="text-stone">{l.variantLabel}</span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{formatMoney(l.lineTotalCents)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 space-y-4 border-t border-line pt-4">
              <DiscountForm pricing={pricing} />
              <OrderTotals pricing={pricing} estimate={step < 2} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
