'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AppLayout from '../components/AppLayout';

export default function JournalDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const journalId = searchParams.get('id');
    if (journalId) {
      loadJournalDetail(journalId);
    } else {
      setError('未找到笔记ID');
      setLoading(false);
    }
    
  }, [searchParams]);

  // 加载笔记详情
  const loadJournalDetail = async (id) => {
    try {
      setLoading(true);
      
      // 检查用户登录状态
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('未找到登录令牌');
        alert('请先登录');
        router.push('/login');
        return;
      }
      
      // 获取用户ID
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('未找到用户ID');
        alert('未找到用户信息，请重新登录');
        router.push('/login');
        return;
      }
      
      // 确保用户信息完整
      let user = null;
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          user = JSON.parse(userStr);
          // 确保用户对象有ID字段
          if (!user._id && !user.id) {
            user._id = userId;
            localStorage.setItem('user', JSON.stringify(user));
          }
        } else {
          // 如果没有用户信息，创建一个基本的用户对象
          user = { _id: userId };
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.error('处理用户信息失败:', error);
        // 创建一个基本的用户对象
        user = { _id: userId };
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      console.log('发送API请求获取笔记:', id);
      console.log('当前用户ID:', userId);
      console.log('携带的Authorization:', `Bearer ${token}`);
      
      const response = await fetch(`/api/journals/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API响应错误:', response.status, errorText);
        
        if (response.status === 401) {
          // 处理未授权错误
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          alert('登录已过期，请重新登录');
          router.push('/login');
          return;
        }
        
        throw new Error(`加载失败: ${response.status} ${errorText || ''}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '加载失败');
      }
      
      console.log('获取到的笔记数据:', result.data);
      
      // 确保评论中的用户信息完整
      if (result.data.comments && result.data.comments.length > 0) {
        result.data.comments.forEach(comment => {
          // 如果评论没有用户信息，添加一个默认值
          if (!comment.user) {
            comment.user = {
              _id: 'unknown',
              name: '未知用户'
            };
          }
        });
      }
      
      setJournal(result.data);
      
      // 检查当前用户是否已点赞
      const liked = result.data.likes && result.data.likes.some(like => {
        const likeId = like._id || like.id || like;
        return String(likeId) === String(userId);
      });
      setIsLiked(liked);
      
    } catch (err) {
      console.error('加载笔记详情失败:', err);
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理点赞
  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        return;
      }

      const response = await fetch(`/api/journals/${journal._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setIsLiked(result.data.isLiked);
        
        // 更新点赞数量
        setJournal(prev => ({
          ...prev,
          likes: Array(result.data.likes).fill(null)
        }));
      }
    } catch (err) {
      console.error('点赞失败:', err);
      alert('操作失败，请重试');
    }
  };

  // 提交评论
  const submitComment = async () => {
    if (!commentInput.trim()) {
      alert('请输入评论内容');
      return;
    }

    try {
      setSubmittingComment(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        return;
      }
      
      // 获取当前用户ID
      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        alert('未找到用户信息，请重新登录');
        return;
      }
      
      // 获取当前用户信息
      let currentUser = null;
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          currentUser = JSON.parse(userStr);
          // 确保用户对象有ID字段
          if (!currentUser._id && !currentUser.id) {
            currentUser._id = currentUserId;
          }
        } else {
          // 如果没有用户信息，创建一个基本的用户对象
          currentUser = { _id: currentUserId };
        }
      } catch (error) {
        console.error('处理用户信息失败:', error);
        // 创建一个基本的用户对象
        currentUser = { _id: currentUserId };
      }
      
      const response = await fetch(`/api/journals/${journal._id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentInput })
      });

      const result = await response.json();
      if (result.success) {
        setCommentInput('');
        
        // 直接将新评论添加到当前数据中
        if (result.data && result.data.comment) {
          // 确保评论对象包含用户信息
          result.data.comment.user = currentUser;
          
          // 添加到评论列表
          setJournal(prev => ({
            ...prev,
            comments: [...(prev.comments || []), result.data.comment]
          }));
        } else {
          // 如果返回的数据不包含评论信息，则重新加载笔记详情
          await loadJournalDetail(journal._id);
        }
      } else {
        throw new Error(result.message || '发表评论失败');
      }
    } catch (err) {
      alert('发表评论失败，请重试');
    } finally {
      setSubmittingComment(false);
    }
  };

  // 删除评论
  const deleteComment = async (commentId) => {
    if (!confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('请先登录');
      }
      
      // 删除评论
      const response = await fetch(`/api/journals/${journal._id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('删除失败');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || '删除失败');
      }
      
      // 从当前数据中移除已删除的评论
      setJournal(prev => ({
        ...prev,
        comments: prev.comments.filter(comment => comment._id !== commentId)
      }));
      
    } catch (err) {
      console.error('删除评论失败:', err);
      alert('删除评论失败，请重试');
    }
  };

  // 获取当前用户ID的函数
  const getCurrentUserId = () => {
    try {
      // 从localStorage中的user对象获取
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && (user._id || user.id)) {
          return user._id || user.id;
        }
      }
      
      // 尝试从token中解析用户ID
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // 解析JWT令牌（不验证签名）
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          if (payload && (payload.id || payload.sub)) {
            return payload.id || payload.sub;
          }
        } catch (tokenError) {
          console.error('解析token失败:', tokenError);
        }
      }
      
      return null;
    } catch (error) {
      console.error('获取用户ID失败:', error);
      return null;
    }
  };

  // 检查用户ID是否匹配
  const checkUserIdMatch = (id1, id2) => {
    if (!id1 || !id2) return false;
    
    // 处理可能的对象格式
    if (typeof id1 === 'object') {
      id1 = id1._id || id1.id;
    }
    if (typeof id2 === 'object') {
      id2 = id2._id || id2.id;
    }
    
    // 转换为字符串并比较
    return String(id1).trim() === String(id2).trim();
  };

  // 清除登录信息并重定向到登录页面
  const handleRelogin = () => {
    try {
      // 清除所有相关的存储项
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // 可选：清除cookie
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      console.log('已清除所有登录信息');
      
      // 重定向到登录页面
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
    } catch (error) {
      console.error('清除登录信息时出错:', error);
      // 强制重定向
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center min-h-screen p-6">
          <div className="bg-transparent/20 rounded-xl shadow-lg border border-blue-100 p-12 text-center max-w-3xl w-full">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-medium text-blue-700 mb-3">加载中</h2>
            <p className="text-gray-500 max-w-md mx-auto">正在获取笔记详情，请稍候...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="text-red-500 mb-6 text-center bg-transparent/20 rounded-xl shadow-lg border border-red-100 p-8 max-w-3xl w-full">
            <h2 className="text-2xl font-bold">加载失败</h2>
            <p className="mt-4 text-base bg-red-50/50 p-5 rounded-lg whitespace-pre-wrap break-words">
              {error}
            </p>
            <div className="mt-6 text-gray-600 text-base">
              <p className="font-medium">可能的原因:</p>
              <ul className="list-disc list-inside mt-3 text-left space-y-2">
                <li>登录令牌已过期或无效</li>
                <li>笔记ID格式不正确</li>
                <li>数据库连接问题</li>
                <li>笔记不存在或已被删除</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-5 mt-8">
            <button 
              onClick={() => loadJournalDetail(searchParams.get('id'))}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md transform hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md transition-all font-medium"
            >
              重试
            </button>
            <button 
              onClick={() => router.push('/travel-journal')}
              className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-md transform hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md transition-all font-medium"
            >
              返回日志列表
            </button>
            <button 
              onClick={handleRelogin}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md transform hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md transition-all font-medium"
            >
              重新登录
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!journal) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="bg-transparent/20 rounded-xl shadow-lg border border-blue-100 p-10 text-center max-w-3xl w-full">
            <svg className="w-20 h-20 mx-auto text-blue-300 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-gray-700 text-xl font-medium mb-5">未找到笔记</div>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">该笔记可能已被删除或不存在，请返回日志列表查看其他笔记。</p>
            <button 
              onClick={() => router.push('/travel-journal')}
              className="px-8 py-3 bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white rounded-lg text-base transition-colors duration-200 shadow-md transform hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md"
            >
              返回日志列表
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-transparent">
        {/* 顶部导航 */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-600 text-sm hover:text-blue-500 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
            返回
          </button>
        </div>

        {/* 主要内容 */}
        <main>
          <div className="max-w-3xl mx-auto px-4 py-8">
            <article className="bg-transparent/20 rounded-xl shadow-lg border border-blue-100 overflow-hidden transform transition-all">
              {/* 作者信息 */}
              <div className="flex items-center gap-3 p-8 border-b border-gray-100">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center text-white font-medium shadow-sm">
                  {journal.user.avatar ? (
                    <img src={journal.user.avatar} className="w-full h-full object-cover rounded-full" alt={journal.user.name} />
                  ) : (
                    journal.user.name[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="font-medium text-lg text-gray-800">{journal.user.name}</h2>
                  <time className="text-sm text-gray-500">{new Date(journal.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                </div>
              </div>

              <div className="p-8">
                {/* 笔记内容 */}
                <h1 className="text-2xl font-medium mb-6 text-blue-700">{journal.title}</h1>
                <div className="text-gray-700 mb-8 whitespace-pre-line leading-relaxed">{journal.content}</div>
                
                {/* 图片展示 */}
                {journal.images && journal.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {journal.images.map(image => (
                      <div key={image._id} className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                        <img 
                          src={`/api/journals/images/${image._id}`} 
                          className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
                          alt=""
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 位置信息 */}
                <div className="flex items-center gap-2 text-gray-500 mb-8 mt-4">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="text-base">{journal.location}</span>
                </div>

                {/* 点赞和评论统计 */}
                <div className="flex items-center gap-8 py-5 border-t border-b border-gray-100">
                  <button 
                    className={`flex items-center gap-2 transition-all duration-200 ${isLiked ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}
                    onClick={handleLike}
                  >
                    <svg 
                      className="w-6 h-6" 
                      fill={isLiked ? "#3b82f6" : "none"} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    <span className="font-medium text-base">{journal.likes?.length || 0}</span>
                  </button>
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    <span className="font-medium text-base">{journal.comments?.length || 0}</span>
                  </div>
                </div>

                {/* 评论区 */}
                <div className="mt-10">
                  <h2 className="text-xl font-bold mb-8 text-blue-700">评论</h2>
                  
                  {/* 评论输入框 */}
                  <div className="mb-10 bg-transparent/20 rounded-xl p-5">
                    <textarea 
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="写下你的评论..." 
                      className="w-full border border-blue-200 rounded-lg p-4 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-shadow duration-200 resize-none bg-white/70"
                      rows="3"
                    ></textarea>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={submitComment} 
                        disabled={submittingComment}
                        className="bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white px-8 py-3 rounded-lg text-base transition-colors duration-200 disabled:opacity-50 shadow-md transform hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md"
                      >
                        {submittingComment ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            发表中...
                          </span>
                        ) : '发表评论'}
                      </button>
                    </div>
                  </div>

                  {/* 评论列表 */}
                  <div className="space-y-6">
                    {!journal.comments || journal.comments.length === 0 ? (
                      <div className="p-10 text-center text-gray-500 bg-transparent/20 rounded-xl">
                        <svg className="w-16 h-16 mx-auto text-blue-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        <p className="text-lg">暂无评论，快来发表第一条评论吧！</p>
                      </div>
                    ) : (
                      journal.comments.map(comment => {
                        const currentUserId = getCurrentUserId();
                        const isCommentOwner = checkUserIdMatch(comment.user._id, currentUserId);
                        
                        return (
                          <div key={comment._id} className="flex items-start space-x-4 py-5 border-b border-gray-100">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                              {comment.user.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800 text-base">{comment.user.name || '用户'}</span>
                                  <span className="text-gray-500 text-sm">{new Date(comment.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {isCommentOwner && (
                                  <button 
                                    onClick={() => deleteComment(comment._id)}
                                    className="text-gray-400 hover:text-blue-500 transition-colors text-sm flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                    删除
                                  </button>
                                )}
                              </div>
                              <p className="text-gray-700 mt-2 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </main>
      </div>
    </AppLayout>
  );
} 