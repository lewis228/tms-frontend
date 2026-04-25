// Mock chat data replicating the reference design. Pure client-side mock
// until a real messaging backend (+ WebSocket) is wired in. All strings go
// through i18n where user-facing; names/emails/timestamps are kept literal
// because they are illustrative sample content.

export type ChatRoomSummary = {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
};

export type ChatMessage =
  | {
      id: string;
      roomId: string;
      kind: "text";
      from: "me" | "other";
      text: string;
      reactions?: string[];
    }
  | {
      id: string;
      roomId: string;
      kind: "emoji";
      from: "me" | "other";
      emoji: string;
    }
  | {
      id: string;
      roomId: string;
      kind: "image-card";
      from: "me" | "other";
      imageUrl: string;
      linkUrl: string;
      linkTitle: string;
    }
  | {
      id: string;
      roomId: string;
      kind: "divider";
      label: string; // "Today, 11:59 AM"
    };

export const CHAT_ROOMS: ChatRoomSummary[] = [
  {
    id: "william",
    name: "William Johnson",
    email: "william@twitter.com",
    avatar: "https://i.pravatar.cc/80?u=william",
    lastMessageAt: "18:30",
    lastMessagePreview: "What about the second plan",
    unreadCount: 0,
  },
  {
    id: "bywind",
    name: "ByeWind",
    email: "bywind@twitter.com",
    avatar: "https://i.pravatar.cc/80?u=bywind",
    lastMessageAt: "19:28",
    lastMessagePreview: "Are you free tonight?",
    unreadCount: 12,
  },
  {
    id: "natali",
    name: "Natali Craig",
    email: "natali@twitter.com",
    avatar: "https://i.pravatar.cc/80?u=natali",
    lastMessageAt: "17:52",
    lastMessagePreview: "Hi",
    unreadCount: 5,
  },
  {
    id: "drew",
    name: "Drew Cano",
    email: "drew@twitter.com",
    avatar: "https://i.pravatar.cc/80?u=drew",
    lastMessageAt: "10:12",
    lastMessagePreview: "Let's go fishing! — Hey, You wanna join...",
    unreadCount: 0,
  },
  {
    id: "bruce-james",
    name: "Bruce Wayne, James Davis",
    avatar: "https://i.pravatar.cc/80?u=bruce",
    lastMessageAt: "06:30",
    lastMessagePreview: "You have a new follower",
    unreadCount: 0,
  },
  {
    id: "orlando",
    name: "Orlando Diggs",
    email: "orlando@twitter.com",
    avatar: "https://i.pravatar.cc/80?u=orlando",
    lastMessageAt: "Mar 12",
    lastMessagePreview: "Hey man — Nah man sorry i don't. Sho...",
    unreadCount: 0,
  },
  {
    id: "sarah-michael",
    name: "Sarah Jackson, Michael Brown...",
    avatar: "https://i.pravatar.cc/80?u=sarah",
    lastMessageAt: "Mar 12",
    lastMessagePreview: "Yes, I think it's a great idea",
    unreadCount: 0,
  },
  {
    id: "andi",
    name: "Andi Lane",
    email: "andi@twitter.com",
    avatar: "https://i.pravatar.cc/80?u=andi",
    lastMessageAt: "Mar 11",
    lastMessagePreview: "Re: New mail settings — Will you answe...",
    unreadCount: 0,
  },
  {
    id: "group",
    name: "Group",
    avatar: "https://i.pravatar.cc/80?u=group",
    lastMessageAt: "Mar 10",
    lastMessagePreview: "You have a new follower",
    unreadCount: 0,
  },
  {
    id: "john",
    name: "John Smith",
    email: "john@twitter.com",
    avatar: "https://i.pravatar.cc/80?u=john",
    lastMessageAt: "Mar 9",
    lastMessagePreview: "There's a bug you need to deal with.",
    unreadCount: 0,
  },
  {
    id: "kate",
    name: "Kate Morrison",
    email: "kate@twitter.com",
    avatar: "https://i.pravatar.cc/80?u=kate",
    lastMessageAt: "Mar 9",
    lastMessagePreview: "I think we should use the first version.",
    unreadCount: 0,
  },
  {
    id: "threads",
    name: "Threads",
    avatar: "https://i.pravatar.cc/80?u=threads",
    lastMessageAt: "Mar 8",
    lastMessagePreview: "You have a new follower",
    unreadCount: 0,
  },
  {
    id: "koray",
    name: "Koray Okumus",
    email: "koray@twitter.com",
    avatar: "https://i.pravatar.cc/80?u=koray",
    lastMessageAt: "Mar 7",
    lastMessagePreview: "Let's talk about the search box interact...",
    unreadCount: 0,
  },
];

