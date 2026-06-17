export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateUsername = (username) => {
  return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
};

export const validateExpense = (form) => {
  const errors = {};
  
  if (!form.title || form.title.trim().length === 0) {
    errors.title = 'Title is required';
  }
  
  if (!form.amount || Number(form.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  
  if (!form.category) {
    errors.category = 'Category is required';
  }
  
  return errors;
};

export const validateSubscription = (form) => {
  const errors = {};
  
  if (!form.name || form.name.trim().length === 0) {
    errors.name = 'Subscription name is required';
  }
  
  if (!form.amount || Number(form.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  
  return errors;
};