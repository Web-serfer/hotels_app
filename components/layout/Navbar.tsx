'use client';

import { UserButton, useAuth } from '@clerk/nextjs';
import { Container } from '../Container';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import SearchInput from '../SearchInput';
import { ModeToggle } from '../ThemeToogle';
import { NavMenu } from './NavMenu';

const Navbar = () => {
  const router = useRouter();
  const { userId } = useAuth();
  return (
    <nav className="sticky top-0 border border-b-primary/10 bg-secondary z-50">
      <Container>
        {/* logo */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <Image src="/favicon.ico" alt="logo" width="30" height="30" />
            <div className="font-bold text-xl">Hot Hotels</div>
          </div>

          {/* Search */}
          <SearchInput />

          {/* right side */}
          <div className="flex gap-3 items-center">
            {/* ThemeToogle */}
            <div>
              <ModeToggle />
              <NavMenu />
            </div>
            <UserButton afterSignOutUrl="/" />
            {!userId && (
              <>
                <Button
                  onClick={() => router.push('/sign-in')}
                  variant="outline"
                  size="sm"
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => router.push('/sign-up')}
                  variant="default"
                  size="sm"
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;
