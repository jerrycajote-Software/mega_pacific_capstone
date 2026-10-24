# Bug Reports Log

Index of fixed and ongoing bug reports for the project.

---

## Closed Issues

| Bug ID | Title | Module | Resolution | Date Fixed |
|--------|-------|--------|------------|------------|
| `BUG-001` | Single-Session Token Invalidation Failure | Auth | Updated `authMiddleware.js` to query DB `sessionToken` on admin routes. | 2026-07-25 |
| `BUG-002` | Image Zoom UI Layout Jump | Frontend UI | Constrained aspect ratio container in `ProductDetails.jsx`. | 2026-07-28 |
| `BUG-003` | Registration Account Soft-Delete Restoration | User Mgmt | Added restoration endpoint and status check on login. | 2026-08-02 |
