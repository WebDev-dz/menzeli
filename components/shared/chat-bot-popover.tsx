"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Bot, Loader2, MessageCircle, Phone, SendHorizonal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuth } from "@/components/providers/auth"
import { useChatbotInfinite } from "@/hooks/use-chatbot"
import { API_URL } from "@/lib/api-config"
import { cn } from "@/lib/utils"

const ChatBotPopover = () => {
  const params = useParams<{ locale: string }>()
  const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
  const { isAuthenticated, isLoading } = useAuth()
  const {
    messages,
    isLoading: isLoadingConversation,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    sendMessage,
    isSendingMessage,
  } = useChatbotInfinite()
  const [message, setMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const previousMessageCountRef = useRef(0)
  const initialScrollDoneRef = useRef(false)
  const pendingLoadMoreRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    const element = scrollRef.current

    if (pendingLoadMoreRef.current) {
      const { scrollHeight, scrollTop } = pendingLoadMoreRef.current
      const nextScrollHeight = element.scrollHeight
      element.scrollTop = nextScrollHeight - scrollHeight + scrollTop
      pendingLoadMoreRef.current = null
      previousMessageCountRef.current = messages.length
      return
    }

    if (!initialScrollDoneRef.current) {
      element.scrollTop = element.scrollHeight
      initialScrollDoneRef.current = true
      previousMessageCountRef.current = messages.length
      return
    }

    if (messages.length > previousMessageCountRef.current) {
      element.scrollTop = element.scrollHeight
    }

    previousMessageCountRef.current = messages.length
  }, [messages.length, isSendingMessage])

  if (isLoading ) {
    return null
  }

  const handleLoadMore = async () => {
    if (!scrollRef.current) return
    if (!hasNextPage || isFetchingNextPage) return

    pendingLoadMoreRef.current = {
      scrollHeight: scrollRef.current.scrollHeight,
      scrollTop: scrollRef.current.scrollTop,
    }

    await fetchNextPage()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = message.trim()
    if (!trimmed) return

    await sendMessage({ message: trimmed })
    setMessage("")
  }

  return (
    <div className="fixed bottom-12 right-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button  className="rounded-full shadow-lg size-14">
            <MessageCircle className="size-8" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="top"
          className="w-90 p-0 sm:w-105"
        >
          <PopoverHeader className="border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="size-4" />
              </div>
              <div>
                <PopoverTitle>Chatbot</PopoverTitle>
                <PopoverDescription>
                  Ask for listings, help, and recommendations.
                </PopoverDescription>
              </div>
            </div>
          </PopoverHeader>
          {!isAuthenticated ? (
            <div className="flex min-h-55 flex-col items-center justify-center gap-4 px-6 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Sign in to chat with the assistant and get personalized listing recommendations.
              </p>
              <Button asChild>
                <Link href={locale ? `/${locale}/auth` : "/auth"}>Sign in</Link>
              </Button>
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                className="flex max-h-105 min-h-80 flex-col gap-3 overflow-y-auto px-4 py-4"
              >
                {hasNextPage ? (
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadMore}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : null}
                      Load more
                    </Button>
                  </div>
                ) : null}
                {isLoadingConversation ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                    Start a conversation with the chatbot.
                  </div>
                ) : (
                  messages?.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                        item.is_bot
                          ? "self-start bg-muted text-foreground"
                          : "self-end bg-primary text-primary-foreground",
                      )}
                    >
                      <div className="whitespace-pre-wrap wrap-break-word">
                        {item.message}
                      </div>

                      {item.is_bot &&
                      item.recommendations.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {item.recommendations.map((recommendation) => (
                            <Link
                              key={recommendation.id}
                              href={`/listings/${recommendation.id}`}
                              className="block rounded-xl border bg-background p-2 text-foreground transition-colors hover:bg-accent"
                            >
                              <div className="flex gap-3">
                                <img
                                  src={
                                    recommendation.main_image?.startsWith("http")
                                      ? recommendation.main_image
                                      : `${recommendation.main_image}`
                                  }
                                  alt={recommendation.title}
                                  className="h-16 w-16 rounded-md object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-medium">
                                    {recommendation.title}
                                  </div>
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {recommendation.type} • {recommendation.nbr_room} rooms
                                  </div>
                                  <div className="mt-1 text-xs font-medium text-primary">
                                    {new Intl.NumberFormat("en-US", {
                                      style: "currency",
                                      currency: "DZD",
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    }).format(recommendation.price)}
                                  </div>
                                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                    <Phone className="size-3" />
                                    {recommendation.phone}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSubmit} className="border-t p-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Type your message..."
                    disabled={isSendingMessage}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isSendingMessage || !message.trim()}
                  >
                    {isSendingMessage ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <SendHorizonal className="size-4" />
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ChatBotPopover
