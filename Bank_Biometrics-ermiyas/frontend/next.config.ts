import type { NextConfig } from "next";
import path from "path";

const apiTarget = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const backendOrigin = apiTarget.replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/login_biometric_banking_system", destination: "/login", permanent: true },
      { source: "/forgot_password_biometric_banking_system", destination: "/forgot-password", permanent: true },
      { source: "/access_denied_403", destination: "/access-denied", permanent: true },
      { source: "/page_not_found_404", destination: "/404", permanent: true },
      { source: "/super_admin_dashboard_biometric_banking_system", destination: "/super-admin", permanent: true },
      { source: "/manager_dashboard_biometric_banking_system", destination: "/manager", permanent: true },
      { source: "/accountant_dashboard_biometric_banking_system", destination: "/accountant", permanent: true },
      { source: "/branch_management_biometric_banking_system", destination: "/branches", permanent: true },
      { source: "/branch_information_biometric_banking_system", destination: "/branches/info", permanent: true },
      { source: "/branch_details_biometric_banking_system", destination: "/branches/details", permanent: true },
      { source: "/create_branch_biometric_banking_system", destination: "/branches/create", permanent: true },
      { source: "/edit_branch_biometric_banking_system", destination: "/branches/edit", permanent: true },
      { source: "/branch_reports_biometric_banking_system", destination: "/branches/reports", permanent: true },
      { source: "/bank_manager_list_biometric_banking_system", destination: "/managers", permanent: true },
      { source: "/manager_details_biometric_banking_system", destination: "/managers/details", permanent: true },
      { source: "/create_bank_manager_biometric_banking_system", destination: "/managers/create", permanent: true },
      { source: "/edit_bank_manager_biometric_banking_system", destination: "/managers/edit", permanent: true },
      { source: "/accountant_list_biometric_banking_system", destination: "/accountants", permanent: true },
      { source: "/accountant_details_biometric_banking_system", destination: "/accountants/details", permanent: true },
      { source: "/create_accountant_biometric_banking_system", destination: "/accountants/create", permanent: true },
      { source: "/edit_accountant_biometric_banking_system", destination: "/accountants/edit", permanent: true },
      { source: "/accountant_performance_biometric_banking_system", destination: "/accountants/performance", permanent: true },
      { source: "/customer_search_biometric_banking_system", destination: "/customers/search", permanent: true },
      { source: "/customer_profile_biometric_banking_system", destination: "/customers/profile", permanent: true },
      { source: "/cash_withdrawal_biometric_banking_system", destination: "/transactions/withdrawal", permanent: true },
      { source: "/cheque_processing_biometric_banking_system", destination: "/transactions/cheque", permanent: true },
      { source: "/transaction_approval_biometric_banking_system", destination: "/transactions/approval", permanent: true },
      { source: "/transaction_history_biometric_banking_system", destination: "/transactions/history", permanent: true },
      { source: "/transaction_analytics_biometric_banking_system", destination: "/transactions/analytics", permanent: true },
      { source: "/fingerprint_scan_biometric_banking_system", destination: "/biometrics/scan", permanent: true },
      { source: "/verification_result_biometric_banking_system", destination: "/biometrics/result", permanent: true },
      { source: "/verification_history_biometric_banking_system", destination: "/biometrics/history", permanent: true },
      { source: "/verification_analytics_biometric_banking_system", destination: "/biometrics/analytics", permanent: true },
      { source: "/verification_statistics_biometric_banking_system", destination: "/biometrics/statistics", permanent: true },
      { source: "/role_management_biometric_banking_system", destination: "/governance/roles", permanent: true },
      { source: "/permission_management_biometric_banking_system", destination: "/governance/permissions", permanent: true },
      { source: "/system_settings_biometric_banking_system", destination: "/settings/system", permanent: true },
      { source: "/profile_settings_biometric_banking_system", destination: "/settings/profile", permanent: true },
      { source: "/system_reports_biometric_banking_system", destination: "/reports/system", permanent: true },
    ];
  },
};

export default nextConfig;
