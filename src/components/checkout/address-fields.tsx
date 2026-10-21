"use client";

import { clsx } from "clsx";
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { countryList, shippingCountries, type CountryCode } from "@/config/shipping";
import { districtOptionsFor, regionOptionsFor, type CheckoutFormValues } from "@/domain/checkout";
import { SelectField, TextField } from "@/components/ui/field";

type Prefix = "shipping" | "billing";

interface Props {
  prefix: Prefix;
  register: UseFormRegister<CheckoutFormValues>;
  watch: UseFormWatch<CheckoutFormValues>;
  setValue: UseFormSetValue<CheckoutFormValues>;
  errors: FieldErrors<CheckoutFormValues>;
  onCountryChange?: (country: CountryCode) => void;
}

const widthClass = { full: "sm:col-span-6", half: "sm:col-span-3", third: "sm:col-span-2" } as const;

export function AddressFields({ prefix, register, watch, setValue, errors, onCountryChange }: Props) {
  const country = (watch(`${prefix}.country`) ?? "TR") as CountryCode;
  const region = watch(`${prefix}.region`) ?? "";
  const config = shippingCountries[country];
  const err = errors[prefix] as Record<string, { message?: string } | undefined> | undefined;
  const message = (name: string) => err?.[name]?.message;

  const regionOptions = regionOptionsFor(country);
  const districtOptions = districtOptionsFor(country, region);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6" data-testid={`${prefix}-address`}>
      <TextField label="First name" autoComplete={prefix === "shipping" ? "given-name" : "billing given-name"} className="sm:col-span-3" error={message("firstName")} {...register(`${prefix}.firstName`)} />
      <TextField label="Last name" autoComplete={prefix === "shipping" ? "family-name" : "billing family-name"} className="sm:col-span-3" error={message("lastName")} {...register(`${prefix}.lastName`)} />

      <SelectField
        label="Country or region"
        autoComplete="country"
        className="sm:col-span-6"
        error={message("country")}
        {...register(`${prefix}.country`, {
          onChange: (e) => {
            const next = e.target.value as CountryCode;
            for (const field of ["region", "district", "city", "postalCode"] as const) setValue(`${prefix}.${field}`, "");
            onCountryChange?.(next);
          },
        })}
      >
        {countryList.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </SelectField>

      {config.fields.map((field) => {
        const name = `${prefix}.${field.name}` as const;
        const shared = {
          label: field.label,
          optional: !field.required,
          hint: field.hint,
          error: message(field.name),
          className: widthClass[field.width ?? "full"],
        };
        const autoComplete = field.autoComplete ? (prefix === "billing" ? `billing ${field.autoComplete}` : field.autoComplete) : undefined;

        if (field.name === "region" && field.type === "select") {
          return (
            <SelectField
              key={name}
              {...shared}
              autoComplete={autoComplete}
              {...register(name, { onChange: () => setValue(`${prefix}.district`, "") })}
            >
              <option value="">Select...</option>
              {regionOptions?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>
          );
        }

        if (field.name === "district" && field.type === "select") {
          if (districtOptions) {
            return (
              <SelectField key={`${name}-select`} {...shared} autoComplete={autoComplete} disabled={!region} {...register(name)}>
                <option value="">{region ? "Select..." : "Choose a province first"}</option>
                {districtOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </SelectField>
            );
          }
          return (
            <TextField
              key={`${name}-text`}
              {...shared}
              hint={region ? "Type your district. A built-in list is not available for this province yet." : "Choose a province first."}
              autoComplete={autoComplete}
              maxLength={80}
              disabled={!region}
              {...register(name)}
            />
          );
        }

        return (
          <TextField
            key={name}
            {...shared}
            autoComplete={autoComplete}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            inputMode={field.name === "postalCode" && (country === "US" || country === "DE" || country === "AT" || country === "TR") ? "numeric" : undefined}
            className={clsx(shared.className)}
            {...register(name)}
          />
        );
      })}
    </div>
  );
}
