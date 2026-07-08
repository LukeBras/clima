# Projeto: Clima

este projeto vai pegar as cidade e baseado nisso, consultar o clima daquela região, exibindo  as principais infomações de clima, temperatuda, umidade e etc.

### Aspectos Técnicos

O projeto vai ser feito e Vite + Vanilla + Typescript


### Informações da API que será usada no projeto:

Ele vai usar a API OpenMeteo, com alguns endpoints:


#### Para pegar a latitute, longetude e timezone, baseado no nome da cidade:
https://geocoding-api.open-meteo.com/v1/search?name={NOME_DA_CIDADE}&count=1&language=pt&format=json

{NOME_DA_CIDADE}= nome da cidade que o usuário digitou

Exemplo de resposta:

{
  "results": [
    {
      "id": 3451190,
      "name": "Rio de Janeiro",
      "latitude": -22.90642,
      "longitude": -43.18223,
      "elevation": 12,
      "feature_code": "PPLA",
      "country_code": "BR",
      "admin1_id": 3451189,
      "admin2_id": 6322060,
      "timezone": "America/Sao_Paulo",
      "population": 6747815,
      "country_id": 3469034,
      "country": "Brasil",
      "admin1": "Rio de Janeiro",
      "admin2": "Rio de Janeiro"
    }
  ],
  "generationtime_ms": 1.1656284
}

Informações que PRECISAMOS:
-name
-latitude
-longetude
-timezone
-country_code



#### Para pegar as informações de clima:
https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&hourly=temperature_2m&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_direction_10m,wind_speed_10m&timezone={TIMEZONE}


{LATITUDE} = Latitude
{LONGITUDE} = Longitude
{TIMEZONE} = timezone

Exemplo de resposta:


{
  "latitude": -22.952549,
  "longitude": -43.215027,
  "generationtime_ms": 0.15413761138916,
  "utc_offset_seconds": 0,
  "timezone": "GMT",
  "timezone_abbreviation": "GMT",
  "elevation": 12,
  "current_units": {
    "time": "iso8601",
    "interval": "seconds",
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "apparent_temperature": "°C",
    "wind_speed_10m": "km/h",
    "wind_direction_10m": "°",
    "wind_gusts_10m": "km/h",
    "precipitation": "mm"
  },
  "current": {
    "time": "2026-07-07T19:30",
    "interval": 900,
    "temperature_2m": 21.2,
    "relative_humidity_2m": 84,
    "apparent_temperature": 20.9,
    "wind_speed_10m": 23.1,
    "wind_direction_10m": 231,
    "wind_gusts_10m": 63.4,
    "precipitation": 0
  },
  "hourly_units": {
    "time": "iso8601",
    "temperature_2m": "°C"
  },
 
    "temperature_2m": [20, 19.9, 19.8, 19.6, 19.3, 19.3, 19, 18.8, 18.5, 18.4, 18.5, 19.5, 21.7, 23.7, 25.5, 26.4, 26.3, 22.7, 22.4, 21.7, 20.7, 20.4, 20, 19.8, 19.7, 19.7, 19.7, 19.5, 19.4, 19.1, 19.1, 18.9, 18.9, 18.9, 19, 19.3, 19.8, 20.3, 20.7, 20.6, 20.5, 20.3, 20.2, 20, 19.7, 19.5, 19.4, 19.1, 18.6, 18.6, 18.7, 18.4, 18.1, 18.1, 17.8, 17.1, 16.5, 16.1, 16.1, 17.5, 19, 20.2, 20.9, 21.6, 22.1, 21.8, 21, 20.5, 19.6, 18.7, 18.4, 18.3, 18.1, 17.9, 17.7, 17.5, 17.3, 17.1, 16.7, 16.4, 16.4, 16.3, 16.5, 17.9, 19.8, 21.9, 23.7, 25.1, 25.9, 25.7, 24.3, 23, 21.7, 20.4, 20.1, 19.9, 19.8, 19.6, 19.5, 19.2, 19.1, 19, 18.7, 18.3, 18, 18.1, 19, 20.5, 21.8, 22.9, 23.9, 24.5, 24.5, 24.1, 23.6, 22.7, 21.6, 20.9, 20.7, 20.7, 20.8, 20.6, 20.4, 20.2, 20, 19.7, 19.6, 19.5, 19.5, 19.6, 19.6, 19.7, 20.3, 21.9, 24, 25.6, 26.2, 26.3, 25.9, 24.8, 23.2, 22, 21.5, 21.3, 21.1, 20.8, 20.5, 20.2, 19.8, 19.5, 19.3, 19.4, 19.7, 19.9, 19.7, 19.9, 20.1, 20.2, 20.4, 20.6, 20.7, 20.8, 20.8, 20.7, 20.5, 20.3, 20, 19.7]
  }


Informaçoes que precisamos da respostas:

Na resposta, eu tenho dois itens:
- currents_units tem a s unidades de medida das propriedades
- current tem os valores das propriedades

Propriedades obrigatorias
- temperature_2m
- relative_humidity_2m
- apparent_temperature
- is_day
- wind_direction_10m
- precipitation_probability


#### Informação importante:
Teremos um arquivo com funções de OpenMeteo, para que o projeto não faça requisição direta a API mas sim use as funções desse arquivo.

Fluxo de pesquisa para receber o nome da cidade e pegar as infomações de clima:
- O usuário digita o nome da cidade
- O projeto pega o nome e usa o OpenMeteo pegar a latitude, longitude e timezone dessa cidade.
- Ao pegar latitude , longetude e timezone, o projeto usa essas informações para fazer a requisição e pgar as informações do clima dessa localização.
- caso não ache as infomarmações da cidade, se comportar com se não tivesse achado nada.
- caso ache as infomações da cidade mas não as de clima, se comportar como se não tivesse achado nada.

A busca envolve a duas requisições (buscar latitude/longitude/timezone + buscar clima), mas para o usuário é um só, com loading.

As funções do OpenMeteo devem verificar se os parâmetros vieram,caso contrário, age como se não tivesse vindo.

### Aspector visuais (design e UX)

tem que ter Empty state

Teremos uma área superio centraliza que tem apenas  o campo de busca da cidade

o projeto terá um sidebar na esquerda com as seguintes informações:

- Temperatura
- Nome da cidade, Código do pais
- Dia atual
- Se é dia ou noite
- weather_code

Na aréa principal:
- humildade relativa
- temperatura aparente
- probabilidade de precipitação
- velocidade/direção do vento

Desing geral:
- O Projeto terá um fundo cinza escuro
- A parte superior não terá background, mas tanto sidebar quanto área principal ficarão dentro de uma div com borda arredondada, fundo branco, centralizada e largura máxima de 800px.


Informações sobre interpretação sobre o Weather Code:
WMO Weather interpretation codes (WW)
Code	Description
0	Clear sky
1, 2, 3	Mainly clear, partly cloudy, and overcast
45, 48	Fog and depositing rime fog
51, 53, 55	Drizzle: Light, moderate, and dense intensity
56, 57	Freezing Drizzle: Light and dense intensity
61, 63, 65	Rain: Slight, moderate and heavy intensity
66, 67	Freezing Rain: Light and heavy intensity
71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
77	Snow grains
80, 81, 82	Rain showers: Slight, moderate, and violent
85, 86	Snow showers slight and heavy
95 *	Thunderstorm: Slight or moderate
96, 99 *	Thunderstorm with slight and heavy hail




