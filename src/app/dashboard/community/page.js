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
      return 'bg-brutal-pink text-black border-black';
    case 'Career Advice':
      return 'bg-brutal-blue text-black border-black';
    case 'Interview Prep':
      return 'bg-brutal-yellow text-black border-black';
    default:
      return 'bg-brutal-mint text-black border-black';
  }
};

const getAvatarColors = (name) => {
  const colors = [
    'bg-brutal-pink',
    'bg-brutal-blue',
    'bg-brutal-yellow',
    'bg-brutal-mint',
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b-4 border-black">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black">
            Community Review
          </h1>
          <p className="text-lg md:text-xl font-bold bg-brutal-green inline-block px-3 py-1 border-2 border-black mt-2">
            Peer-to-peer resume teardowns, discussions & career wisdom.
          </p>
        </div>
        <Button 
          variant="brutal" 
          onClick={() => {
            setShowNewPost(!showNewPost);
            if (selectedPost) setSelectedPost(null); // Close detail when writing post
          }}
          className={`w-full md:w-auto text-lg font-black border-4 px-6 py-3 shadow-[4px_4px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all ${
            showNewPost ? 'bg-white text-black' : 'bg-brutal-pink text-black'
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
        <Card className="border-4 border-black shadow-[8px_8px_0_#000] bg-brutal-yellow overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Request a Peer Review</h2>
              <p className="text-sm font-bold text-gray-700 mt-1">Get authentic advice from other builders and recruiters in the platform.</p>
            </div>
            
            <form onSubmit={handleCreatePost} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="font-black uppercase tracking-wider text-sm block mb-2">Discussion Title</label>
                  <input 
                    value={newPostTitle}
                    onChange={e => setNewPostTitle(e.target.value)}
                    placeholder="e.g., Roasting my Frontend Developer Resume - Be Brutal!"
                    className="w-full border-4 border-black p-3 outline-none font-bold text-black bg-white shadow-[4px_4px_0_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                  />
                </div>
                <div>
                  <label className="font-black uppercase tracking-wider text-sm block mb-2">Category</label>
                  <select 
                    value={newPostCategory}
                    onChange={e => setNewPostCategory(e.target.value)}
                    className="w-full border-4 border-black p-3.5 outline-none font-bold text-black bg-white shadow-[4px_4px_0_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-black uppercase tracking-wider text-sm block mb-2">Attach Resume (Optional)</label>
                  <select 
                    value={selectedResumeId}
                    onChange={e => setSelectedResumeId(e.target.value)}
                    className="w-full border-4 border-black p-3.5 outline-none font-bold text-black bg-white shadow-[4px_4px_0_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
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
                  <label className="font-black uppercase tracking-wider text-sm block mb-2">Context & Goals</label>
                  <textarea 
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    placeholder="What kind of roles are you applying for? What feedback are you specifically looking for?"
                    rows={4}
                    className="w-full border-4 border-black p-3 outline-none font-bold text-black bg-white resize-none shadow-[4px_4px_0_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="brutal" 
                className="w-full text-lg font-black bg-black text-white hover:bg-slate-900 border-4 py-4 shadow-[4px_4px_0_#ccc] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Post to Discussion Board
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter and Search Bar Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-50 p-4 border-4 border-black shadow-[4px_4px_0_#000]">
        {/* Category Tags */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            const badgeColor = getCategoryBadgeStyle(cat).split(' ')[0];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 border-2 border-black font-black text-xs md:text-sm tracking-wide uppercase transition-all shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 ${
                  isActive ? `${badgeColor} translate-x-0.5 translate-y-0.5 shadow-none` : 'bg-white text-black hover:bg-slate-100'
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
              className="w-full border-2 border-black p-2 pl-9 outline-none font-bold text-sm bg-white shadow-[2px_2px_0_#000] focus:shadow-none focus:translate-x-0.5 focus:translate-y-0.5 transition-all"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
          </div>
          <Button 
            type="submit" 
            variant="brutal" 
            className="bg-brutal-blue text-black font-black border-2 px-5 py-2 text-sm shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            Search
          </Button>
          {searchQuery && (
            <Button 
              type="button" 
              onClick={() => { setSearchQuery(''); fetchPosts(selectedCategory, ''); }}
              className="bg-slate-200 text-black border-2 border-black font-bold px-3 py-2 text-sm shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              Clear
            </Button>
          )}
        </form>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Feed List Pane */}
        <div className={`${selectedPost ? 'hidden lg:block lg:col-span-1' : 'col-span-3'} space-y-4`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 border-4 border-black border-dashed bg-white">
               <Loader2 className="w-12 h-12 animate-spin text-black" />
               <p className="font-bold text-gray-500 mt-4 uppercase">Loading Feed Discussions...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="border-4 border-black p-12 text-center bg-white shadow-[4px_4px_0_#000]">
              <p className="font-black text-xl uppercase">No discussions found</p>
              <p className="text-sm font-bold text-gray-500 mt-1">Change your filters or request the first resume review!</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${selectedPost ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {posts.map(post => (
                <Card 
                  key={post.id} 
                  onClick={() => openPost(post.id)}
                  className={`cursor-pointer border-4 border-black transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] flex flex-col justify-between ${
                    selectedPost?.id === post.id ? 'bg-slate-50 shadow-none translate-y-0.5' : 'bg-white shadow-[4px_4px_0_rgba(0,0,0,1)]'
                  }`}
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full flex-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className={`inline-block border-2 ${getCategoryBadgeStyle(post.category)} px-2 py-0.5 text-[10px] font-black uppercase tracking-wider mb-2`}>
                          {post.category}
                        </span>
                        {post.documentId && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase bg-slate-100 border-2 border-dashed border-gray-400 px-2 py-0.5">
                            <FileText className="w-3.5 h-3.5" /> CV Attached
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-lg line-clamp-2 mt-1 leading-tight hover:underline text-black">
                        {post.title}
                      </h3>
                      {post.content && (
                        <p className="text-xs font-medium text-gray-600 mt-2 line-clamp-2">
                          {post.content}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 border-2 border-black font-black text-xs flex items-center justify-center shadow-[1.5px_1.5px_0_#000] ${getAvatarColors(post.user?.name || 'Anonymous').bg}`}>
                          {getAvatarColors(post.user?.name || 'Anonymous').initials}
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-tight leading-none text-gray-800">
                            {post.user?.name || 'Anonymous'}
                          </p>
                          <span className="text-[9px] font-bold text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs font-black">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleUpvote(post.id); }}
                          className="flex items-center gap-1 hover:text-brutal-blue hover:scale-105 transition-transform"
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
            <Card className="border-4 border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,1)] min-h-[600px] flex flex-col overflow-hidden">
              {/* Card Header details */}
              <div className="p-6 border-b-4 border-black space-y-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedPost(null)} 
                  className="mb-2 border-2 border-black font-black text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all bg-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Feed
                </Button>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className={`inline-block border-2 ${getCategoryBadgeStyle(selectedPost.category)} px-3 py-1 text-xs font-black uppercase tracking-wider mb-2`}>
                      {selectedPost.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-black leading-tight">
                      {selectedPost.title}
                    </h2>
                  </div>
                  <Button 
                    variant="brutal" 
                    onClick={() => handleUpvote(selectedPost.id)}
                    className={`border-3 px-4 py-2 font-black shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${
                      selectedPost.hasUpvoted ? 'bg-brutal-blue text-white' : 'bg-white text-black'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" /> {selectedPost._count.upvotes} Upvotes
                  </Button>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className={`w-10 h-10 border-2 border-black font-black text-sm flex items-center justify-center shadow-[2px_2px_0_#000] ${getAvatarColors(selectedPost.user?.name || 'Anonymous').bg}`}>
                    {getAvatarColors(selectedPost.user?.name || 'Anonymous').initials}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight leading-none text-gray-900">
                      Posted by {selectedPost.user?.name || 'Anonymous'}
                    </p>
                    <span className="text-xs font-bold text-gray-500">
                      Published on {new Date(selectedPost.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {selectedPost.content && (
                  <p className="font-bold text-gray-700 bg-slate-50 p-4 border-2 border-dashed border-gray-300 rounded-none whitespace-pre-wrap leading-relaxed text-sm">
                    {selectedPost.content}
                  </p>
                )}

                {/* Attached Resume Component */}
                {selectedPost.document ? (
                  <div className="p-4 bg-brutal-mint border-4 border-black shadow-[4px_4px_0_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white border-2 border-black shadow-[1.5px_1.5px_0_#000]">
                        <FileText className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-600 tracking-wider">Attached Resume</p>
                        <h4 className="font-black text-base text-black leading-tight">
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
                      <Button variant="brutal" className="w-full md:w-auto bg-white text-black text-xs font-black border-2 border-black hover:bg-slate-50 shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                        Analyze & View Resume &rarr;
                      </Button>
                    </a>
                  </div>
                ) : selectedPost.documentId ? (
                  <div className="p-4 bg-red-100 border-2 border-red-400 text-red-700 text-xs font-bold">
                    This post points to an attached resume, but you do not have permission to view it or it was deleted.
                  </div>
                ) : null}
              </div>

              {/* Comments Section */}
              <div className="flex-1 overflow-y-auto p-6 bg-brutal-bg space-y-4 max-h-[400px]">
                <h3 className="font-black uppercase tracking-wider text-xs text-gray-500 mb-2">
                  Feedback & Comments ({selectedPost.comments?.length || 0})
                </h3>
                
                {selectedPost.comments?.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-gray-300 bg-white">
                    <p className="font-bold text-gray-400">No constructive feedback yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Be the first to share your thoughts and help a peer!</p>
                  </div>
                ) : (
                  selectedPost.comments?.map(comment => {
                    const { bg, initials } = getAvatarColors(comment.user?.name || 'Peer');
                    return (
                      <div key={comment.id} className="bg-white p-4 border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0_rgba(0,0,0,1)] transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 border-2 border-black font-black text-xs flex items-center justify-center shadow-[1px_1px_0_#000] ${bg}`}>
                              {initials}
                            </div>
                            <span className="font-black text-xs uppercase tracking-tight text-gray-800">
                              {comment.user?.name || 'Anonymous Peer'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-bold text-gray-700 text-sm whitespace-pre-wrap pl-1 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Comment Submission Form */}
              <div className="p-4 border-t-4 border-black bg-white">
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input 
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Provide constructive feedback..."
                    className="flex-1 p-3 border-2 border-black outline-none font-bold text-sm bg-white focus:bg-brutal-yellow/10"
                  />
                  <Button 
                    type="submit" 
                    variant="brutal" 
                    className="bg-brutal-pink text-black font-black border-2 px-6 shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all" 
                    disabled={!commentText.trim()}
                  >
                    <Send className="w-4 h-4" />
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
