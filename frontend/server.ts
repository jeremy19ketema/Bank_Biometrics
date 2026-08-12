import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Resolve directory name for ESM module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const PORTAL_DIR = path.join(process.cwd(), 'stitch_bioverify_banking_portal');

// Serve static assets from the portal folders
app.use(express.static(PORTAL_DIR));

// Index all folders under stitch_bioverify_banking_portal
const pageFolders = fs.readdirSync(PORTAL_DIR).filter(file => {
  const fullPath = path.join(PORTAL_DIR, file);
  return fs.statSync(fullPath).isDirectory() && file !== 'precision_institutional';
});

// Map clean paths and exact folder paths to html files
const routeMap: Record<string, string> = {};

pageFolders.forEach(folder => {
  // Map exact folder path: /login_biometric_banking_system
  routeMap[`/${folder}`.toLowerCase()] = path.join(PORTAL_DIR, folder, 'code.html');

  // Map cleaned path: /login-biometric-banking-system -> /login
  const cleanName = folder.replace('_biometric_banking_system', '').replace(/_/g, '-');
  routeMap[`/${cleanName}`.toLowerCase()] = path.join(PORTAL_DIR, folder, 'code.html');

  // Aliases for user convenience
  if (cleanName === 'login') {
    routeMap['/login'] = path.join(PORTAL_DIR, folder, 'code.html');
    routeMap['/'] = path.join(PORTAL_DIR, folder, 'code.html');
  } else if (cleanName === 'super-admin-dashboard') {
    routeMap['/super-admin'] = path.join(PORTAL_DIR, folder, 'code.html');
    routeMap['/admin'] = path.join(PORTAL_DIR, folder, 'code.html');
  } else if (cleanName === 'manager-dashboard') {
    routeMap['/manager'] = path.join(PORTAL_DIR, folder, 'code.html');
  } else if (cleanName === 'accountant-dashboard') {
    routeMap['/accountant'] = path.join(PORTAL_DIR, folder, 'code.html');
  } else if (cleanName === 'page-not-found-404') {
    routeMap['/404'] = path.join(PORTAL_DIR, folder, 'code.html');
  } else if (cleanName === 'access-denied-403') {
    routeMap['/403'] = path.join(PORTAL_DIR, folder, 'code.html');
  } else if (cleanName === 'fingerprint-scan') {
    routeMap['/scan'] = path.join(PORTAL_DIR, folder, 'code.html');
  }
});

