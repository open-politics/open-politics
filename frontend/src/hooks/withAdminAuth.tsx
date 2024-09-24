import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

const withAdminAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { user, isLoading, isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isLoggedIn) {
        router.push('/');
      }
    }, [isLoading, isLoggedIn, router]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAdminAuth;