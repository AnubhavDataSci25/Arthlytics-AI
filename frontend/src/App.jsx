import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import userAuthStore from '@/store/authStore';

// Pages
import Login from '@/pages/auth/Login';
import Resgister from '@/pages/auth/Register';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';

// Layout
import AppLayout from './components/layout/AppLayout';
import Register from './pages/auth/Register';

function PrivateRoute({ children }) {
    const token = userAuthStore(s => s.token)
    return token ? children : <Navigate to="/login" replace/>
}

function PublicRoute({ children }) {
    const token = userAuthStore(s => s.token)
    return !token ? children : <Navigate to="/dashboard" replace/>
}

export default function App() {
    return (
        <BrowserRouter>
            <Toaster
                position='top-right'
                toastOptions={{
                    style: {
                    background: '#171e1a',
                    color: '#f4f4f5',
                    border: '1px solid rgba(255,255,255,0.06)',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '14px',
                },
                success: { iconTheme: { primary: '#27a268', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}      
            />
            <Routes>
                {/* Public */}
                <Route path='/login' element={<PublicRoute><Login /></PublicRoute>}/>
                <Route path='/register' element={<PublicRoute><Register /></PublicRoute>} />

                {/* Private - wrapped in AppLayout */}
                <Route path='/' element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                    <Route index element={<Navigate to='/dashboard' replace/>} />
                    <Route path='dashboard' element={<Dashboard/>} />
                    {/* F3-F6 routes added per phase */}
                </Route>

                <Route path='*' element={<NotFound/>} />
            </Routes>
        </BrowserRouter>
    )
}