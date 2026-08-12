# Aegis Biometric Banking Portal - Full-Stack Migration Report

This report outlines the technical blueprint to migrate the static Google Stitch HTML mockup screens into a modern, enterprise-grade, full-stack application.

---

## 1. Folder Structure Mapping (Static HTML to Next.js 15 + Express Monorepo)

To integrate both frontend and backend code cleanly, we propose a monorepo layout. 

```
/root
  ├── /frontend                     # Next.js 15 Application
  │   ├── /public                   # Static assets (images, icons)
  │   └── /src
  │       ├── /app                  # Next.js App Router (Details in Section 2)
  │       ├── /components           # React Components
  │       │   ├── /ui               # shadcn/ui primitives (Button, Card, Dialog, Table, etc.)
  │       │   └── /shared           # Custom layouts (Sidebar, Topbar, StatCard, Biometric scanner)
  │       ├── /hooks                # Custom React Hooks (useAuth, useBiometrics)
  │       ├── /lib                  # Utilities (cn.ts, api-client.ts)
  │       ├── /types                # TS interface definitions
  │       └── middleware.ts         # JWT-based client-side route guard (RBAC)
  │
  ├── /backend                      # Express.js Server
  │   ├── /src
  │   │   ├── /config               # DB configurations, environment variables
  │   │   ├── /controllers          # Business logic handlers (auth, transactions, branches)
  │   │   ├── /middleware           # authMiddleware (JWT), rbacMiddleware, errorHandlers
  │   │   ├── /models               # Sequelize / Prisma PostgreSQL models
  │   │   ├── /routes               # Endpoint routers mapping to controllers
  │   │   ├── /services             # Biometric validation helpers, audit logs
  │   │   └── index.ts              # Express Server entrypoint
  │
  ├── /infrastructure               # DevOps & Containerization
  │   ├── /nginx
  │   │   └── nginx.conf            # Nginx config for reverse proxying frontend/backend
  │   ├── /docker
  │   │   ├── frontend.Dockerfile
  │   │   └── backend.Dockerfile
  │   └── docker-compose.yml        # Orchestration (Next.js, Express, Postgres, Nginx)
  │
  └── package.json                  # Root npm workspaces configuration
```

---

## 2. Routing Mapping (App Router Blueprint)

Next.js 15 **App Router** enables nested layouts and route groupings. By wrapping routes in folders like `(dashboard)` and `(auth)`, we can define shared layouts (`SideNavBar` and `TopNavBar`) to eliminate the markup duplication present in the mockups.

