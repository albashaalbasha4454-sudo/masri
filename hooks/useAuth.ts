import { useCallback, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import type { User, SessionUser } from '../types';

const simpleHash = (password: string, salt: string) => `hashed_${password}_with_${salt}`;

const toSessionUser = (user: User): SessionUser => ({
  id: user.id,
  username: user.username,
  role: user.role,
});

/**
 * Authentication hook that stores only safe session fields in localStorage.
 */
const useAuth = (users: User[]) => {
  const [currentUser, setCurrentUser] = useLocalStorage<SessionUser | null>('currentUser', null);

  useEffect(() => {
    if (!currentUser) return;

    const freshUser = users.find(u => u.id === currentUser.id);

    if (!freshUser) {
      setCurrentUser(null);
      return;
    }

    const safeSession = toSessionUser(freshUser);
    if (JSON.stringify(safeSession) !== JSON.stringify(currentUser)) {
      setCurrentUser(safeSession);
    }
  }, [users, currentUser, setCurrentUser]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return false;

    const passwordHash = simpleHash(password, user.salt);
    if (passwordHash !== user.passwordHash) return false;

    setCurrentUser(toSessionUser(user));
    return true;
  }, [users, setCurrentUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  return {
    currentUser,
    login,
    logout,
  };
};

export default useAuth;
