/**
 * Unified Account & Session Registry for Elevara.
 * Manages multiple authenticated accounts, token-based quick login, and seamless account switching.
 */

const STORAGE_KEY = 'elevara_saved_accounts';

export const accountManager = {
  /**
   * Retrieve all saved accounts, migrating legacy keys if present.
   */
  getSavedAccounts() {
    if (typeof window === 'undefined') return [];
    try {
      let accounts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      
      // Migration from legacy 'saved_accounts' or 'elevara_accounts'
      if (!Array.isArray(accounts) || accounts.length === 0) {
        const legacy1 = JSON.parse(localStorage.getItem('saved_accounts') || '[]');
        const legacy2 = JSON.parse(localStorage.getItem('elevara_accounts') || '[]');
        const combined = [...(Array.isArray(legacy1) ? legacy1 : []), ...(Array.isArray(legacy2) ? legacy2 : [])];
        
        if (combined.length > 0) {
          const map = new Map();
          combined.forEach(item => {
            const id = item.id || item.user?.id;
            const email = item.email || item.user?.email;
            if (id && email && !map.has(id)) {
              map.set(id, {
                id,
                email,
                name: item.name || email.split('@')[0],
                avatarUrl: item.avatarUrl || null,
                session: item.session || null,
                lastActive: item.savedAt ? new Date(item.savedAt).getTime() : Date.now()
              });
            }
          });
          accounts = Array.from(map.values());
          localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
        }
      }

      return Array.isArray(accounts) ? accounts.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0)) : [];
    } catch (e) {
      console.error('Failed to get saved accounts:', e);
      return [];
    }
  },

  /**
   * Save or update an authenticated account with its current session tokens.
   */
  saveAccount({ user, session, profile }) {
    if (typeof window === 'undefined' || !user?.id || !user?.email) return;
    try {
      const accounts = this.getSavedAccounts();
      const existingIdx = accounts.findIndex(a => a.id === user.id);

      const accountData = {
        id: user.id,
        email: user.email,
        name: profile?.fullName || profile?.username || user.user_metadata?.full_name || user.email.split('@')[0],
        avatarUrl: profile?.avatarUrl || user.user_metadata?.avatar_url || null,
        role: user.role || 'USER',
        session: session ? {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        } : (existingIdx !== -1 ? accounts[existingIdx].session : null),
        lastActive: Date.now()
      };

      if (existingIdx !== -1) {
        accounts[existingIdx] = { ...accounts[existingIdx], ...accountData };
      } else {
        accounts.unshift(accountData);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      // Dispatch custom event for real-time header/login sync
      window.dispatchEvent(new CustomEvent('elevara_accounts_changed'));
    } catch (e) {
      console.error('Failed to save account:', e);
    }
  },

  /**
   * Remove an account from saved accounts list.
   */
  removeAccount(accountId) {
    if (typeof window === 'undefined') return;
    try {
      const accounts = this.getSavedAccounts().filter(a => a.id !== accountId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      window.dispatchEvent(new CustomEvent('elevara_accounts_changed'));
    } catch (e) {
      console.error('Failed to remove account:', e);
    }
  },

  /**
   * Switch to a saved account using its stored session tokens.
   * If valid, Supabase sets the active session without re-prompting for password.
   */
  async restoreSession(accountId, supabase) {
    if (!supabase || typeof window === 'undefined') {
      return { success: false, error: 'Supabase client unavailable' };
    }

    const accounts = this.getSavedAccounts();
    const target = accounts.find(a => a.id === accountId);

    if (!target) {
      return { success: false, error: 'Account not found in registry' };
    }

    if (!target.session?.access_token || !target.session?.refresh_token) {
      return { 
        success: false, 
        error: 'NO_TOKENS', 
        email: target.email,
        name: target.name 
      };
    }

    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: target.session.access_token,
        refresh_token: target.session.refresh_token
      });

      if (error || !data?.session) {
        // Clear expired/invalid tokens from this saved account
        const updatedAccounts = this.getSavedAccounts().map(a => 
          a.id === accountId ? { ...a, session: null } : a
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});

        return { 
          success: false, 
          error: 'SESSION_EXPIRED', 
          email: target.email,
          name: target.name 
        };
      }

      // Update fresh session tokens returned by Supabase
      this.saveAccount({
        user: data.session.user,
        session: data.session,
        profile: { avatarUrl: target.avatarUrl, fullName: target.name }
      });

      return { success: true, session: data.session };
    } catch (err) {
      console.error('Session restore exception:', err);
      return { 
        success: false, 
        error: err.message || 'RESTORE_FAILED', 
        email: target.email,
        name: target.name 
      };
    }
  }
};
