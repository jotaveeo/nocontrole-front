# NoControle

NoControle é um sistema moderno de controle financeiro pessoal, desenvolvido em React + TypeScript, com design responsivo e foco em usabilidade. Permite gerenciar receitas, despesas, cartões, metas, wishlist, cofrinho, limites por categoria, relatórios e muito mais.

## Funcionalidades

- Cadastro e autenticação de usuários
- Lançamento de receitas e despesas
- Gestão de categorias personalizadas
- Controle de cartões de crédito
- Metas financeiras e wishlist
- Cofrinho digital para economias
- Limites de gastos por categoria
- Relatórios e gráficos detalhados
- Importação de extratos CSV
- Notificações inteligentes
- Backup e exportação de dados
- Política de privacidade e LGPD

## Tecnologias

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Firebase Auth (opcional)]

## Instalação

1. **Clone o repositório:**
   ```sh
   git clone https://github.com/seu-usuario/nocontrole-frontend.git
   cd nocontrole-frontend
   ```

2. **Instale as dependências:**
   ```sh
   npm install
   ```

3. **Configure variáveis de ambiente (se necessário):**
   - Crie um arquivo `.env` com as configurações da API backend e Firebase, se usar autenticação Google.

4. **Inicie o projeto:**
   ```sh
   npm run dev
   ```

5. **Acesse em:**  
   [http://localhost:5173](http://localhost:5173)

## Estrutura do Projeto

```
src/
  components/      # Componentes reutilizáveis
  contexts/        # Contextos globais (ex: autenticação, finanças)
  hooks/           # Hooks customizados
  lib/             # Integração com API e helpers
  pages/           # Páginas principais do app
  types/           # Tipos TypeScript globais
  utils/           # Funções utilitárias
  App.tsx          # Componente principal
  main.tsx         # Ponto de entrada
```

## Scripts

- `npm run dev` — Inicia o servidor de desenvolvimento
- `npm run build` — Gera build de produção
- `npm run preview` — Visualiza build de produção localmente
- `npm run lint` — Checa problemas de lint

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b minha-feature`
3. Commit suas alterações: `git commit -m 'feat: minha nova feature'`
4. Push para o fork: `git push origin minha-feature`
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.

---

Desenvolvido com 💜 por João Vitor Oliveira