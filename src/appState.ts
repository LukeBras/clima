import { fetchCurrentWeather, searchCity } from './services/openMeteo'
import { normalizeWeatherData } from './weatherModel'
import type { GeoLocation, OpenMeteoWeatherResponse, WeatherViewModel } from './weatherModel'

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'empty'

export type WeatherState = {
  status: WeatherStatus
  query: string
  isLoading: boolean
  hasSearched: boolean
  data: WeatherViewModel | null
}

export type WeatherSearchDependencies = {
  geocodeCity: (cityName: string) => Promise<GeoLocation | null>
  getCurrentWeather: (
    latitude: number,
    longitude: number,
    timezone: string,
  ) => Promise<OpenMeteoWeatherResponse | null>
}

type WeatherStateListener = (state: WeatherState) => void

const initialState: WeatherState = {
  status: 'idle',
  query: '',
  isLoading: false,
  hasSearched: false,
  data: null,
}

export function createWeatherStore(dependencies: Partial<WeatherSearchDependencies> = {}) {
  const clients: WeatherSearchDependencies = {
    geocodeCity: dependencies.geocodeCity ?? searchCity,
    getCurrentWeather: dependencies.getCurrentWeather ?? fetchCurrentWeather,
  }

  let state = { ...initialState }
  const listeners = new Set<WeatherStateListener>()

  function getState(): WeatherState {
    return { ...state }
  }

  function subscribe(listener: WeatherStateListener): () => void {
    listeners.add(listener)
    listener(getState())

    return () => {
      listeners.delete(listener)
    }
  }

  async function search(query: string): Promise<WeatherState> {
    if (state.isLoading) {
      return getState()
    }

    const normalizedQuery = query.trim()

    if (normalizedQuery.length === 0) {
      setState({
        status: 'empty',
        query: '',
        isLoading: false,
        hasSearched: true,
        data: null,
      })

      return getState()
    }

    setState({
      status: 'loading',
      query: normalizedQuery,
      isLoading: true,
      hasSearched: true,
      data: null,
    })

    try {
      const location = await clients.geocodeCity(normalizedQuery)

      if (!location) {
        setEmptyState(normalizedQuery)
        return getState()
      }

      const weatherResponse = await clients.getCurrentWeather(
        location.latitude,
        location.longitude,
        location.timezone,
      )
      const weatherViewModel = normalizeWeatherData(location, weatherResponse)

      if (!weatherViewModel) {
        setEmptyState(normalizedQuery)
        return getState()
      }

      setState({
        status: 'success',
        query: normalizedQuery,
        isLoading: false,
        hasSearched: true,
        data: weatherViewModel,
      })
    } catch {
      setEmptyState(normalizedQuery)
    }

    return getState()
  }

  function setEmptyState(query: string): void {
    setState({
      status: 'empty',
      query,
      isLoading: false,
      hasSearched: true,
      data: null,
    })
  }

  function setState(nextState: WeatherState): void {
    state = nextState
    notify()
  }

  function notify(): void {
    const currentState = getState()

    listeners.forEach((listener) => {
      listener(currentState)
    })
  }

  return {
    getState,
    subscribe,
    search,
  }
}
