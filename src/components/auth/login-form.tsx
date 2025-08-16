'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { ForgotPasswordForm } from './forgot-password-form';
import { AnimatedContainer, AnimatedHeading, AnimatedText } from '@/components/ui/animated-container';
import { fadeInUpVariants, scaleInVariants } from '@/lib/animations';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
  name: z.string().min(1, 'Name is required'),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const { toast } = useToast();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      referralCode: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: 'Welcome back!',
        description: 'You have been successfully logged in.',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await register(data.email, data.password, data.name, data.referralCode);
      toast({
        title: 'Account created!',
        description: 'Your account has been successfully created.',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <motion.div
          variants={scaleInVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        variants={scaleInVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="w-full shadow-xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <AnimatedContainer animation="fadeInDown" delay={0.1}>
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-background rounded-lg" />
              </div>
            </AnimatedContainer>
            
            <AnimatedHeading
              as="h1"
              className="text-2xl md:text-3xl font-bold tracking-tight"
              delay={0.2}
            >
              Welcome Back
            </AnimatedHeading>
            
            <AnimatedText
              className="text-muted-foreground"
              delay={0.3}
            >
              Sign in to your account or create a new one
            </AnimatedText>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <motion.div 
                    className="space-y-2"
                    variants={fadeInUpVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                  >
                    <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      className="h-11 px-4"
                      {...loginForm.register('email')}
                    />
                    {loginForm.formState.errors.email && (
                      <motion.p 
                        className="text-sm text-red-500"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {loginForm.formState.errors.email.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    variants={fadeInUpVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                  >
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      className="h-11 px-4"
                      {...loginForm.register('password')}
                    />
                    {loginForm.formState.errors.password && (
                      <motion.p 
                        className="text-sm text-red-500"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {loginForm.formState.errors.password.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    variants={fadeInUpVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-11 font-semibold"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <motion.div
                          className="flex items-center gap-2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Signing in...
                        </motion.div>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </motion.div>

                  <motion.div 
                    className="text-center"
                    variants={fadeInUpVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-muted-foreground hover:text-primary"
                      onClick={() => setShowForgotPassword(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Forgot your password?
                    </Button>
                  </motion.div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <motion.div 
                    className="space-y-2"
                    variants={fadeInUpVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                  >
                    <Label htmlFor="register-name" className="text-sm font-medium">Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Enter your name"
                      className="h-11 px-4"
                      {...registerForm.register('name')}
                    />
                    {registerForm.formState.errors.name && (
                      <motion.p 
                        className="text-sm text-red-500"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {registerForm.formState.errors.name.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    variants={fadeInUpVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                  >
                    <Label htmlFor="register-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      className="h-11 px-4"
                      {...registerForm.register('email')}
                    />
                    {registerForm.formState.errors.email && (
                      <motion.p 
                        className="text-sm text-red-500"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {registerForm.formState.errors.email.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    variants={fadeInUpVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      className="h-11 px-4"
                      {...registerForm.register('password')}
                    />
                    {registerForm.formState.errors.password && (
                      <motion.p 
                        className="text-sm text-red-500"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {registerForm.formState.errors.password.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    variants={fadeInUpVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.4 }}
                  >
                    <Label htmlFor="register-confirm-password" className="text-sm font-medium">Confirm Password</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      className="h-11 px-4"
                      {...registerForm.register('confirmPassword')}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <motion.p 
                        className="text-sm text-red-500"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {registerForm.formState.errors.confirmPassword.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    variants={fadeInUpVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                  >
                    <Label htmlFor="register-referral-code" className="text-sm font-medium">Referral Code (Optional)</Label>
                    <Input
                      id="register-referral-code"
                      type="text"
                      placeholder="Enter referral code"
                      className="h-11 px-4"
                      {...registerForm.register('referralCode')}
                    />
                    {registerForm.formState.errors.referralCode && (
                      <motion.p 
                        className="text-sm text-red-500"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {registerForm.formState.errors.referralCode.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    variants={fadeInUpVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.6 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-11 font-semibold"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <motion.div
                          className="flex items-center gap-2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Creating account...
                        </motion.div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </motion.div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}