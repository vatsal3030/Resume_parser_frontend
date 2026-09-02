"use client";
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, ThumbsUp, FileText, Send, Loader2, Search, ArrowLeft, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

const categories = ['All', 'Resume Review', 'Career Advice', 'Interview Prep', 'General'];

const getCategoryBadgeStyle = (cat) => {
 switch (cat) {
 case 'Resume Review':
 return 'bg-(--primary)/10 text-(--primary) border-(--primary)/20';
 case 'Career Advice':
 return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
 case 'Interview Prep':
 return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
 default:
 return 'bg-(--surface-soft) text-(--muted) border-(--hairline-soft)';
 }
};

const getAvatarColors = (name) => {
 const colors = [
 'bg-(--primary-active)',
 'bg-(--accent-amber)',
 'bg-(--primary)',
 'bg-(--accent-teal)',
 'bg-orange-300',
 'bg-purple-300',
 'bg-red-300'
 ];
 if (!name) return { bg: 'bg-gray-300', initials: '?' };
 const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
 let hash = 0;
 for (let i = 0; i < name.length; i++) {
 hash = name.charCodeAt(i) + ((hash << 5) - hash);
 }
 const bg = colors[Math.abs(hash) % colors.length];
 return { bg, initials };
};

export default function CommunityPage() {
 const [posts, setPosts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [selectedCategory, setSelectedCategory] = useState('All');
 const [searchQuery, setSearchQuery] = useState('');
 
 // Resumes list for attachment
 const [resumes, setResumes] = useState([]);
 const [selectedResumeId, setSelectedResumeId] = useState('');
 
 // New Post State
 const [showNewPost, setShowNewPost] = useState(false);
 const [newPostTitle, setNewPostTitle] = useState('');
 const [newPostContent, setNewPostContent] = useState('');
 const [newPostCategory, setNewPostCategory] = useState('General');
 
 // Post Detail / Comment State
 const [selectedPost, setSelectedPost] = useState(null);
 const [commentText, setCommentText] = useState('');
 const toast = useToast();

 const fetchPosts = useCallback(async (category = 'All', search = '') => {
 setLoading(true);
 try {
 const params = {};
 if (category !== 'All') params.category = category;
 if (search) params.search = search;
 
 const res = await api.get('/community', { params });
 setPosts(res.data);
 } catch (err) {
 console.error(err);
 toast.error('Error', 'Failed to fetch community posts.');
 } finally {
 setLoading(false);
 }
 }, [toast]);

 useEffect(() => {
 fetchPosts(selectedCategory, searchQuery);
 }, [selectedCategory, searchQuery, fetchPosts]);

 useEffect(() => {
 const fetchResumes = async () => {
 try {
 const res = await api.get('/resumes');
 setResumes(res.data || []);
 } catch (err) {
 console.error('Failed to fetch resumes:', err);
 }
 };
 fetchResumes();
 }, []);

 const handleCreatePost = async (e) => {
 e.preventDefault();
 if (!newPostTitle.trim()) {
 toast.error('Validation Error', 'A title is required to share your post.');
 return;
 }
 try {
 await api.post('/community', {
 title: newPostTitle,
 content: newPostContent,
 category: newPostCategory,
 documentId: selectedResumeId || null
 });
 setShowNewPost(false);
 setNewPostTitle('');
 setNewPostContent('');
 setNewPostCategory('General');
 setSelectedResumeId('');
 toast.success('Post Created!', 'Your request is live in the community board.');
 fetchPosts(selectedCategory, searchQuery);
 } catch (err) {
 console.error(err);
 toast.error('Error', 'Failed to create community post.');
 }
 };

 const handleSearchSubmit = (e) => {
 e.preventDefault();
 fetchPosts(selectedCategory, searchQuery);
 };

 const handleUpvote = async (postId) => {
 try {
 await api.post(`/community/${postId}/upvote`);
 // Optimistic update - refetch current lists
 fetchPosts(selectedCategory, searchQuery); 
 if (selectedPost && selectedPost.id === postId) {
 openPost(postId);
 }
 } catch (err) {
 console.error(err);
 }
 };

 const openPost = async (postId) => {
 try {
 const res = await api.get(`/community/${postId}`);
 setSelectedPost(res.data);
 } catch (err) {
 console.error(err);
 toast.error('Error', 'Failed to retrieve post details.');
 }
 };

 const handleAddComment = async (e) => {
 e.preventDefault();
 if (!commentText.trim() || !selectedPost) return;
 try {
 await api.post(`/community/${selectedPost.id}/comments`, { content: commentText });
 setCommentText('');
 toast.success('Comment Added', 'Your feedback has been successfully posted.');
 openPost(selectedPost.id);
 fetchPosts(selectedCategory, searchQuery);
 } catch (err) {
 console.error(err);
 toast.error('Error', 'Failed to add comment.');
 }
 };

 return (
 <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
 {/* Page Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-(--hairline)">
 <div>
 <h1 className="text-4xl md:text-5xl font-medium text-black">
 Community Review
 </h1>
 <p className="text-sm text-(--muted) mt-1">Get feedback on your resume, discuss interview strategies, and network.</p>
 </div>
 <Button 
 variant="default" 
 onClick={() => {
 setShowNewPost(!showNewPost);
 if (selectedPost) setSelectedPost(null); // Close detail when writing post
 }}
 className={`w-full md:w-auto text-lg font-semibold border px-6 py-3 shadow-sm hover:shadow-sm transition-all ${
 showNewPost ? 'bg-(--surface-soft) text-(--ink)' : 'bg-(--primary) text-white'
 }`}
 >
 {showNewPost ? (
 <span className="flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> Back to Feed</span>
 ) : (
 <span className="flex items-center gap-2"><Plus className="w-5 h-5" /> Request Feedback</span>
 )}
 </Button>
 </div>

 {/* New Post Creator Form */}
 {showNewPost && (
 <Card className="border border-(--hairline) shadow-sm bg-(--surface-card) rounded-2xl overflow-hidden">
 <CardContent className="p-6 md:p-8 space-y-6">
 <div>
 <h2 className="text-3xl font-medium">Request a Peer Review</h2>
 <p className="text-sm font-bold text-gray-700 mt-1">Get authentic advice from other builders and recruiters in the platform.</p>
 </div>
 
 <form onSubmit={handleCreatePost} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="md:col-span-2">
 <label className="font-medium tracking-wide text-sm block mb-2">Discussion Title</label>
 <input 
 value={newPostTitle}
 onChange={e => setNewPostTitle(e.target.value)}
 placeholder="e.g., Roasting my Frontend Developer Resume - Be Brutal!"
 className="w-full rounded-xl border border-(--hairline) bg-(--surface-soft) p-3 text-sm text-(--ink) outline-none focus:border-(--primary) transition-colors"
 />
 </div>
 <div>
 <label className="font-medium tracking-wide text-sm block mb-2">Category</label>
 <select 
 value={newPostCategory}
 onChange={e => setNewPostCategory(e.target.value)}
 className="w-full rounded-xl border border-(--hairline) bg-(--surface-soft) p-3 text-sm text-(--ink) outline-none focus:border-(--primary) transition-colors"
 >
 {categories.filter(c => c !== 'All').map(c => (
 <option key={c} value={c}>{c}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="font-medium tracking-wide text-sm block mb-2">Attach Resume (Optional)</label>
 <select 
 value={selectedResumeId}
 onChange={e => setSelectedResumeId(e.target.value)}
 className="w-full rounded-xl border border-(--hairline) bg-(--surface-soft) p-3 text-sm text-(--ink) outline-none focus:border-(--primary) transition-colors"
 >
 <option value="">No Resume Attached</option>
 {resumes.map(r => (
 <option key={r.id} value={r.id}>
 {r.title || 'Untitled Resume'} (ATS: {r.atsScore} | Fit: {r.jobFitScore}%)
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className="font-medium tracking-wide text-sm block mb-2">Context & Goals</label>
 <textarea 
 value={newPostContent}
 onChange={e => setNewPostContent(e.target.value)}
 placeholder="What kind of roles are you applying for? What feedback are you specifically looking for?"
 rows={4}
 className="w-full rounded-xl border border-(--hairline) bg-(--surface-soft) p-3 text-sm text-(--ink) outline-none focus:border-(--primary) resize-none transition-colors"
 />
 </div>
 </div>

 <Button 
 type="submit" 
 variant="default" 
 className="w-full text-sm font-medium bg-(--primary) text-white hover:bg-(--primary-active) rounded-xl py-3 shadow-sm transition-all"
 >
 Post to Discussion Board
 </Button>
 </form>
 </CardContent>
 </Card>
 )}

 {/* Filter and Search Bar Section */}
 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-(--surface-card) p-3.5 rounded-2xl border border-(--hairline) shadow-xs">
 {/* Category Tags */}
 <div className="flex flex-wrap gap-1.5">
 {categories.map(cat => {
 const isActive = selectedCategory === cat;
 return (
 <button
 key={cat}
 onClick={() => setSelectedCategory(cat)}
 className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium tracking-wide transition-all ${
 isActive ? 'bg-(--primary) text-white border-(--primary) shadow-xs' : 'border-transparent bg-(--surface-soft) text-(--muted) hover:text-(--ink) hover:bg-(--surface-card) hover:border-(--hairline)'
 }`}
 >
 {cat}
 </button>
 );
 })}
 </div>

 {/* Search Input */}
 <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full lg:w-auto lg:max-w-md flex-1 justify-end">
 <div className="relative flex-1 max-w-sm">
 <input 
 type="text"
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 placeholder="Search discussions..."
 className="w-full rounded-xl border border-(--hairline) bg-(--surface-soft) p-2 pl-9 text-xs text-(--ink) outline-none focus:border-(--primary) transition-colors"
 />
 <Search className="w-3.5 h-3.5 text-(--muted) absolute left-3 top-3" />
 </div>
 <Button 
 type="submit" 
 variant="default" 
 className="text-xs px-3.5"
 >
 Search
 </Button>
 {searchQuery && (
 <Button 
 type="button" 
 variant="secondary"
 onClick={() => { setSearchQuery(''); fetchPosts(selectedCategory, ''); }}
 className="text-xs px-3"
 >
 Clear
 </Button>
 )}
 </form>
 </div>

 {/* Main Grid Layout */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Feed List Pane */}
 <div className={`${selectedPost ? 'hidden lg:block lg:col-span-1' : 'col-span-3'} space-y-4`}>
 {loading ? (
 <div className={`grid gap-5 ${selectedPost ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
 {[1, 2, 3, 4, 5, 6].map(i => (
 <div key={i} className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-5 shadow-xs animate-pulse">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-9 h-9 bg-(--surface-soft) rounded-full shrink-0" />
 <div className="flex-1 space-y-1.5">
 <div className="h-3.5 bg-(--surface-soft) rounded w-24" />
 <div className="h-2.5 bg-(--surface-soft) rounded w-16" />
 </div>
 </div>
 <div className="h-4 bg-(--surface-soft) rounded w-4/5 mb-3" />
 <div className="space-y-2 mb-4">
 <div className="h-3 bg-(--surface-soft) rounded w-full" />
 <div className="h-3 bg-(--surface-soft) rounded w-3/4" />
 </div>
 <div className="flex justify-between items-center pt-3 border-t border-(--hairline-soft)">
 <div className="h-3 bg-(--surface-soft) rounded w-12" />
 <div className="h-3 bg-(--surface-soft) rounded w-16" />
 </div>
 </div>
 ))}
 </div>
 ) : posts.length === 0 ? (
 <div className="rounded-2xl border border-dashed border-(--hairline) p-12 text-center bg-(--surface-card) shadow-xs">
 <p className="font-medium text-lg text-(--ink)">No discussions found</p>
 <p className="text-xs text-(--muted) mt-1">Change your filters or request the first resume review!</p>
 </div>
 ) : (
 <div className={`grid gap-5 ${selectedPost ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
 {posts.map(post => (
 <Card 
 key={post.id} 
 onClick={() => openPost(post.id)}
 className={`cursor-pointer rounded-2xl border border-(--hairline) transition-all hover:-translate-y-0.5 hover:border-(--primary)/50 flex flex-col justify-between ${
 selectedPost?.id === post.id ? 'bg-(--surface-soft) border-(--primary)/60 shadow-xs' : 'bg-(--surface-card) hover:bg-(--surface-soft) shadow-xs'
 }`}
 >
 <CardContent className="p-5 flex flex-col justify-between h-full flex-1">
 <div>
 <div className="flex justify-between items-start gap-2">
 <span className={`inline-block border rounded-full ${getCategoryBadgeStyle(post.category)} px-2.5 py-0.5 text-[10px] font-medium tracking-wide mb-2`}>
 {post.category}
 </span>
 {post.documentId && (
 <span className="flex items-center gap-1 text-[10px] font-medium text-(--muted) bg-(--surface-soft) border border-(--hairline-soft) rounded-full px-2 py-0.5">
 <FileText className="w-3 h-3" /> CV Attached
 </span>
 )}
 </div>
 <h3 className="font-medium text-sm line-clamp-2 mt-1 leading-snug hover:text-(--primary) text-(--ink) transition-colors">
 {post.title}
 </h3>
 {post.content && (
 <p className="text-xs text-(--muted) mt-2 line-clamp-2 leading-relaxed">
 {post.content}
 </p>
 )}
 </div>
 
 <div className="mt-4 pt-3 border-t border-(--hairline-soft) flex justify-between items-center">
 <div className="flex items-center gap-2">
 <div className={`w-7 h-7 rounded-full border border-(--hairline-soft) font-medium text-[11px] flex items-center justify-center text-white ${getAvatarColors(post.user?.name || 'Anonymous').bg}`}>
 {getAvatarColors(post.user?.name || 'Anonymous').initials}
 </div>
 <div>
 <p className="text-xs font-medium leading-none text-(--ink)">
 {post.user?.name || 'Anonymous'}
 </p>
 <span className="text-[10px] text-(--muted)">
 {new Date(post.createdAt).toLocaleDateString()}
 </span>
 </div>
 </div>
 
 <div className="flex items-center gap-3 text-xs text-(--muted)">
 <button 
 onClick={(e) => { e.stopPropagation(); handleUpvote(post.id); }}
 className="flex items-center gap-1 hover:text-(--primary) transition-colors"
 >
 <ThumbsUp className="w-3.5 h-3.5" /> {post._count.upvotes}
 </button>
 <span className="flex items-center gap-1">
 <MessageCircle className="w-3.5 h-3.5" /> {post._count.comments}
 </span>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 )}
 </div>

 {/* Detailed Thread View Pane */}
 {selectedPost && (
 <div className="col-span-3 lg:col-span-2">
 <Card className="border border-(--hairline) bg-(--surface-card) rounded-2xl shadow-sm min-h-[600px] flex flex-col overflow-hidden">
 {/* Card Header details */}
 <div className="p-6 border-b border-(--hairline-soft) space-y-4">
 <Button 
 variant="secondary" 
 onClick={() => setSelectedPost(null)} 
 className="mb-2 text-xs flex items-center gap-1"
 >
 <ArrowLeft className="w-3.5 h-3.5" /> Back to Feed
 </Button>
 
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <span className={`inline-block border rounded-full ${getCategoryBadgeStyle(selectedPost.category)} px-3 py-0.5 text-xs font-medium tracking-wide mb-2`}>
 {selectedPost.category}
 </span>
 <h2 className="text-xl md:text-2xl font-medium text-(--ink) leading-snug">
 {selectedPost.title}
 </h2>
 </div>
 <Button 
 variant={selectedPost.hasUpvoted ? 'default' : 'secondary'} 
 onClick={() => handleUpvote(selectedPost.id)}
 className="text-xs"
 >
 <ThumbsUp className="w-3.5 h-3.5 mr-1.5" /> {selectedPost._count.upvotes} Upvotes
 </Button>
 </div>

 <div className="flex items-center gap-3 pt-2">
 <div className={`w-9 h-9 rounded-full border border-(--hairline-soft) font-medium text-xs flex items-center justify-center text-white ${getAvatarColors(selectedPost.user?.name || 'Anonymous').bg}`}>
 {getAvatarColors(selectedPost.user?.name || 'Anonymous').initials}
 </div>
 <div>
 <p className="text-sm font-medium leading-none text-(--ink)">
 Posted by {selectedPost.user?.name || 'Anonymous'}
 </p>
 <span className="text-xs text-(--muted)">
 Published on {new Date(selectedPost.createdAt).toLocaleString()}
 </span>
 </div>
 </div>

 {selectedPost.content && (
 <p className="font-normal text-(--body) bg-(--surface-soft) p-4 rounded-xl border border-(--hairline-soft) whitespace-pre-wrap leading-relaxed text-sm">
 {selectedPost.content}
 </p>
 )}

 {/* Attached Resume Component */}
 {selectedPost.document ? (
 <div className="p-4 bg-(--surface-soft) rounded-xl border border-(--hairline-soft) flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-(--surface-card) border border-(--hairline) rounded-lg">
 <FileText className="w-5 h-5 text-(--primary)" />
 </div>
 <div>
 <p className="text-[10px] font-medium text-(--muted)">Attached Resume</p>
 <h4 className="font-medium text-sm text-(--ink) leading-tight">
 {selectedPost.document.title || 'Untitled Resume'}
 </h4>
 </div>
 </div>
 <a 
 href={`/results/${selectedPost.document.id}`} 
 target="_blank" 
 rel="noopener noreferrer"
 className="w-full md:w-auto"
 >
 <Button variant="default" className="w-full md:w-auto text-xs font-medium">
 Analyze & View Resume &rarr;
 </Button>
 </a>
 </div>
 ) : selectedPost.documentId ? (
 <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs font-medium">
 This post points to an attached resume, but you do not have permission to view it or it was deleted.
 </div>
 ) : null}
 </div>

 {/* Comments Section */}
 <div className="flex-1 overflow-y-auto p-6 bg-(--canvas) space-y-3 max-h-[400px]">
 <h3 className="font-medium text-xs text-(--muted) mb-2">
 Feedback & Comments ({selectedPost.comments?.length || 0})
 </h3>
 
 {selectedPost.comments?.length === 0 ? (
 <div className="text-center py-10 rounded-xl border border-dashed border-(--hairline) bg-(--surface-card)">
 <p className="text-xs font-medium text-(--muted)">No constructive feedback yet.</p>
 <p className="text-[11px] text-(--muted-soft) mt-1">Be the first to share your thoughts and help a peer!</p>
 </div>
 ) : (
 selectedPost.comments?.map(comment => {
 const { bg, initials } = getAvatarColors(comment.user?.name || 'Peer');
 return (
 <div key={comment.id} className="bg-(--surface-card) p-4 rounded-xl border border-(--hairline) text-xs transition-all">
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <div className={`w-6 h-6 rounded-full border border-(--hairline-soft) font-medium text-[10px] flex items-center justify-center text-white ${bg}`}>
 {initials}
 </div>
 <span className="font-medium text-xs text-(--ink)">
 {comment.user?.name || 'Anonymous Peer'}
 </span>
 </div>
 <span className="text-[10px] text-(--muted)">
 {new Date(comment.createdAt).toLocaleDateString()}
 </span>
 </div>
 <p className="text-xs text-(--body) whitespace-pre-wrap pl-1 leading-relaxed">
 {comment.content}
 </p>
 </div>
 );
 })
 )}
 </div>

 {/* Comment Submission Form */}
 <div className="p-4 border-t border-(--hairline-soft) bg-(--surface-card)">
 <form onSubmit={handleAddComment} className="flex gap-2">
 <input 
 type="text"
 value={commentText}
 onChange={e => setCommentText(e.target.value)}
 placeholder="Provide constructive feedback..."
 className="flex-1 p-2.5 rounded-xl border border-(--hairline) outline-none text-xs text-(--ink) bg-(--surface-soft) focus:border-(--primary) transition-colors"
 />
 <Button 
 type="submit" 
 variant="default" 
 className="text-xs px-4" 
 disabled={!commentText.trim()}
 >
 <Send className="w-3.5 h-3.5" />
 </Button>
 </form>
 </div>
 </Card>
 </div>
 )}
 </div>
 </div>
 );
}
