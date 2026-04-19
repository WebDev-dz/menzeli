import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "@/lib/api-config"
import { useAuth } from "@/components/providers/auth"

export interface RecommendationResource {
   id: string,
   title: string,
   price: number
   phone: string
   main_image: string,
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
  recommendations:  RecommendationResource[]
  created_at: string
  [k: string]: unknown
}


export interface ConversationResource {
  id: string
  title: string
  last_message_at: string
  created_at: string,
  messages: ChatMessageResource[]
  [k: string]: unknown
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

async function fetchChatbotConversation(token: string) {
  const response = await fetch(`${API_URL}/api/chatbot`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })

  const json = (await response.json().catch(() => null)) as
    | ApiEnvelope<ConversationResource>
    | EmptyConversationEnvelope
    | null

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(json?.message || `Failed to fetch chatbot (${response.status})`)
  }

  return json?.data ?? null
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
    | ApiEnvelope<ChatMessageResource>
    | null

  if (!response.ok) {
    throw new Error(json?.message || `Failed to send message (${response.status})`)
  }

  return json?.data
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

export function useSendChatbotMessage() {
  const queryClient = useQueryClient()
  const { token } = useAuth()
  const queryKey = [...CHATBOT_QUERY_KEY, token]

  return useMutation({
    mutationFn: async (payload: SendChatbotMessagePayload) => {
      if (!token) throw new Error("Not authenticated")
      return await postChatbotMessage(token, payload)
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey })

      const previousConversation = queryClient.getQueryData<ConversationResource | null>(queryKey)
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

      return { previousConversation, optimisticMessageId: optimisticMessage.id }
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
    },
    onError: (_error, _payload, context) => {
      queryClient.setQueryData(queryKey, context?.previousConversation ?? null)
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
