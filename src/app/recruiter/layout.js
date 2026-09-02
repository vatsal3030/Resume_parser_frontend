export default function RecruiterLayout({ children }) {
 return (
 <div className="min-h-screen bg-(--canvas) text-black">
 <nav className="bg-(--accent-amber) border-b border-(--hairline) p-4">
 <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
 <h1 className="text-2xl font-mediumer shadow-sm text-white">
 Elevara <span className="text-(--primary)">/ Recruiter</span>
 </h1>
 </div>
 </nav>
 {children}
 </div>
 );
}
