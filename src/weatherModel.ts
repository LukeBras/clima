export type GeoLocation = {
  name: string
  latitude: number
  longitude: number
  timezone: string
  countryCode: string
}

export type WeatherValue = {
  value: number
  unit: string
}

export type WeatherViewModel = {
  cityName: string
  countryCode: string
  currentDate: string
  temperature: WeatherValue
  relativeHumidity: WeatherValue
  apparentTemperature: WeatherValue
  precipitationProbability: WeatherValue
  wind: {
    speed: number
    speedUnit: string
    direction: number
    directionUnit: string
  }
  isDay: boolean
  weatherCode: number
  weatherDescription: string
}

export type OpenMeteoWeatherResponse = {
  current?: {
    temperature_2m?: unknown
    relative_humidity_2m?: unknown
    apparent_temperature?: unknown
    is_day?: unknown
    weather_code?: unknown
    wind_direction_10m?: unknown
    wind_speed_10m?: unknown
    time?: unknown
  }
  current_units?: {
    temperature_2m?: unknown
    relative_humidity_2m?: unknown
    apparent_temperature?: unknown
    weather_code?: unknown
    wind_direction_10m?: unknown
    wind_speed_10m?: unknown
  }
  hourly?: {
    time?: unknown
    precipitation_probability?: unknown
  }
  hourly_units?: {
    precipitation_probability?: unknown
  }
}

const weatherDescriptions: Record<number, string> = {
  0: 'Ceu limpo',
  1: 'Principalmente limpo, parcialmente nublado ou nublado',
  2: 'Principalmente limpo, parcialmente nublado ou nublado',
  3: 'Principalmente limpo, parcialmente nublado ou nublado',
  45: 'Nevoeiro',
  48: 'Nevoeiro',
  51: 'Garoa leve, moderada ou intensa',
  53: 'Garoa leve, moderada ou intensa',
  55: 'Garoa leve, moderada ou intensa',
  56: 'Garoa congelante leve ou intensa',
  57: 'Garoa congelante leve ou intensa',
  61: 'Chuva fraca, moderada ou forte',
  63: 'Chuva fraca, moderada ou forte',
  65: 'Chuva fraca, moderada ou forte',
  66: 'Chuva congelante leve ou forte',
  67: 'Chuva congelante leve ou forte',
  71: 'Neve fraca, moderada ou forte',
  73: 'Neve fraca, moderada ou forte',
  75: 'Neve fraca, moderada ou forte',
  77: 'Graos de neve',
  80: 'Pancadas de chuva fracas, moderadas ou violentas',
  81: 'Pancadas de chuva fracas, moderadas ou violentas',
  82: 'Pancadas de chuva fracas, moderadas ou violentas',
  85: 'Pancadas de neve fracas ou fortes',
  86: 'Pancadas de neve fracas ou fortes',
  95: 'Tempestade fraca ou moderada',
  96: 'Tempestade com granizo fraco ou forte',
  99: 'Tempestade com granizo fraco ou forte',
}

export function getWeatherDescription(weatherCode: number): string {
  return weatherDescriptions[weatherCode] ?? 'Condicao desconhecida'
}

