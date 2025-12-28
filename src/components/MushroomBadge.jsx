import {
  Utensils,
  FlaskConical,
  Skull,
  Leaf,
  Flame,
  Zap,
} from "lucide-react";

export default function MushroomBadge({ category, use, variant = "small" }) {
  const getUseIcon = (useType) => {
    const iconSize = variant === "small" ? 12 : 16;
    switch (useType?.toLowerCase()) {
      case "culinary":
      case "edible":
        return <Utensils size={iconSize} className="text-emerald-400" />;
      case "medicinal":
        return <FlaskConical size={iconSize} className="text-blue-400" />;
      case "poisonous":
        return <Skull size={iconSize} className="text-red-500" />;
      case "research":
        return <Leaf size={iconSize} className="text-orange-400" />;
      case "fuel":
        return <Flame size={iconSize} className="text-yellow-500" />;
      default:
        return <Zap size={iconSize} className="text-purple-400" />;
    }
  };

  return (
    <div
      className={`flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full ${
        variant === "small" ? "px-2 py-0.5" : "px-4 py-2"
      }`}
    >
      {getUseIcon(use)}
      <span
        className={`font-black uppercase tracking-tighter text-white ${
          variant === "small" ? "text-[9px]" : "text-xs"
        }`}
      >
        {category}
      </span>
    </div>
  );
}

