import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowRight, ExternalLink } from "lucide-react";

const products = [
  { name: "Chanel No. 5", price: "$135", store: "Amazon" },
  { name: "Dior Sauvage", price: "$98", store: "eBay" },
  { name: "Tom Ford Oud", price: "$245", store: "Flipkart" },
];

export default function ShopCard() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      onClick={() => navigate("/dashboard/shopping")}
      className="glass-card-hover h-full p-5 flex flex-col cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Shop Products
          </h3>
          <p className="text-sm text-muted-foreground">
            Amazon, eBay, Flipkart
          </p>
        </div>
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Product list */}
      <div className="flex-1 flex flex-col justify-center gap-2">
        {products.map((product, idx) => (
          <motion.div
            key={product.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {product.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.store}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">{product.price}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-1.5 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom prompt */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Browse all products
        </p>
        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    </motion.div>
  );
}
