const LAST_INPUT_KEY = 'pension_abacus_last_input';
const LAST_RESULT_KEY = 'pension_abacus_last_result';
const ACCOUNT_BALANCE_KEY = 'pension_abacus_account_balance';
const FAMILY_LAST_INPUT_KEY = 'pension_abacus_family_last_input';
const FAMILY_LAST_RESULT_KEY = 'pension_abacus_family_last_result';
const FAMILY_ACCOUNT_BALANCE_KEY = 'pension_abacus_family_account_balance';

function getWxStorage() {
  if (typeof wx === 'undefined') {
    return null;
  }
  return wx;
}

function get(key, fallback = null) {
  const storage = getWxStorage();
  if (!storage) return fallback;

  try {
    const value = storage.getStorageSync(key);
    return value === '' || value === undefined ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function set(key, value) {
  const storage = getWxStorage();
  if (!storage) return;
  storage.setStorageSync(key, value);
}

function remove(key) {
  const storage = getWxStorage();
  if (!storage) return;
  storage.removeStorageSync(key);
}

module.exports = {
  ACCOUNT_BALANCE_KEY,
  FAMILY_ACCOUNT_BALANCE_KEY,
  FAMILY_LAST_INPUT_KEY,
  FAMILY_LAST_RESULT_KEY,
  LAST_INPUT_KEY,
  LAST_RESULT_KEY,
  get,
  remove,
  set
};
