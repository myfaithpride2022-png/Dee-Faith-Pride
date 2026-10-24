import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateFixedPrice,
  parseNairaToMinorUnits,
  parseServiceForm,
  validateServiceDetails,
} from "../src/lib/orders/validation.ts";

test("calculates fixed amounts using integer minor units", () => {
  assert.deepEqual(calculateFixedPrice("fixed", 12500, 250), {
    subtotalMinor: "12500",
    serviceFeeMinor: "250",
    totalMinor: "12750",
  });
});

test("rejects quotation pricing until a price is configured", () => {
  assert.equal(calculateFixedPrice("quotation", null, 0), null);
  assert.equal(calculateFixedPrice("fixed", null, 0), null);
});

test("rejects malformed and unsafe monetary amounts", () => {
  assert.equal(calculateFixedPrice("fixed", -1, 0), null);
  assert.equal(calculateFixedPrice("fixed", "01", "0"), null);
  assert.equal(calculateFixedPrice("fixed", Number.MAX_SAFE_INTEGER, 1), null);
});

test("converts decimal naira values to safe integer minor units", () => {
  assert.equal(parseNairaToMinorUnits("1500"), "150000");
  assert.equal(parseNairaToMinorUnits("0.5"), "50");
  assert.equal(parseNairaToMinorUnits("12.34"), "1234");
  assert.equal(parseNairaToMinorUnits("12.345"), null);
  assert.equal(parseNairaToMinorUnits("01.00"), null);
  assert.equal(parseNairaToMinorUnits("-2"), null);
});

const formSchema = {
  fields: [
    {
      name: "phone_number",
      label: "Phone number",
      type: "phone",
      required: true,
      maxLength: 20,
    },
    {
      name: "network",
      label: "Network",
      type: "select",
      required: true,
      options: ["MTN", "Airtel"],
    },
  ],
};

test("accepts valid service-specific details", () => {
  assert.deepEqual(parseServiceForm(formSchema), formSchema.fields);
  assert.deepEqual(
    validateServiceDetails(formSchema, {
      phone_number: "+234 801 234 5678",
      network: "MTN",
    }),
    {
      success: true,
      data: {
        phone_number: "+234 801 234 5678",
        network: "MTN",
      },
    },
  );
});

test("rejects malformed service forms and duplicate field names", () => {
  assert.equal(parseServiceForm({ fields: [{ name: "bad field" }] }), null);
  assert.equal(
    parseServiceForm({
      fields: [formSchema.fields[0], formSchema.fields[0]],
    }),
    null,
  );
  assert.equal(
    parseServiceForm({
      fields: [
        {
          name: "network",
          label: "Network",
          type: "select",
          required: true,
        },
      ],
    }),
    null,
  );
});

test("rejects missing, unknown, and invalid service-specific fields", () => {
  assert.equal(
    validateServiceDetails(formSchema, { phone_number: "08012345678" }).success,
    false,
  );
  assert.equal(
    validateServiceDetails(formSchema, {
      phone_number: "08012345678",
      network: "Unsupported",
    }).success,
    false,
  );
  assert.equal(
    validateServiceDetails(formSchema, {
      phone_number: "08012345678",
      network: "MTN",
      payment_status: "confirmed",
    }).success,
    false,
  );
});
