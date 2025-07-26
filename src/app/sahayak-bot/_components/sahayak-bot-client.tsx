'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send, Sparkles, User, BotMessageSquare, Lightbulb } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sahayakBotFlow, SahayakBotOutput } from '@/ai/flows/sahayak-bot-flow';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  data?: SahayakBotOutput;
}

const formSchema = z.object({
  prompt: z.string().min(1, 'Please enter a prompt.'),
});

export function SahayakBotClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: '' },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: values.prompt,
    };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();

    try {
      const result = await sahayakBotFlow({
        query: values.prompt,
        language: language,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: result.response,
        data: result,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (e: any) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to get a response from the bot. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const renderBotMessage = (message: Message) => {
    const { data } = message;
    return (
      <div className="space-y-4">
        <p className="whitespace-pre-wrap">{message.content}</p>
        {data?.story && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="text-accent" />
                Generated Story
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              {data.story.story}
            </CardContent>
          </Card>
        )}
        {data?.explanation && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="text-accent" />
                  Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                {data.explanation.explanation}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="text-accent" />
                  Analogy
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                {data.explanation.analogy}
              </CardContent>
            </Card>
          </>
        )}
        {data?.visualAid && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="text-accent" />
                Generated Visual Aid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={data.visualAid.visualAid}
                alt="Generated visual aid"
                width={300}
                height={300}
                className="rounded-lg border object-contain"
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 pt-4">
      <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef as any}>
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-4',
                message.type === 'user' && 'justify-end'
              )}
            >
              {message.type === 'bot' && (
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback>
                    <BotMessageSquare />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xl rounded-lg p-3',
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.type === 'user' ? message.content : renderBotMessage(message)}
              </div>
              {message.type === 'user' && (
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
              <Avatar className="h-9 w-9 border">
                <AvatarFallback>
                  <BotMessageSquare />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-xl rounded-lg p-3 bg-muted w-full">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="mt-4 border-t pt-4">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-center gap-2"
        >
          <Input
            {...form.register('prompt')}
            placeholder="e.g., Explain photosynthesis in simple terms"
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
