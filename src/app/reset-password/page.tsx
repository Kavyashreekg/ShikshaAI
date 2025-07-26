
'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { BotMessageSquare } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Suspense, useEffect } from 'react';

const formSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});


function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { resetPassword } = useAuth();
    const email = searchParams.get('email');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { password: '', confirmPassword: '' },
    });

    const { formState: { isSubmitting }, setError } = form;

    useEffect(() => {
        if (!email) {
            toast({
                variant: 'destructive',
                title: 'Invalid Link',
                description: 'The password reset link is invalid or has expired.',
            });
            router.push('/forgot-password');
        }
    }, [email, router, toast]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!email) return;
        const success = await resetPassword(email, values.password);
        if (success) {
            toast({
                title: 'Password Reset Successful',
                description: 'You can now log in with your new password.',
            });
            router.push('/login');
        } else {
            setError('root', { type: 'manual', message: 'Could not reset password. Please try again.' });
        }
    }

    if (!email) {
        return null; // Render nothing while redirecting
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <BotMessageSquare className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Reset Your Password</CardTitle>
                <CardDescription>Enter a new password for your account.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                {form.formState.errors.root && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
                </form>
            </Form>
             <div className="mt-4 text-center text-sm">
                <Link href="/login" className="underline">
                    Back to Login
                </Link>
            </div>
            </CardContent>
        </Card>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
           <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordForm />
           </Suspense>
        </div>
    )
}
