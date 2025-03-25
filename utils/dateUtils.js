/**
 * 计算从当前到目标日期的倒计时
 * @param {string} targetDate 目标日期字符串 (YYYY-MM-DD)
 * @returns {Object} 包含天、小时、分钟的对象
 */
export function calculateCountdown(targetDate) {
    const target = new Date(targetDate);
    const now = new Date();
    
    // 确保目标日期有效
    if (isNaN(target.getTime())) {
      return { days: 0, hours: 0, minutes: 0, text: '无效日期' };
    }
    
    // 计算时间差（毫秒）
    const diff = target - now;
    
    // 如果目标日期已过
    if (diff < 0) {
      return { days: 0, hours: 0, minutes: 0, text: '已过期' };
    }
    
    // 计算天、小时、分钟
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    // 格式化文本
    const text = `${days}天 ${hours}小时 ${minutes}分钟`;
    
    return { days, hours, minutes, text };
  }
  
  /**
   * 格式化日期为本地字符串
   * @param {string} dateString 日期字符串
   * @returns {string} 格式化后的日期字符串
   */
  export function formatDate(dateString) {
    const date = new Date(dateString);
    
    // 确保日期有效
    if (isNaN(date.getTime())) {
      return '无效日期';
    }
    
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }
  
  /**
   * 获取今天的日期字符串 (YYYY-MM-DD)
   * @returns {string} 今天的日期字符串
   */
  export function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  /**
   * 检查日期是否在未来
   * @param {string} dateString 日期字符串
   * @returns {boolean} 是否是未来日期
   */
  export function isFutureDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    
    // 重置时间部分以便只比较日期
    today.setHours(0, 0, 0, 0);
    
    return date >= today;
  }