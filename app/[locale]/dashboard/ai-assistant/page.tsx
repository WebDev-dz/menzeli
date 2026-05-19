"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Bot, Loader2, MessageCircle, Phone, SendHorizonal, Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/components/providers/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { RecommendationResource, useChatbot } from "@/hooks/use-chatbot"
import { API_URL } from "@/lib/api-config"
import { cn } from "@/lib/utils"

const AiAssistantPage = () => {
  const params = useParams<{ locale: string }>()
  const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
  const { t } = useTranslation("dashboard")
  const { isAuthenticated, isLoading } = useAuth()
  const {
    data: conversation,
    isLoading: isLoadingConversation,
    isError,
    error,
    sendMessage,
    isSendingMessage,
  } = useChatbot()
  const [message, setMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const messages = useMemo(() => conversation?.messages ?? [], [conversation])

  const isRecommendationList = (
    recommendations: RecommendationResource[],
  ): recommendations is RecommendationResource[] => {
    return (
      Array.isArray(recommendations) &&
      recommendations.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "title" in item,
      )
    )
  }

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isSendingMessage])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = message.trim()
    if (!trimmed) return

    await sendMessage({ message: trimmed })
    setMessage("")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              {t("ai_assistant.badge", "AI Assistant")}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("ai_assistant.title", "Property Assistant")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(
              "ai_assistant.subtitle",
              "Ask for personalized recommendations, budget guidance, and listing discovery help.",
            )}
          </p>
        </div>
      </div> */}

      {!isAuthenticated ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>{t("ai_assistant.guest_title", "Sign in to continue")}</CardTitle>
            <CardDescription>
              {t(
                "ai_assistant.guest_description",
                "Your assistant can use your account context to tailor listing suggestions and conversations.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={locale ? `/${locale}/auth` : "/auth"}>
                {t("ai_assistant.sign_in", "Sign in")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>{t("ai_assistant.chat_title", "Conversation")}</CardTitle>
                  <CardDescription>
                    {t(
                      "ai_assistant.chat_description",
                      "Describe what you need and the assistant will answer in context.",
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[60vh]">
                <div
                  ref={scrollRef}
                  className="flex min-h-[60vh] flex-col gap-4 px-4 py-4"
                >
                  {isLoadingConversation ? (
                    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("ai_assistant.loading", "Loading conversation...")}
                    </div>
                  ) : isError ? (
                    <div className="flex flex-1 items-center justify-center text-center text-sm text-destructive">
                      {error instanceof Error
                        ? error.message
                        : t("ai_assistant.error", "Failed to load conversation.")}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center">
                      <div className="max-w-md text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <MessageCircle className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold">
                          {t("ai_assistant.empty_title", "Start your first chat")}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {t(
                            "ai_assistant.empty_description",
                            "Try asking for neighborhoods, budget-friendly options, or rentals that match your family size.",
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                          item.is_bot
                            ? "self-start border bg-muted text-foreground"
                            : "self-end bg-primary text-primary-foreground",
                        )}
                      >
                        <div className="whitespace-pre-wrap break-words">
                          {item.message}
                        </div>

                        {item.is_bot &&
                        isRecommendationList(item.recommendations) &&
                        item.recommendations.length > 0 ? (
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {item.recommendations.map((recommendation) => (
                              <Link
                                key={recommendation.id}
                                href={
                                  locale
                                    ? `/${locale}/listings/${recommendation.id}`
                                    : `/listings/${recommendation.id}`
                                }
                                className="overflow-hidden rounded-xl border bg-background text-foreground transition-colors hover:bg-accent"
                              >
                                <div className="flex gap-3 p-3">
                                  <img
                                    src={
                                      recommendation.main_image?.startsWith("http")
                                        ? recommendation.main_image
                                        : `${recommendation.main_image}`
                                    }
                                    alt={recommendation.title}
                                    className="h-20 w-20 rounded-lg object-cover"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold">
                                      {recommendation.title}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      {recommendation.type} • {recommendation.nbr_room} rooms
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-primary">
                                      {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "DZD",
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      }).format(recommendation.price)}
                                    </div>
                                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                      <Phone className="h-3.5 w-3.5" />
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
              </ScrollArea>

              <form onSubmit={handleSubmit} className="border-t p-4">
                <div className="space-y-3">
                  <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={t(
                      "ai_assistant.placeholder",
                      "Ask for help finding a property...",
                    )}
                    className="min-h-24 resize-none"
                    disabled={isSendingMessage}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "ai_assistant.tip",
                        "Include city, budget, rent or sale preference, and room count for better results.",
                      )}
                    </p>
                    <Button
                      type="submit"
                      disabled={isSendingMessage || !message.trim()}
                    >
                      {isSendingMessage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("ai_assistant.sending", "Sending...")}
                        </>
                      ) : (
                        <>
                          <SendHorizonal className="mr-2 h-4 w-4" />
                          {t("ai_assistant.send", "Send")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("ai_assistant.quick_title", "Quick prompts")}</CardTitle>
                <CardDescription>
                  {t(
                    "ai_assistant.quick_description",
                    "Use one of these ideas to start the conversation faster.",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  t(
                    "ai_assistant.prompts.family",
                    "Show me family-friendly rentals in Oran under 60,000 DZD.",
                  ),
                  t(
                    "ai_assistant.prompts.investment",
                    "Find good investment apartments with 2 bedrooms.",
                  ),
                  t(
                    "ai_assistant.prompts.short_stay",
                    "I need a short stay listing near the city center.",
                  ),
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setMessage(prompt)}
                    className="w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    {prompt}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("ai_assistant.help_title", "What it can do")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  {t(
                    "ai_assistant.help_1",
                    "Suggest listings based on budget, location, and property type.",
                  )}
                </p>
                <p>
                  {t(
                    "ai_assistant.help_2",
                    "Recommend alternatives when your first criteria are too narrow.",
                  )}
                </p>
                <p>
                  {t(
                    "ai_assistant.help_3",
                    "Surface property cards directly in the conversation.",
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default AiAssistantPage
