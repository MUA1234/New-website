'use client';

import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-4"
      >
        {icon || <Inbox size={48} className="text-white/20" />}
      </motion.div>
      <h3 className="text-lg font-semibold text-white/80 mb-2">{title}</h3>
      {description && <p className="text-sm text-white/40 max-w-xs mb-6">{description}</p>}
      {action}
    </motion.div>
  );
}
