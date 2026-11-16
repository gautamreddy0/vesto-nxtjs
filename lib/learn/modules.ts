import { MODULES } from '@/types';
import { MODULE_CONTENT } from './questions';

export const MODULE_META = {
  'module-1': {
    illustration: '/brand/learn/module-1.webp',
    topic: 'Fundamentals',
    levelColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  'module-2': {
    illustration: '/brand/learn/module-2.webp',
    topic: '10-K Analysis',
    levelColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  'module-3': {
    illustration: '/brand/learn/module-3.webp',
    topic: 'Financial Statements',
    levelColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  'module-4': {
    illustration: '/brand/learn/module-4.webp',
    topic: 'Strategy',
    levelColor: 'bg-violet-100 text-violet-800 border-violet-200',
  },
  'module-5': {
    illustration: '/brand/learn/module-5.webp',
    topic: 'Comparative',
    levelColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
} as const;

export type LearnModuleId = keyof typeof MODULE_META;

export interface ModuleStats {
  mcq: number;
  written: number;
  total: number;
  estMinutes: number;
}

export function getModuleStats(moduleId: string): ModuleStats {
  const questions = MODULE_CONTENT[moduleId]?.questions;
  if (!Array.isArray(questions)) {
    return { mcq: 0, written: 0, total: 0, estMinutes: 0 };
  }

  const mcq = questions.filter((question: { type?: string }) => question.type === 'mcq').length;
  const written = questions.filter((question: { type?: string }) => question.type === 'written').length;
  const total = questions.length;
  const minutes = mcq * 2 + written * 8;

  return {
    mcq,
    written,
    total,
    estMinutes: Math.round(minutes / 5) * 5,
  };
}

export const TOTAL_MODULES = MODULES.length;