```
/src/app
  ├── (auth)
  │   ├── login
  │   │   └── page.tsx              --> login_biometric_banking_system
  │   └── forgot-password
  │       └── page.tsx              --> forgot_password_biometric_banking_system
  │
  ├── (dashboard)
  │   ├── layout.tsx                # Mounts SideNavBar + TopNavBar, injects {children}
  │   │
  │   ├── super-admin               # SUPER_ADMIN Routes
  │   │   ├── page.tsx              --> super_admin_dashboard_biometric_banking_system
  │   │   ├── branches
  │   │   │   ├── page.tsx          --> branch_management_biometric_banking_system
  │   │   │   ├── create
  │   │   │   │   └── page.tsx      --> create_branch_biometric_banking_system
  │   │   │   └── [id]
  │   │   │       ├── page.tsx      --> branch_details_biometric_banking_system
  │   │   │       ├── info
  │   │   │       │   └── page.tsx  --> branch_information_biometric_banking_system
  │   │   │       └── edit
  │   │   │           └── page.tsx  --> edit_branch_biometric_banking_system
  │   │   ├── managers
  │   │   │   ├── page.tsx          --> bank_manager_list_biometric_banking_system
  │   │   │   ├── create
  │   │   │   │   └── page.tsx      --> create_bank_manager_biometric_banking_system
  │   │   │   └── [id]
  │   │   │       ├── page.tsx      --> manager_details_biometric_banking_system
  │   │   │       └── edit
  │   │   │           └── page.tsx  --> edit_bank_manager_biometric_banking_system
  │   │   ├── system-settings
  │   │   │   └── page.tsx          --> system_settings_biometric_banking_system
  │   │   └── system-reports
  │   │       └── page.tsx          --> system_reports_biometric_banking_system
  │   │
  │   ├── manager                   # MANAGER Routes
  │   │   ├── page.tsx              --> manager_dashboard_biometric_banking_system
  │   │   ├── accountants
  │   │   │   ├── page.tsx          --> accountant_list_biometric_banking_system
  │   │   │   ├── create
  │   │   │   │   └── page.tsx      --> create_accountant_biometric_banking_system
  │   │   │   └── [id]
  │   │   │       ├── page.tsx      --> accountant_details_biometric_banking_system
  │   │   │       ├── performance
  │   │   │       │   └── page.tsx  --> accountant_performance_biometric_banking_system
  │   │   │       └── edit
  │   │   │           └── page.tsx  --> edit_accountant_biometric_banking_system
  │   │   └── transactions
  │   │       └── approvals
  │   │           └── page.tsx      --> transaction_approval_biometric_banking_system
  │   │
  │   ├── accountant                # ACCOUNTANT / OPERATOR Routes
  │   │   ├── page.tsx              --> accountant_dashboard_biometric_banking_system
  │   │   ├── customers
  │   │   │   ├── page.tsx          --> customer_search_biometric_banking_system
  │   │   │   └── [id]
  │   │   │       └── page.tsx      --> customer_profile_biometric_banking_system
  │   │   ├── transactions
  │   │   │   ├── withdrawal
  │   │   │   │   └── page.tsx      --> cash_withdrawal_biometric_banking_system
  │   │   │   ├── cheque-processing
  │   │   │   │   └── page.tsx      --> cheque_processing_biometric_banking_system
  │   │   │   ├── history
  │   │   │   │   └── page.tsx      --> transaction_history_biometric_banking_system
  │   │   │   └── analytics
  │   │   │       └── page.tsx      --> transaction_analytics_biometric_banking_system
  │   │   └── biometrics
  │   │       ├── scan
  │   │       │   └── page.tsx      --> fingerprint_scan_biometric_banking_system
  │   │       ├── result
  │   │       │   └── page.tsx      --> verification_result_biometric_banking_system
  │   │       ├── history
  │   │       │   └── page.tsx      --> verification_history_biometric_banking_system
  │   │       ├── analytics
  │   │       │   └── page.tsx      --> verification_analytics_biometric_banking_system
  │   │       └── statistics
  │   │           └── page.tsx      --> verification_statistics_biometric_banking_system
  │   │
  │   └── shared                    # Profile & Common Panels
  │       ├── profile-settings
  │       │   └── page.tsx          --> profile_settings_biometric_banking_system
  │       ├── role-management
  │       │   └── page.tsx          --> role_management_biometric_banking_system
  │       └── permission-management
  │           └── page.tsx          --> permission_management_biometric_banking_system
  │
  ├── 403
  │   └── page.tsx                  --> access_denied_403
  ├── not-found.tsx                 --> page_not_found_404
  └── page.tsx                      # Root route (redirects to /login or /dashboard)
```

---

## 3. Reusable UI Components (Mapping to shadcn/ui)

We will extract and refine components from the static HTML markup into custom React hooks and shadcn components:

