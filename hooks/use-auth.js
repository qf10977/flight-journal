"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 检查用户是否已登录
  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }
    
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          setLoading(false)
          return
        }
        
        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (response.data.success) {
          setUser(response.data.user)
        } else {
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('认证检查失败:', error)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  // 登录
  const login = async (email, password) => {
    setError(null)
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        setUser(response.data.user)
        return { success: true }
      } else {
        setError(response.data.message || '登录失败')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      // 修改错误处理逻辑，确保能正确显示服务器返回的错误信息
      let errorMessage = '登录时发生错误';
      
      // 尝试从不同的错误对象属性中获取错误信息
      if (error.response) {
        // 服务器返回了错误响应
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            // 响应是字符串
            errorMessage = `服务器错误: ${error.response.status}`;
            console.error('服务器返回了非JSON响应:', error.response.data);
          } else if (error.response.data.message) {
            // 响应是JSON且包含message字段
            errorMessage = error.response.data.message;
          }
        } else {
          errorMessage = `服务器错误: ${error.response.status}`;
        }
      } else if (error.request) {
        // 请求已发送但没有收到响应
        errorMessage = '服务器无响应，请检查网络连接';
      } else if (error.message) {
        // 请求设置时出错
        errorMessage = error.message;
      }
      
      console.error('登录错误详情:', error);
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }

  // 注册
  const register = async (userData) => {
    setError(null)
    try {
      const response = await axios.post('/api/auth/register', userData)
      
      if (response.data.success) {
        return { success: true }
      } else {
        setError(response.data.message || '注册失败')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || '注册时发生错误'
      setError(message)
      return { success: false, message }
    }
  }

  // 登出
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    setUser(null)
  }

  // 更新用户信息
  const updateUser = (newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }))
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (typeof window === 'undefined') {
    // 服务器端渲染时返回默认值
    return {
      user: null,
      loading: false,
      error: null,
      login: () => Promise.resolve({ success: false }),
      register: () => Promise.resolve({ success: false }),
      logout: () => {},
      updateUser: () => {}
    }
  }
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 