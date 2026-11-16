'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  GraduationCap,
  LayoutGrid,
  PlayCircle,
  Route,
  Search,
  UserRound,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LearningProgressPanel } from '@/components/learn/learning-progress-panel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBookmarks } from '@/lib/hooks/use-bookmarks';
import { useLearningProgress } from '@/lib/hooks/use-learning-progress';
import { getModuleStats, MODULE_META } from '@/lib/learn/modules';
import { GLOSSARY_TERMS } from '@/lib/learn/glossary';
import { MODULES } from '@/types';
import type { Module, UserProgress } from '@/types';

const tabs = [
  { id: 'all', label: 'All Modules', Icon: LayoutGrid },
  { id: 'learning', label: 'My Learning', Icon: UserRound },
  { id: 'path', label: 'Learning Paths', Icon: Route },
  { id: 'bookmarks', label: 'Bookmarks', Icon: Bookmark },
] as const;

type TabId = (typeof tabs)[number]['id'];
type Level = Module['level'];

const levelLabels: Record<Level, string> = {
  easy: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

const levelStyles: Record<Level, string> = {
  easy: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  intermediate: 'border-blue-200 bg-blue-50 text-blue-800',
  advanced: 'border-violet-200 bg-violet-50 text-violet-800',
  expert: 'border-amber-200 bg-amber-50 text-amber-800',
};

function getProgress(progressMap: Record<string, UserProgress>, moduleId: string) {
  const row = progressMap[moduleId];
  const percentage = Math.max(0, Math.min(100, row?.completion_percentage ?? 0));
  const stats = getModuleStats(moduleId);
  const answered = Math.round((stats.total * percentage) / 100);
  const completed = row?.status === 'completed' || percentage >= 100;
  return { percentage, answered, stats, completed, inProgress: percentage > 0 && !completed };
}

function ModuleCard({
  module,
  progressMap,
  bookmarked,
  onToggleBookmark,
}: {
  module: Module;
  progressMap: Record<string, UserProgress>;
  bookmarked: boolean;
  onToggleBookmark: (moduleId: string) => void;
}) {
  const progress = getProgress(progressMap, module.id);
  const metadata = MODULE_META[module.id as keyof typeof MODULE_META];
  const action = progress.completed ? 'Review' : progress.inProgress ? 'Continue' : 'Start Module';

  return (
    <Card
      className={`group relative flex min-h-[282px] flex-col overflow-hidden border-border bg-card p-4 shadow-sm motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg ${progress.completed ? 'ring-1 ring-success/25' : ''}`}
    >
      <div className="relative min-h-[146px] pr-24">
        <div className="flex items-center gap-2">
          <Badge className={`border px-2.5 py-1 text-[11px] font-semibold ${levelStyles[module.level]}`}>
            {levelLabels[module.level]}
          </Badge>
          {progress.completed && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
              <Check className="h-3.5 w-3.5" /> Completed
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={bookmarked ? `Remove ${module.title} from bookmarks` : `Bookmark ${module.title}`}
          aria-pressed={bookmarked}
          onClick={() => onToggleBookmark(module.id)}
          className={`absolute right-0 top-0 z-10 rounded-full p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${bookmarked ? 'text-primary' : 'text-muted-foreground hover:bg-muted-bg hover:text-primary'}`}
        >
          <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
        </button>
        <Image
          src={metadata.illustration}
          alt=""
          width={112}
          height={104}
          className="absolute right-0 top-8 h-24 w-24 object-contain"
        />
        <h2 className="mt-3 max-w-[calc(100%-0.25rem)] font-display text-lg font-bold leading-snug text-foreground">
          {module.title}
        </h2>
        <p className="mt-1.5 line-clamp-3 max-w-[calc(100%-0.25rem)] text-sm leading-relaxed text-muted-foreground">
          {module.description}
        </p>
      </div>

      <div className="mt-auto pt-3">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-medium">
          <span className="text-foreground">{progress.percentage}% complete</span>
          <span className="text-muted-foreground">{progress.answered} of {progress.stats.total} answered</span>
        </div>
        <div
          role="progressbar"
          aria-label={`${module.title} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percentage}
          className="h-2 overflow-hidden rounded-full bg-muted-bg"
        >
          <div className="h-full rounded-full bg-success transition-[width]" style={{ width: `${progress.percentage}%` }} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
            <span className="whitespace-nowrap">{progress.stats.total} Questions</span>
            <span aria-hidden="true" className="text-border">|</span>
            <span className="whitespace-nowrap">~{progress.stats.estMinutes} min</span>
          </div>
          <Link href={`/learn/${module.id}`} className="shrink-0">
            <Button size="sm" className="gap-1 bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary-hover">
              {action}{progress.completed ? ' ✓' : <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default function LearnPage() {
  const { progressMap, loading, isAuthenticated } = useLearningProgress();
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        event.stopImmediatePropagation();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut, true);
    return () => window.removeEventListener('keydown', handleShortcut, true);
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const glossaryMatches = useMemo(() => {
    if (!normalizedQuery) return [];
    return GLOSSARY_TERMS.filter(({ term, definition, formula, ruleOfThumb }) => `${term} ${definition} ${formula ?? ''} ${ruleOfThumb}`.toLowerCase().includes(normalizedQuery)).slice(0, 6);
  }, [normalizedQuery]);

  const visibleModules = useMemo(() => {
    return MODULES.filter((module) => {
      const metadata = MODULE_META[module.id as keyof typeof MODULE_META];
      const progress = getProgress(progressMap, module.id);
      const matchesTab = activeTab === 'all'
        || (activeTab === 'learning' && (progress.inProgress || progress.completed))
        || (activeTab === 'bookmarks' && bookmarks.includes(module.id));
      const matchesQuery = !normalizedQuery
        || `${module.title} ${module.description} ${metadata.topic}`.toLowerCase().includes(normalizedQuery);
      const matchesLevel = levelFilter === 'all' || module.level === levelFilter;
      const matchesTopic = topicFilter === 'all' || metadata.topic === topicFilter;
      return matchesTab && matchesQuery && matchesLevel && matchesTopic;
    });
  }, [activeTab, bookmarks, levelFilter, normalizedQuery, progressMap, topicFilter]);

  const nextModule = MODULES.find((module) => !getProgress(progressMap, module.id).completed) ?? MODULES[0];
  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label;
  const progressRows = Object.values(progressMap);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 pb-20 md:pb-6">
      <div className="grid min-w-0 gap-6 min-[1200px]:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">Learn</h1>
        <label className="flex h-11 w-full items-center gap-2 rounded-lg border border-border bg-card px-3 shadow-sm focus-within:ring-2 focus-within:ring-ring sm:max-w-[400px]">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search topics, modules (e.g. P/E Ratio, DCF…)"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="Search topics, modules, and glossary terms"
          />
          <kbd className="hidden rounded border border-border bg-muted-bg px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">⌘K</kbd>
        </label>
      </div>

      <section className="relative isolate flex min-h-[188px] overflow-hidden rounded-2xl bg-brand-hero text-white shadow-sm">
        <div className="relative z-10 flex w-full max-w-[68%] flex-col justify-center px-6 py-7 sm:px-8 lg:px-10">
          <div className="mb-3 flex items-center gap-3 text-teal-300">
            <GraduationCap className="h-9 w-9 shrink-0" strokeWidth={2.25} />
            <span className="sr-only">Learning</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-[40px]">Learning Modules</h2>
          <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-white/85 sm:text-base">
            Build a strong investing foundation, master analysis techniques, and apply them through real-world company examples.
          </p>
        </div>
        <Image
          src="/brand/learn/learn-hero-art.webp"
          alt=""
          width={520}
          height={320}
          priority
          className="absolute right-0 top-1/2 hidden h-[260px] w-[38%] -translate-y-1/2 object-contain object-right md:block"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 25%)' }}
        />
      </section>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-max rounded-xl border border-border bg-muted-bg/70 p-1" role="tablist" aria-label="Learn sections">
          {tabs.map(({ id, label, Icon }) => {
            const selected = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`learn-tab-${id}`}
                aria-controls="learn-tabpanel"
                aria-selected={selected}
                onClick={() => setActiveTab(id)}
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                  event.preventDefault();
                  const direction = event.key === 'ArrowRight' ? 1 : -1;
                  const currentIndex = tabs.findIndex((tab) => tab.id === id);
                  const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
                  setActiveTab(tabs[nextIndex].id);
                  document.getElementById(`learn-tab-${tabs[nextIndex].id}`)?.focus();
                }}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors sm:min-w-[150px] ${selected ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div id="learn-tabpanel" role="tabpanel" aria-labelledby={`learn-tab-${activeTab}`} tabIndex={0} className="space-y-5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      {activeTab === 'path' ? (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">Learning Path</p>
              <h2 className="mt-1 font-display text-xl font-bold text-foreground">Fundamental Investing Path</h2>
              <p className="mt-1 text-sm text-muted-foreground">Work through the modules in order, from core fundamentals to comparative analysis.</p>
            </div>
            <Link href={`/learn/${nextModule.id}`}>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">Continue path <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          <ol className="mt-7 space-y-0">
            {MODULES.map((module, index) => {
              const progress = getProgress(progressMap, module.id);
              const stateLabel = progress.completed ? 'Completed' : progress.inProgress ? 'In progress' : 'Not started';
              return (
                <li key={module.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {index < MODULES.length - 1 && <span aria-hidden="true" className="absolute left-[11px] top-6 h-[calc(100%-1rem)] w-px bg-border" />}
                  <span className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${progress.completed ? 'border-success bg-success text-white' : progress.inProgress ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                    {progress.completed ? <Check className="h-3.5 w-3.5" /> : <span className={`h-2 w-2 rounded-full ${progress.inProgress ? 'bg-primary' : 'bg-transparent'}`} />}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{index + 1}. {module.title}</p>
                      <p className="text-xs text-muted-foreground">{stateLabel} · {getModuleStats(module.id).total} questions</p>
                    </div>
                    <Link href={`/learn/${module.id}`} className="text-sm font-semibold text-primary hover:underline">{progress.completed ? 'Review module' : 'Open module'}</Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Modules ({MODULES.length})</h2>
              {activeTab !== 'all' && <p className="mt-0.5 text-xs text-muted-foreground">{activeTabLabel}</p>}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:flex sm:items-center">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger aria-label="Filter by level" className="w-full bg-card sm:w-[152px]"><SelectValue placeholder="All Levels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Select value={topicFilter} onValueChange={setTopicFilter}>
                <SelectTrigger aria-label="Filter by topic" className="w-full bg-card sm:w-[190px]"><SelectValue placeholder="All Topics" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {[...new Set(MODULES.map((module) => MODULE_META[module.id as keyof typeof MODULE_META].topic))].map((topic) => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="learn-module-grid grid gap-4">
              {MODULES.map((module) => (
                <div key={module.id} className="h-[282px] animate-pulse rounded-xl border border-border bg-card p-4" aria-hidden="true">
                  <div className="h-5 w-24 rounded-full bg-muted-bg" />
                  <div className="mt-5 h-5 w-3/5 rounded bg-muted-bg" />
                  <div className="mt-3 h-3 w-4/5 rounded bg-muted-bg" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-muted-bg" />
                  <div className="mt-14 h-2 rounded bg-muted-bg" />
                  <div className="mt-5 h-8 rounded bg-muted-bg" />
                </div>
              ))}
            </div>
          ) : visibleModules.length > 0 ? (
            <div className="learn-module-grid grid gap-4">
              {visibleModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  progressMap={progressMap}
                  bookmarked={isBookmarked(module.id)}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card px-5 py-12 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-muted-bg text-muted-foreground">
                {activeTab === 'bookmarks' ? <Bookmark className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
              </div>
              <p className="mt-3 font-semibold text-foreground">
                {activeTab === 'bookmarks' ? 'No bookmarked modules yet' : activeTab === 'learning' ? 'Start a module to see it here' : 'No modules match your search'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeTab === 'bookmarks' ? 'Use the bookmark icon on any module to save it for later.' : 'Try adjusting your search or filters.'}
              </p>
            </div>
          )}

          {normalizedQuery && glossaryMatches.length > 0 && (
            <section aria-labelledby="glossary-matches-heading" className="space-y-3">
              <div>
                <h2 id="glossary-matches-heading" className="font-display text-lg font-bold text-foreground">Glossary matches</h2>
                <p className="text-sm text-muted-foreground">Related investing terms for “{query.trim()}”</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {glossaryMatches.map(({ term, id }) => (
                  <Link key={id} href={`/learn/glossary#${id}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted-bg">
                    {term}<ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
      </div>

        </div>
        <LearningProgressPanel progressRows={progressRows} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  );
}
