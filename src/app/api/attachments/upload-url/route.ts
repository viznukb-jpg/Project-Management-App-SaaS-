import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase';
import { checkTaskAccess } from '@/server/services/attachment.service';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { taskId, fileName, fileType, fileSize } = body;

    if (!taskId || !fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Basic validation
    if (fileSize > 10 * 1024 * 1024) {
      // 10MB limit
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Role check
    await checkTaskAccess(taskId, session.user.id);

    // Generate unique path
    const fileExt = fileName.split('.').pop();
    const filePath = `tasks/${taskId}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const supabase = getServerSupabase();

    // Create signed upload URL
    const { data, error } = await supabase.storage
      .from('attachments')
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      console.error('Signed URL Error:', error);
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      token: data.token,
      path: data.path,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
