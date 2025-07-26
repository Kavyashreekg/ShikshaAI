
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { BotMessageSquare, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parse, isValid } from 'date-fns';
import { useState } from 'react';


const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  dob: z.date({
    required_error: "A date of birth is required.",
  }),
  school: z.string().min(2, 'School name is required.'),
  contact: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit contact number.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', school: '', contact: '', email: '', password: '' },
  });
  
  const { formState: { isSubmitting }, setError } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const userData = { ...values, dob: values.dob.toISOString() };
    const success = await register(userData);
    if (success) {
      router.push('/');
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
                  name="dob"
                  render={({ field }) => {
                    const [dateString, setDateString] = useState(field.value ? format(field.value, 'dd-MM-yyyy') : '');

                    const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        setDateString(value); // Update the visual input immediately
                        
                        // Try to parse the date and update the form value only if it's a valid, complete date
                        const parsedDate = parse(value, 'dd-MM-yyyy', new Date());
                        if (isValid(parsedDate) && value.length === 10) {
                            field.onChange(parsedDate);
                        }
                    };
                    
                    const handleCalendarSelect = (date: Date | undefined) => {
                       if(date) {
                         field.onChange(date);
                         setDateString(format(date, "dd-MM-yyyy"));
                       }
                    }

                    return (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                            <div className="relative">
                               <FormControl>
                                    <Input
                                        placeholder="DD-MM-YYYY"
                                        value={dateString}
                                        onChange={handleManualDateChange}
                                    />
                                </FormControl>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground">
                                            <CalendarIcon className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={handleCalendarSelect}
                                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                          <FormMessage />
                        </FormItem>
                    )
                  }}
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
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
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
