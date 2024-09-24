import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

const withAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { isLoggedIn, isLoading } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      if (!isLoading && !isLoggedIn()) {
        router.push('/login');
      }
    }, [isLoading, isLoggedIn, router]);

    if (!isClient) {
      return null; // Return null on server-side
    }

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isLoggedIn()) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;