export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          tagline: string | null;
          icon: string | null;
          description: string | null;
          color: string | null;
          bg_color: string | null;
          ships_countrywide: boolean;
          price_from: number | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          tagline?: string | null;
          icon?: string | null;
          description?: string | null;
          color?: string | null;
          bg_color?: string | null;
          ships_countrywide?: boolean;
          price_from?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          tagline?: string | null;
          icon?: string | null;
          description?: string | null;
          color?: string | null;
          bg_color?: string | null;
          ships_countrywide?: boolean;
          price_from?: number | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          legacy_id: string | null;
          slug: string;
          name: string;
          category_id: string;
          description: string | null;
          long_description: string | null;
          price: number;
          size: string | null;
          image_url: string | null;
          features: string[];
          ingredients: string | null;
          nutrition_highlights: string[];
          badge: string | null;
          in_stock: boolean;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          legacy_id?: string | null;
          slug: string;
          name: string;
          category_id: string;
          description?: string | null;
          long_description?: string | null;
          price: number;
          size?: string | null;
          image_url?: string | null;
          features?: string[];
          ingredients?: string | null;
          nutrition_highlights?: string[];
          badge?: string | null;
          in_stock?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          legacy_id?: string | null;
          slug?: string;
          name?: string;
          category_id?: string;
          description?: string | null;
          long_description?: string | null;
          price?: number;
          size?: string | null;
          image_url?: string | null;
          features?: string[];
          ingredients?: string | null;
          nutrition_highlights?: string[];
          badge?: string | null;
          in_stock?: boolean;
          is_active?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          role: "customer" | "admin" | "kitchen";
          default_address: string | null;
          default_city: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          role?: "customer" | "admin" | "kitchen";
          default_address?: string | null;
          default_city?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          role?: "customer" | "admin" | "kitchen";
          default_address?: string | null;
          default_city?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          status: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          delivery_address: string;
          delivery_city: string;
          delivery_type: string;
          order_notes: string | null;
          subtotal: number;
          delivery_fee: number;
          total: number;
          payment_method: string;
          payment_status: string;
          mpesa_checkout_request_id: string | null;
          mpesa_receipt_number: string | null;
          created_at: string;
          updated_at: string;
          confirmed_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          status?: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          delivery_address: string;
          delivery_city: string;
          delivery_type?: string;
          order_notes?: string | null;
          subtotal: number;
          delivery_fee: number;
          total: number;
          payment_method: string;
          payment_status?: string;
          mpesa_checkout_request_id?: string | null;
          mpesa_receipt_number?: string | null;
          confirmed_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          status?: string;
          payment_status?: string;
          mpesa_checkout_request_id?: string | null;
          mpesa_receipt_number?: string | null;
          confirmed_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          product_price: number;
          quantity: number;
          line_total: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          product_price: number;
          quantity: number;
          line_total: number;
        };
        Update: {
          quantity?: number;
          line_total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_logs: {
        Row: {
          id: string;
          order_id: string | null;
          provider: string;
          event_type: string;
          raw_payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          provider: string;
          event_type: string;
          raw_payload?: Json | null;
        };
        Update: {
          order_id?: string | null;
          provider?: string;
          event_type?: string;
          raw_payload?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_logs_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
