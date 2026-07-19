import { withRouteHandler } from '@/shared/utils/handleRoute';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import {
  deleteAttachment,
  getAttachment,
} from '@/server/services/attachment.service';
import { getServerSupabase } from '@/shared/utils/supabase/server';

export const GET = withRouteHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const attachment = await getAttachment((await params).id, session.user.id);
    const supabase = getServerSupabase();

    // The fileUrl stored in DB is actually the path inside the bucket, e.g., 'tasks/...'
    const { data, error } = await supabase.storage
      .from('attachments')
      .createSignedUrl(attachment.fileUrl, 60 * 5); // 5 minutes

    if (error || !data) {
      throw new Error(error?.message || 'Failed to generate signed URL');
    }

    return NextResponse.json({ url: data.signedUrl });
  }
);

export const DELETE = withRouteHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await deleteAttachment((await params).id, session.user.id);
    return NextResponse.json({ success: true });
  }
);
