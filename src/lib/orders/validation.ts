import { z } from "zod";

const serviceFieldSchema = z
  .object({
    name: z.string().regex(/^[a-z][a-z0-9_]{0,39}$/),
    label: z.string().min(1).max(100),
    type: z.enum(["text", "phone", "email", "select"]),
    required: z.boolean(),
    maxLength: z.number().int().min(1).max(500).optional(),
    options: z.array(z.string().min(1).max(100)).max(50).optional(),
  })
  .strict();

const serviceFormSchema = z
  .object({
    fields: z.array(serviceFieldSchema).max(30),
  })
  .strict();

export type ServiceFormField = z.infer<typeof serviceFieldSchema>;

export function parseServiceForm(input: unknown): ServiceFormField[] | null {
  const parsed = serviceFormSchema.safeParse(input);
  if (!parsed.success) return null;

  const fields = parsed.data.fields;
  if (new Set(fields.map((field) => field.name)).size !== fields.length) {
    return null;
  }
  if (
    fields.some(
      (field) =>
        field.type === "select" &&
        (!field.options?.length ||
          new Set(field.options).size !== field.options.length),
    )
  ) {
    return null;
  }

  return fields;
}

const submittedDetailsSchema = z.record(
  z.string().regex(/^[a-z][a-z0-9_]{0,39}$/),
  z.string().max(500),
);

export type ServiceDetailsValidation =
  | { success: true; data: Record<string, string> }
  | { success: false; message: string };

export function validateServiceDetails(
  formSchemaInput: unknown,
  submittedDetailsInput: unknown,
): ServiceDetailsValidation {
  const fields = parseServiceForm(formSchemaInput);
  const parsedDetails = submittedDetailsSchema.safeParse(submittedDetailsInput);

  if (!fields || !parsedDetails.success) {
    return { success: false, message: "Service details are invalid." };
  }

  const knownFields = new Set(fields.map((field) => field.name));
  if (Object.keys(parsedDetails.data).some((name) => !knownFields.has(name))) {
    return {
      success: false,
      message: "Unexpected service details were provided.",
    };
  }

  for (const field of fields) {
    const value = parsedDetails.data[field.name];

    if (field.required && (!value || !value.trim())) {
      return {
        success: false,
        message: `Please provide ${field.label.toLocaleLowerCase()}.`,
      };
    }
    if (value === undefined) continue;
    if (value.length > (field.maxLength ?? 500)) {
      return { success: false, message: `${field.label} is too long.` };
    }
    if (
      field.type === "email" &&
      value &&
      !z.email().safeParse(value).success
    ) {
      return {
        success: false,
        message: `${field.label} must be a valid email address.`,
      };
    }
    if (
      field.type === "phone" &&
      value &&
      !/^[+\d][\d\s()-]{6,24}$/.test(value)
    ) {
      return {
        success: false,
        message: `${field.label} must be a valid phone number.`,
      };
    }
    if (
      field.type === "select" &&
      (!field.options || !field.options.includes(value))
    ) {
      return {
        success: false,
        message: `Choose a valid ${field.label.toLocaleLowerCase()}.`,
      };
    }
  }

  return { success: true, data: parsedDetails.data };
}

export function calculateFixedPrice(
  pricingType: "fixed" | "quotation",
  basePriceMinor: string | number | null,
  serviceFeeMinor: string | number,
): {
  subtotalMinor: string;
  serviceFeeMinor: string;
  totalMinor: string;
} | null {
  if (pricingType !== "fixed" || basePriceMinor === null) return null;

  const amountPattern = /^(0|[1-9]\d*)$/;
  const subtotal = String(basePriceMinor);
  const fee = String(serviceFeeMinor);
  if (!amountPattern.test(subtotal) || !amountPattern.test(fee)) return null;

  const subtotalValue = BigInt(subtotal);
  const feeValue = BigInt(fee);
  const total = subtotalValue + feeValue;
  const maximumSafeInteger = BigInt(Number.MAX_SAFE_INTEGER);
  if (
    subtotalValue > maximumSafeInteger ||
    feeValue > maximumSafeInteger ||
    total > maximumSafeInteger
  ) {
    return null;
  }

  return {
    subtotalMinor: subtotalValue.toString(),
    serviceFeeMinor: feeValue.toString(),
    totalMinor: total.toString(),
  };
}

export function parseNairaToMinorUnits(amount: string): string | null {
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(amount);
  if (!match) return null;

  const minor =
    BigInt(match[1]) * 100n + BigInt((match[2] ?? "").padEnd(2, "0") || "0");
  if (minor > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return minor.toString();
}
