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

## Tarefa 2: proteger a main com o CI
- **PR Bloqueado:** [COLE_AQUI_O_LINK_DO_PR_COM_ERRO]
- **PR Liberado:** [COLE_AQUI_O_LINK_DO_PR_COM_SUCESSO]
- **Saída do git push recusado:**
  ```text
  remote: - Changes must be made through a pull request.
  remote: - Required status check "verificar" is expected.