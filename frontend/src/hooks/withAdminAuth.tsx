import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

const withAdminAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { user, isLoading, isLoggedIn } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
      setIsClient(true);
      // Check if we have a token in localStorage
      const hasToken = typeof window !== 'undefined' && localStorage.getItem('access_token');
      setIsInitialized(!!hasToken);
    }, []);

    useEffect(() => {
      console.log('withAdminAuth - Auth State:', {
        isLoading,
        isLoggedIn,
        isInitialized,
        user: user ? {
          email: user.email,
          isSuperuser: user.is_superuser,
          isActive: user.is_active
        } : null
      });

      // Only redirect if we're not loading and have completed initialization
      if (!isLoading && isInitialized && (!isLoggedIn || !user?.is_superuser)) {
        console.log('Redirecting - Conditions not met:', {
          notLoggedIn: !isLoggedIn,
          notSuperuser: !user?.is_superuser
        });
        router.push('/');
      }
    }, [isLoading, isLoggedIn, user, router, isInitialized]);

    // Show loading state while we're initializing or loading
    if (!isClient || isLoading || !isInitialized) {
      console.log('Loading state:', { isClient, isLoading, isInitialized });
      return <div>Loading...</div>;
    }

    // Only show the component if we're logged in and a superuser
    if (isLoggedIn && user?.is_superuser) {
      console.log('Rendering admin component');
      return <WrappedComponent {...props} />;
    }

    console.log('Not authorized, returning null');
    return null;
  };
};

export default withAdminAuth;
