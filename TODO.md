# Role Hierarchy & Approval Workflow - Implementation TODO

## Phase 1: Database Schema Updates

- [x] 1.1 Update Prisma schema with new Role enums and ApprovalRequest model
- [x] 1.2 Update SQL init schema to match Prisma changes

## Phase 2: Backend - Models & Middleware

- [x] 2.1 Update auth middleware with new role support and first-login check
- [x] 2.2 Create approvalController with CRUD operations
- [x] 2.3 Create approvalRoutes
- [x] 2.4 Update staffController with new role creation flows
- [x] 2.5 Update authController with first-login/credential change logic
- [x] 2.6 Update route index and individual route guards

## Phase 3: Frontend - Types & Auth

- [x] 3.1 Update types/index.ts with new roles, statuses, ApprovalRequest
- [x] 3.2 Update lib/auth.ts with new role mappings, routes, access
- [x] 3.3 Update middleware.ts with first-login detection and new roles
- [x] 3.4 Update API login route with new roles and isFirstLogin
- [x] 3.5 Update lib/validations.ts with new role schemas

## Phase 4: Frontend - Stores

- [x] 4.1 Create approvalStore.ts (Zustand)
- [x] 4.2 Update superAdminStore.ts with new user types and approval integration

## Phase 5: Frontend - New Pages & Components

- [x] 5.1 Create change-credentials page (/(auth)/change-credentials)
- [x] 5.2 Create approval queue management page (via store)

## Phase 6: Frontend - Existing Page Updates

- [x] 6.1 Create VaultSidebar.tsx with new role navigation (vault-inspired)
- [x] 6.2 Create VaultTopbar.tsx for new roles (vault-inspired breadcrumb)
- [x] 6.3 Update login page for first-login redirect (vault-inspired design)
- [x] 6.4 Create approvals page (/(dashboard)/approvals)
- [x] 6.5 Update dashboard layout to use VaultSidebar and VaultTopbar
- [ ] 6.6 Update super-admin dashboard page (vault-inspired)
- [ ] 6.7 Update manager dashboard page (vault-inspired)
- [ ] 6.8 Update IT dashboard page (vault-inspired)
- [ ] 6.9 Update internal-manager dashboard page (vault-inspired)
- [ ] 6.10 Update FOREX dashboard page (vault-inspired)
- [ ] 6.11 Update accountant dashboard page (vault-inspired)

## Phase 7: Testing & Verification

- [ ] 7.1 Test first-login forced credential change flow
- [ ] 7.2 Test approval workflow (Super Admin level)
- [ ] 7.3 Test approval workflow (Bank Manager level)
- [ ] 7.4 Test RBAC route protection
- [ ] 7.5 Test password reset flow
