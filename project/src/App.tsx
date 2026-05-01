import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SignUpPage from './pages/Signup';
import ClubDetails from './pages/ClubDetails';
import CreatePostPage from './pages/CreatePost';
import CommentAnalyticsPage from './pages/CommentAnalytics';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/clubs/:clubId" element={<ClubDetails />} />
              <Route path="/clubs/:clubId/create-post" element={<CreatePostPage />} />
              <Route path="/clubs/:clubId/comment-analytics" element={<CommentAnalyticsPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
