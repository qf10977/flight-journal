import { useState } from 'react';

export default function TravelMemoItem({ memo, onToggle, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  // 处理删除
  const handleDelete = async () => {
    if (window.confirm('确定要删除这个备忘项吗？')) {
      setIsDeleting(true);
      try {
        await onDelete(memo.id);
      } catch (error) {
        console.error('删除备忘项失败:', error);
        alert('删除失败，请重试');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <li className="flex items-center gap-3 p-2 bg-white border rounded-md">
      <input 
        type="checkbox" 
        checked={memo.completed} 
        onChange={() => onToggle(memo.id)} 
        className="w-5 h-5"
      />
      <span className={memo.completed ? 'line-through text-gray-500' : ''}>
        {memo.content}
      </span>
      <button 
        onClick={handleDelete} 
        disabled={isDeleting}
        className="ml-auto text-red-500 hover:text-red-700 disabled:opacity-50"
      >
        {isDeleting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            删除中
          </span>
        ) : '删除'}
      </button>
    </li>
  );
} 