import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Lottie from 'lottie-react';
import useAuth from '@/hooks/useAuth';
import LottiePlaceholder from '@/components/ui/lottie-placeholder';

const withAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { isLoggedIn, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      if (!isLoading && !isLoggedIn) {
        if (pathname !== '/accounts/login') {
          router.push('/accounts/login');
        }
      }
    }, [isLoading, isLoggedIn, router, pathname]);

    if (!isClient || isLoading) {
      return <LottiePlaceholder />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;