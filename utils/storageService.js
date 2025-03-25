/**
 * 从本地存储获取旅行计划
 * @returns {Array} 旅行计划数组
 */
export function getPlans() {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('plans') || '[]');
  }
  
  /**
   * 保存旅行计划到本地存储
   * @param {Array} plans 旅行计划数组
   */
  export function savePlans(plans) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('plans', JSON.stringify(plans));
  }
  
  /**
   * 获取特定计划的备忘录
   * @param {string|number} planId 计划ID
   * @returns {Array} 备忘录数组
   */
  export function getMemos(planId) {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(`memos_${planId}`) || '[]');
  }
  
  /**
   * 保存备忘录到本地存储
   * @param {string|number} planId 计划ID
   * @param {Array} memos 备忘录数组
   */
  export function saveMemos(planId, memos) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`memos_${planId}`, JSON.stringify(memos));
  }
  
  /**
   * 删除计划及其相关备忘录
   * @param {string|number} planId 计划ID
   */
  export function deletePlanAndMemos(planId) {
    if (typeof window === 'undefined') return;
    
    // 获取所有计划
    const plans = getPlans();
    
    // 过滤掉要删除的计划
    const updatedPlans = plans.filter(plan => plan.id.toString() !== planId.toString());
    
    // 保存更新后的计划列表
    savePlans(updatedPlans);
    
    // 删除相关的备忘录
    localStorage.removeItem(`memos_${planId}`);
    
    return updatedPlans;
  }
  
  /**
   * 添加新计划
   * @param {Object} plan 计划对象
   * @returns {Array} 更新后的计划数组
   */
  export function addPlan(plan) {
    if (typeof window === 'undefined') return [];
    
    const plans = getPlans();
    const updatedPlans = [...plans, { ...plan, id: Date.now() }];
    savePlans(updatedPlans);
    
    return updatedPlans;
  }
  
  /**
   * 添加备忘项
   * @param {string|number} planId 计划ID
   * @param {string} content 备忘内容
   * @returns {Array} 更新后的备忘录数组
   */
  export function addMemo(planId, content) {
    if (typeof window === 'undefined') return [];
    
    const memos = getMemos(planId);
    const newMemo = {
      id: Date.now(),
      content,
      completed: false
    };
    
    const updatedMemos = [...memos, newMemo];
    saveMemos(planId, updatedMemos);
    
    return updatedMemos;
  }
  
  /**
   * 切换备忘项完成状态
   * @param {string|number} planId 计划ID
   * @param {string|number} memoId 备忘项ID
   * @returns {Array} 更新后的备忘录数组
   */
  export function toggleMemoStatus(planId, memoId) {
    if (typeof window === 'undefined') return [];
    
    const memos = getMemos(planId);
    const updatedMemos = memos.map(memo => 
      memo.id.toString() === memoId.toString() 
        ? { ...memo, completed: !memo.completed } 
        : memo
    );
    
    saveMemos(planId, updatedMemos);
    
    return updatedMemos;
  }
  
  /**
   * 删除备忘项
   * @param {string|number} planId 计划ID
   * @param {string|number} memoId 备忘项ID
   * @returns {Array} 更新后的备忘录数组
   */
  export function deleteMemo(planId, memoId) {
    if (typeof window === 'undefined') return [];
    
    const memos = getMemos(planId);
    const updatedMemos = memos.filter(memo => memo.id.toString() !== memoId.toString());
    
    saveMemos(planId, updatedMemos);
    
    return updatedMemos;
  }