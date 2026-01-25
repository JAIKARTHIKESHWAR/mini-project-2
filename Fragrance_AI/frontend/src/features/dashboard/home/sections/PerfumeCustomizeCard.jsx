import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Droplet, Leaf, Flower2, Sparkles, ArrowRight } from "lucide-react";

const scentIcons = [
  { icon: Droplet, label: "Aquatic", color: "text-blue-400" },
  { icon: Leaf, label: "Green", color: "text-emerald-400" },
  { icon: Flower2, label: "Floral", color: "text-pink-400" },
  { icon: Sparkles, label: "Oriental", color: "text-primary" },
];

export default function PerfumeCustomizeCard() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      onClick={() => navigate("/dashboard/personalization-lab")}
      className="glass-card-hover h-full p-5 flex flex-col cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Personalize Your Blend
          </h3>
          <p className="text-sm text-muted-foreground">
            Mix notes & create your signature scent
          </p>
        </div>
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Scent icons grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-4 gap-3 w-full">
          {scentIcons.map(({ icon: Icon, label, color }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className={`p-3 rounded-xl bg-secondary/50 ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom prompt */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Tap to enter the Personalization Lab
        </p>
      </div>
    </motion.div>
  );
}
