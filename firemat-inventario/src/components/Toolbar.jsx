import { motion } from "framer-motion";

function Toolbar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-wrap items-center gap-3 mb-4 rounded-xl border border-neutral-200 bg-white/90 px-4 py-3 shadow-sm"
    >
      <input
        type="text"
        placeholder="Buscar por codigo o nombre..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="px-3 py-2 rounded-md border border-neutral-300 bg-white text-sm placeholder:text-neutral-400 focus:border-red-400 focus:outline-none"
      />

      <select
        value={categoryFilter}
        onChange={(e) => onCategoryFilterChange(e.target.value)}
        className="px-3 py-2 rounded-md border border-neutral-300 bg-white text-sm focus:border-red-400 focus:outline-none"
      >
        <option value="">Todas las categorias</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </motion.section>
  );
}

export default Toolbar;
