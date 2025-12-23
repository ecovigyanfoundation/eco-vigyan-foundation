"use client";

function CheckIcon() {
  return (
    <svg 
      className="w-3 h-3 text-white" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth="3"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function CategoryFilter({ categories, filters, toggle }) {
  if (!categories || categories.length === 0) {
    return <div className="text-gray-500 text-xs italic">No filters available</div>;
  }

  return (
    <div className="space-y-2">
      {categories.map((cat) => {
        const isActive = filters[cat];

        return (
          <div
            key={cat}
            onClick={() => toggle(cat)}
            className={`
              group flex items-center justify-between 
              p-3 rounded-xl border cursor-pointer 
              transition-all duration-200 ease-in-out
              ${
                isActive
                  ? "bg-green-900/20 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                  : "bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750"
              }
            `}
          >
            {/* Label */}
            <span
              className={`text-sm font-medium capitalize transition-colors ${
                isActive ? "text-green-400" : "text-gray-400 group-hover:text-gray-200"
              }`}
            >
              {cat}
            </span>

            {/* Custom Checkbox Circle */}
            <div
              className={`
                w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-200
                ${
                  isActive
                    ? "bg-green-500 border-green-500 scale-110"
                    : "border-gray-600 bg-gray-900 group-hover:border-gray-400"
                }
              `}
            >
              {isActive && <CheckIcon />}
            </div>
          </div>
        );
      })}
    </div>
  );
}