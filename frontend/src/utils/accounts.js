const ACCOUNTS_KEY = 'savedAccounts';

export const getSavedAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
  } catch {
    return [];
  }
};

export const saveAccount = (token, user) => {
  const accounts = getSavedAccounts();
  const filtered = accounts.filter((a) => a.user.email !== user.email);
  const updated = [...filtered, { token, user }];
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updated));
};

export const removeAccount = (email) => {
  const accounts = getSavedAccounts().filter((a) => a.user.email !== email);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const updateSavedAccountUser = (email, updatedUser) => {
  const accounts = getSavedAccounts().map((a) =>
    a.user.email === email ? { ...a, user: updatedUser } : a
  );
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};