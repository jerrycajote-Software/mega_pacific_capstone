# Changelog

All notable changes to the Mega Pacific project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] - 2026-08-06

### Added
- Comprehensive repository documentation structure in `docs/` (`01_Project`, `02_Architecture`, `03_Development`, `04_API`, `05_Database`, `06_UI`, `07_Features`, `08_Testing`, `09_Deployment`).
- Architecture Decision Records (ADRs) for PostgreSQL, Prisma ORM, Vite+React, and Express.js.
- Single-session token verification middleware for Admin and Sales logins.
- Stock adjustment audit logging (`InventoryLog`) for manual and bulk updates.
- Real-time customer service inquiry system powered by Socket.IO.
- Email OTP verification and forgot-password reset flow.
- Soft-delete account restoration and status management for users.
- PDF and Excel export capabilities for orders and reports.
- Product variant support and multi-image product gallery.
- Dark/Light mode theme switching and i18n support.
