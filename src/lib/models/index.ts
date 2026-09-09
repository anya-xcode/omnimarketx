import mongoose, { Schema, type Model } from "mongoose";
import type { BlogPost, FeedPost, Group, Market, SupportTicket, Trade, Trader, User } from "@/lib/types";

const OutcomeSchema = new Schema({ id: String, label: String, price: Number }, { _id: false });
const PricePointSchema = new Schema({ t: Number, p: Schema.Types.Mixed }, { _id: false });

const MarketSchema = new Schema<Market>(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: String,
    category: { type: String, required: true, index: true },
    kind: { type: String, required: true },
    icon: String,
    outcomes: [OutcomeSchema],
    volume: { type: Number, default: 0, index: true },
    traders: { type: Number, default: 0 },
    liquidity: { type: Number, default: 0 },
    change24h: { type: Number, default: 0 },
    createdAt: { type: String, required: true },
    closesAt: { type: String, required: true },
    status: { type: String, default: "open" },
    resolution: String,
    resolutionSources: [String],
    tags: [String],
    featured: Boolean,
    region: String,
    history: [PricePointSchema],
    trendScore: { type: Number, default: 0, index: true },
  },
  { versionKey: false, timestamps: false },
);
MarketSchema.index({ title: "text", tags: "text" });

const FeedPostSchema = new Schema<FeedPost>(
  {
    id: { type: String, required: true, unique: true },
    author: { name: String, handle: String, avatarColor: String, verified: Boolean },
    body: { type: String, required: true },
    marketSlug: String,
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    reposts: { type: Number, default: 0 },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

const TraderSchema = new Schema<Trader>(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    handle: String,
    avatarColor: String,
    roi: Number,
    pnl: Number,
    volume: Number,
    winRate: Number,
    trades: Number,
    streak: Number,
    verified: Boolean,
    categories: [String],
  },
  { versionKey: false },
);

const BlogPostSchema = new Schema<BlogPost>(
  {
    slug: { type: String, required: true, unique: true },
    title: String,
    excerpt: String,
    category: String,
    gradient: String,
    emoji: String,
    author: String,
    publishedAt: String,
    readMinutes: Number,
    featured: Boolean,
  },
  { versionKey: false },
);

const GroupSchema = new Schema<Group>(
  { id: { type: String, required: true, unique: true }, name: String, description: String, members: Number, category: String, emoji: String },
  { versionKey: false },
);

const TradeSchema = new Schema<Trade>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    marketSlug: { type: String, required: true, index: true },
    marketTitle: String,
    outcomeId: String,
    outcomeLabel: String,
    side: String,
    shares: Number,
    price: Number,
    amount: Number,
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

const UserSchema = new Schema<User>(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    handle: String,
    balance: { type: Number, default: 10_000 },
    createdAt: String,
    watchlist: { type: [String], default: [] },
  },
  { versionKey: false },
);

const SupportTicketSchema = new Schema<SupportTicket>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    email: String,
    message: { type: String, required: true },
    transcript: [String],
    status: { type: String, default: "open" },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

const SubscriberSchema = new Schema({ email: { type: String, required: true, unique: true }, createdAt: String }, { versionKey: false });

function model<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) ?? mongoose.model<T>(name, schema);
}

export const MarketModel = model<Market>("Market", MarketSchema);
export const FeedPostModel = model<FeedPost>("FeedPost", FeedPostSchema);
export const TraderModel = model<Trader>("Trader", TraderSchema);
export const BlogPostModel = model<BlogPost>("BlogPost", BlogPostSchema);
export const GroupModel = model<Group>("Group", GroupSchema);
export const TradeModel = model<Trade>("Trade", TradeSchema);
export const UserModel = model<User>("User", UserSchema);
export const SubscriberModel = model("Subscriber", SubscriberSchema);
export const SupportTicketModel = model<SupportTicket>("SupportTicket", SupportTicketSchema);
