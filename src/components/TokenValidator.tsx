/**
 * Componente que valida o token JWT ao carregar a aplicação
 * Remove dados de autenticação se o token estiver expirado
 * Validação silenciosa - sem notificações ao usuário
 */

import { useEffect } from 'react';
import { Logger } from '@/utils/logger';

const logger = new Logger('TokenValidator');

export function TokenValidator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const validateToken = () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const expiresAt = localStorage.getItem('expires_at');

        // Se não tem token, não precisa validar
        if (!accessToken || !expiresAt) {
          return;
        }

        // Verificar se o token expirou
        const expirationTime = parseInt(expiresAt) * 1000;
        const now = Date.now();

        if (now >= expirationTime) {
          logger.info('🔒 Token expirado detectado - limpando dados de autenticação');
          
          // Limpar todos os dados de autenticação
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('expires_at');
          localStorage.removeItem('user');
          localStorage.removeItem('token'); // Limpar tokens antigos também
          localStorage.removeItem('authToken');
          
          logger.info('✅ Dados limpos - usuário será visto como deslogado');
        } else {
          // Token ainda válido
          const hoursRemaining = Math.floor((expirationTime - now) / (1000 * 60 * 60));
          logger.debug(`✅ Token válido - expira em ${hoursRemaining}h`);
        }
      } catch (error) {
        logger.error('❌ Erro ao validar token:', error);
        // Em caso de erro, limpar dados por segurança
        localStorage.clear();
      }
    };

    // Validar ao montar o componente
    validateToken();

    // Validar periodicamente a cada 5 minutos
    const interval = setInterval(validateToken, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
