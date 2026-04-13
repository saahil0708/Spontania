'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { Box, CircularProgress } from '@mui/material';
import { useGetMeQuery } from '@/redux/api/authApi';
import { setCredentials, setAuthInitialized } from '@/redux/features/authSlice';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  
  const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  
  // Try to fetch current user on mount to verify session via cookies
  const { data, error, isLoading, isFetching } = useGetMeQuery(undefined, {
    skip: isAuthenticated, // Skip if already authenticated in state
  });

  useEffect(() => {
    if (data?.success) {
      dispatch(setCredentials({ user: data.data }));
    } else if (error) {
      dispatch(setAuthInitialized());
    }
  }, [data, error, dispatch]);

  useEffect(() => {
    // Only redirect once initialization is complete and we're sure about auth status
    if (isInitialized && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, router, pathname]);

  // Show loading while initializing session or checking auth for protected routes
  if ((isLoading || isFetching) && !isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
