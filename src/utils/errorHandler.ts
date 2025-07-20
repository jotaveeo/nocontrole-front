// Filtro global para erros de extensões do Chrome e outros erros não críticos

// Lista de erros que devem ser ignorados
const IGNORED_ERRORS = [
  'chrome-extension://',
  'moz-extension://',
  'webkit-masked-url://',
  'Non-Error promise rejection captured',
  'ResizeObserver loop limit exceeded',
  'A listener indicated an asynchronous response by returning true',
  'message channel closed before a response was received',
  'Cannot read properties of undefined (reading \'length\')',
  'Script error.',
  'Network request failed'
];

// Função para verificar se um erro deve ser ignorado
export const shouldIgnoreError = (error: string | Error): boolean => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return IGNORED_ERRORS.some(ignoredError => 
    errorMessage.includes(ignoredError)
  );
};

// Handler global para erros não capturados
export const setupGlobalErrorHandler = () => {
  // Capturar erros JavaScript
  window.addEventListener('error', (event) => {
    if (shouldIgnoreError(event.error || event.message)) {
      console.log('🤫 [ERROR_FILTER] Ignorando erro de extensão/não crítico:', event.message);
      event.preventDefault();
      return false;
    }
  });

  // Capturar promises rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    if (shouldIgnoreError(event.reason)) {
      console.log('🤫 [ERROR_FILTER] Ignorando promise rejection de extensão:', event.reason);
      event.preventDefault();
    }
  });
};

// Console override para filtrar logs desnecessários
export const filterConsoleErrors = () => {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    const message = args.join(' ');
    if (!shouldIgnoreError(message)) {
      originalError.apply(console, args);
    }
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    if (!shouldIgnoreError(message)) {
      originalWarn.apply(console, args);
    }
  };
};
