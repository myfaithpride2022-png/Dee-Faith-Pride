export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type ProfileRow = {
  id: string;
  display_name: string;
  email: string;
  role: "admin" | "staff";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderRow = {
  id: string;
  order_reference: string;
  tracking_token_hash: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  service_id: string | null;
  service_name_snapshot: string;
  service_details: Json;
  subtotal_minor: number | string;
  service_fee_minor: number | string;
  total_minor: number | string;
  currency: string;
  payment_status:
    | "unpaid"
    | "submitted"
    | "under_review"
    | "confirmed"
    | "rejected"
    | "refund_pending"
    | "refunded";
  fulfilment_status:
    | "not_started"
    | "queued"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled";
  customer_notes: string | null;
  internal_notes: string | null;
  payment_instructions_snapshot: Json | null;
  created_at: string;
  updated_at: string;
};

export type PaymentSubmissionRow = {
  id: string;
  order_id: string;
  amount_reported_minor: number | string;
  payment_reference: string | null;
  payment_date: string | null;
  receipt_storage_path: string | null;
  status: "submitted" | "under_review" | "confirmed" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  customer_note: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderEventRow = {
  id: string;
  order_id: string;
  actor_id: string | null;
  event_type: string;
  previous_status: string | null;
  new_status: string | null;
  note: string | null;
  metadata: Json;
  created_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_path: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ServiceRow = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  instructions: string;
  form_schema: Json;
  base_price_minor: number | string | null;
  service_fee_minor: number | string;
  pricing_type: "fixed" | "quotation";
  processing_estimate: string | null;
  image_path: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Pick<ProfileRow, "id" | "display_name" | "email"> &
          Partial<Pick<ProfileRow, "role" | "is_active">>
      >;
      service_categories: Table<
        CategoryRow,
        Pick<CategoryRow, "name" | "slug"> &
          Partial<
            Pick<
              CategoryRow,
              "description" | "image_path" | "is_active" | "sort_order"
            >
          >
      >;
      services: Table<
        ServiceRow,
        Pick<ServiceRow, "name" | "slug"> &
          Partial<
            Pick<
              ServiceRow,
              | "category_id"
              | "description"
              | "instructions"
              | "form_schema"
              | "base_price_minor"
              | "service_fee_minor"
              | "pricing_type"
              | "processing_estimate"
              | "image_path"
              | "is_active"
              | "is_featured"
              | "sort_order"
            >
          >
      >;
      orders: Table<
        OrderRow,
        Pick<
          OrderRow,
          | "order_reference"
          | "tracking_token_hash"
          | "customer_name"
          | "customer_phone"
          | "service_name_snapshot"
          | "service_details"
          | "subtotal_minor"
          | "service_fee_minor"
          | "total_minor"
        > &
          Partial<
            Pick<
              OrderRow,
              | "customer_email"
              | "service_id"
              | "currency"
              | "payment_status"
              | "fulfilment_status"
              | "customer_notes"
              | "internal_notes"
              | "payment_instructions_snapshot"
            >
          >
      >;
      payment_submissions: Table<
        PaymentSubmissionRow,
        Pick<PaymentSubmissionRow, "order_id" | "amount_reported_minor"> &
          Partial<
            Pick<
              PaymentSubmissionRow,
              | "payment_reference"
              | "payment_date"
              | "receipt_storage_path"
              | "status"
              | "reviewed_by"
              | "reviewed_at"
              | "rejection_reason"
              | "customer_note"
            >
          >
      >;
      order_events: Table<
        OrderEventRow,
        Pick<OrderEventRow, "order_id" | "event_type"> &
          Partial<
            Pick<
              OrderEventRow,
              | "actor_id"
              | "previous_status"
              | "new_status"
              | "note"
              | "metadata"
            >
          >
      >;
    };
    Views: Record<string, never>;
    Functions: {
      submit_manual_payment_report: {
        Args: {
          p_order_reference: string;
          p_tracking_token_hash: string;
          p_amount_reported_minor: number;
          p_payment_reference?: string | null;
          p_payment_date?: string | null;
          p_customer_note?: string | null;
        };
        Returns: string;
      };
      admin_review_payment_submission: {
        Args: {
          p_submission_id: string;
          p_decision: string;
          p_rejection_reason?: string | null;
        };
        Returns: undefined;
      };
      admin_update_order_fulfilment: {
        Args: {
          p_order_id: string;
          p_new_status: string;
          p_note?: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: {
      staff_role: "admin" | "staff";
      pricing_type: "fixed" | "quotation";
    };
    CompositeTypes: Record<string, never>;
  };
};
