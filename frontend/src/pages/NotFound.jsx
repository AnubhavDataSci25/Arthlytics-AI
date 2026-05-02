import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-surface-900 flex items-center justify-center">
            <div className="text-center space-y-4 animate-fade-up">
                <p className="text-7xl font-display font-black text-brand-500/30">404</p>
                <h1 className="text-xl font-display font-bold text-zinc-100">Page not found</h1>
                <p className="text-sm text-zinc-500">That route doesn't exist.</p>
                <button onClick={() => navigate('/dashboard')} className="btn-primary mt-2">
                    Back to Dashboard
                </button>
            </div>
        </div>
    )
}