export function normalizeWeatherData(
  location: GeoLocation,
  weatherResponse: OpenMeteoWeatherResponse | null,
): WeatherViewModel | null {
  if (!isValidLocation(location) || !weatherResponse) {
    return null
  }

  const current = weatherResponse.current
  const currentUnits = weatherResponse.current_units
  const hourly = weatherResponse.hourly
  const hourlyUnits = weatherResponse.hourly_units

  if (!current || !currentUnits || !hourly || !hourlyUnits) {
    return null
  }

  const currentTime = readString(current.time)
  const temperature = readNumber(current.temperature_2m)
  const relativeHumidity = readNumber(current.relative_humidity_2m)
  const apparentTemperature = readNumber(current.apparent_temperature)
  const isDay = readDayFlag(current.is_day)
  const weatherCode = readInteger(current.weather_code)
  const windDirection = readNumber(current.wind_direction_10m)
  const windSpeed = readNumber(current.wind_speed_10m)
  const temperatureUnit = readString(currentUnits.temperature_2m)
  const relativeHumidityUnit = readString(currentUnits.relative_humidity_2m)
  const apparentTemperatureUnit = readString(currentUnits.apparent_temperature)
  const windDirectionUnit = readString(currentUnits.wind_direction_10m)
  const windSpeedUnit = readString(currentUnits.wind_speed_10m)
  const precipitationProbabilityUnit = readString(hourlyUnits.precipitation_probability)
  const precipitationProbability = findClosestPrecipitationProbability(currentTime, hourly)

  if (
    currentTime === null ||
    temperature === null ||
    relativeHumidity === null ||
    apparentTemperature === null ||
    isDay === null ||
    weatherCode === null ||
    windDirection === null ||
    windSpeed === null ||
    temperatureUnit === null ||
    relativeHumidityUnit === null ||
    apparentTemperatureUnit === null ||
    windDirectionUnit === null ||
    windSpeedUnit === null ||
    precipitationProbabilityUnit === null ||
    precipitationProbability === null
  ) {
    return null
  }

  return {
    cityName: location.name,
    countryCode: location.countryCode,
    currentDate: formatCurrentDate(currentTime),
    temperature: {
      value: temperature,
      unit: temperatureUnit,
    },
    relativeHumidity: {
      value: relativeHumidity,
      unit: relativeHumidityUnit,
    },
    apparentTemperature: {
      value: apparentTemperature,
      unit: apparentTemperatureUnit,
    },
    precipitationProbability: {
      value: precipitationProbability,
      unit: precipitationProbabilityUnit,
    },
    wind: {
      speed: windSpeed,
      speedUnit: windSpeedUnit,
      direction: windDirection,
      directionUnit: windDirectionUnit,
    },
    isDay,
    weatherCode,
    weatherDescription: getWeatherDescription(weatherCode),
  }
}

function isValidLocation(location: GeoLocation): boolean {
  return (
    readString(location.name) !== null &&
    readNumber(location.latitude) !== null &&
    readNumber(location.longitude) !== null &&
    readString(location.timezone) !== null &&
    readString(location.countryCode) !== null
  )
}

function findClosestPrecipitationProbability(
  currentTime: string | null,
  hourly: NonNullable<OpenMeteoWeatherResponse['hourly']>,
): number | null {
  if (currentTime === null || !Array.isArray(hourly.time) || !Array.isArray(hourly.precipitation_probability)) {
    return null
  }

  const timeValues = hourly.time.map(readString)
  const precipitationValues = hourly.precipitation_probability.map(readNumber)
  const exactIndex = timeValues.findIndex((time) => time === currentTime)

  if (exactIndex >= 0) {
    return precipitationValues[exactIndex] ?? null
  }

  const currentTimestamp = Date.parse(currentTime)

  if (!Number.isFinite(currentTimestamp)) {
    return null
  }

  let closestIndex = -1
  let closestDistance = Number.POSITIVE_INFINITY

  for (let index = 0; index < timeValues.length; index += 1) {
    const timestamp = Date.parse(timeValues[index] ?? '')

    if (!Number.isFinite(timestamp)) {
      continue
    }

    const distance = Math.abs(timestamp - currentTimestamp)

    if (distance < closestDistance) {
      closestDistance = distance
      closestIndex = index
    }
  }

  if (closestIndex < 0) {
    return null
  }

  return precipitationValues[closestIndex] ?? null
}

function formatCurrentDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(date)
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

function readInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) ? value : null
}

function readDayFlag(value: unknown): boolean | null {
  if (value === 0) {
    return false
  }

  if (value === 1) {
    return true
  }

  return null
}