| Stitch Mockup Markup | Target shadcn/ui Component | Refactoring Logic |
|---|---|---|
| Duplicated left `aside` panel | Custom `SideNavBar` | Created once in `components/shared/sidebar.tsx` with role filtering based on AuthContext. |
| Duplicated top `header` bar | Custom `TopNavBar` | Leverages shadcn `Breadcrumb` and `DropdownMenu` for user profiles. |
| Dashboard Metric Cards | shadcn `Card` + Lucide | Abstracted to `<StatCard title={...} value={...} change={...} />` with Lucide icons. |
| Search & List Data Tables | shadcn `Table` + TanStack Table | Created as a generic table mapping columns, dynamic cell rendering, and pagination parameters. |
| Biometric Fingerprint Circle | Custom stateful `<BiometricScanner />` | Replaces CSS animation mockup with active device hooks (WebUSB/FIDO2). |
| Static Status Tags (e.g. Approved) | shadcn `Badge` | Map styling states using theme CSS variables from the design system. |
| Creation & Edit Forms | shadcn `Form` + `zod` | Combined with `react-hook-form` and schema validations for error tracking. |
| Confirmation Popups | shadcn `Dialog` | Used to trigger dynamic modals for transaction approvals or audit logs. |

---

## 4. Missing Pages & System Components (Security & Operations)

For a fully compliant, production-grade biometric banking application, the following views and backend systems are missing from the generated mockups:

1. **Authentication guards & Middlewares:**
   * Next.js Middleware check on requests, redirecting unauthenticated traffic to `/login` and unauthorized roles to `/403`.
2. **Staff Enrollment & Activation Link Pages:**
   * A portal view for newly created Managers/Accountants to select their credentials, passwords, and enroll initial biometric templates.
3. **Hardware Management Console:**
   * A page to register physical security tokens, enroll new biometric scanners, and calibrate FIPS 140-3 hardware devices.
4. **Session Expiry Warnings:**
   * An overlay warning modal and timer that triggers automatic logout after a period of user inactivity (e.g. 5 minutes).
5. **Loading Skeletal Layouts:**
   * Next.js `loading.tsx` loaders for charts and lists to provide immediate feedback during backend fetches.
6. **Error Boundaries:**
   * Next.js `error.tsx` catch-alls to handle query failures gracefully without breaking the workspace dashboard UI.

---

## 5. Placeholder Components to Replace

To transition from static presentations to functional widgets:

1. **Analytical Charts:**
   * Replace `<script src="chart.js">` CDNs with **Recharts** styled dynamically using values from `precision_institutional/DESIGN.md`.
2. **Geographical Maps:**
   * Replace static `<img>` maps with interactive components using `react-leaflet` or Mapbox, pulling longitude/latitude from branch records.
3. **Biometric Scan Simulator:**
   * Connect CSS scanners to actual browser-facing FIDO2/WebAuthn APIs, or set up a secure local WebSocket daemon connecting to the bank tellers' USB scanner.
4. **User Avatars:**
   * Replace public web URLs with dynamic initial-generator badges, or set up an S3 file storage client.

---

## 6. TypeScript Issues & Schema Definition

Because the mockups use vanilla JavaScript, we must define strict types to prevent runtime errors:

### Key Entity Schemas (`types/index.ts`):
```typescript
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  ACCOUNTANT = 'ACCOUNTANT'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  branchId: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  managerId: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  metrics: {
    totalTransactions: number;
    activeOperators: number;
  };
}

export interface Transaction {
  id: string;
  customerId: string;
  accountantId: string;
  type: 'WITHDRAWAL' | 'DEPOSIT' | 'CHEQUE';
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  biometricVerificationId: string;
  createdAt: string;
}

export interface BiometricLog {
  id: string;
  userId: string;
  deviceId: string;
  status: 'SUCCESS' | 'FAILED';
  matchScore: number;
  far: number;
  frr: number;
  timestamp: string;
}
```

---

## 7. Missing Dependencies (System Setup)

To build and compile the application successfully, we must declare the following package specifications:

### Frontend (`frontend/package.json`):
* **Next.js & React:** `next@15.0.0`, `react@19.0.0`, `react-dom@19.0.0`
* **Styling & Icons:** `tailwindcss`, `lucide-react`, `tailwind-merge`, `clsx`
* **shadcn/ui primitives:** `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-slot`, `@radix-ui/react-toast`, `@radix-ui/react-label`
* **Form & Validation:** `react-hook-form`, `zod`, `@hookform/resolvers`
* **Charts:** `recharts`
* **Dev Dependencies:** `typescript`, `@types/react`, `@types/node`

