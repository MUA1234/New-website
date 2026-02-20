'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, X, ChevronRight, Clock, BarChart2, CheckCircle2,
  Award, RefreshCw, Search, Filter, GraduationCap,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/ui/GlassCard';
import EmptyState from '@/components/ui/EmptyState';
import type { Article, QuizQuestion } from '@/types';

const DIFFICULTY_CONFIG = {
  beginner: { color: '#16a085', bg: 'rgba(22,160,133,0.15)', label: 'Beginner' },
  intermediate: { color: '#f39c12', bg: 'rgba(243,156,18,0.15)', label: 'Intermediate' },
  advanced: { color: '#e74c3c', bg: 'rgba(231,76,60,0.15)', label: 'Advanced' },
};

const CATEGORY_FILTERS = [
  'All', 'Tax & Legal', 'Budgeting', 'Savings & Investment', 'Debt Management', 'Banking',
];

function QuizView({
  questions, onFinish,
}: {
  questions: QuizQuestion[];
  onFinish: (score: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  const handleSelect = (optionIdx: number) => {
    if (revealed) return;
    setSelected(optionIdx);
    setRevealed(true);
    if (optionIdx === q.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (isLast) {
      onFinish(score + (selected === q.correct ? 1 : 0));
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/50">Question {idx + 1} of {questions.length}</span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={cn('h-1.5 w-6 rounded-full transition-colors', i < idx ? 'bg-[#16a085]' : i === idx ? 'bg-[#e8b930]' : 'bg-white/10')} />
          ))}
        </div>
      </div>

      <p className="text-base font-semibold text-white leading-relaxed">{q.question}</p>

      <div className="space-y-2">
        {q.options.map((option, i) => {
          let cls = 'border border-white/10 bg-white/5 text-white/70';
          if (revealed) {
            if (i === q.correct) cls = 'border-[#16a085] bg-[#16a085]/15 text-[#16a085]';
            else if (i === selected && i !== q.correct) cls = 'border-[#e74c3c] bg-[#e74c3c]/15 text-[#e74c3c]';
            else cls = 'border-white/5 bg-white/3 text-white/30';
          } else if (selected === i) {
            cls = 'border-[#e8b930] bg-[#e8b930]/15 text-[#e8b930]';
          }
          return (
            <button key={i} onClick={() => handleSelect(i)}
              className={cn('w-full text-left p-3.5 rounded-xl text-sm transition-all', cls)}>
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
              {option}
            </button>
          );
        })}
      </div>

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-white/5 rounded-xl border border-white/10">
          <p className="text-xs text-white/50 font-semibold mb-1">Explanation</p>
          <p className="text-sm text-white/70">{q.explanation}</p>
        </motion.div>
      )}

      <button onClick={handleNext} disabled={!revealed}
        className={cn('w-full py-3 rounded-xl font-bold text-black transition-all',
          revealed ? 'bg-gradient-to-r from-[#e8b930] to-[#c49a18]' : 'bg-white/10 text-white/30 cursor-not-allowed')}>
        {isLast ? 'Finish Quiz' : 'Next Question'}
      </button>
    </div>
  );
}

