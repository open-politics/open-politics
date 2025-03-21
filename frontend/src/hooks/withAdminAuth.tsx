'use client'

import { useRouter, usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import LottiePlaceholder from '@/components/ui/lottie-placeholder';

const withAdminAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { user, isLoading, isLoggedIn } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      if (!isLoading && (!isLoggedIn || !user?.is_superuser)) {
        console.log('Redirecting - Conditions not met:', {
          notLoggedIn: !isLoggedIn,
          notSuperuser: user?.is_superuser,
        });
        if (pathname !== '/') {
          router.push('/');
        }
      }
    }, [isLoading, isLoggedIn, user, router, pathname]);

    if (!isClient || isLoading) {
      return <LottiePlaceholder />;
    }

    if (isLoggedIn && user?.is_superuser) {
      console.log('Rendering admin component');
      return <WrappedComponent {...props} />;
    }

    console.log('Not authorized, returning null');
    return null;
  };
};

export default withAdminAuth;
