'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  FileText,
  Layers,
  LockKeyhole,
  PlayCircle,
  Sparkles,
  Trophy,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MODULES, type UserProgress } from '@/types';
import {
  achievements as getAchievements,
  avgAiScore,
  modulesCompleted,
  nextModule as getNextModule,
  overallPercent,
  questionsAnswered,
} from '@/lib/learn/progress';

const badgeDetails = [
  { id: 'first-module-started', label: 'First Module Started', image: '/brand/learn/badge-1.webp', Icon: PlayCircle },
  { id: 'first-module-completed', label: 'First Module Completed', image: '/brand/learn/badge-2.webp', Icon: CheckCircle2 },
  { id: 'ai-score-80', label: 'AI Score 80+', image: '/brand/learn/badge-3.webp', Icon: Sparkles },
] as const;

const otherAchievementIcons = {
  'halfway-there': Trophy,
  'path-complete': Award,
  'sharp-shooter': Sparkles,
} as const;

function ProgressRing({ value }: { value: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="relative h-[120px] w-[120px]" role="img" aria-label={`${value}% overall progress`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--muted-bg)" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--success)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-extrabold leading-none text-foreground">{value}%</span>
        <span className="mt-1 text-[11px] font-medium text-muted-foreground">Overall</span>
      </div>
    </div>
  );
}

export function LearningProgressPanel({
  progressRows,
  isAuthenticated,
}: {
  progressRows: UserProgress[];
  isAuthenticated: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const percent = isAuthenticated ? overallPercent(progressRows) : 0;
  const completed = isAuthenticated ? modulesCompleted(progressRows) : { completed: 0, total: MODULES.length };
  const answered = isAuthenticated ? questionsAnswered(progressRows) : { completed: 0, total: questionsAnswered([]).total };
  const score = isAuthenticated ? avgAiScore(progressRows) : null;
  const next = getNextModule(isAuthenticated ? progressRows : []);
  const allAchievements = getAchievements(isAuthenticated ? progressRows : []);
  const achievementById = new Map(allAchievements.map((achievement) => [achievement.id, achievement]));

  return (
    <aside className="min-w-0 space-y-4">
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base font-bold">My Learning Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAuthenticated ? (
            <div className="rounded-lg border border-dashed border-border bg-muted-bg/50 px-4 py-5 text-center">
              <CircleHelp className="mx-auto h-7 w-7 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">Sign in to track your progress</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Your modules and AI scores will appear here.</p>
              <Link href="/login" className="mt-4 inline-block">
                <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover">Sign in <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-center py-1"><ProgressRing value={percent} /></div>
              <div className="space-y-3 border-t border-border pt-4">
                <MetricRow icon={CheckCircle2} color="text-success" label="Modules Completed" value={`${completed.completed}/${completed.total}`} />
                <MetricRow icon={PlayCircle} color="text-primary" label="Questions Answered" value={`${answered.completed}/${answered.total}`} />
                <MetricRow icon={Sparkles} color="text-accent-text" label="Avg. AI Score" value={score == null ? '—' : `${score}/100`} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-success/20 bg-success-bg/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <Layers className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-foreground">Fundamental Investing Path</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">A structured path from basics to advanced company analysis.</p>
            </div>
          </div>
          <Link href={next ? `/learn/${next.id}` : '/learn'} className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-success/15 bg-card/70 px-3 py-2.5 text-sm transition-colors hover:bg-card">
            <span className="min-w-0 truncate"><span className="font-semibold text-success">Next:</span> <span className="text-foreground">{next?.title ?? 'Path complete'}</span></span>
            <ChevronRight className="h-4 w-4 shrink-0 text-success" />
          </Link>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="font-display text-base font-bold">Achievements</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button type="button" className="text-xs font-semibold text-primary hover:underline">View All</button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">Achievements</DialogTitle>
                <DialogDescription>Milestones earned as you work through the Fundamental Investing Path.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {allAchievements.map((achievement) => {
                  const featured = badgeDetails.find((badge) => badge.id === achievement.id);
                  const Icon = featured?.Icon ?? otherAchievementIcons[achievement.id as keyof typeof otherAchievementIcons] ?? Award;
                  return (
                    <div key={achievement.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${achievement.unlocked ? 'bg-success-bg text-success' : 'bg-muted-bg text-muted-foreground'}`}>
                        {featured ? <Image src={featured.image} alt="" width={40} height={40} className={`h-auto w-10 object-contain ${achievement.unlocked ? '' : 'grayscale opacity-40'}`} /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground">{achievement.label}</span>
                      {achievement.unlocked ? <CheckCircle2 className="h-4 w-4 text-success" /> : <LockKeyhole className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          {badgeDetails.map((badge) => {
            const unlocked = isAuthenticated && (achievementById.get(badge.id)?.unlocked ?? false);
            return (
              <div key={badge.id} title={badge.label} className="relative flex min-h-[112px] flex-col items-center justify-center rounded-lg border border-border bg-muted-bg/40 px-1.5 py-3 text-center">
                <Image src={badge.image} alt="" width={56} height={56} className={`h-auto w-14 object-contain ${unlocked ? '' : 'grayscale opacity-40'}`} />
                {!unlocked && <LockKeyhole className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-muted-foreground" />}
                <span className={`mt-2 text-[10px] font-semibold leading-tight ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{badge.label}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="font-display text-base font-bold">Resources</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {[
            { href: '/learn/resources/ratios-cheat-sheet', label: 'Financial Ratios Cheat Sheet' },
            { href: '/learn/resources/10k-checklist', label: '10-K Analysis Checklist' },
            { href: '/learn/glossary', label: 'Investing Terms Glossary' },
            { href: '/fund-manager', label: 'Company Analysis Template' },
          ].map((resource) => (
            <Link key={resource.href} href={resource.href} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted-bg hover:text-foreground">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">{resource.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}

function MetricRow({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: typeof CheckCircle2;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className={`h-4 w-4 shrink-0 ${color}`} />
      <span className="min-w-0 flex-1 text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}
