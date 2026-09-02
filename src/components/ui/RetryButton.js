import { RefreshCw, XCircle } from 'lucide-react';

export default function RetryButton({ onRetry, onCancel, message, isRetrying }) {
 return (
 <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6 text-center max-w-md mx-auto">
 <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
 <XCircle className="w-6 h-6 text-red-500" />
 </div>
 <h3 className="text-lg font-bold text-white mb-2">Generation Failed</h3>
 <p className="text-red-300 text-sm mb-6">
 {message || 'The AI service encountered an error or took too long to respond. Please try again.'}
 </p>
 
 <div className="flex items-center justify-center gap-4">
 <button
 onClick={onCancel}
 className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={onRetry}
 disabled={isRetrying}
 className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
 >
 <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
 {isRetrying ? 'Retrying...' : 'Try Again'}
 </button>
 </div>
 </div>
 );
}
