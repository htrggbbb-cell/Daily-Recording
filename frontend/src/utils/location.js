// 用户位置相关API

/**
 * 通过IP定位获取用户位置信息
 * 使用免费IP定位API
 */
// 英文城市名到中文的映射
const cityNameMap = {
  // 江苏
  'Nanjing': '南京', 'Suzhou': '苏州', 'Wuxi': '无锡', 'Changzhou': '常州',
  'Zhenjiang': '镇江', 'Yangzhou': '扬州', 'Taizhou': '泰州', 'Nantong': '南通',
  'Lianyungang': '连云港', 'Huai\'an': '淮安', 'Yancheng': '盐城', 'Suqian': '宿迁', 'Xuzhou': '徐州',
  // 直辖市
  'Beijing': '北京', 'Shanghai': '上海', 'Tianjin': '天津', 'Chongqing': '重庆',
  // 省会城市
  'Guangzhou': '广州', 'Shenzhen': '深圳', 'Hangzhou': '杭州', 'Chengdu': '成都',
  'Wuhan': '武汉', 'Xi\'an': '西安', 'Changsha': '长沙', 'Zhengzhou': '郑州',
  'Shenyang': '沈阳', 'Ji\'nan': '济南', 'Qingdao': '青岛', 'Dalian': '大连',
  'Xiamen': '厦门', 'Fuzhou': '福州', 'Harbin': '哈尔滨', 'Changchun': '长春',
  'Taiyuan': '太原', 'Hefei': '合肥', 'Nanchang': '南昌', 'Nanning': '南宁',
  'Haikou': '海口', 'Kunming': '昆明', 'Guiyang': '贵阳', 'Lanzhou': '兰州',
  'Yinchuan': '银川', 'Xining': '西宁', 'Hohhot': '呼和浩特', 'Urumqi': '乌鲁木齐',
  'Lhasa': '拉萨'
}

export async function getUserLocationByIP() {
  try {
    // 使用支持HTTPS的免费IP定位API
    console.log('[定位] 开始请求IP定位...')
    const response = await fetch('https://ipapi.co/json/', {
      timeout: 10000 // 10秒超时
    })

    console.log('[定位] 响应状态:', response.status)

    if (!response.ok) {
      throw new Error(`定位失败: HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log('[定位] 原始数据:', data)

    if (data.city) {
      // 将英文城市名转换为中文
      const chineseCity = cityNameMap[data.city] || data.city

      console.log('[定位] 转换后城市:', data.city, '→', chineseCity)

      return {
        city: chineseCity,
        region: data.region,
        country: data.country_name,
        lat: data.latitude,
        lon: data.longitude,
        isp: data.org
      }
    } else {
      throw new Error('定位失败: 无法获取城市信息')
    }
  } catch (error) {
    console.error('[定位] IP定位失败:', error)
    return null
  }
}

/**
 * 获取城市对应的坐标
 */
export function getCityCoordinates(cityName) {
  const cityCoords = {
    '北京': { lat: 39.9042, lng: 116.4074 },
    '上海': { lat: 31.2304, lng: 121.4737 },
    '广州': { lat: 23.1291, lng: 113.2644 },
    '深圳': { lat: 22.5431, lng: 114.0579 },
    '杭州': { lat: 30.2741, lng: 120.1551 },
    '南京': { lat: 32.0603, lng: 118.7969 },
    '苏州': { lat: 31.2989, lng: 120.5853 },
    '成都': { lat: 30.5728, lng: 104.0668 },
    '武汉': { lat: 30.5928, lng: 114.3055 },
    '西安': { lat: 34.3416, lng: 108.9398 },
    '重庆': { lat: 29.5630, lng: 106.5516 },
    '天津': { lat: 39.3434, lng: 117.3616 },
    '长沙': { lat: 28.2278, lng: 112.9388 },
    '郑州': { lat: 34.7466, lng: 113.6254 },
    '沈阳': { lat: 41.8057, lng: 123.4315 },
    '济南': { lat: 36.6512, lng: 117.1205 },
    '青岛': { lat: 36.0671, lng: 120.3826 },
    '大连': { lat: 38.9140, lng: 121.6147 },
    '厦门': { lat: 24.4798, lng: 118.0894 },
    '福州': { lat: 26.0745, lng: 119.2965 },
    '哈尔滨': { lat: 45.8038, lng: 126.5350 },
    '长春': { lat: 43.8868, lng: 125.3245 },
    '太原': { lat: 37.8706, lng: 112.5489 },
    '合肥': { lat: 31.8206, lng: 117.2272 },
    '南昌': { lat: 28.6820, lng: 115.8579 },
    '南宁': { lat: 22.8170, lng: 108.3665 },
    '海口': { lat: 20.0440, lng: 110.2006 },
    '昆明': { lat: 25.0406, lng: 102.7129 },
    '贵阳': { lat: 26.6470, lng: 106.6302 },
    '兰州': { lat: 36.0611, lng: 103.8343 },
    '银川': { lat: 38.4681, lng: 106.2731 },
    '西宁': { lat: 36.6171, lng: 101.7782 },
    '呼和浩特': { lat: 40.8414, lng: 111.7519 },
    '乌鲁木齐': { lat: 43.8256, lng: 87.6168 },
    '拉萨': { lat: 29.6500, lng: 91.1000 },
    '镇江': { lat: 32.1880, lng: 119.4550 },
    '泰州': { lat: 32.4848, lng: 119.9225 },
    '无锡': { lat: 31.4912, lng: 120.3119 },
    '常州': { lat: 31.8106, lng: 119.9741 },
    '南通': { lat: 32.0146, lng: 120.8944 },
    '扬州': { lat: 32.3949, lng: 119.4128 },
    '徐州': { lat: 34.2044, lng: 117.2842 }
  }

  return cityCoords[cityName] || { lat: 39.9042, lng: 116.4074 }
}
