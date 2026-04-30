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
      banners: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          image_url: string;
          mobile_image_url: string | null;
          link_url: string | null;
          link_text: string | null;
          position: "hero" | "promo_strip" | "middle" | "footer";
          sort_order: number;
          is_active: boolean;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
          title_color: string | null;
          subtitle_color: string | null;
          description_color: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string | null;
          description?: string | null;
          image_url: string;
          mobile_image_url?: string | null;
          link_url?: string | null;
          link_text?: string | null;
          position: "hero" | "promo_strip" | "middle" | "footer";
          sort_order?: number;
          is_active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
          title_color?: string | null;
          subtitle_color?: string | null;
          description_color?: string | null;
        };
        Update: {
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          image_url?: string;
          mobile_image_url?: string | null;
          link_url?: string | null;
          link_text?: string | null;
          position?: "hero" | "promo_strip" | "middle" | "footer";
          sort_order?: number;
          is_active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          title_color?: string | null;
          subtitle_color?: string | null;
          description_color?: string | null;
        };
        Relationships: [];
      };
      delivery_zones: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          areas: string[];
          fee: number;
          free_above: number | null;
          estimated_days: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          areas?: string[];
          fee: number;
          free_above?: number | null;
          estimated_days?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          areas?: string[];
          fee?: number;
          free_above?: number | null;
          estimated_days?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
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
          delivery_fee?: number;
          total?: number;
          order_notes?: string | null;
          delivery_address?: string;
          delivery_city?: string;
          delivery_type?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
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
      store_settings: {
        Row: {
          id: number;
          store_name: string;
          support_email: string | null;
          support_phone: string | null;
          default_delivery_fee: number;
          delivery_cities: string[];
          order_notification_emails: string[];
          updated_at: string;
        };
        Insert: {
          id?: number;
          store_name?: string;
          support_email?: string | null;
          support_phone?: string | null;
          default_delivery_fee?: number;
          delivery_cities?: string[];
          order_notification_emails?: string[];
          updated_at?: string;
        };
        Update: {
          id?: number;
          store_name?: string;
          tagline?: string;
          support_email?: string | null;
          support_phone?: string | null;
          whatsapp_number?: string;
          address?: string;
          city?: string;
          country?: string;
          currency?: string;
          default_delivery_fee?: number;
          delivery_cities?: string[];
          order_notification_emails?: string[];
          mpesa_shortcode?: string;
          mpesa_environment?: string;
          wasender_api_key?: string;
          wasender_phone_id?: string;
          tax_rate?: number;
          free_shipping_threshold?: number;
          low_stock_threshold?: number;
          tax_inclusive?: boolean;
          allow_guest_checkout?: boolean;
          new_order_sound_enabled?: boolean;
          new_message_sound_enabled?: boolean;
          primary_color?: string;
          secondary_color?: string;
          accent_color?: string;
          font_heading?: string;
          font_body?: string;
          logo_url?: string;
          [key: string]: unknown;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          category: "ordering" | "shipping" | "products" | "health" | "restaurant" | "wholesale" | "general";
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          category?: "ordering" | "shipping" | "products" | "health" | "restaurant" | "wholesale" | "general";
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          question?: string;
          answer?: string;
          category?: "ordering" | "shipping" | "products" | "health" | "restaurant" | "wholesale" | "general";
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          role: string | null;
          location: string | null;
          quote: string;
          rating: number;
          product: string | null;
          avatar_url: string | null;
          is_active: boolean;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role?: string | null;
          location?: string | null;
          quote: string;
          rating?: number;
          product?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          role?: string | null;
          location?: string | null;
          quote?: string;
          rating?: number;
          product?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      notifications: {
          title: string;
          message: string;
          order_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          message: string;
          order_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          type?: string;
          title?: string;
          message?: string;
          order_id?: string | null;
          is_read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey";
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
