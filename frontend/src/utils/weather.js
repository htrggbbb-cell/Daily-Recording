export const getCityCoordinates = (cityName) => {
  const cityMap = {
    '北京': { lat: 39.9042, lng: 116.4074 },
    '上海': { lat: 31.2304, lng: 121.4737 },
    '广州': { lat: 23.1291, lng: 113.2644 },
    '深圳': { lat: 22.5431, lng: 114.0579 },
    '杭州': { lat: 30.2741, lng: 120.1551 },
    '南京': { lat: 32.0603, lng: 118.7969 },
    '无锡': { lat: 31.4912, lng: 120.3119 },
    '徐州': { lat: 34.2044, lng: 117.2840 },
    '常州': { lat: 31.8106, lng: 119.9740 },
    '苏州': { lat: 31.2989, lng: 120.5853 },
    '南通': { lat: 32.0146, lng: 120.8943 },
    '连云港': { lat: 34.5967, lng: 119.2216 },
    '淮安': { lat: 33.6104, lng: 119.0153 },
    '盐城': { lat: 33.3476, lng: 120.1617 },
    '扬州': { lat: 32.3949, lng: 119.4128 },
    '镇江': { lat: 32.2044, lng: 119.4550 },
    '泰州': { lat: 32.4554, lng: 119.9232 },
    '宿迁': { lat: 33.9630, lng: 118.2757 },
    '成都': { lat: 30.5728, lng: 104.0668 },
    '武汉': { lat: 30.5928, lng: 114.3055 },
    '西安': { lat: 34.3416, lng: 108.9398 },
    '重庆': { lat: 29.4316, lng: 106.9123 }
  }
  return cityMap[cityName] || { lat: 39.9042, lng: 116.4074 }
}

export const getRealWeatherData = async (city) => {
  try {
    const coords = getCityCoordinates(city)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    )
    const data = await response.json()
    
    const weatherCodeMap = {
      0: '晴',
      1: '晴',
      2: '多云',
      3: '多云',
      45: '雾',
      48: '雾',
      51: '小雨',
      53: '小雨',
      55: '小雨',
      61: '小雨',
      63: '小雨',
      65: '大雨',
      66: '大雨',
      67: '大雨',
      71: '大雨',
      73: '大雨',
      75: '大雨',
      77: '大雨',
      80: '阵雨',
      81: '阵雨',
      82: '阵雨',
      85: '阵雨',
      95: '雷雨',
      96: '雷雨',
      99: '雷雨'
    }
    
    return {
      name: city,
      temp: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      weather: weatherCodeMap[data.current.weather_code] || '多云',
      wind: Math.round(data.current.wind_speed_10m)
    }
  } catch (error) {
    console.error('获取真实天气失败:', error)
    return null
  }
}

export const getProvinceWeatherData = async (provinceName) => {
  const cityMap = {
    '北京市': '北京',
    '天津市': '天津',
    '河北省': '石家庄',
    '山西省': '太原',
    '内蒙古自治区': '呼和浩特',
    '辽宁省': '沈阳',
    '吉林省': '长春',
    '黑龙江省': '哈尔滨',
    '上海市': '上海',
    '江苏省': '南京',
    '浙江省': '杭州',
    '安徽省': '合肥',
    '福建省': '福州',
    '江西省': '南昌',
    '山东省': '济南',
    '河南省': '郑州',
    '湖北省': '武汉',
    '湖南省': '长沙',
    '广东省': '广州',
    '广西壮族自治区': '南宁',
    '海南省': '海口',
    '重庆市': '重庆',
    '四川省': '成都',
    '贵州省': '贵阳',
    '云南省': '昆明',
    '西藏自治区': '拉萨',
    '陕西省': '西安',
    '甘肃省': '兰州',
    '青海省': '西宁',
    '宁夏回族自治区': '银川',
    '新疆维吾尔自治区': '乌鲁木齐'
  }

  const city = cityMap[provinceName]
  if (!city) return null

  try {
    const coords = getCityCoordinates(city)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m&timezone=auto`
    )
    const data = await response.json()
    return {
      temp: Math.round(data.current.temperature_2m)
    }
  } catch (error) {
    console.error('获取省份天气失败:', provinceName, error)
    return null
  }
}

// 天气数据缓存
const weatherCache = new Map()
const CACHE_TTL = 10 * 60 * 1000 // 10分钟缓存

/**
 * 获取省份内所有城市的天气数据
 * @param {string} provinceName - 省份名称
 * @returns {Promise<Array>} 城市天气数据数组 [{name: '南京', temp: 18}, ...]
 */
export const getProvinceCityWeatherData = async (provinceName) => {
  // 动态导入避免循环依赖
  const { provinceCities } = await import('../data/provinceCities.js')

  const cities = provinceCities[provinceName]
  if (!cities || cities.length === 0) {
    console.warn(`[getProvinceCityWeatherData] 未找到省份 ${provinceName} 的城市数据`)
    return []
  }

  // 检查缓存
  const cacheKey = provinceName
  const cached = weatherCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[getProvinceCityWeatherData] 使用缓存数据: ${provinceName}`)
    return cached.data
  }

  console.log(`[getProvinceCityWeatherData] 开始获取 ${provinceName} 的 ${cities.length} 个城市天气`)

  // 批量请求，限制并发数为5
  const chunks = []
  for (let i = 0; i < cities.length; i += 5) {
    chunks.push(cities.slice(i, i + 5))
  }

  const results = []

  for (const chunk of chunks) {
    const promises = chunk.map(async (city) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current=temperature_2m&timezone=auto`
        )
        const data = await response.json()
        return {
          name: city.name,
          temp: Math.round(data.current.temperature_2m)
        }
      } catch (error) {
        console.error(`获取 ${city.name} 天气失败:`, error)
        // API失败时返回默认温度20°C，确保该城市在地图上有数据
        return { name: city.name, temp: 20 }
      }
    })

    const chunkResults = await Promise.allSettled(promises)
    results.push(...chunkResults.map(r => r.status === 'fulfilled' ? r.value : r.reason))
  }

  // 现在所有城市都有数据，不需要过滤
  const validResults = results.filter(r => r && r.name)

  console.log(`[getProvinceCityWeatherData] 成功获取 ${validResults.length}/${cities.length} 个城市天气`)

  // 缓存结果
  weatherCache.set(cacheKey, { data: validResults, timestamp: Date.now() })

  return validResults
}

// 清除缓存（用于手动刷新）
export const clearWeatherCache = () => {
  weatherCache.clear()
  console.log('[clearWeatherCache] 天气缓存已清除')
}
