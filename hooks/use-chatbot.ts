import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { API_URL } from "@/lib/api-config"
import { useAuth } from "@/components/providers/auth"
import { useMemo } from "react"

export interface RecommendationResource {
   id: string
   title: string
   price: number
   phone: string
   main_image: string
   type: "Rent" | "Sell" | "Exchange"
   nbr_room: number 
   rent_duration: "Day" | "Month"

}


export interface ChatMessageResource {
  id: string
  conversation_id: string
  message: string
  is_bot: boolean
  role: string
  recommendations: RecommendationResource[]
  created_at: string
}


export interface ConversationResource {
  id: string
  title: string
  last_message_at: string
  created_at: string
  messages: ChatMessageResource[]
}

type PaginationResource = {
  total: string
  count: string
  per_page: string
  current_page: string
  total_pages: string
  has_pages: string
  has_more_pages: string
  first_page_url: string
  last_page_url: string
  next_page_url: string | null
  prev_page_url: string | null
  from: string
  to: string
  path: string
  current_page_url: string
}

type ChatbotConversationApiResource = {
  conversation: Omit<ConversationResource, "messages">
  messages: {
    messages: Array<
      Omit<ChatMessageResource, "recommendations"> & {
        recommendations: RecommendationResource[] | string | null
      }
    >
    pagination: PaginationResource
  }
}

type ChatMessageApiResource = Omit<ChatMessageResource, "recommendations"> & {
  recommendations: RecommendationResource[] | string | null
}


interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

interface EmptyConversationEnvelope {
  success: boolean
  message: string
  data: null
}

export interface SendChatbotMessagePayload {
  message: string
}

const CHATBOT_QUERY_KEY = ["chatbot-conversation"]
const CHATBOT_INFINITE_QUERY_KEY = ["chatbot-conversation-infinite"]

function coerceRecommendations(
  input: RecommendationResource[] | string | null | undefined,
): RecommendationResource[] {
  if (!input) return []
  if (Array.isArray(input)) return input
  if (typeof input !== "string") return []
  const trimmed = input.trim()
  if (!trimmed) return []
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (Array.isArray(parsed)) return parsed as RecommendationResource[]
    } catch {
      return []
    }
  }
  return []
}

function normalizeConversation(
  payload: ChatbotConversationApiResource,
): ConversationResource & { pagination?: PaginationResource } {
  const rawMessages = payload.messages.messages
  const normalizedMessages: ChatMessageResource[] = rawMessages.map((message) => {
    const { recommendations, ...rest } = message
    return {
      ...rest,
      recommendations: coerceRecommendations(recommendations),
    }
  })

  return {
    ...payload.conversation,
    messages: normalizedMessages,
    pagination: payload.messages.pagination,
  }
}

type ChatbotConversationPage = {
  conversation: Omit<ConversationResource, "messages">
  messages: ChatMessageResource[]
  pagination: PaginationResource
}

function normalizeConversationPage(payload: ChatbotConversationApiResource): ChatbotConversationPage {
  const rawMessages = payload.messages.messages
  const normalizedMessages: ChatMessageResource[] = rawMessages.map((message) => {
    const { recommendations, ...rest } = message
    return {
      ...rest,
      recommendations: coerceRecommendations(recommendations),
    }
  })

  return {
    conversation: payload.conversation,
    messages: normalizedMessages,
    pagination: payload.messages.pagination,
  }
}

async function fetchChatbotConversation(token: string) {
  const response = await fetch(`${API_URL}/api/chatbot`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })

  const json = (await response.json().catch(() => null)) as
    | ApiEnvelope<ChatbotConversationApiResource>
    | EmptyConversationEnvelope
    | null

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(json?.message || `Failed to fetch chatbot (${response.status})`)
  }

  if (!json?.data) return null
  return normalizeConversation(json.data)
}

