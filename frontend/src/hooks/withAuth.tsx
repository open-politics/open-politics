import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Lottie from 'lottie-react'; 
import useAuth from '@/hooks/useAuth';
import LottiePlaceholder from '@/components/ui/lottie-placeholder';

const withAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { isLoggedIn, isLoading } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      if (!isLoading && !isLoggedIn) {
        router.push('/login');
      }
    }, [isLoading, isLoggedIn, router]);

    if (!isClient) {
      return null; // Return null on server-side
    }

    if (isLoading) {
      return <LottiePlaceholder />;
    }

    if (!isLoggedIn) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
