import { NextRequest, NextResponse } from 'next/server';
import { invalidateUserTokens } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (refreshToken) {
      // Try to invalidate user tokens if refresh token exists
      try {
        const { verifyRefreshToken } = await import('@/lib/auth');
        const payload = verifyRefreshToken(refreshToken);
        if (payload) {
          await invalidateUserTokens(payload.userId);
        }
      } catch (error) {
        // Ignore errors during logout
        console.error('Error invalidating tokens during logout:', error);
      }
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Logged out successfully' });
  }
}