export default function PlanCard({ plan, isSelected, onSelect, onDelete }) {
    return (
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
        <span>{plan.destination} - {plan.date}</span>
        <div className="flex gap-2">
          <button 
            onClick={onSelect} 
            className={`px-4 py-1 text-sm ${isSelected ? 'text-gray-500' : ''}`}
          >
            {isSelected ? '已选择' : '选择'}
          </button>
          <button 
            onClick={onDelete} 
            className="px-3 py-1 text-sm text-red-500 hover:text-red-700"
          >
            删除
          </button>
        </div>
      </div>
    );
  }