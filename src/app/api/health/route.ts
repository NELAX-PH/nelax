import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const health: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
    };

    // Check database connectivity
    // let dbStatus = 'connected';
    // try {
    //   const supabase = createServerComponentClient();
    //   const { error } = await supabase.from('profiles').select('id').limit(1);
    //   if (error) {
    //     dbStatus = 'disconnected';
    //     health.status = 'degraded';
    //   }
    // } catch (error) {
    //   dbStatus = 'error';
    //   health.status = 'degraded';
    // }
    // health.database = dbStatus;

    // Add database placeholder for now
    health.database = 'not configured';

    logger.info('Health check requested', {
      status: health.status,
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    logger.error('Health check endpoint error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
