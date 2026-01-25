import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Bot, ArrowRight } from "lucide-react";

export default function MaestroCard() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      onClick={() => navigate("/dashboard/maestro")}
      className="glass-card-hover h-full p-5 flex flex-col cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Chat with Maestro
          </h3>
          <p className="text-sm text-muted-foreground">
            AI guidance on perfumes
          </p>
        </div>
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Chat preview */}
      <div className="flex-1 flex flex-col justify-center gap-3">
        {/* AI message */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-2"
        >
          <div className="p-1.5 rounded-full bg-primary/20">
            <Bot className="w-3 h-3 text-primary" />
          </div>
          <div className="bg-secondary/50 rounded-lg rounded-tl-none px-3 py-2 max-w-[85%]">
            <p className="text-xs text-foreground">
              I'd recommend exploring oud-based fragrances for evening wear...
            </p>
          </div>
        </motion.div>

        {/* User message */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-2 justify-end"
        >
          <div className="bg-primary/20 rounded-lg rounded-tr-none px-3 py-2 max-w-[85%]">
            <p className="text-xs text-foreground">
              What about something fresh for summer?
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom prompt */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Ask anything about fragrances
        </p>
      </div>
    </motion.div>
  );
}
