# Ayola Foods KE — Client Handover Documentation
**Prepared by:** Development Team  
**Handover Date:** April 2026  
**Website:** [ayola-foods-ke.vercel.app](https://ayola-foods-ke.vercel.app)  
**Admin Panel:** [ayola-foods-ke.vercel.app/admin](https://ayola-foods-ke.vercel.app/admin)

---

## 📦 Document Index

This folder contains the complete handover documentation for the Ayola Foods KE platform.

| # | Document | Audience | Description |
|---|---|---|---|
| 01 | [Project Overview](./01_Project_Overview.md) | Client / All | What was built, the tech stack, key links |
| 02 | [User Guide — Public Website](./02_User_Guide_Public_Website.md) | End Users / Staff | How customers use the website |
| 03 | [User Guide — Admin Dashboard](./03_User_Guide_Admin_Dashboard.md) | Admin / Kitchen Staff | How to manage orders, products, customers |
| 04 | [Admin API Reference](./04_Admin_API_Reference.md) | Developers | All API endpoints, request/response shapes |
| 05 | [Database Schema](./05_Database_Schema.md) | Developers | Tables, columns, relationships, RLS |
| 06 | [Deployment & Environment](./06_Deployment_Environment.md) | Developers / DevOps | Vercel, Supabase, M-Pesa, environment vars |
| 07 | [Maintenance & Troubleshooting](./07_Maintenance_Troubleshooting.md) | Developers / Admin | Common issues, how to maintain the platform |

---

## 🔑 Quick Reference

| Item | Value |
|---|---|
| **Live URL** | https://ayola-foods-ke.vercel.app |
| **Admin URL** | https://ayola-foods-ke.vercel.app/admin |
| **Supabase Project** | Configured in `.env` → `NEXT_PUBLIC_SUPABASE_URL` |
| **M-Pesa** | Daraja API (Sandbox by default — switch to production per doc 06) |
| **Framework** | Next.js 16 (App Router) |
| **Database** | Supabase (PostgreSQL) |
| **Hosting** | Vercel |

---

## 🧭 Where to Start

- **If you are Prisca (Founder / Admin):** Read documents **02** and **03**.
- **If you are kitchen staff:** Read section 3.2 of document **03**.
- **If you are a developer taking over:** Read documents **04**, **05**, and **06** in order.
- **If something is broken:** Jump to document **07**.
