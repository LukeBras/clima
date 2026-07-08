import './style.css'
import { createWeatherStore, type WeatherState } from './appState'
import type { WeatherViewModel } from './weatherModel'

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  const weatherStore = createWeatherStore()

  app.innerHTML = `
    <main class="weather-app" aria-label="Aplicacao de clima">
      <section class="search-area" aria-label="Busca de cidade">
        <form class="search-form" data-search-form>
          <label class="visually-hidden" for="city-search">Cidade</label>
          <input
            id="city-search"
            class="search-input"
            name="city"
            type="search"
            autocomplete="off"
            placeholder="Digite uma cidade"
            data-search-input
          />
          <button class="search-button" type="submit" data-search-button>Buscar</button>
        </form>
      </section>
      <section class="weather-panel" aria-label="Painel de clima" data-weather-panel>
        <aside class="weather-sidebar" aria-label="Dados principais" data-weather-sidebar></aside>
        <section class="weather-details" aria-label="Metricas complementares" data-weather-details></section>
      </section>
    </main>
  `

  const searchForm = app.querySelector<HTMLFormElement>('[data-search-form]')
  const searchInput = app.querySelector<HTMLInputElement>('[data-search-input]')
  const searchButton = app.querySelector<HTMLButtonElement>('[data-search-button]')
  const weatherPanel = app.querySelector<HTMLElement>('[data-weather-panel]')
  const weatherSidebar = app.querySelector<HTMLElement>('[data-weather-sidebar]')
  const weatherDetails = app.querySelector<HTMLElement>('[data-weather-details]')

  searchForm?.addEventListener('submit', (event) => {
    event.preventDefault()

    const query = searchInput?.value ?? ''

    void weatherStore.search(query)
  })

  weatherStore.subscribe((state) => {
    renderSearchControls(state, searchInput, searchButton)
    renderWeatherPanel(state, weatherPanel, weatherSidebar, weatherDetails)
  })
}

function renderSearchControls(
  state: WeatherState,
  searchInput: HTMLInputElement | null,
  searchButton: HTMLButtonElement | null,
): void {
  if (searchInput) {
    searchInput.disabled = state.isLoading
    searchInput.setAttribute('aria-busy', String(state.isLoading))
  }

  if (searchButton) {
    searchButton.disabled = state.isLoading
    searchButton.textContent = state.isLoading ? 'Buscando...' : 'Buscar'
    searchButton.setAttribute('aria-busy', String(state.isLoading))
  }
}

function renderWeatherPanel(
  state: WeatherState,
  weatherPanel: HTMLElement | null,
  weatherSidebar: HTMLElement | null,
  weatherDetails: HTMLElement | null,
): void {
  if (!weatherPanel || !weatherSidebar || !weatherDetails) {
    return
  }

  weatherPanel.dataset.status = state.status

  if (state.status === 'loading') {
    weatherSidebar.innerHTML = ''
    weatherDetails.innerHTML = `
      <div class="state-message" role="status" aria-live="polite">
        <p class="state-kicker">Buscando clima</p>
        <h1>Consultando dados da cidade...</h1>
        <p>Aguarde enquanto localizamos a cidade e carregamos as condicoes atuais.</p>
      </div>
    `
    return
  }

  if (state.status === 'success' && state.data) {
    renderWeatherResult(state.data, weatherSidebar, weatherDetails)
    return
  }

  weatherSidebar.innerHTML = ''
  weatherDetails.innerHTML = `
    <div class="state-message">
      <p class="state-kicker">${state.hasSearched ? 'Sem resultado' : 'Comece a busca'}</p>
      <h1>${state.hasSearched ? 'Nao encontramos dados para essa cidade.' : 'Pesquise uma cidade.'}</h1>
      <p>${state.hasSearched ? 'Tente outro nome de cidade ou verifique a grafia.' : 'Digite o nome de uma cidade no campo acima para ver o clima atual.'}</p>
    </div>
  `
}

function renderWeatherResult(
  data: WeatherViewModel,
  weatherSidebar: HTMLElement,
  weatherDetails: HTMLElement,
): void {
  weatherSidebar.innerHTML = `
    <div class="sidebar-summary">
      <p class="state-kicker">Agora</p>
      <p class="temperature">${formatWeatherValue(data.temperature.value, data.temperature.unit)}</p>
      <h1>${escapeHtml(data.cityName)}</h1>
      <p class="country-code">${escapeHtml(data.countryCode)}</p>
      <dl class="primary-list">
        <div>
          <dt>Dia</dt>
          <dd>${escapeHtml(data.currentDate)}</dd>
        </div>
        <div>
          <dt>Periodo</dt>
          <dd>${data.isDay ? 'Dia' : 'Noite'}</dd>
        </div>
        <div>
          <dt>Codigo WMO</dt>
          <dd>${data.weatherCode}</dd>
        </div>
        <div>
          <dt>Condicao</dt>
          <dd>${escapeHtml(data.weatherDescription)}</dd>
        </div>
      </dl>
    </div>
  `

  weatherDetails.innerHTML = `
    <div class="details-header">
      <p class="state-kicker">Metricas</p>
      <h2>Condicoes complementares</h2>
    </div>
    <div class="metric-grid" aria-label="Metricas complementares">
      ${renderMetricCard(
        'Umidade relativa',
        formatWeatherValue(data.relativeHumidity.value, data.relativeHumidity.unit),
      )}
      ${renderMetricCard(
        'Sensacao termica',
        formatWeatherValue(data.apparentTemperature.value, data.apparentTemperature.unit),
      )}
      ${renderMetricCard(
        'Precipitacao',
        formatWeatherValue(data.precipitationProbability.value, data.precipitationProbability.unit),
      )}
      ${renderMetricCard(
        'Vento',
        `${formatWeatherValue(data.wind.speed, data.wind.speedUnit)} | ${formatWeatherValue(
          data.wind.direction,
          data.wind.directionUnit,
        )}`,
      )}
    </div>
  `
}

function renderMetricCard(label: string, value: string): string {
  return `
    <article class="metric-card">
      <h3>${escapeHtml(label)}</h3>
      <p>${escapeHtml(value)}</p>
    </article>
  `
}

function formatWeatherValue(value: number, unit: string): string {
  const formattedValue = Number.isInteger(value) ? String(value) : value.toFixed(1)

  return `${formattedValue} ${unit}`.trim()
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }

    return entities[character]
  })
}
