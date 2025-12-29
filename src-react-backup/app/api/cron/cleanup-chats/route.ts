import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ChatSession from '../../../../../backend/models/ChatSession.js';

async function ensureDB() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGO_URI || '';
  if (!uri) throw new Error('MONGO_URI is not set');
  await mongoose.connect(uri);
}

export async function GET() {
  try {
    await ensureDB();

    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await ChatSession.deleteMany({ lastMessageAt: { $lt: cutoff } });

    return NextResponse.json({ ok: true, deleted: result.deletedCount, cutoff: cutoff.toISOString() });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
