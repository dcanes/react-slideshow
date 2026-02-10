import { motion } from 'framer-motion';

const tileVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

interface SmartTileProps {
  text: string;
}

export function SmartTile({ text }: SmartTileProps) {
  return (
    <motion.div variants={tileVariants} className="smart-tile">
      <span className="tile-text">{text}</span>
    </motion.div>
  );
}