async function fetchChatbotConversationPage(token: string, page: number) {
  const url = new URL(`${API_URL}/api/chatbot`)
  url.searchParams.set("page", String(page))

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })

  const json = (await response.json().catch(() => null)) as
    | ApiEnvelope<ChatbotConversationApiResource>
    | EmptyConversationEnvelope
    | null

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(json?.message || `Failed to fetch chatbot (${response.status})`)
  }

  if (!json?.data) return null
  return normalizeConversationPage(json.data)
}

async function postChatbotMessage(token: string, payload: SendChatbotMessagePayload) {
  const response = await fetch(`${API_URL}/api/chatbot`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const json = (await response.json().catch(() => null)) as
    | ApiEnvelope<ChatMessageApiResource>
    | null

  if (!response.ok) {
    throw new Error(json?.message || `Failed to send message (${response.status})`)
  }

  if (!json?.data) return null
  const data: ChatMessageApiResource = json.data
  const normalized: ChatMessageResource = {
    ...data,
    recommendations: coerceRecommendations(data.recommendations),
  }
  return normalized
}

export function useChatbotConversation() {
  const { token, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: [...CHATBOT_QUERY_KEY, token],
    enabled: !!token && isAuthenticated,
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated")
      return await fetchChatbotConversation(token)
    },
  })
}

export function useChatbotConversationInfinite() {
  const { token, isAuthenticated } = useAuth()

  return useInfiniteQuery({
    queryKey: [...CHATBOT_INFINITE_QUERY_KEY, token],
    enabled: !!token && isAuthenticated,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!token) throw new Error("Not authenticated")
      return await fetchChatbotConversationPage(token, pageParam)
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined
      if (lastPage.pagination.has_more_pages !== "true") return undefined
      const currentPage = Number(lastPage.pagination.current_page)
      if (!Number.isFinite(currentPage)) return undefined
      return currentPage + 1
    },
  })
}

