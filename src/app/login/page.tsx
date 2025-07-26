
'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { BotMessageSquare, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  emailOrContact: z.string().min(1, 'Please enter your email or contact number.'),
  password: z.string().min(1, 'Please enter your password.'),
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { emailOrContact: '', password: '' },
  });

  const { formState: { isSubmitting }, setError } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const success = await login(values.emailOrContact, values.password);
    if (success) {
      router.push('/');
    } else {
        setError('root', { type: 'manual', message: 'Invalid credentials. Please try again.' });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <BotMessageSquare className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Login to your ShikshaAI account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="emailOrContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com / 9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <Link
                            href="/forgot-password"
                            className="ml-auto inline-block text-sm underline"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                    <div className="relative">
                      <FormControl>
                        <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.formState.errors.root && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="underline">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
