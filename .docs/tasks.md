# Tasks - Projeto Clima

Este arquivo quebra a implementacao do PRD em tarefas menores para execucao progressiva por agentes de IA.

Referencia principal: [`prd.md`](./prd.md). Use o PRD como fonte de verdade para regras de produto, endpoints, dados obrigatorios, criterios de aceite e detalhes visuais. Evite duplicar informacoes aqui quando elas ja estiverem descritas no PRD.

## Orientacoes para agentes

- Trabalhe em apenas uma task por vez.
- Antes de implementar, leia as secoes do PRD referenciadas na task.
- Mantenha o escopo da task; nao antecipe tarefas futuras, exceto quando for necessario para compilar.
- Ao concluir, rode uma verificacao compativel com a mudanca, preferencialmente `npm run build`.
- Marque a task com `[x]` somente quando todos os criterios de aprovacao dela forem atendidos.

## Tarefas

- [x] 1. Limpar a base inicial do Vite e preparar a estrutura da aplicacao.
  - Referencias: PRD secoes 4.1, 5.1, 7.1.
  - Escopo: remover a tela inicial do Vite/TypeScript, imports e assets nao usados; preparar `src/main.ts` e `src/style.css` para a aplicacao de clima; manter o app rodando em Vite + Vanilla + TypeScript.
  - Criterio de aprovacao: a aplicacao compila sem referencias ao contador/template inicial, a tela nao exibe conteudo padrao do Vite e `npm run build` finaliza com sucesso.

- [x] 2. Criar o modulo dedicado da Open-Meteo.
  - Referencias: PRD secoes 4.3, 4.4, 5.1, 5.2, 5.3.
  - Escopo: criar `src/services/openMeteo.ts` com funcoes dedicadas para geocoding e clima; centralizar nesse modulo a montagem das URLs e chamadas `fetch`.
  - Criterio de aprovacao: a UI nao monta URLs da Open-Meteo diretamente, o modulo valida parametros obrigatorios antes de requisitar e parametros ausentes retornam resultado vazio ou `null` sem disparar `fetch`.

- [x] 3. Implementar tipagem e normalizacao dos dados de clima para a UI.
  - Referencias: PRD secoes 3.2, 5.3, 5.4, 5.6, 6.
  - Escopo: definir o modelo usado pela UI, validar campos obrigatorios das respostas, calcular a probabilidade de precipitacao a partir de `hourly.precipitation_probability` e mapear `weather_code` para descricao textual.
  - Criterio de aprovacao: uma resposta valida da Open-Meteo gera um objeto no formato esperado pela UI, respostas incompletas retornam `null`/vazio, e codigos WMO conhecidos e desconhecidos exibem descricoes conforme o PRD.

- [x] 4. Implementar o fluxo de busca completo no estado da aplicacao.
  - Referencias: PRD secoes 3.1, 3.3, 5.5, 8.
  - Escopo: validar texto digitado, executar geocoding e clima em sequencia, controlar um unico estado de loading, bloquear busca duplicada durante carregamento e tratar falhas como ausencia de resultado.
  - Criterio de aprovacao: buscar uma cidade dispara no maximo uma sequencia geocoding -> clima, o loading cobre as duas requisicoes, novas buscas ficam bloqueadas durante o loading e erros nao quebram a interface.

- [ ] 5. Construir o formulario de busca no topo.
  - Referencias: PRD secoes 3.1, 7.1, 7.3.
  - Escopo: criar campo de texto centralizado no topo, com botao ou envio claro; conectar o submit ao fluxo de busca; refletir estado de loading no controle.
  - Criterio de aprovacao: o usuario consegue pesquisar pelo teclado e/ou botao, o campo aceita texto livre, o controle indica progresso durante loading e nao permite envio concorrente.

- [ ] 6. Criar os estados de interface: inicial, loading, resultado e sem resultado.
  - Referencias: PRD secoes 3.3, 7.4, 8.
  - Escopo: renderizar estado inicial vazio antes da primeira busca, estado de loading, painel com resultado valido e empty state para cidade/clima/dados obrigatorios ausentes.
  - Criterio de aprovacao: cada estado aparece na situacao correta, o empty state orienta o usuario a pesquisar uma cidade e nenhuma falha de rede ou dado incompleto aparece como erro bruto na tela.

- [ ] 7. Renderizar a sidebar com os dados principais.
  - Referencias: PRD secoes 3.2, 5.6, 6, 7.2, 8.
  - Escopo: exibir temperatura atual, cidade, codigo do pais, dia atual, indicacao dia/noite, `weather_code` e descricao textual na sidebar esquerda.
  - Criterio de aprovacao: com dados validos, todos os campos principais aparecem na sidebar, a temperatura e a cidade tem destaque visual e a descricao do codigo meteorologico segue o mapeamento do PRD.

- [ ] 8. Renderizar a area principal com metricas complementares.
  - Referencias: PRD secoes 3.2, 5.4, 5.6, 7.2, 8.
  - Escopo: exibir umidade relativa, temperatura aparente, probabilidade de precipitacao e velocidade/direcao do vento na area principal direita.
  - Criterio de aprovacao: com dados validos, todas as metricas aparecem com valores e unidades quando disponiveis, a precipitacao vem de `hourly.precipitation_probability` e os blocos sao faceis de escanear.

- [ ] 9. Aplicar o layout visual responsivo definido no PRD.
  - Referencias: PRD secoes 7.1, 7.2, 7.5, 8.
  - Escopo: aplicar fundo cinza escuro, painel branco centralizado com largura maxima de `800px`, bordas arredondadas, busca no topo sem background proprio, sidebar e area principal dentro de uma unica div/painel.
  - Criterio de aprovacao: em desktop o painel fica centralizado com sidebar esquerda e area principal direita; em telas menores o conteudo empilha verticalmente com boa legibilidade; o visual respeita cores, hierarquia e contraste do PRD.

- [ ] 10. Garantir resiliencia do servico e da UI em cenarios invalidos.
  - Referencias: PRD secoes 4.4, 5.2, 5.3, 5.4, 8.
  - Escopo: revisar validacoes para cidade vazia, geocoding sem resultado, clima sem campos obrigatorios, precipitacao sem valor valido, falha de rede e respostas inesperadas.
  - Criterio de aprovacao: todos os cenarios invalidos resultam em estado sem resultado ou vazio controlado, nenhuma requisicao invalida e feita por falta de parametros essenciais e nao ha excecao visual para o usuario.

- [ ] 11. Validar integracao manual com cidades reais.
  - Referencias: PRD secoes 3.1, 3.2, 3.3, 5.5, 8.
  - Escopo: testar manualmente pelo menos uma cidade valida, uma cidade inexistente e uma busca vazia usando o servidor de desenvolvimento do Vite.
  - Criterio de aprovacao: cidade valida exibe todos os dados esperados, cidade inexistente exibe empty state, busca vazia nao dispara fluxo invalido e o loading aparece como uma unica acao.

- [ ] 12. Fazer verificacao final de build e aderencia ao PRD.
  - Referencias: PRD secoes 8, 9.
  - Escopo: rodar a verificacao final, revisar se o que foi implementado esta dentro do escopo inicial e confirmar que itens fora de escopo nao foram adicionados por acidente.
  - Criterio de aprovacao: `npm run build` passa, todos os criterios de aceite aplicaveis do PRD estao cobertos e funcionalidades fora de escopo inicial nao foram implementadas.
