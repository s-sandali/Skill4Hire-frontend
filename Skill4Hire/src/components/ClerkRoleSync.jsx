import { useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';

// Synchronises Clerk user metadata (role + ids) with localStorage so legacy guards stay functional.
const ClerkRoleSync = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  const metadata = useMemo(() => {
    if (!user) {
      return {
        role: null,
        userId: null,
        companyId: null,
        employeeId: null,
        candidateId: null,
      };
    }

    const pickString = (value) => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length > 0) {
          return trimmed;
        }
      }
      if (typeof value === 'number' && !Number.isNaN(value)) {
        return String(value);
      }
      return null;
    };

    const resolveClaim = (key) => {
      return pickString(user.unsafeMetadata?.[key])
        || pickString(user.publicMetadata?.[key])
        || pickString(user[key]);
    };

    return {
      role: resolveClaim('role'),
      userId: pickString(user.id),
      companyId: resolveClaim('companyId') || resolveClaim('company_id'),
      employeeId: resolveClaim('employeeId') || resolveClaim('employee_id'),
      candidateId: resolveClaim('candidateId') || resolveClaim('candidate_id'),
    };
  }, [user]);

  const { role, userId, companyId, employeeId, candidateId } = metadata;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isLoaded) return;

    const storage = window.localStorage;

    if (!isSignedIn) {
      storage.removeItem('userRole');
      storage.removeItem('userId');
      storage.removeItem('companyId');
      storage.removeItem('employeeId');
      storage.removeItem('candidateId');
      return;
    }

    if (role) {
      storage.setItem('userRole', role.toUpperCase());
    } else {
      storage.removeItem('userRole');
    }

    const persisted = {
      userId,
      companyId,
      employeeId,
      candidateId,
    };

    Object.entries(persisted).forEach(([key, value]) => {
      if (!value) {
        storage.removeItem(key);
        return;
      }
      storage.setItem(key, value);
    });
  }, [isLoaded, isSignedIn, role, userId, companyId, employeeId, candidateId]);

  return null;
};

export default ClerkRoleSync;
