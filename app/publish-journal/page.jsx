'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '../components/AppLayout';

export default function PublishJournal() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 自动焦点到标题输入框
    if (typeof document !== 'undefined') {
      const titleInput = document.getElementById('title');
      if (titleInput) {
        titleInput.focus();
      }
    }
  }, []);

  // 处理图片选择
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // 限制最多9张图片
    if (selectedImages.length + files.length > 9) {
      alert('最多只能上传9张图片');
      return;
    }

    const newImages = [];
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          newImages.push({
            file,
            preview: e.target.result
          });
          
          if (newImages.length === files.length) {
            setSelectedImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // 移除图片
  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 表单提交处理
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content || !location) {
      alert('请填写完整信息');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('location', location);
      
      // 添加图片文件
      if (selectedImages.length > 0) {
        selectedImages.forEach(image => {
          if (image.file) {
            formData.append('images', image.file);
          }
        });
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('请先登录');
      }

      // 尝试发送请求
      let response;
      try {
        response = await fetch('/api/journals', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      } catch (networkError) {
        console.error('网络错误:', networkError);
        throw new Error('网络连接失败，请检查您的网络连接');
      }

      // 检查响应状态
      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = errorData.message || `服务器错误 (${response.status})`;
        } catch (e) {
          errorText = `服务器错误 (${response.status})`;
        }
        console.error('发布失败:', response.status, errorText);
        throw new Error(`发布失败: ${errorText}`);
      }

      // 解析响应数据
      let result;
      try {
        result = await response.json();
      } catch (e) {
        console.error('解析响应失败:', e);
        throw new Error('服务器返回了无效的数据');
      }

      if (result.success) {
        alert('发布成功！');
        router.push('/travel-journal');
      } else {
        throw new Error(result.message || '发布失败');
      }
    } catch (error) {
      console.error('发布失败:', error);
      alert('发布失败: ' + (error.message || '请重试'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-transparent">
        {/* 顶部导航 */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button onClick={() => router.back()} className="text-gray-600 text-sm flex items-center gap-1 hover:text-blue-500 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              返回
            </button>
            <h1 className="text-xl font-medium text-blue-700">发布新笔记</h1>
            <div className="w-16"></div>{/* 占位，保持标题居中 */}
          </div>
        </div>

        {/* 主要内容 */}
        <main>
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-transparent/20 rounded-xl shadow-lg border border-blue-100">
              <form id="publishForm" className="space-y-8 p-8" onSubmit={handleSubmit}>
                {/* 标题输入 */}
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-blue-700">标题</label>
                  <input 
                    id="title"
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-blue-200 rounded-lg p-4 text-base text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-shadow bg-white/70"
                    placeholder="给你的旅行笔记起个标题"
                    required
                  />
                </div>

                {/* 内容输入 */}
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium text-blue-700">内容</label>
                  <textarea 
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full border border-blue-200 rounded-lg p-4 text-base text-gray-600 outline-none resize-none min-h-[200px] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-shadow bg-white/70"
                    placeholder="分享你的旅行故事..."
                    required
                  ></textarea>
                </div>

                {/* 位置输入 */}
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium text-blue-700">位置</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <input 
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full border border-blue-200 rounded-lg py-4 pl-12 pr-4 text-base text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-shadow bg-white/70"
                      placeholder="添加位置"
                      required
                    />
                  </div>
                </div>

                {/* 图片上传区域 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-700">照片 ({selectedImages.length}/9)</label>
                  <div className="grid grid-cols-3 gap-4 min-h-[120px] border-2 border-dashed border-blue-200 rounded-lg p-5 bg-transparent">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                        <img src={image.preview} className="w-full h-full object-cover" alt="" />
                        <button 
                          type="button" 
                          className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1.5 text-white hover:bg-blue-600 transition-colors" 
                          onClick={() => removeImage(index)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                    {selectedImages.length < 9 && (
                      <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg bg-transparent hover:bg-blue-50/30 cursor-pointer transition-colors">
                        <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        <span className="mt-2 text-sm text-blue-500">添加照片</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className="hidden"
                          onChange={handleImageSelect}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* 发布按钮 */}
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white rounded-lg text-lg font-medium transition-colors duration-200 disabled:opacity-50 shadow-md transform hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        发布中...
                      </span>
                    ) : '发布笔记'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
} 