export const CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  bywind: [
    {
      id: "m1",
      roomId: "bywind",
      kind: "text",
      from: "me",
      text: "hi ByeWind, I saw your work on Dribbble and it's awesome.\nI would like to know more about it. Could you send me your website?",
    },
    { id: "m2", roomId: "bywind", kind: "divider", label: "Today, 11:59 AM" },
    {
      id: "m3",
      roomId: "bywind",
      kind: "text",
      from: "other",
      text: "Thank you. Of course. Just a moment, please.",
    },
    {
      id: "m4",
      roomId: "bywind",
      kind: "image-card",
      from: "other",
      imageUrl:
        "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=60",
      linkUrl: "snow.bywind.com",
      linkTitle: "Snow Dashboard UI Kit",
    },
    {
      id: "m5",
      roomId: "bywind",
      kind: "text",
      from: "me",
      text: "Got it, thank you.",
      reactions: ["❤️"],
    },
    {
      id: "m6",
      roomId: "bywind",
      kind: "emoji",
      from: "other",
      emoji: "🤪",
    },
  ],
  william: [
    {
      id: "wm1",
      roomId: "william",
      kind: "text",
      from: "other",
      text: "Hey, did you review the first plan?",
    },
    {
      id: "wm2",
      roomId: "william",
      kind: "text",
      from: "me",
      text: "Yeah, I think we can iterate on it. What about the second plan?",
    },
    {
      id: "wm3",
      roomId: "william",
      kind: "text",
      from: "other",
      text: "What about the second plan?",
    },
  ],
  natali: [
    { id: "nm1", roomId: "natali", kind: "text", from: "other", text: "Hi" },
    {
      id: "nm2",
      roomId: "natali",
      kind: "text",
      from: "me",
      text: "Hey! How's the design going?",
    },
  ],
  drew: [
    {
      id: "dm1",
      roomId: "drew",
      kind: "text",
      from: "other",
      text: "Let's go fishing this weekend!",
    },
    {
      id: "dm2",
      roomId: "drew",
      kind: "text",
      from: "other",
      text: "Hey, you wanna join us?",
    },
  ],
  "bruce-james": [
    {
      id: "bm1",
      roomId: "bruce-james",
      kind: "text",
      from: "other",
      text: "You have a new follower",
    },
  ],
  orlando: [
    {
      id: "om1",
      roomId: "orlando",
      kind: "text",
      from: "me",
      text: "Hey man, you got a minute?",
    },
    {
      id: "om2",
      roomId: "orlando",
      kind: "text",
      from: "other",
      text: "Nah man sorry i don't. Shooting something right now.",
    },
  ],
  "sarah-michael": [
    {
      id: "sm1",
      roomId: "sarah-michael",
      kind: "text",
      from: "other",
      text: "Yes, I think it's a great idea.",
    },
    {
      id: "sm2",
      roomId: "sarah-michael",
      kind: "text",
      from: "me",
      text: "Let's ship it next week.",
    },
  ],
  andi: [
    {
      id: "am1",
      roomId: "andi",
      kind: "text",
      from: "other",
      text: "Re: New mail settings",
    },
    {
      id: "am2",
      roomId: "andi",
      kind: "text",
      from: "other",
      text: "Will you answer when the email comes in?",
    },
  ],
  group: [
    {
      id: "gm1",
      roomId: "group",
      kind: "text",
      from: "other",
      text: "You have a new follower",
    },
  ],
  john: [
    {
      id: "jm1",
      roomId: "john",
      kind: "text",
      from: "other",
      text: "There's a bug you need to deal with.",
    },
    {
      id: "jm2",
      roomId: "john",
      kind: "text",
      from: "me",
      text: "Can you share the reproduction steps?",
    },
  ],
  kate: [
    {
      id: "km1",
      roomId: "kate",
      kind: "text",
      from: "other",
      text: "I think we should use the first version.",
    },
    {
      id: "km2",
      roomId: "kate",
      kind: "text",
      from: "me",
      text: "Agreed. Let me update the PR.",
    },
  ],
  threads: [
    {
      id: "tm1",
      roomId: "threads",
      kind: "text",
      from: "other",
      text: "You have a new follower",
    },
  ],
  koray: [
    {
      id: "kom1",
      roomId: "koray",
      kind: "text",
      from: "other",
      text: "Let's talk about the search box interaction tomorrow.",
    },
    {
      id: "kom2",
      roomId: "koray",
      kind: "text",
      from: "me",
      text: "Sure. 10 AM your time?",
    },
  ],
};
