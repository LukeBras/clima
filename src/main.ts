import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  app.innerHTML = `
    <main class="weather-app" aria-label="Aplicacao de clima">
      <section class="search-area" aria-label="Busca de cidade"></section>
      <section class="weather-panel" aria-label="Painel de clima">
        <aside class="weather-sidebar" aria-label="Dados principais"></aside>
        <section class="weather-details" aria-label="Metricas complementares"></section>
      </section>
    </main>
  `
}
