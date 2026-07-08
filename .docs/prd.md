# PRD - Projeto Clima

## 1. Visao Geral

O Projeto Clima e uma aplicacao web para consulta de condicoes climaticas atuais a partir do nome de uma cidade. O usuario informa uma cidade, a aplicacao consulta a API Open-Meteo para localizar latitude, longitude e timezone, e em seguida usa esses dados para buscar as informacoes de clima da regiao.

O objetivo e entregar uma experiencia simples, direta e visualmente organizada, exibindo os dados principais de clima em um painel central com sidebar e area de detalhes.

## 2. Objetivos do Produto

- Permitir que o usuario pesquise o clima atual de uma cidade pelo nome.
- Exibir as principais informacoes climaticas de forma clara.
- Tratar estados de carregamento, erro e busca sem resultado.
- Centralizar toda comunicacao com a API Open-Meteo em funcoes dedicadas.
- Manter a interface leve, responsiva e compativel com Vite + Vanilla + TypeScript.

## 3. Escopo Funcional

### 3.1 Busca por cidade

O usuario deve conseguir digitar o nome de uma cidade em um campo de busca localizado na area superior da tela.

Ao enviar a busca:

- A aplicacao deve iniciar um unico estado de loading para o usuario.
- A aplicacao deve consultar o endpoint de geocoding da Open-Meteo.
- Caso a cidade seja encontrada, a aplicacao deve usar latitude, longitude e timezone para consultar o clima.
- Caso a cidade nao seja encontrada, a interface deve exibir um estado vazio/sem resultados.
- Caso a cidade seja encontrada, mas a consulta de clima falhe ou nao retorne dados suficientes, a interface tambem deve exibir o estado sem resultados.

### 3.2 Dados exibidos

Na sidebar esquerda, devem ser exibidos:

- Temperatura atual.
- Nome da cidade e codigo do pais.
- Dia atual.
- Indicacao se e dia ou noite.
- Codigo meteorologico (`weather_code`) e sua interpretacao textual.

Na area principal, devem ser exibidos:

- Umidade relativa.
- Temperatura aparente.
- Probabilidade de precipitacao.
- Velocidade e direcao do vento.

### 3.3 Estados da interface

A aplicacao deve contemplar:

- Estado inicial vazio, antes de qualquer busca.
- Estado de loading durante as duas requisicoes.
- Estado com resultado encontrado.
- Estado sem resultado quando nao houver cidade, clima ou dados obrigatorios.
- Estado de erro generico tratado como ausencia de resultado, sem quebrar a interface.

## 4. Requisitos de Sistema

### 4.1 Stack

- Vite.
- Vanilla JavaScript com TypeScript.
- HTML, CSS e TypeScript sem framework de UI.
- Requisicoes HTTP usando `fetch`.

### 4.2 Compatibilidade

- A aplicacao deve rodar em navegadores modernos com suporte a ES Modules.
- Deve funcionar localmente via servidor de desenvolvimento do Vite.
- Nao deve depender de backend proprio.

### 4.3 Performance

- A busca deve executar apenas as requisicoes necessarias.
- A interface deve bloquear buscas duplicadas enquanto uma busca estiver em andamento.
- O estado de loading deve cobrir as duas chamadas da Open-Meteo como uma unica acao para o usuario.

### 4.4 Resiliencia

- As funcoes de API devem validar parametros obrigatorios antes de fazer requisicoes.
- Se algum parametro essencial nao for informado, a funcao deve retornar resultado vazio ou `null`, sem disparar uma requisicao invalida.
- Falhas de rede, respostas vazias ou dados incompletos devem ser tratados sem lancar erro visual na tela.

## 5. Detalhes Tecnicos

### 5.1 Arquitetura sugerida

Criar um modulo dedicado para comunicacao com a Open-Meteo, por exemplo:

```text
src/services/openMeteo.ts
```

Esse arquivo deve conter as funcoes responsaveis por:

- Buscar dados de geolocalizacao a partir do nome da cidade.
- Buscar dados climaticos a partir de latitude, longitude e timezone.
- Opcionalmente normalizar os dados retornados para um formato usado pela UI.

A UI nao deve montar URLs da Open-Meteo diretamente. Ela deve chamar apenas as funcoes desse modulo.

### 5.2 Endpoint de geocoding

Endpoint:

```text
https://geocoding-api.open-meteo.com/v1/search?name={NOME_DA_CIDADE}&count=1&language=pt&format=json
```

Parametro:

- `{NOME_DA_CIDADE}`: texto digitado pelo usuario.

Dados obrigatorios a extrair:

- `name`
- `latitude`
- `longitude`
- `timezone`
- `country_code`

Se `results` vier vazio, ausente ou sem os campos obrigatorios, a busca deve ser considerada sem resultado.

### 5.3 Endpoint de clima

Endpoint base:

```text
https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_direction_10m,wind_speed_10m&hourly=temperature_2m,precipitation_probability&timezone={TIMEZONE}
```

Parametros:

- `{LATITUDE}`: latitude retornada pelo geocoding.
- `{LONGITUDE}`: longitude retornada pelo geocoding.
- `{TIMEZONE}`: timezone retornado pelo geocoding.

Dados obrigatorios de `current`:

- `temperature_2m`
- `relative_humidity_2m`
- `apparent_temperature`
- `is_day`
- `weather_code`
- `wind_direction_10m`
- `wind_speed_10m`
- `time`

Dados obrigatorios de `current_units`:

- Unidades das propriedades exibidas na interface, quando disponiveis.

Dados obrigatorios de `hourly`:

- `time`
- `precipitation_probability`

### 5.4 Probabilidade de precipitacao

