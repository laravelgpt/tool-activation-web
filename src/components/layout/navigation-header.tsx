'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from '@/components/ui/language-selector';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogoutConfirmation } from '@/components/auth/logout-confirmation';
import { 
  LogOut, 
  User, 
  Settings, 
  CreditCard,
  Shield,
  Home,
  Activity,
  Key
} from 'lucide-react';

interface NavigationHeaderProps {
  title?: string;
  showAdminLink?: boolean;
}

export function NavigationHeader({ title, showAdminLink = false }: NavigationHeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      setShowLogoutConfirmation(false);
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4" />;
      case 'SUPPORT':
        return <Activity className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Key className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{title || 'Unlocking Tool System'}</h1>
                  {showAdminLink && (
                    <p className="text-sm text-muted-foreground">Administration Panel</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Language Selector */}
              <LanguageSelector />
              
              {/* Quick Stats */}
              <div className="hidden sm:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{user?.credits || 0}</span>
                  <span className="text-muted-foreground">{t('credits')}</span>
                </div>
                <Badge variant="outline" className="flex items-center space-x-1">
                  {getRoleIcon(user?.role || 'USER')}
                  <span>{user?.role}</span>
                </Badge>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image} alt={user?.name || user?.email} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user?.name || '', user?.email || '')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name || 'No name'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Navigation Links */}
                  <DropdownMenuItem asChild>
                    <Link href="/" className="flex items-center">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {user?.role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link href="/" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem asChild>
                    <a href="#" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <a href="#" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Logout Button */}
                  <DropdownMenuItem 
                    onClick={() => setShowLogoutConfirmation(true)}
                    className="flex items-center text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmation 
        open={showLogoutConfirmation} 
        onOpenChange={setShowLogoutConfirmation} 
      />
    </>
  );
}