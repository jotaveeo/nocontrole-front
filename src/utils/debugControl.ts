// Sistema de debug controlado
// Para ativar: localStorage.setItem('debug_mode', 'true')
// Para desativar: localStorage.removeItem('debug_mode')

const DEBUG_ENABLED = localStorage.getItem('debug_mode') === 'true';

export const debugLog = {
  auth: (...args: any[]) => {
    if (DEBUG_ENABLED) console.log("🔐 [AUTH]", ...args);
  },
  api: (...args: any[]) => {
    if (DEBUG_ENABLED) console.log("🌐 [API]", ...args);
  },
  token: (...args: any[]) => {
    if (DEBUG_ENABLED) console.log("🔑 [TOKEN]", ...args);
  },
  general: (...args: any[]) => {
    if (DEBUG_ENABLED) console.log("ℹ️ [DEBUG]", ...args);
  }
};

// Função para ativar/desativar debug
export const toggleDebug = (enable: boolean) => {
  if (enable) {
    localStorage.setItem('debug_mode', 'true');
    console.log("🐛 Debug mode ATIVADO");
  } else {
    localStorage.removeItem('debug_mode');
    console.log("🐛 Debug mode DESATIVADO");
  }
};

// Disponibilizar globalmente
(window as any).toggleDebug = toggleDebug;

if (DEBUG_ENABLED) {
  console.log("🐛 Debug mode está ATIVO. Use toggleDebug(false) para desativar.");
} else {
  console.log("💡 Para debug detalhado, use: toggleDebug(true)");
}
