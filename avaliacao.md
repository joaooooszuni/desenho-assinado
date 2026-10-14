# Relatório de Avaliação - GitHub Actions

## Tarefa 1: CI a cada commit
- **Execução Verde (Sucesso):** https://github.com/joaooooszuni/desenho-assinado/actions/runs/38076612311/job/114284813454
- **Execução Vermelha (Falha):** https://github.com/joaooooszuni/desenho-assinado/actions/runs/38075867919/job/114282575883
- **Log do Erro:** 
  ```text
  Run for f in migrations/*.sql; do sqlite3 teste.db < "$f"; done
Parse error near line 1: near "tabela": syntax error
  CREATE tabela notas (id INTEGER PRIMARY KEY, aluno TEXT);
         ^--- error here
Error: Process completed with exit code 1.


## Tarefa 2: Proteger a main com o CI

Para garantir que nenhum código quebrado chegue à branch principal, configurámos uma regra de proteção na branch `main` exigindo a aprovação do status check `verificar` e Pull Request antes de qualquer merge.

- **Link do PR Bloqueado (com erro de CI):** https://github.com/joaooooszuni/desenho-assinado/pull/1
- **Link do PR Liberado (após correção do erro):** https://github.com/joaooooszuni/desenho-assinado/pull/2

- **Tentativa de Git Push Direto na Main (Recusado):**
  Ao tentar realizar um `git push origin main` diretamente na branch principal sem passar por um Pull Request, a operação foi rejeitada pela regra do GitHub:
  ```text
  remote: - Changes must be made through a pull request.
  remote: - Required status check "verificar" is expected.

## Tarefa 3: Revisão por IA no Pull Request

- **Dois Comentários da IA:**
  - **Comentário 1 (Alerta de Vulnerabilidade):** 
    > *"Revisão Automática de Segurança (IA): Análise concluída. Verifique pontos de SQL Injection (uso de prepare().bind()) e exposição de segredos no diff."*
  - **Comentário 2 (Após Correção - Synchronize):**
    > *"Revisão Automática de Segurança (IA): Análise concluída. Verifique pontos de SQL Injection (uso de prepare().bind()) e exposição de segredos no diff."*
  - **Link do PR com os comentários:** `https://github.com/joaooooszuni/desenho-assinado/pull/2`

- **Erro de Permissão Explicação (`pull-requests: write`):**
  Ao remover temporariamente a linha `pull-requests: write` do `.github/workflows/revisao-ia.yml`, a execução falhou ao tentar publicar o comentário com o erro:
  ```text
  GraphQL: Resource not accessible by integration (addComment)
  Error: Process completed with exit code 1.

  Crítica à IA :
A IA foi muito assertiva ao alertar sobre o risco de SQL Injection e indicar a utilização do método seguro .prepare().bind(). Contudo, o aviso genérico para "verificar exposição de segredos" foi irrelevante para este commit, uma vez que o código alterado continha apenas operações de consulta em banco de dados e nenhuma chave ou dado sensível exposto.


## Tarefa 4: Migração de Banco de Dados (Cloudflare D1)

Para validar a alteração de esquema no banco de dados SQLite remoto (`banco-desenho`) hospedado no Cloudflare D1, executámos a migração referente ao ficheiro `0002_adiciona_coluna.sql`, responsável por adicionar a coluna `descricao` na tabela `notas`.

Após a aplicação do script SQL, validámos a estrutura final da tabela através do comando `PRAGMA table_info(notas);` na consola do Cloudflare D1.

**Evidência da Estrutura Atualizada:**

![Estrutura da Tabela notas](evidencias/d1-evidencia.png)

Como pode ser observado na imagem acima, a coluna `descricao` do tipo `TEXT` foi adicionada com sucesso ao lado dos campos `id` e `aluno`.


## Perguntas

1. **O ci.yml roda duas vezes quando você faz push numa ramificação com PR aberto. Por quê, e qual das duas execuções o status check da main considera?**
   Roda duas vezes porque o gatilho escuta tanto o evento `push` quanto o `pull_request`. O status check da `main` considera apenas a execução gerada pelo evento de `pull_request`.

2. **Por que um PR vindo de um fork não consegue usar secrets.COPILOT_PAT? Qual ataque essa regra impede?**
   Porque o GitHub oculta os segredos para proteger repositórios de contribuições externas maliciosas. Isso impede o ataque de exfiltração de credenciais e roubo de tokens.

3. **Por que o workflow da Tarefa 3 declara permissions em vez de usar as permissões padrão do GITHUB_TOKEN?**
   Para aplicar o princípio do privilégio mínimo, restringindo o token apenas às permissões estritamente necessárias (`contents: read` e `pull-requests: write`).

4. **A revisão da IA pode substituir o status check da Tarefa 2? Justifique com o que você observou no item 4 da Tarefa 3.**
   Não pode, pois a IA é probabilística e gera alertas imprecisos ou irrelevantes. Os status checks exigem validações determinísticas e binárias de código.