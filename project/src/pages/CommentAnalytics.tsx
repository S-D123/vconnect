import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Lock,
  Loader,
  RefreshCcw,
  Trash2,
} from 'lucide-react';
import { deleteComment, fetchClubDetail, fetchComments, fetchPosts } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { ClubDetail, Comment, Post } from '../types';

type Sentiment = 'positive' | 'neutral' | 'negative';
type ActiveTab = 'overview' | 'comments' | 'flagged';
type SentimentFilter = 'all' | Sentiment;
type ToxicityFilter = 'all' | 'high' | 'medium' | 'low';
type SortField = 'sentiment' | 'emotion' | 'toxicity' | 'date';
type SortDirection = 'asc' | 'desc';

type Emotion =
  | 'joy'
  | 'approval'
  | 'excitement'
  | 'neutral'
  | 'sadness'
  | 'anger'
  | 'concern';

interface AnalyzedComment {
  id: string;
  postId: string;
  postTitle: string;
  authorName: string;
  content: string;
  createdAt: string;
  sentiment: Sentiment;
  sentimentScore: number;
  toxicityScore: number;
  emotion: Emotion;
}

const POSITIVE_WORDS = [
  'great',
  'awesome',
  'love',
  'amazing',
  'helpful',
  'nice',
  'good',
  'cool',
  'excited',
  'fantastic',
  'brilliant',
  'best',
  'thanks',
  'thank you',
  'excellent',
];

const NEGATIVE_WORDS = [
  'bad',
  'worst',
  'hate',
  'awful',
  'boring',
  'terrible',
  'poor',
  'useless',
  'waste',
  'disappointing',
  'confusing',
  'late',
  'problem',
  'issues',
];

const TOXIC_WORDS = [
  'stupid',
  'idiot',
  'trash',
  'nonsense',
  'shut up',
  'fake',
  'dumb',
  'pathetic',
];

function clamp(num: number, min = 0, max = 1) {
  return Math.max(min, Math.min(num, max));
}

function countWordHits(text: string, words: string[]) {
  const normalized = text.toLowerCase();
  return words.reduce((count, word) => (normalized.includes(word) ? count + 1 : count), 0);
}

function detectEmotion(text: string, sentiment: Sentiment): Emotion {
  const lower = text.toLowerCase();
  if (/(wow|can't wait|so excited|hyped|super excited)/.test(lower)) return 'excitement';
  if (/(thank|thanks|appreciate|well done|great work)/.test(lower)) return 'approval';
  if (/(happy|love|amazing|awesome)/.test(lower)) return 'joy';
  if (/(angry|annoyed|frustrated|ridiculous)/.test(lower)) return 'anger';
  if (/(sad|unhappy|disappointed)/.test(lower)) return 'sadness';
  if (/(worried|concern|unsafe|issue)/.test(lower)) return 'concern';

  if (sentiment === 'positive') return 'joy';
  if (sentiment === 'negative') return 'concern';
  return 'neutral';
}

function analyzeComment(comment: Comment, post: Post): AnalyzedComment {
  const text = comment.content.trim();
  const positiveHits = countWordHits(text, POSITIVE_WORDS);
  const negativeHits = countWordHits(text, NEGATIVE_WORDS);
  const toxicHits = countWordHits(text, TOXIC_WORDS);

  const textLengthFactor = clamp(text.length / 220, 0.35, 1);
  const baseSentimentScore = clamp((positiveHits - negativeHits + 2) / 4, 0, 1);

  let sentiment: Sentiment = 'neutral';
  if (positiveHits > negativeHits) sentiment = 'positive';
  else if (negativeHits > positiveHits) sentiment = 'negative';

  const toxicityScore = clamp((toxicHits * 0.35 + Math.max(negativeHits - positiveHits, 0) * 0.12) * textLengthFactor, 0, 1);
  const sentimentScore = sentiment === 'neutral' ? 0.5 : baseSentimentScore;
  const emotion = detectEmotion(text, sentiment);

  return {
    id: comment.id,
    postId: post.id,
    postTitle: post.eventName,
    authorName: comment.userName,
    content: text,
    createdAt: comment.createdAt,
    sentiment,
    sentimentScore,
    toxicityScore,
    emotion,
  };
}

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

function dayKey(dateString: string) {
  return new Date(dateString).toISOString().slice(0, 10);
}

function prettyDayLabel(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function toxicityBucket(value: number): Exclude<ToxicityFilter, 'all'> {
  if (value > 0.7) return 'high';
  if (value > 0.4) return 'medium';
  return 'low';
}

function SentimentPill({ sentiment }: { sentiment: Sentiment }) {
  const map = {
    positive: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    neutral: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    negative: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[sentiment]}`}>
      {sentiment}
    </span>
  );
}

function EmotionBadge({ emotion }: { emotion: Emotion }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 capitalize">
      {emotion}
    </span>
  );
}

function ToxicityBar({ value }: { value: number }) {
  const isHigh = value > 0.7;
  const isMedium = value > 0.4 && value <= 0.7;
  const color = isHigh
    ? 'bg-rose-500'
    : isMedium
      ? 'bg-amber-500'
      : 'bg-teal-500';

  return (
    <div className="min-w-[120px]">
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.max(2, value * 100)}%` }} />
      </div>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{pct(value)}</p>
    </div>
  );
}