export function useSendChatbotMessage() {
  const queryClient = useQueryClient()
  const { token } = useAuth()
  const queryKey = [...CHATBOT_QUERY_KEY, token]
  const infiniteQueryKey = [...CHATBOT_INFINITE_QUERY_KEY, token]

  return useMutation({
    mutationFn: async (payload: SendChatbotMessagePayload) => {
      if (!token) throw new Error("Not authenticated")
      return await postChatbotMessage(token, payload)
    },
    onMutate: async (payload) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey }),
        queryClient.cancelQueries({ queryKey: infiniteQueryKey }),
      ])

      const previousConversation = queryClient.getQueryData<ConversationResource | null>(queryKey)
      const previousInfiniteConversation =
        queryClient.getQueryData<InfiniteData<ChatbotConversationPage | null>>(infiniteQueryKey)
      const conversationId = previousConversation?.id ?? "pending-conversation"
      const now = new Date().toISOString()

      const optimisticMessage: ChatMessageResource = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        message: payload.message,
        is_bot: false,
        role: "user",
        recommendations: [],
        created_at: now,
      }

      queryClient.setQueryData(
        queryKey,
        (current: ConversationResource | null | undefined) => {
          if (!current) {
            return {
              id: conversationId,
              title: "Conversation",
              last_message_at: now,
              created_at: now,
              messages: [optimisticMessage],
            } satisfies ConversationResource
          }

          return {
            ...current,
            last_message_at: now,
            messages: [...(current.messages ?? []), optimisticMessage],
          }
        },
      )

      queryClient.setQueryData(
        infiniteQueryKey,
        (current: InfiniteData<ChatbotConversationPage | null> | undefined) => {
          if (!current) {
            return {
              pages: [
                {
                  conversation: {
                    id: conversationId,
                    title: "Conversation",
                    last_message_at: now,
                    created_at: now,
                  },
                  pagination: {
                    total: "0",
                    count: "0",
                    per_page: "0",
                    current_page: "1",
                    total_pages: "1",
                    has_pages: "false",
                    has_more_pages: "false",
                    first_page_url: "",
                    last_page_url: "",
                    next_page_url: null,
                    prev_page_url: null,
                    from: "0",
                    to: "0",
                    path: "",
                    current_page_url: "",
                  },
                  messages: [optimisticMessage],
                },
              ],
              pageParams: [1],
            } satisfies InfiniteData<ChatbotConversationPage | null>
          }

          const pages = [...current.pages]
          if (pages.length === 0) return current
          const firstPage = pages[0]
          if (!firstPage) return current

          pages[0] = {
            ...firstPage,
            conversation: {
              ...firstPage.conversation,
              id: firstPage.conversation?.id ?? conversationId,
              last_message_at: now,
            },
            messages: [optimisticMessage, ...(firstPage.messages ?? [])],
          }

          return { ...current, pages }
        },
      )

      return {
        previousConversation,
        previousInfiniteConversation,
        optimisticMessageId: optimisticMessage.id,
      }
    },
    onSuccess: (message) => {
      queryClient.setQueryData(
        queryKey,
        (current: ConversationResource | null | undefined) => {
          if (!message) return current ?? null
          if (!current) {
            return {
              id: message.conversation_id,
              title: "Conversation",
              last_message_at: message.created_at,
              created_at: message.created_at,
              messages: [message],
            } satisfies ConversationResource
          }

          return {
            ...current,
            id:
              current.id === "pending-conversation"
                ? message.conversation_id
                : current.id,
            last_message_at: message.created_at,
            messages: [
              ...(current.messages ?? []),
              message,
            ],
          }
        },
      )

      queryClient.setQueryData(
        infiniteQueryKey,
        (current: InfiniteData<ChatbotConversationPage | null> | undefined) => {
          if (!message) return current
          if (!current) return current

          const pages = [...current.pages]
          if (pages.length === 0) return current

          const firstPage = pages[0]
          if (!firstPage) return current

          const existing = firstPage.messages ?? []
          const nextMessages =
            existing.length > 0 && existing[0]?.id?.startsWith("temp-")
              ? [message, ...existing.slice(1)]
              : [message, ...existing]

          pages[0] = {
            ...firstPage,
            conversation: {
              ...firstPage.conversation,
              id:
                firstPage.conversation.id === "pending-conversation"
                  ? message.conversation_id
                  : firstPage.conversation.id,
              last_message_at: message.created_at,
            },
            messages: nextMessages,
          }

          return { ...current, pages }
        },
      )
    },
    onError: (_error, _payload, context) => {
      queryClient.setQueryData(queryKey, context?.previousConversation ?? null)
      if (context?.previousInfiniteConversation) {
        queryClient.setQueryData(infiniteQueryKey, context.previousInfiniteConversation)
      }
    },
  })
}

export function useChatbot() {
  const conversationQuery = useChatbotConversation()
  const sendMessageMutation = useSendChatbotMessage()

  return {
    ...conversationQuery,
    sendMessage: sendMessageMutation.mutateAsync,
    sendMessageStatus: sendMessageMutation.status,
    isSendingMessage: sendMessageMutation.isPending,
    sendMessageError: sendMessageMutation.error,
  }
}

export function useChatbotInfinite() {
  const conversationQuery = useChatbotConversationInfinite()
  const sendMessageMutation = useSendChatbotMessage()

  const conversation = conversationQuery.data?.pages?.[0]?.conversation ?? null
  const pages = conversationQuery.data?.pages ?? []
  const pagination = pages.length > 0 ? pages[pages.length - 1]?.pagination : undefined

  const chronologicalMessages = useMemo(() => {
    const normalizedPages = pages.filter((page): page is ChatbotConversationPage => Boolean(page))
    const messages: ChatMessageResource[] = []
    for (let pageIndex = normalizedPages.length - 1; pageIndex >= 0; pageIndex -= 1) {
      const page = normalizedPages[pageIndex]
      for (let i = page.messages.length - 1; i >= 0; i -= 1) {
        messages.push(page.messages[i])
      }
    }
    return messages
  }, [pages])

  return {
    ...conversationQuery,
    conversation,
    messages: chronologicalMessages,
    pagination,
    sendMessage: sendMessageMutation.mutateAsync,
    sendMessageStatus: sendMessageMutation.status,
    isSendingMessage: sendMessageMutation.isPending,
    sendMessageError: sendMessageMutation.error,
  }
}
