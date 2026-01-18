# API Endpoints

## Chat Messages

### POST /api/chat/messages

Send a new message to a chat room.

**Headers:**
```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "roomId": "uuid",
  "content": "Go Bears!",
  "contentType": "text",    // "text" | "gif"
  "gifUrl": null,           // URL if contentType is "gif"
  "replyToId": null         // UUID if replying to a message
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "room_id": "uuid",
    "user_id": "uuid",
    "content": "Go Bears!",
    "content_type": "text",
    "moderation_status": "approved",
    "created_at": "2024-01-15T10:30:00Z",
    "user": {
      "id": "uuid",
      "display_name": "BearsFan123",
      "avatar_url": "https://...",
      "badge": "verified"
    }
  },
  "moderation": {
    "score": 0.0
  }
}
```

**Moderation Error (400):**
```json
{
  "error": "Message blocked: profanity",
  "moderation": {
    "action": "block",
    "flags": ["profanity"],
    "score": 0.65
  }
}
```

**Rate Limit Error (429):**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 45
}
```

**Banned User (403):**
```json
{
  "error": "You are banned from chat",
  "banReason": "Hate speech violation",
  "banExpiresAt": "2024-01-16T10:30:00Z"
}
```

### GET /api/chat/messages

Fetch messages for a chat room.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| roomId | UUID | Yes | Chat room ID |
| before | ISO Date | No | Pagination cursor |
| limit | Number | No | Max 100, default 50 |

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "room_id": "uuid",
      "user_id": "uuid",
      "content": "Bear down!",
      "content_type": "text",
      "reply_to_id": null,
      "thread_reply_count": 3,
      "reaction_counts": {"🔥": 5, "💪": 2},
      "created_at": "2024-01-15T10:30:00Z",
      "user": {
        "id": "uuid",
        "display_name": "ChicagoFan",
        "avatar_url": "https://...",
        "badge": null
      }
    }
  ],
  "hasMore": true
}
```

---

## GIF Search

### GET /api/gifs/search

Search for GIFs (proxies to Tenor/GIPHY).

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | String | Yes | Search query |
| limit | Number | No | Max 50, default 20 |

**Response:**
```json
{
  "gifs": [
    {
      "id": "abc123",
      "url": "https://media.giphy.com/.../giphy.gif",
      "preview": "https://media.giphy.com/.../200w.gif"
    }
  ],
  "source": "giphy"
}
```

**Notes:**
- Query is sanitized (blocked terms removed)
- Sports context added to generic queries
- Content filtered to PG rating
- Falls back to curated sports GIFs if API unavailable

---

## Disqus SSO

### GET /api/auth/disqus-sso

Generate Disqus SSO authentication payload.

**Headers:**
```
Authorization: Bearer <supabase_access_token>
```

**Authenticated Response:**
```json
{
  "auth": "base64_payload signature timestamp",
  "public_key": "your_disqus_public_key",
  "user": {
    "id": "uuid",
    "username": "BearsFan123",
    "avatar": "https://..."
  },
  "isGuest": false
}
```

**Guest Response:**
```json
{
  "auth": null,
  "public_key": "your_disqus_public_key",
  "isGuest": true
}
```

---

## Supabase Realtime

Messages are delivered via Supabase Realtime subscriptions.

### Subscribe to Room Messages

```typescript
const channel = supabase
  .channel(`room:${roomId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `room_id=eq.${roomId}`,
    },
    (payload) => {
      // New message received
      console.log('New message:', payload.new);
    }
  )
  .subscribe();
```

### Subscribe to Reactions

```typescript
const channel = supabase
  .channel(`reactions:${roomId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'chat_reactions',
    },
    (payload) => {
      // Reaction added/removed
      console.log('Reaction update:', payload);
    }
  )
  .subscribe();
```

### Presence (Online Users)

```typescript
const presenceChannel = supabase
  .channel(`presence:${roomId}`)
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    console.log('Online users:', Object.values(state).flat());
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user: currentUser,
        online_at: new Date().toISOString(),
      });
    }
  });
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad request / Moderation blocked |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (banned/muted user) |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Server error |
