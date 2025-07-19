

export const resetAllData = () => {
  // Lista de todas as chaves do localStorage usadas pela aplicação
  const keys = [
    'financeflow_transactions',
    'financeflow_categories', 
    'financeflow_goals',
    'financeflow_wishlist',
    'financeflow_piggybank',
    'financeflow_debts',
    'financeflow_creditcards',
    'financeflow_limits',
    'financeflow_investments',
    'financeflow_fixedexpenses',
    'financeflow_incomesources',
    'financeflow_categorization_rules',
    'financeflow_categorization_history',
    'financeflow_custom_limits'
  ];

  // Remove todas as chaves do localStorage
  keys.forEach(key => {
    localStorage.removeItem(key);
  });

  // Limpar também qualquer cache adicional
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('financeflow_')) {
      localStorage.removeItem(key);
    }
  });

  console.log('Limpando dados...');
  console.log('Dados removidos:', keys);
  
  // Recarrega a página para aplicar as mudanças
  setTimeout(() => {
    window.location.reload();
  }, 500);
};