### Backend (`backend/package.json`):
* **Server Framework:** `express`, `@types/express`
* **Authentication:** `jsonwebtoken`, `@types/jsonwebtoken`, `bcryptjs`, `@types/bcryptjs`
* **Database Driver/ORM:** `pg`, `sequelize` or `prisma`
* **Security & Utility:** `cors`, `helmet`, `morgan`, `dotenv`
* **Dev Run Tool:** `ts-node-dev`

---

## 8. Recommendations & Architecture Plan

### A. Development Environment & Docker Compose
Create a local multi-container environment to guarantee uniform setup across engineering team systems.

**`docker-compose.yml` Template:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: aegis_db
    environment:
      POSTGRES_DB: aegis_banking
      POSTGRES_USER: aegis_admin
      POSTGRES_PASSWORD: secure_dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aegis_admin -d aegis_banking"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: aegis_backend
    environment:
      PORT: 5000
      DATABASE_URL: postgres://aegis_admin:secure_dev_password@postgres:5432/aegis_banking
      JWT_SECRET: dev_secret_signing_key_987654321
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: aegis_frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:80/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    container_name: aegis_gateway
    ports:
      - "80:80"
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
```

---

### B. Nginx Gateway Settings (`nginx.conf`)
Configure Nginx as a reverse proxy gateway to handle incoming traffic, routes API queries to the Express server, and serves Next.js client pages.

```nginx
events { worker_connections 1024; }

http {
    include       mime.types;
    default_type  application/octet-stream;

    upstream frontend_server {
        server frontend:3000;
    }

    upstream backend_server {
        server backend:5000;
    }

    server {
        listen 80;
        server_name localhost;

        # API Requests
        location /api/ {
            proxy_pass http://backend_server/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Next.js Frontend
        location / {
            proxy_pass http://frontend_server;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

---

### C. JWT Authentication & Role-Based Access Control (RBAC) Flow
1. **Login:** User credentials and device info are posted to `/api/auth/login`.
2. **Tokens:** Backend returns a JWT `accessToken` (short-lived, 15 min, inside HTTP-only Secure SameSite cookie) and a `refreshToken` (stored securely in DB and HTTP-only cookie).
3. **RBAC Verification Middleware:**
   ```typescript
   export const authorize = (allowedRoles: UserRole[]) => {
     return (req: Request, res: Response, next: NextFunction) => {
       const user = req.user; // Appended by authMiddleware after JWT verify
       if (!user || !allowedRoles.includes(user.role)) {
         return res.status(403).json({ error: 'Access denied: Insufficient permissions.' });
       }
       next();
     };
   };
   ```
4. **Endpoint Guarding:**
   ```typescript
   router.post('/branches', authMiddleware, authorize([UserRole.SUPER_ADMIN]), createBranchHandler);
   ```

---

### D. Step-by-Step Migration Roadmap
1. **Sprint 1 (Base Setup):** Initialize directories, configure `docker-compose`, bootstrap the PostgreSQL schema, and setup the TypeScript Next.js app in workspaces.
2. **Sprint 2 (Auth & Design Integration):** Establish Express auth handlers (JWT/RBAC), install shadcn/ui components, and set up `tailwind.config.ts` using the design variables.
3. **Sprint 3 (Shell & Navigation):** Build the shared `SideNavBar` and `TopNavBar` layout system. Configure the Next.js router mappings and client-side auth cookies.
4. **Sprint 4 (Dashboard Views & Mock Replacement):** Migrating Super Admin, Manager, and Accountant dashboards. Install Recharts and connect them to real Express aggregation APIs.
5. **Sprint 5 (Operations & Biometrics):** Migrate customer profiles, transactions, and cheque processing. Build FIDO2/WebAuthn APIs to interface with the biometric scanning pages.
6. **Sprint 6 (Audit & Production Hardening):** Create immutable audit logger middlewares, lock down Nginx headers, optimize docker builds, and execute production penetration/compliance test dry-runs.