A API Open-Meteo nao fornece `precipitation_probability` diretamente dentro de `current` no endpoint especificado. Portanto, a aplicacao deve solicitar `precipitation_probability` em `hourly` e selecionar o valor correspondente ao horario atual.

Regra recomendada:

- Usar `current.time` como referencia.
- Procurar o mesmo horario dentro de `hourly.time`.
- Se nao houver correspondencia exata, usar o item horario mais proximo.
- Se nao houver valor valido em `hourly.precipitation_probability`, considerar a busca sem resultado.

### 5.5 Fluxo da busca

1. Usuario digita o nome da cidade.
2. Usuario envia a busca.
3. Aplicacao valida se o texto nao esta vazio.
4. Aplicacao exibe loading.
5. Aplicacao chama a funcao de geocoding.
6. Se nao houver cidade valida, exibe estado sem resultado.
7. Se houver cidade valida, aplicacao chama a funcao de clima.
8. Se nao houver clima valido, exibe estado sem resultado.
9. Se houver clima valido, aplicacao renderiza os dados no painel.
10. Loading e finalizado.

### 5.6 Modelo de dados sugerido para a UI

```ts
type WeatherViewModel = {
  cityName: string;
  countryCode: string;
  currentDate: string;
  temperature: {
    value: number;
    unit: string;
  };
  relativeHumidity: {
    value: number;
    unit: string;
  };
  apparentTemperature: {
    value: number;
    unit: string;
  };
  precipitationProbability: {
    value: number;
    unit: string;
  };
  wind: {
    speed: number;
    speedUnit: string;
    direction: number;
    directionUnit: string;
  };
  isDay: boolean;
  weatherCode: number;
  weatherDescription: string;
};
```

## 6. Interpretacao de Weather Code

A aplicacao deve mapear `weather_code` para uma descricao textual baseada nos codigos WMO:

| Codigo | Descricao |
| --- | --- |
| 0 | Ceu limpo |
| 1, 2, 3 | Principalmente limpo, parcialmente nublado ou nublado |
| 45, 48 | Nevoeiro |
| 51, 53, 55 | Garoa leve, moderada ou intensa |
| 56, 57 | Garoa congelante leve ou intensa |
| 61, 63, 65 | Chuva fraca, moderada ou forte |
| 66, 67 | Chuva congelante leve ou forte |
| 71, 73, 75 | Neve fraca, moderada ou forte |
| 77 | Graos de neve |
| 80, 81, 82 | Pancadas de chuva fracas, moderadas ou violentas |
| 85, 86 | Pancadas de neve fracas ou fortes |
| 95 | Tempestade fraca ou moderada |
| 96, 99 | Tempestade com granizo fraco ou forte |

Caso o codigo nao esteja mapeado, exibir uma descricao generica como `Condicao desconhecida`.

## 7. Instrucoes Visuais e UX

### 7.1 Layout geral

- Fundo da pagina em cinza escuro.
- Conteudo principal centralizado horizontalmente.
- Largura maxima do painel principal: `800px`.
- Area superior centralizada contendo apenas o campo de busca.
- A area superior nao deve ter background proprio.
- Sidebar e area principal devem ficar dentro de uma unica div/painel com fundo branco e bordas arredondadas.

### 7.2 Estrutura do painel

O painel de resultados deve ser dividido em:

- Sidebar esquerda para informacoes principais.
- Area principal direita para metricas complementares.

Em telas menores, o layout deve poder empilhar sidebar e area principal verticalmente, mantendo boa legibilidade.

### 7.3 Campo de busca

- Deve ficar no topo, centralizado.
- Deve aceitar texto livre com o nome da cidade.
- Deve ter um botao ou comportamento claro para enviar a busca.
- Durante loading, deve indicar progresso e evitar nova busca concorrente.

### 7.4 Empty state

O empty state deve aparecer:

- Antes da primeira busca.
- Quando uma cidade nao for encontrada.
- Quando a busca de clima nao retornar dados validos.

O empty state deve ser visualmente simples e orientar o usuario a pesquisar uma cidade.

### 7.5 Estilo visual

- Fundo geral: cinza escuro.
- Painel de resultado: branco.
- Bordas do painel: arredondadas.
- Tipografia limpa e legivel.
- Dados principais, como temperatura e nome da cidade, devem ter mais destaque visual.
- Metricas secundarias devem ser organizadas em blocos escaneaveis.
- Evitar excesso de cores; usar contraste para hierarquia e legibilidade.

## 8. Criterios de Aceite

- O usuario consegue pesquisar uma cidade pelo nome.
- A aplicacao realiza a busca de geocoding e clima em sequencia.
- O usuario percebe apenas uma acao de loading durante todo o fluxo.
- A aplicacao exibe temperatura, cidade, pais, dia atual, dia/noite e weather code na sidebar.
- A aplicacao exibe umidade relativa, temperatura aparente, probabilidade de precipitacao e vento na area principal.
- A probabilidade de precipitacao e obtida de `hourly.precipitation_probability`.
- A aplicacao exibe empty state antes da busca e em buscas sem resultado.
- A UI nao faz chamadas diretas para a Open-Meteo fora do modulo dedicado.
- Parametros ausentes ou invalidos nao geram requisicoes invalidas.
- O layout respeita o fundo cinza escuro, painel branco centralizado, bordas arredondadas e largura maxima de `800px`.

## 9. Fora de Escopo Inicial

- Autocomplete de cidades.
- Historico de buscas.
- Favoritos.
- Previsao para varios dias.
- Grafico horario de temperatura.
- Geolocalizacao automatica do usuario.
- Backend proprio ou cache em servidor.
