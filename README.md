# Insight Weaver — Dashboard de métricas com IA

Este repositório contém o código do painel publicado no Lovable (desafio RankMyApp): você sobe os JSONs de métricas, o dashboard monta as visualizações automaticamente e você pode solicitar uma análise por IA via um workflow no n8n.

## Entregas
- Painel publicado: https://vgs-dashboard-rmapp.lovable.app
- Código do painel: este repositório
- Workflow do n8n exportado: `n8n-workflow-analise.json`

## Como configurar e testar

### 1) Teste principal (recomendado): pelo Lovable
O jeito mais simples é testar diretamente no painel publicado:

- Abra: https://vgs-dashboard-rmapp.lovable.app
- Upload:
	- Suba um JSON da pasta `json/` (ex.: `pagina-inteira.json`).
	- Você pode subir mais de um arquivo de uma vez.
- Filtros e visualização:
	- Use o filtro de datas (ou quick-ranges 7d/30d/90d).
	- Confirme que os widgets mudam e que, quando o intervalo não tem dados, aparece o estado vazio (ex.: “Sem dados nas datas selecionadas”).
- Exportação:
	- Exportar → PDF/CSV/Relatório (JSON).
- IA:
	- Clique em “Analisar com IA” para disparar o workflow do n8n.

Observação importante sobre a IA: para a análise retornar, o workflow precisa estar ativo/publicado no n8n (webhook público/persistente). O endpoint configurado no frontend é `https://webhook.digital-ai.tech/webhook/analise`.

### 2) Teste opcional: local (para desenvolvimento)
Este modo é útil para desenvolver/iterar sem depender do deploy do Lovable.

Pré-requisito: Node.js + npm instalados.

```bash
cd insight-weaver-main
npm install
npm run dev
```

Abra a URL que o Vite mostrar no terminal (no meu ambiente ficou em `http://localhost:8080`).

### 3) n8n: como importar e manter o webhook ativo

- No n8n, importe `n8n-workflow-analise.json`.
- Ative o workflow para garantir que o webhook fique disponível.
- Se o n8n estiver atrás de autenticação/restrições de rede, garanta que o webhook seja público (ou que o frontend consiga acessá-lo).

## O que está pronto hoje
Este é o estado atual do projeto (o que dá para demonstrar no Lovable e/ou localmente):

- Upload de múltiplos JSONs com validação básica (evita arquivos “quebrados”/sem widgets).
- Widgets renderizados automaticamente a partir do JSON:
	- big number
	- line/area
	- bar
	- pie/donut
	- table
- Filtro de data:
	- seleção manual por intervalo e quick-ranges (7d/30d/90d)
	- estados vazios quando o filtro remove todos os dados (mensagem “Sem dados nas datas selecionadas”)
- Exportação:
	- PDF (print)
	- CSV
	- Relatório completo em JSON
- Integração n8n:
	- chamada via webhook
	- retorno da análise formatada em HTML (lista)
- Tratamento de erros na UX:
	- toasts para sucesso/erro no upload
	- feedback de erro na análise quando a requisição falha

## Desafios e como resolvi

- JSON “inconsistente” na prática: alguns arquivos vinham com `data` vazio, outros com `exampleData`, e isso fazia certos widgets parecerem sem dados.
	- O que fiz: tratei fallback de `exampleData` nos componentes e deixei o comportamento de filtro mais explícito.
- Filtro de datas que parecia não surtir efeito:
	- O que descobri: nem todo dataset expõe `date` do mesmo jeito; em alguns casos a data vinha vazia/estruturada.
	- O que fiz: ajuste de extração de data e estados vazios para o usuário entender quando o filtro “zerou” o resultado.
- IA travando a experiência quando o modelo demora:
	- O que fiz: adotei ack com `jobId` no n8n para o usuário não ficar preso numa request longa.
- Teste/validação ficava lento (dependia de deploy):
	- O que fiz: documentei teste local com Vite para acelerar iteração, mantendo o Lovable como caminho principal de validação.

## Melhorias futuras 
IA (qualidade e consistência)
- Exigir saída do modelo em JSON estrito (e não texto livre) e validar no n8n antes de enviar ao frontend.
- Adotar templates de prompt com exemplos curtos e objetivos (ex.: “3 insights + 1 recomendação acionável”).
- Adicionar validações automáticas no workflow (ex.: garantir que a resposta menciona números, tendência e ação recomendada).
- Criar um modo “debug” que exporta o prompt+payload usados para auditoria.

IA (fluxo assíncrono)
- Fechar o loop de ponta a ponta: entregar o resultado final ao frontend via `callbackUrl` (push) ou via polling por `jobId`.
- Persistir resultados por `jobId` (para o usuário poder voltar e ver análises anteriores).

Produto / UX
- Presets de filtros mais ricos (ex.: últimos 7/30/90, mês anterior, YTD) e indicação visual clara de filtro ativo.
- Melhorar a experiência de exportação (ex.: PDF com layout “report”, capa e rodapé).

Qualidade / Engenharia
- Testes automatizados (Playwright/Cypress) para upload, filtros, export e chamada do webhook.
- Pipeline de CI para build e smoke tests.
- Endurecer validação de JSON (schema) com mensagens de erro mais específicas no upload.

Segurança / Operação
- Assinatura/validação de token no webhook (evitar abuso do endpoint).
- Rate limit / fila para lidar com picos de requisições ao modelo.

