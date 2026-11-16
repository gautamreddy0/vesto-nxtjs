import { MODULES, type UserProgress } from '@/types';
import { getModuleStats } from './modules';

export interface ProgressCount {
  completed: number;
  total: number;
}

export interface Achievement {
  id: 'first-module-started' | 'first-module-completed' | 'ai-score-80' | 'halfway-there' | 'path-complete' | 'sharp-shooter';
  label: string;
  unlocked: boolean;
}

const rowsByModule = (rows: UserProgress[]) => new Map(rows.map((row) => [row.module_id, row]));

export function overallPercent(rows: UserProgress[]): number {
  const byModule = rowsByModule(rows);
  const total = MODULES.reduce((sum, module) => sum + (byModule.get(module.id)?.completion_percentage ?? 0), 0);
  return Math.round(total / MODULES.length);
}

export function modulesCompleted(rows: UserProgress[]): ProgressCount {
  const byModule = rowsByModule(rows);
  return {
    completed: MODULES.filter((module) => {
      const row = byModule.get(module.id);
      return row?.status === 'completed' || row?.completion_percentage === 100;
    }).length,
    total: MODULES.length,
  };
}

export function questionsAnswered(rows: UserProgress[]): ProgressCount {
  const byModule = rowsByModule(rows);
  return MODULES.reduce<ProgressCount>((count, module) => {
    const row = byModule.get(module.id);
    const moduleTotal = getModuleStats(module.id).total;
    count.total += moduleTotal;
    if (row && moduleTotal > 0) {
      // completion_percentage tracks successfully completed questions, not all attempts.
      count.completed += Math.round((moduleTotal * row.completion_percentage) / 100);
    }
    return count;
  }, { completed: 0, total: 0 });
}

export function avgAiScore(rows: UserProgress[]): number | null {
  const scoredRows = rows.filter((row) =>
    getModuleStats(row.module_id).written > 0 && row.average_score > 0
  );
  if (scoredRows.length === 0) return null;
  return Math.round(scoredRows.reduce((total, row) => total + row.average_score, 0) / scoredRows.length);
}

export function nextModule(rows: UserProgress[]): (typeof MODULES)[number] | null {
  const byModule = rowsByModule(rows);
  return MODULES.find((module) => {
    const row = byModule.get(module.id);
    return row?.status !== 'completed' && row?.completion_percentage !== 100;
  }) ?? null;
}

export function achievements(rows: UserProgress[]): Achievement[] {
  const byModule = rowsByModule(rows);
  const completion = modulesCompleted(rows);
  const started = rows.some((row) => row.status === 'in_progress' || row.status === 'completed' || Boolean(row.started_at));
  const highAiScore = rows.some((row) => getModuleStats(row.module_id).written > 0 && row.average_score >= 80);

  // correct_answers aggregates accepted MCQs and written answers. Subtract the maximum
  // possible written-answer contribution so this only unlocks when 90% MCQ accuracy is certain.
  const sharpShooter = MODULES.some((module) => {
    const row = byModule.get(module.id);
    const stats = getModuleStats(module.id);
    if (!row || stats.mcq === 0) return false;
    const minimumMcqCorrect = Math.max(0, Math.min(stats.mcq, row.correct_answers - stats.written));
    return minimumMcqCorrect / stats.mcq >= 0.9;
  });

  return [
    { id: 'first-module-started', label: 'First Module Started', unlocked: started },
    { id: 'first-module-completed', label: 'First Module Completed', unlocked: completion.completed > 0 },
    { id: 'ai-score-80', label: 'AI Score 80+', unlocked: highAiScore },
    { id: 'halfway-there', label: 'Halfway There', unlocked: completion.completed >= 3 },
    { id: 'path-complete', label: 'Path Complete', unlocked: completion.completed === completion.total },
    { id: 'sharp-shooter', label: 'Sharp Shooter', unlocked: sharpShooter },
  ];
}
