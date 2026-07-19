import { withRouteHandler } from '@/shared/utils/handleRoute';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase';
import { checkTaskAccess } from '@/server/services/attachment.service';
import { v4 as uuidv4 } from 'uuid';

export const POST = withRouteHandler(async (req: NextRequest) => {
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
  const fileExt = fileName.split('.').pop()?.toLowerCase();

  // File type validation
  const allowedExts = ['pdf', 'doc', 'docx', 'txt'];
  if (!fileExt || !allowedExts.includes(fileExt)) {
    return NextResponse.json(
      {
        error: 'Invalid file format. Only PDF, DOC, DOCX, and TXT are allowed.',
      },
      { status: 400 }
    );
  }

  const filePath = `tasks/${taskId}-${uuidv4()}.${fileExt}`;

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
});
