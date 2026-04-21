import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const payload = await req.json()
  const record = payload.record // { id, post_id, user_id, created_at }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get the post + owner's name
  const { data: post } = await supabase
    .from('posts')
    .select('course, time, building, user_id, profiles(full_name)')
    .eq('id', record.post_id)
    .single()

  if (!post) return new Response('Post not found', { status: 404 })

  // Get owner's email
  const { data: { user: owner } } = await supabase.auth.admin.getUserById(post.user_id)

  // Get joiner's name and email
  const { data: joinerProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', record.user_id)
    .single()
  const { data: { user: joiner } } = await supabase.auth.admin.getUserById(record.user_id)

  if (!owner?.email) return new Response('Owner email not found', { status: 404 })

  const joinerName = joinerProfile?.full_name || joiner?.email || 'Someone'
  const ownerName = (post.profiles as any)?.full_name || 'there'
  const sessionTime = post.time
    ? new Date(post.time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : 'N/A'

  // Send via Resend
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'StudyBuddy <notifications@studybuddyuta.com>',
      to: owner.email,
      subject: `${joinerName} joined your study session: ${post.course}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #2d7a6b;">Someone joined your study session!</h2>
          <p>Hi ${ownerName},</p>
          <p><strong>${joinerName}</strong> just joined your session:</p>
          <div style="background: #f5f0e8; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Course:</strong> ${post.course}</p>
            <p style="margin: 4px 0;"><strong>Time:</strong> ${sessionTime}</p>
            <p style="margin: 4px 0;"><strong>Location:</strong> ${post.building}</p>
          </div>
          <p>Log in to <a href="https://studybuddyuta.com">StudyBuddy</a> to message them.</p>
          <p style="color: #888; font-size: 0.85em; margin-top: 30px;">— The StudyBuddy Team</p>
        </div>
      `,
    }),
  })

  const resBody = await res.json()
  console.log('Resend response:', resBody)

  return new Response(JSON.stringify({ ok: res.ok }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
