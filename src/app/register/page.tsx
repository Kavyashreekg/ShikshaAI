
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
import { useToast } from '@/hooks/use-toast';


const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  school: z.string().min(2, 'School name is required.'),
  contact: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit contact number.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', school: '', contact: '', email: '', password: '' },
  });
  
  const { formState: { isSubmitting }, setError } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const success = await register(values);
    if (success) {
      toast({
        title: 'Registration Successful',
        description: 'You can now log in with your credentials.',
      });
      router.push('/login');
    } else {
      setError('root', { type: 'manual', message: 'Registration failed. An account with this email or contact may already exist.' });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
             <div className="flex justify-center mb-4">
                <BotMessageSquare className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>Join ShikshaAI to assist your teaching.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Anika Gupta" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Working School</FormLabel>
                    <FormControl><Input placeholder="e.g., Govt. Primary School" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Details</FormLabel>
                    <FormControl><Input placeholder="e.g., 9876543210" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email ID</FormLabel>
                    <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Create Password</FormLabel>
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
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