// Client-side router script to be dynamically injected at body end
const ROUTER_SCRIPT = `
<!-- Aegis Biometric UI Client-Side Router Injection -->
<script>
document.addEventListener('DOMContentLoaded', () => {
  const linkRoutes = {
    'dashboard': (current) => {
      if (current.includes('super-admin') || current.includes('admin')) return '/super-admin-dashboard';
      if (current.includes('manager')) return '/manager-dashboard';
      return '/accountant-dashboard';
    },
    'branch management': '/branch-management',
    'branches': '/branch-management',
    'accountants': '/accountant-list',
    'verifications': '/verification-history',
    'audit logs': '/system-reports',
    'audit trail': '/system-reports',
    'transactions': '/transaction-history',
    'role management': '/role-management',
    'roles': '/role-management',
    'permission management': '/permission-management',
    'permissions': '/permission-management',
    'settings': '/system-settings',
    'profile': '/profile-settings',
    'generate report': '/branch-reports',
    'forgot passcode': '/forgot-password',
    'sign out': '/login',
    'logout': '/login',
    'support': '/404',
    'cancel': () => {
      // Go back to relevant page
      if (window.location.pathname.includes('scan') || window.location.pathname.includes('result')) {
        return '/cash-withdrawal';
      }
      return '/login';
    },
    'retry scan': '/fingerprint-scan'
  };

  // 1. Intercept all href="#" links
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    
    const href = anchor.getAttribute('href');
    if (href === '#' || !href) {
      e.preventDefault();
      const text = anchor.textContent.trim().toLowerCase();
      const currentPath = window.location.pathname;

      let targetRoute = null;

      // Match text against routing dict
      for (const [key, value] of Object.entries(linkRoutes)) {
        if (text.includes(key)) {
          targetRoute = typeof value === 'function' ? value(currentPath) : value;
          break;
        }
      }

      // Context-aware "View Details" mapping
      if (!targetRoute && (text.includes('view details') || text.includes('details'))) {
        if (currentPath.includes('branch')) {
          targetRoute = '/branch-details';
        } else if (currentPath.includes('manager')) {
          targetRoute = '/manager-details';
        } else if (currentPath.includes('accountant')) {
          targetRoute = '/accountant-details';
        } else {
          targetRoute = '/customer-profile';
        }
      }

      // Add/Edit buttons
      if (!targetRoute) {
        if (text.includes('create branch') || text.includes('add branch')) {
          targetRoute = '/create-branch';
        } else if (text.includes('edit branch')) {
          targetRoute = '/edit-branch';
        } else if (text.includes('create accountant') || text.includes('add accountant')) {
          targetRoute = '/create-accountant';
        } else if (text.includes('edit accountant')) {
          targetRoute = '/edit-accountant';
        } else if (text.includes('create manager') || text.includes('add manager')) {
          targetRoute = '/create-bank-manager';
        } else if (text.includes('edit manager')) {
          targetRoute = '/edit-bank-manager';
        }
      }

      if (targetRoute) {
        window.location.href = targetRoute;
      }
    }
  });

  // 2. Intercept Login form submit and route based on ID
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('username');
      const username = usernameInput ? usernameInput.value.trim().toLowerCase() : '';
      
      // Simulate loading state
      const submitBtn = document.getElementById('submitBtn');
      const loadingSpinner = document.getElementById('loadingSpinner');
      const btnText = submitBtn ? submitBtn.querySelector('span') : null;
      
      if (submitBtn) submitBtn.setAttribute('disabled', 'true');
      if (btnText) btnText.textContent = 'Verifying Identity...';
      if (loadingSpinner) loadingSpinner.classList.remove('hidden');

      setTimeout(() => {
        if (username.includes('admin') || username.includes('super')) {
          window.location.href = '/super-admin-dashboard';
        } else if (username.includes('manager')) {
          window.location.href = '/manager-dashboard';
        } else {
          // Default: Teller/Accountant Dashboard
          window.location.href = '/accountant-dashboard';
        }
      }, 1200);
    });
  }

  // 3. Make table rows clickable to navigate details
  const tables = document.querySelectorAll('table');
  tables.forEach(table => {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', (e) => {
        // If user clicks a button/checkbox/link in a row, let normal event fire
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
          return;
        }
        
        const currentPath = window.location.pathname;
        if (currentPath.includes('accountant_list') || currentPath.includes('accountant-list')) {
          window.location.href = '/accountant-details';
        } else if (currentPath.includes('bank_manager_list') || currentPath.includes('manager-list')) {
          window.location.href = '/manager-details';
        } else if (currentPath.includes('branch_management') || currentPath.includes('branch-management')) {
          window.location.href = '/branch-details';
        } else if (currentPath.includes('customer_search') || currentPath.includes('customer-search')) {
          window.location.href = '/customer-profile';
        } else if (currentPath.includes('transaction_approval') || currentPath.includes('transaction-approval')) {
          window.location.href = '/transaction-analytics';
        }
      });
    });
  });

  // 4. Biometric scanning triggers
  const scanButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent.includes('Biometric Key') || 
    btn.textContent.includes('Initiate Verification')
  );
  scanButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const currentPath = window.location.pathname;
      if (currentPath.includes('cash_withdrawal') || currentPath.includes('cash-withdrawal') || currentPath.includes('customer')) {
        e.preventDefault();
        window.location.href = '/fingerprint-scan';
      }
    });
  });

  // 5. Auto-advance biometric fingerprint scanner simulator
  if (window.location.pathname.includes('fingerprint-scan') || window.location.pathname.includes('scan')) {
    setTimeout(() => {
      window.location.href = '/verification-result';
    }, 3500);
  }

  // 6. Verification Result "Proceed/Authorize" action redirection
  const actionBtn = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Proceed') || 
    btn.textContent.includes('Authorize') ||
    btn.textContent.includes('Done')
  );
  if (actionBtn && window.location.pathname.includes('verification_result') || window.location.pathname.includes('verification-result')) {
    actionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Back to withdrawal success or profile
      window.location.href = '/transaction-history';
    });
  }
});
</script>
`;

function servePage(filePath: string, res: express.Response) {
  if (!fs.existsSync(filePath)) {
    res.status(404).send('Page not found');
    return;
  }

  try {
    let html = fs.readFileSync(filePath, 'utf-8');
    
    // Inject client micro-router script
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${ROUTER_SCRIPT}</body>`);
    } else {
      html += ROUTER_SCRIPT;
    }
    
    res.send(html);
  } catch (err) {
    console.error('Error serving page:', err);
    res.status(500).send('Internal Server Error');
  }
}

// Global routes handler
app.get('*', (req, res, next) => {
  const rawPath = req.path.toLowerCase();
  
  // Strip trailing slash
  const cleanPath = rawPath.endsWith('/') && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath;

  // Direct route check
  if (routeMap[cleanPath]) {
    servePage(routeMap[cleanPath], res);
    return;
  }

  // Segment matches (mapping clean routes e.g. /login to folders)
  const segment = cleanPath.slice(1).replace(/-/g, '_');
  const folderMatch = pageFolders.find(f => f.startsWith(segment) || f.endsWith(segment) || f === segment);
  if (folderMatch) {
    servePage(path.join(PORTAL_DIR, folderMatch, 'code.html'), res);
    return;
  }

  // Static files check in portal directory
  next();
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Aegis Biometric Banking Server Running Localized`);
  console.log(` Port:    http://localhost:${PORT}`);
  console.log(` Default: http://localhost:${PORT}/login`);
  console.log(`==================================================`);
});
