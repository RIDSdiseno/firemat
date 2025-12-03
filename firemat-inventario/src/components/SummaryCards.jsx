import { motion } from "framer-motion";

function SummaryCards({ productsCount, lowStockCount, totalStock }) {
  const cards = [
    {
      label: "Productos activos",
      value: productsCount,
      gradient: "from-red-500/20 to-red-500/10",
    },
    {
      label: "Items bajo minimo",
      value: lowStockCount,
      gradient: "from-amber-500/20 to-amber-500/10",
    },
    {
      label: "Stock total (unidades)",
      value: totalStock,
      gradient: "from-emerald-500/20 to-emerald-500/10",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: idx * 0.05 }}
          className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white/90 shadow-md px-4 py-4"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`}
          />
          <div className="relative">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold">
              {card.label}
            </p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {card.value}
            </p>
          </div>
        </motion.div>
      ))}
    </section>
  );
}

export default SummaryCards;
