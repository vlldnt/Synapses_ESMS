const PERMISSIONS = {
  admin: {
    pages: ['all'],
    dataAccess: 'all',
  },
  direction: {
    pages: ['CRR', 'VEILLE', 'RM', 'RA', 'BA', 'PE', 'PS', 'HAS', 'AAP'],
    dataAccess: 'org',
  },
  agent: {
    pages: ['CRI', 'PPAMS', 'PPAS', 'BILAN', 'ECRIT'],
    dataAccess: 'own',
  },
};

export function checkPageAccess(role, page) {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  if (perms.pages.includes('all')) return true;
  return perms.pages.includes(page);
}

export function checkDataAccess(role, userId, orgId, resourceUserId, resourceOrgId) {
  const perms = PERMISSIONS[role];
  if (!perms) return false;

  if (perms.dataAccess === 'all') return resourceOrgId === orgId;
  if (perms.dataAccess === 'org') return resourceOrgId === orgId;
  if (perms.dataAccess === 'own') return resourceUserId === userId && resourceOrgId === orgId;

  return false;
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const { role, organizationId } = req.auth;

    if (!role) {
      return res.status(403).json({ error: 'No role assigned' });
    }

    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export function checkOrgId(req, res, next) {
  const { organizationId } = req.auth;
  const queryOrgId = req.body?.organizationId || req.query?.organizationId || req.params?.organizationId;

  if (queryOrgId && queryOrgId !== organizationId) {
    return res.status(403).json({ error: 'Cannot access other organizations' });
  }

  next();
}
