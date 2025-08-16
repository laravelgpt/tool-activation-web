import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { errorTracker } from '@/lib/error-tracker';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const rules = errorTracker.getRules();

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Error fetching error rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch error rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, conditions, actions, enabled = true } = body;

    if (!name || !description || !conditions || !actions) {
      return NextResponse.json(
        { error: 'Name, description, conditions, and actions are required' },
        { status: 400 }
      );
    }

    const rule = await errorTracker.createRule({
      name,
      description,
      conditions,
      actions,
      enabled
    });

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Error creating error rule:', error);
    return NextResponse.json(
      { error: 'Failed to create error rule' },
      { status: 500 }
    );
  }
}