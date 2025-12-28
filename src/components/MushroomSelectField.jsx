export default function MushroomSelectField({ label, value, onChange, options }) {
  const formatLabel = (val) => {
    return val
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <label className="block">
      <span className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value || "")}
        className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-stone-800 text-sm"
      >
        <option value="">— Select (Optional) —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {formatLabel(o)}
          </option>
        ))}
      </select>
    </label>
  );
}










