import { NextRequest, NextResponse } from 'next/server';
import { AppError } from './errors';
import { z } from 'zod';

export function handleRouteError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: error.errors[0].message },
      { status: 400 }
    );
  }
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  console.error(error); // Here we would connect Sentry or another logger
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export function withRouteHandler<T = unknown>(
  handler: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: NextRequest | Request | any,
    context: T
  ) => Promise<NextResponse> | NextResponse
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: NextRequest | Request | any, context: T) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleRouteError(error);
    }
  };
}