function SortBtn({
  label,
  field,
  activeField,
  direction,
  onClick,
}: {
  label: string;
  field: SortField;
  activeField: SortField;
  direction: SortDirection;
  onClick: (field: SortField) => void;
}) {
  const active = activeField === field;
  return (
    <button
      type="button"
      onClick={() => onClick(field)}
      className={`text-xs font-semibold transition-colors ${
        active ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
      }`}
    >
      {label} {active ? (direction === 'asc' ? '↑' : '↓') : ''}
    </button>
  );
}

export default function CommentAnalyticsPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [club, setClub] = useState<ClubDetail | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [analyzed, setAnalyzed] = useState<AnalyzedComment[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const [toxicityFilter, setToxicityFilter] = useState<ToxicityFilter>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = (user?.role ?? '').toLowerCase() === 'admin';
  const isClubOwner = Boolean(user?.isClub && user?.clubId && clubId && user.clubId === clubId);
  const canViewDashboard = isAdmin || isClubOwner;

  useEffect(() => {
    async function fetchAdminStats() {
      return { generatedAt: new Date().toISOString() };
    }

    async function fetchAllCommentAnalysis() {
      if (!clubId) {
        return { clubData: null as ClubDetail | null, clubPosts: [] as Post[], analyzedComments: [] as AnalyzedComment[] };
      }

      const [clubData, allPosts] = await Promise.all([
        fetchClubDetail(clubId).catch(() => null),
        fetchPosts('All'),
      ]);

      const clubPosts = allPosts.filter((p) => p.clubId === clubId);
      const commentsByPost = await Promise.all(
        clubPosts.map(async (post) => {
          const comments = await fetchComments(post.id);
          return comments.map((comment) => analyzeComment(comment, post));
        })
      );

      return { clubData, clubPosts, analyzedComments: commentsByPost.flat() };
    }

    async function load() {
      if (!clubId) {
        setError('Missing club id.');
        setIsLoading(false);
        return;
      }

      if (!canViewDashboard) {
        setIsLoading(false);
        return;
      }

      try {
        const [, analyticsData] = await Promise.all([
          fetchAdminStats(),
          fetchAllCommentAnalysis(),
        ]);
        setClub(analyticsData.clubData);
        setPosts(analyticsData.clubPosts);
        setAnalyzed(analyticsData.analyzedComments);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load analytics.');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [clubId, canViewDashboard]);

  const clubName = club?.name || 'Singing Club';

  const metrics = useMemo(() => {
    const totalComments = analyzed.length;
    const positives = analyzed.filter((c) => c.sentiment === 'positive').length;
    const neutrals = analyzed.filter((c) => c.sentiment === 'neutral').length;
    const negatives = analyzed.filter((c) => c.sentiment === 'negative').length;

    const avgSentimentScore =
      totalComments > 0 ? analyzed.reduce((sum, c) => sum + c.sentimentScore, 0) / totalComments : 0;
    const avgToxicityScore =
      totalComments > 0 ? analyzed.reduce((sum, c) => sum + c.toxicityScore, 0) / totalComments : 0;

    const toxicCount = analyzed.filter((c) => c.toxicityScore >= 0.55).length;

    const byEmotion = analyzed.reduce<Record<Emotion, number>>(
      (acc, item) => {
        acc[item.emotion] += 1;
        return acc;
      },
      {
        joy: 0,
        approval: 0,
        excitement: 0,
        neutral: 0,
        sadness: 0,
        anger: 0,
        concern: 0,
      }
    );

    const postEngagement = posts
      .map((post) => {
        const count = analyzed.filter((c) => c.postId === post.id).length;
        const avgToxicity =
          count > 0
            ? analyzed
                .filter((c) => c.postId === post.id)
                .reduce((sum, c) => sum + c.toxicityScore, 0) / count
            : 0;
        return {
          postId: post.id,
          postTitle: post.eventName,
          comments: count,
          avgToxicity,
        };
      })
      .sort((a, b) => b.comments - a.comments)
      .slice(0, 5);

    const last7DaysKeys = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const commentsByDayMap = analyzed.reduce<Record<string, number>>((acc, item) => {
      const k = dayKey(item.createdAt);
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

    const trend = last7DaysKeys.map((k) => ({
      day: prettyDayLabel(k),
      count: commentsByDayMap[k] ?? 0,
    }));

    const maxTrend = Math.max(...trend.map((t) => t.count), 1);

    return {
      totalComments,
      positives,
      neutrals,
      negatives,
      avgSentimentScore,
      avgToxicityScore,
      toxicCount,
      byEmotion,
      postEngagement,
      trend,
      maxTrend,
    };
  }, [analyzed, posts]);

  const sentimentBreakdown = useMemo(() => {
    const total = Math.max(analyzed.length, 1);
    return [
      { key: 'positive', label: 'Positive', count: metrics.positives, pct: (metrics.positives / total) * 100, color: 'bg-teal-500' },
      { key: 'negative', label: 'Negative', count: metrics.negatives, pct: (metrics.negatives / total) * 100, color: 'bg-rose-500' },
      { key: 'neutral', label: 'Neutral', count: metrics.neutrals, pct: (metrics.neutrals / total) * 100, color: 'bg-slate-400' },
    ];
  }, [analyzed.length, metrics.negatives, metrics.neutrals, metrics.positives]);

  const topEmotionDistribution = useMemo(() => {
    const total = Math.max(analyzed.length, 1);
    return Object.entries(metrics.byEmotion)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([emotion, count]) => ({
        emotion,
        count,
        pct: (count / total) * 100,
      }));
  }, [analyzed.length, metrics.byEmotion]);

  const toxicityDistribution = useMemo(() => {
    const high = analyzed.filter((c) => c.toxicityScore > 0.7).length;
    const medium = analyzed.filter((c) => c.toxicityScore > 0.4 && c.toxicityScore <= 0.7).length;
    const low = analyzed.filter((c) => c.toxicityScore <= 0.4).length;
    const total = Math.max(analyzed.length, 1);
    return {
      high,
      medium,
      low,
      highPct: (high / total) * 100,
      mediumPct: (medium / total) * 100,
      lowPct: (low / total) * 100,
    };
  }, [analyzed]);

  const filteredComments = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    const copy = analyzed.filter((comment) => {
      const matchesSearch =
        !search ||
        comment.content.toLowerCase().includes(search) ||
        comment.authorName.toLowerCase().includes(search);
      const matchesSentiment = sentimentFilter === 'all' || comment.sentiment === sentimentFilter;
      const bucket = toxicityBucket(comment.toxicityScore);
      const matchesToxicity = toxicityFilter === 'all' || bucket === toxicityFilter;
      return matchesSearch && matchesSentiment && matchesToxicity;
    });

    copy.sort((a, b) => {
      let result = 0;
      if (sortField === 'toxicity') result = a.toxicityScore - b.toxicityScore;
      else if (sortField === 'date') result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === 'emotion') result = a.emotion.localeCompare(b.emotion);
      else if (sortField === 'sentiment') result = a.sentiment.localeCompare(b.sentiment);
      return sortDirection === 'asc' ? result : -result;
    });

    return copy;
  }, [analyzed, searchQuery, sentimentFilter, toxicityFilter, sortDirection, sortField]);

  const flaggedComments = useMemo(
    () => analyzed.filter((c) => c.toxicityScore > 0.4).sort((a, b) => b.toxicityScore - a.toxicityScore),
    [analyzed]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDirection('desc');
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingId(commentId);
    setError('');
    try {
      await deleteComment(commentId);
      setAnalyzed((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete comment.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!canViewDashboard) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Lock size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <p className="text-red-600 dark:text-red-400 font-semibold mb-1">Access restricted</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Only club owners and admins can view analytics.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size={30} className="animate-spin text-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Failed to load analytics</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button onClick={() => navigate(0)} className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
          Retry
        </button>
      </div>
    );
  }

  const sentimentTotal = Math.max(metrics.totalComments, 1);
  const donutStyle = {
    background: `conic-gradient(
      #14b8a6 0 ${Math.round((metrics.positives / sentimentTotal) * 360)}deg,
      #94a3b8 ${Math.round((metrics.positives / sentimentTotal) * 360)}deg ${Math.round(((metrics.positives + metrics.neutrals) / sentimentTotal) * 360)}deg,
      #ef4444 ${Math.round(((metrics.positives + metrics.neutrals) / sentimentTotal) * 360)}deg 360deg
    )`,
  };

  const emotionEntries = Object.entries(metrics.byEmotion).sort((a, b) => b[1] - a[1]);

  const tabButtonClass = (tab: ActiveTab) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
      activeTab === tab
        ? 'bg-teal-500 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold hover:gap-3 transition-all"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comment Analytics</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Club: <span className="font-semibold">{clubName}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Insights modeled on `comment_analysis` dimensions: sentiment, sentiment score, toxicity score, and emotion.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
            <Sparkles size={12} />  Admin
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className={tabButtonClass('overview')} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={tabButtonClass('comments')} onClick={() => setActiveTab('comments')}>Comments</button>
          <button className={tabButtonClass('flagged')} onClick={() => setActiveTab('flagged')}>Flagged</button>

          <button
            type="button"
            onClick={() => navigate(0)}
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <RefreshCcw size={13} /> Refresh
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Sentiment breakdown</h3>
              <div className="space-y-3">
                {sentimentBreakdown.map((item) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                      <span className="text-gray-500 dark:text-gray-400">{item.count} ({Math.round(item.pct)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.max(item.pct, 2)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Top emotions</h3>
              <div className="space-y-3">
                {topEmotionDistribution.map((item) => (
                  <div key={item.emotion}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{item.emotion}</span>
                      <span className="text-gray-500 dark:text-gray-400">{item.count} ({Math.round(item.pct)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 dark:bg-sky-400 rounded-full" style={{ width: `${Math.max(item.pct, 2)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Toxicity distribution</h3>
              <div className="space-y-3">
                {[
                  { label: 'High (> 0.7)', count: toxicityDistribution.high, pct: toxicityDistribution.highPct, color: 'bg-rose-500' },
                  { label: 'Medium (> 0.4 && <= 0.7)', count: toxicityDistribution.medium, pct: toxicityDistribution.mediumPct, color: 'bg-amber-500' },
                  { label: 'Low (<= 0.4)', count: toxicityDistribution.low, pct: toxicityDistribution.lowPct, color: 'bg-teal-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                      <span className="text-gray-500 dark:text-gray-400">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.max(item.pct, 2)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total comments</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalComments}</p>
          <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1"><MessageSquare size={13} /> Across {posts.length} posts</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg sentiment score</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pct(metrics.avgSentimentScore)}</p>
          <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1"><TrendingUp size={13} /> Higher means more positive</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg toxicity score</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pct(metrics.avgToxicityScore)}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1"><ShieldAlert size={13} /> Lower is healthier</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Flagged comments</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.toxicCount}</p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1"><AlertTriangle size={13} /> Toxicity ≥ 55%</p>
        </div>
      </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
            <BarChart3 size={15} /> Sentiment split
          </h2>

          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full relative" style={donutStyle}>
              <div className="absolute inset-3 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                {metrics.totalComments}
              </div>
            </div>

            <div className="space-y-2 text-sm w-full">
              {[
                { label: 'Positive', value: metrics.positives, color: 'bg-teal-500' },
                { label: 'Neutral', value: metrics.neutrals, color: 'bg-slate-400' },
                { label: 'Negative', value: metrics.negatives, color: 'bg-rose-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Comment trend (last 7 days)</h2>
          <div className="h-44 flex items-end gap-2">
            {metrics.trend.map((item) => {
              const height = `${Math.max(8, (item.count / metrics.maxTrend) * 100)}%`;
              return (
                <div key={item.day} className="flex-1 min-w-0 flex flex-col items-center gap-1">
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{item.count}</div>
                  <div className="w-full rounded-md bg-teal-500/85 dark:bg-teal-400/70" style={{ height }} />
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{item.day}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Top emotions</h2>
          <div className="space-y-2.5">
            {emotionEntries.map(([emotion, count]) => {
              const percentage = metrics.totalComments > 0 ? (count / metrics.totalComments) * 100 : 0;
              return (
                <div key={emotion}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-gray-700 dark:text-gray-300">{emotion}</span>
                    <span className="text-gray-600 dark:text-gray-400">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 dark:bg-sky-400 rounded-full"
                      style={{ width: `${Math.max(2, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Most discussed posts</h2>
          {metrics.postEngagement.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet for this club.</p>
          ) : (
            <div className="space-y-2.5">
              {metrics.postEngagement.map((post) => (
                <div key={post.postId} className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{post.postTitle}</p>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{post.comments} comments</span>
                    <span>Avg toxicity {pct(post.avgToxicity)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

        </>
      )}

      {activeTab === 'comments' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by comment or author"
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value as SentimentFilter)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>
            <select
              value={toxicityFilter}
              onChange={(e) => setToxicityFilter(e.target.value as ToxicityFilter)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Toxicity</option>
              <option value="high">High (&gt; 0.7)</option>
              <option value="medium">Medium (&gt; 0.4 &amp;&amp; &lt;= 0.7)</option>
              <option value="low">Low (&lt;= 0.4)</option>
            </select>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            <SortBtn label="Sentiment" field="sentiment" activeField={sortField} direction={sortDirection} onClick={handleSort} />
            <SortBtn label="Emotion" field="emotion" activeField={sortField} direction={sortDirection} onClick={handleSort} />
            <SortBtn label="Toxicity" field="toxicity" activeField={sortField} direction={sortDirection} onClick={handleSort} />
            <SortBtn label="Date" field="date" activeField={sortField} direction={sortDirection} onClick={handleSort} />
          </div>

          {filteredComments.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">No comments match your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    <th className="py-2 pr-3">Comment</th>
                    <th className="py-2 pr-3">Author</th>
                    <th className="py-2 pr-3">Post</th>
                    <th className="py-2 pr-3">Sentiment</th>
                    <th className="py-2 pr-3">Emotion</th>
                    <th className="py-2 pr-3">Toxicity</th>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComments.map((comment) => (
                    <tr key={comment.id} className="border-b border-gray-100 dark:border-gray-800 align-top">
                      <td className="py-3 pr-3 text-gray-700 dark:text-gray-300 max-w-[320px]">
                        <p className="line-clamp-2">{comment.content}</p>
                      </td>
                      <td className="py-3 pr-3 text-gray-700 dark:text-gray-300">{comment.authorName}</td>
                      <td className="py-3 pr-3 text-gray-700 dark:text-gray-300 max-w-[220px]"><p className="line-clamp-1">{comment.postTitle}</p></td>
                      <td className="py-3 pr-3"><SentimentPill sentiment={comment.sentiment} /></td>
                      <td className="py-3 pr-3"><EmotionBadge emotion={comment.emotion} /></td>
                      <td className="py-3 pr-3"><ToxicityBar value={comment.toxicityScore} /></td>
                      <td className="py-3 pr-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(comment.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          disabled={deletingId === comment.id}
                          onClick={() => handleDeleteComment(comment.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/40 disabled:opacity-60"
                        >
                          <Trash2 size={12} /> {deletingId === comment.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'flagged' && (
        <div className="space-y-3">
          {flaggedComments.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-10 text-center text-sm text-gray-500 dark:text-gray-400">
              No comments flagged for high toxicity.
            </div>
          ) : (
            flaggedComments.map((comment) => {
              const high = comment.toxicityScore > 0.7;
              return (
                <div
                  key={comment.id}
                  className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 border-l-4 ${
                    high ? 'border-l-rose-500' : 'border-l-amber-500'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{comment.authorName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{comment.postTitle}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <SentimentPill sentiment={comment.sentiment} />
                      <EmotionBadge emotion={comment.emotion} />
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <ToxicityBar value={comment.toxicityScore} />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
                    </div>

                    <button
                      type="button"
                      disabled={deletingId === comment.id}
                      onClick={() => handleDeleteComment(comment.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/40 disabled:opacity-60"
                    >
                      <Trash2 size={12} /> {deletingId === comment.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {error && !isLoading && (
        <div className="text-sm rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-2.5">
          {error}
        </div>
      )}
    </div>
  );
}
