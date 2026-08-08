import { Routes, Route } from 'react-router-dom';
import {
  HomePage,
  ProfilePage,
  VerifyEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  NotFoundPage,
} from '../pages';

interface AppRoutesProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export function AppRoutes({ onOpenAuthModal }: AppRoutesProps) {
  return (
    <Routes>
      {/* Home / Feed Route */}
      <Route path="/" element={<HomePage onOpenAuthModal={onOpenAuthModal} />} />

      {/* User Profile Route */}
      <Route path="/profile/:id" element={<ProfilePage onOpenAuthModal={onOpenAuthModal} />} />

      {/* Auth Utility Routes */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
