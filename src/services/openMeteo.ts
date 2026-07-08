import type { GeoLocation, OpenMeteoWeatherResponse } from '../weatherModel'

type Fetcher = typeof fetch

type OpenMeteoOptions = {
  fetcher?: Fetcher
}

type GeocodingResponse = {
  results?: unknown
}

const geocodingEndpoint = 'https://geocoding-api.open-meteo.com/v1/search'
const weatherEndpoint = 'https://api.open-meteo.com/v1/forecast'
const currentFields = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'weather_code',
  'wind_direction_10m',
  'wind_speed_10m',
].join(',')

const hourlyFields = ['temperature_2m', 'precipitation_probability'].join(',')

export async function searchCity(
  cityName: string,
  options: OpenMeteoOptions = {},
): Promise<GeoLocation | null> {
  const normalizedCityName = typeof cityName === 'string' ? cityName.trim() : ''

  if (normalizedCityName.length === 0) {
    return null
  }

  const url = new URL(geocodingEndpoint)
  url.searchParams.set('name', normalizedCityName)
  url.searchParams.set('count', '1')
  url.searchParams.set('language', 'pt')
  url.searchParams.set('format', 'json')

  try {
    const response = await getFetcher(options)(url)

    if (!response.ok) {
      return null
    }

    return parseGeocodingResponse((await response.json()) as GeocodingResponse)
  } catch {
    return null
  }
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
  timezone: string,
  options: OpenMeteoOptions = {},
): Promise<OpenMeteoWeatherResponse | null> {
  const normalizedTimezone = typeof timezone === 'string' ? timezone.trim() : ''

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || normalizedTimezone.length === 0) {
    return null
  }

  const url = new URL(weatherEndpoint)
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('current', currentFields)
  url.searchParams.set('hourly', hourlyFields)
  url.searchParams.set('timezone', normalizedTimezone)

  try {
    const response = await getFetcher(options)(url)

    if (!response.ok) {
      return null
    }

    return (await response.json()) as OpenMeteoWeatherResponse
  } catch {
    return null
  }
}

function parseGeocodingResponse(data: GeocodingResponse): GeoLocation | null {
  if (!Array.isArray(data.results) || data.results.length === 0) {
    return null
  }

  return parseGeocodingResult(data.results[0])
}

function parseGeocodingResult(result: unknown): GeoLocation | null {
  if (!isRecord(result)) {
    return null
  }

  const name = readString(result.name)
  const latitude = readNumber(result.latitude)
  const longitude = readNumber(result.longitude)
  const timezone = readString(result.timezone)
  const countryCode = readString(result.country_code)

  if (name === null || latitude === null || longitude === null || timezone === null || countryCode === null) {
    return null
  }

  return {
    name,
    latitude,
    longitude,
    timezone,
    countryCode,
  }
}

function getFetcher(options: OpenMeteoOptions): Fetcher {
  return options.fetcher ?? fetch
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()

  return trimmedValue.length > 0 ? trimmedValue : null
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}