function ArticleModal({ article, onClose }: { article: Article; onClose: () => void }) {
  const { markArticleRead, articlesRead } = useAppStore();
  const [tab, setTab] = useState<'read' | 'quiz'>('read');
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizKey, setQuizKey] = useState(0);

  const isRead = articlesRead.includes(article.id);
  const diff = DIFFICULTY_CONFIG[article.difficulty];

  const handleFinishQuiz = (score: number) => {
    setQuizScore(score);
    if (!isRead) markArticleRead(article.id);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-2xl glass-card p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: diff.color, backgroundColor: diff.bg }}>
                {diff.label}
              </span>
              <span className="text-xs text-white/40 flex items-center gap-1"><Clock size={11} /> {article.reading_time} min</span>
              {isRead && <span className="text-xs text-[#16a085] flex items-center gap-1"><CheckCircle2 size={11} /> Read</span>}
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{article.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-white/50 flex-shrink-0"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-5">
          {(['read', 'quiz'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                tab === t ? 'bg-[#e8b930]/20 text-[#e8b930]' : 'text-white/40 hover:text-white/60')}>
              {t === 'quiz' ? `Quiz (${article.quiz.length}Q)` : 'Article'}
            </button>
          ))}
        </div>

        {tab === 'read' && (
          <div className="prose prose-sm max-w-none">
            <div className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{article.content}</div>
            <div className="flex flex-wrap gap-2 mt-5">
              {article.tags.map((tag) => (
                <span key={tag} className="text-xs bg-white/5 text-white/40 px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
            <button onClick={() => setTab('quiz')}
              className="mt-5 w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#e8b930] to-[#c49a18] flex items-center justify-center gap-2">
              <GraduationCap size={18} /> Take the Quiz
            </button>
          </div>
        )}

        {tab === 'quiz' && (
          quizScore !== null ? (
            <div className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-black"
                style={{
                  background: quizScore >= article.quiz.length * 0.7
                    ? 'rgba(22,160,133,0.2)' : 'rgba(232,185,48,0.2)',
                  color: quizScore >= article.quiz.length * 0.7 ? '#16a085' : '#e8b930',
                  border: `3px solid ${quizScore >= article.quiz.length * 0.7 ? '#16a085' : '#e8b930'}`,
                }}>
                {quizScore}/{article.quiz.length}
              </motion.div>
              <p className="text-xl font-bold text-white mb-1">
                {quizScore === article.quiz.length ? 'Perfect Score!' : quizScore >= article.quiz.length * 0.7 ? 'Well done!' : 'Keep learning!'}
              </p>
              <p className="text-sm text-white/50 mb-5">
                You answered {quizScore} out of {article.quiz.length} correctly
              </p>
              {!isRead && <p className="text-xs text-[#16a085] mb-4 flex items-center justify-center gap-1"><CheckCircle2 size={13} /> Article marked as read!</p>}
              <button onClick={() => { setQuizScore(null); setQuizKey((k) => k + 1); }}
                className="flex items-center gap-2 mx-auto text-sm text-white/50 hover:text-white py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10">
                <RefreshCw size={14} /> Retry Quiz
              </button>
            </div>
          ) : (
            <QuizView key={quizKey} questions={article.quiz} onFinish={handleFinishQuiz} />
          )
        )}
      </motion.div>
    </motion.div>
  );
}

export default function LearnPage() {
  const { articlesRead } = useAppStore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [selected, setSelected] = useState<Article | null>(null);

  useEffect(() => {
    fetch('/api/articles')
      .then((r) => r.json())
      .then((d) => { setArticles(d.articles || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (search && !a.title.toLowerCase().includes(search.toLowerCase()) &&
          !a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) return false;
      if (category !== 'All' && a.category !== category) return false;
      if (difficulty !== 'all' && a.difficulty !== difficulty) return false;
      return true;
    });
  }, [articles, search, category, difficulty]);

  const readCount = articles.filter((a) => articlesRead.includes(a.id)).length;

  return (
    <div className="p-4 md:p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Literacy Hub</h1>
          <p className="text-white/40 text-sm">
            {readCount}/{articles.length} articles read
            {readCount > 0 && ` · ${Math.round((readCount / articles.length) * 100)}% complete`}
          </p>
        </div>
        {readCount > 0 && (
          <div className="p-2.5 rounded-xl bg-[#e8b930]/15 text-[#e8b930]">
            <Award size={22} />
          </div>
        )}
      </div>

      {/* Progress bar */}
      {articles.length > 0 && (
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(readCount / articles.length) * 100}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-[#e8b930] to-[#16a085] rounded-full"
          />
        </div>
      )}

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles and topics..."
            className="lkr-input w-full rounded-xl pl-9 pr-4 py-2.5 text-sm" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_FILTERS.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                category === cat ? 'bg-[#e8b930]/20 text-[#e8b930] border border-[#e8b930]/30' : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((d) => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                difficulty === d
                  ? d === 'all' ? 'bg-white/20 text-white' : `text-white`
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
              style={difficulty === d && d !== 'all' ? {
                backgroundColor: DIFFICULTY_CONFIG[d].bg,
                color: DIFFICULTY_CONFIG[d].color,
              } : {}}>
              {d === 'all' ? 'All Levels' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Articles grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="glass-card p-5 h-32 skeleton" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((article, i) => {
            const isRead = articlesRead.includes(article.id);
            const diff = DIFFICULTY_CONFIG[article.difficulty];
            return (
              <GlassCard key={article.id} className="p-5 cursor-pointer" delay={i * 0.05}
                onClick={() => setSelected(article)}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: diff.color, backgroundColor: diff.bg }}>
                      {diff.label}
                    </span>
                    {isRead && <CheckCircle2 size={13} className="text-[#16a085]" />}
                  </div>
                  <span className="text-xs text-white/40 flex items-center gap-1 flex-shrink-0">
                    <Clock size={11} /> {article.reading_time}m
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white/90 mb-2 leading-tight">{article.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <BarChart2 size={12} className="text-white/30" />
                    <span className="text-xs text-white/40">{article.quiz.length} quiz questions</span>
                  </div>
                  <ChevronRight size={14} className="text-white/30" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {article.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[10px] bg-white/5 text-white/30 px-1.5 py-0.5 rounded-md">{tag}</span>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen size={48} className="text-white/20" />}
          title="No articles found"
          description="Try a different search or category"
        />
      )}

      <AnimatePresence>
        {selected && <ArticleModal article={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
