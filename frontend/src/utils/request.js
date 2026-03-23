import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 使用环境变量配置 API 地址，开发环境使用相对路径通过 proxy
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const request = axios.create({
  baseURL,
  timeout: 10000
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    // 不显示token验证错误的提示（避免自动保存时频繁弹窗）
    const isTokenError = error.response?.status === 401

    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
        if (!isTokenError) {
          ElMessage.error('登录已过期，请重新登录')
        }
      } else if (data?.error && !error.config?.silent) {
        ElMessage.error(data.error || '请求失败')
      }
    } else if (!error.config?.silent) {
      ElMessage.error('网络错误，请检查后端是否运行')
    }
    return Promise.reject(error)
  }
)

export default request
