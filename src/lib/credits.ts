import { db } from '@/lib/db';

export interface CreditTransactionInput {
  userId: string;
  amount: number;
  type: 'PURCHASE' | 'USAGE' | 'REFUND' | 'BONUS' | 'ADJUSTMENT';
  description?: string;
  metadata?: any;
}

export async function addCredits(input: CreditTransactionInput) {
  const result = await db.$transaction(async (tx) => {
    // Update user credits
    const updatedUser = await tx.user.update({
      where: { id: input.userId },
      data: {
        credits: {
          increment: input.amount,
        },
      },
    });

    // Create transaction record
    const transaction = await tx.creditTransaction.create({
      data: {
        userId: input.userId,
        amount: input.amount,
        type: input.type,
        description: input.description,
        metadata: input.metadata || {},
      },
    });

    return { user: updatedUser, transaction };
  });

  return result;
}

export async function deductUserCredits(input: CreditTransactionInput) {
  // Check if user has enough credits
  const user = await db.user.findUnique({
    where: { id: input.userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.credits < Math.abs(input.amount)) {
    throw new Error('Insufficient credits');
  }

  // Use negative amount for deduction
  const deductionInput = { ...input, amount: -Math.abs(input.amount) };
  return await addCredits(deductionInput);
}

export async function getUserCredits(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  return user?.credits || 0;
}

export async function getUserCreditTransactions(userId: string, limit = 50) {
  return await db.creditTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function checkCredits(userId: string, requiredAmount: number): Promise<boolean> {
  const credits = await getUserCredits(userId);
  return credits >= requiredAmount;
}

export async function consumeUserCredits(userId: string, amount: number, description?: string, metadata?: any) {
  if (!await checkCredits(userId, amount)) {
    throw new Error('Insufficient credits');
  }

  return await deductUserCredits({
    userId,
    amount,
    type: 'USAGE',
    description: description || `Credit usage: ${amount} credits`,
    metadata,
  });
}

export async function purchaseCredits(userId: string, amount: number, paymentMethod?: string) {
  return await addCredits({
    userId,
    amount,
    type: 'PURCHASE',
    description: `Credit purchase: ${amount} credits`,
    metadata: { paymentMethod },
  });
}

export async function refundCredits(userId: string, amount: number, reason?: string) {
  return await addCredits({
    userId,
    amount,
    type: 'REFUND',
    description: `Credit refund: ${amount} credits`,
    metadata: { reason },
  });
}

export async function addBonusCredits(userId: string, amount: number, reason?: string) {
  return await addCredits({
    userId,
    amount,
    type: 'BONUS',
    description: `Bonus credits: ${amount} credits`,
    metadata: { reason },
  });
}

export async function adjustCredits(userId: string, amount: number, reason?: string) {
  const transactionType = amount >= 0 ? 'ADJUSTMENT' : 'ADJUSTMENT';
  return await addCredits({
    userId,
    amount,
    type: transactionType,
    description: `Credit adjustment: ${amount} credits`,
    metadata: { reason },
  });
}

export async function getCreditStats(userId?: string) {
  const where = userId ? { userId } : {};
  
  const stats = await db.creditTransaction.groupBy({
    by: ['type'],
    where,
    _sum: {
      amount: true,
    },
    _count: {
      amount: true,
    },
  });

  return stats;
}