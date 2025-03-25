'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '../components/AppLayout';
import axios from 'axios';

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 页面加载时获取用户信息
  useEffect(() => {
    loadUserInfo();
  }, []);

  // 加载用户信息
  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/login');
        return;
      }

      const userData = JSON.parse(userStr);
      setUser(userData);
      setEditUsername(userData.name || '');
      setAvatarPreview(userData.avatar || null);
    } catch (error) {
      console.error('加载用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打开编辑资料弹窗
  const editProfile = () => {
    setShowEditModal(true);
  };

  // 关闭编辑资料弹窗
  const closeEditProfile = () => {
    setShowEditModal(false);
    setSelectedAvatar(null);
    // 重置表单数据为当前用户数据
    if (user) {
      setEditUsername(user.name || '');
      setEditPassword('');
      setAvatarPreview(user.avatar || null);
    }
  };

  // 处理头像预览
  const handleAvatarPreview = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedAvatar(file);
    const reader = new FileReader();
    reader.onload = function(e) {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('请先登录');
      }

      // 创建 FormData 对象
      const formData = new FormData();
      
      if (!editUsername.trim()) {
        throw new Error('用户名不能为空');
      }
      
      formData.append('name', editUsername);
      
      if (editPassword) {
        formData.append('password', editPassword);
      }
      
      // 如果选择了新头像
      if (selectedAvatar) {
        formData.append('avatar', selectedAvatar);
      }

      // 发送更新请求
      const response = await axios.put('/api/auth/profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const result = response.data;
      
      if (result.success) {
        // 更新本地存储的用户信息
        const updatedUser = {
          ...user,
          name: editUsername
        };
        
        if (result.user.avatar) {
          updatedUser.avatar = result.user.avatar;
        }
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        // 关闭编辑窗口
        closeEditProfile();
        alert('更新成功！');
      } else {
        throw new Error(result.message || '更新失败');
      }
    } catch (error) {
      console.error('更新失败:', error);
      alert(error.message || '更新失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* 顶部个人资料卡片 - 重新设计 */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex items-center p-6">
            {/* 头像部分 - 变小 */}
            <div className="mr-5">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100">
                {user?.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                ) : (
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center text-xl font-semibold text-blue-600">
                    {user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
            </div>
            
            {/* 用户信息部分 */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{user?.name || '未知用户'}</h1>
                  <p className="text-gray-500 text-sm mt-1">{user?.email || '暂无邮箱'}</p>
                  <p className="text-gray-400 text-xs mt-1">注册时间: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '未知'}</p>
                </div>
                <button 
                  onClick={editProfile}
                  className="mt-3 sm:mt-0 py-1.5 px-3 bg-blue-50 rounded-full text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors flex items-center self-start"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  编辑资料
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 详细信息卡片 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">个人详细信息</h2>
              <p className="text-sm text-gray-500 mt-1">管理您的个人信息和账户安全</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <InfoItem label="用户名" value={user?.name || '未设置'} />
            <InfoItem label="邮箱地址" value={user?.email || '未设置'} />
            <InfoItem label="账号设置" value="修改密码" isLink onClick={editProfile} />
          </div>
        </div>
      </div>

      {/* 编辑资料弹窗 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto overflow-hidden animate-modalFadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">编辑个人资料</h2>
              <button 
                onClick={closeEditProfile}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 头像上传 */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="text-3xl font-semibold text-blue-500">
                          {user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-sm cursor-pointer hover:bg-gray-50 border border-gray-100">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarPreview}
                      />
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      </svg>
                    </label>
                  </div>
                  <span className="text-sm text-gray-500">点击更换头像</span>
                </div>

                {/* 用户名输入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  <input 
                    type="text" 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* 密码输入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                  <input 
                    type="password" 
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="留空表示不修改"
                  />
                </div>

                {/* 按钮组 */}
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={closeEditProfile} 
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    取消
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {submitting ? '保存中...' : '保存'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// 详细信息项组件
function InfoItem({ label, value, isLink = false, onClick }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2">
      <div className="text-sm text-gray-500 mb-1 sm:mb-0">{label}</div>
      {isLink ? (
        <button 
          onClick={onClick}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {value}
        </button>
      ) : (
        <div className="text-sm font-medium text-gray-900">{value}</div>
      )}
    </div>
  );
} 