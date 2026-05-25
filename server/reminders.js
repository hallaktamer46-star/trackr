import cron from 'node-cron'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

async function sendReminders() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.RESEND_API_KEY) {
    console.log('Reminders: missing env vars, skipping')
    return
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const resend = new Resend(process.env.RESEND_API_KEY)
  const today = new Date().toISOString().split('T')[0]

  const { data: applications, error } = await supabase
    .from('applications')
    .select('*')
    .eq('reminder_date', today)

  if (error) { console.error('Reminders: DB error', error); return }
  if (!applications?.length) { console.log(`Reminders: none for ${today}`); return }

  // Group by user
  const byUser = {}
  for (const app of applications) {
    if (!byUser[app.user_id]) byUser[app.user_id] = []
    byUser[app.user_id].push(app)
  }

  for (const [userId, apps] of Object.entries(byUser)) {
    try {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId)
      if (!user?.email) continue

      const appUrl = process.env.APP_URL || 'https://trackr-taupe.vercel.app'

      await resend.emails.send({
        from: 'Trackr <onboarding@resend.dev>',
        to: user.email,
        subject: `${apps.length} follow-up${apps.length > 1 ? 's' : ''} due today — Trackr`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0f172a;">
            <h2 style="margin:0 0 8px;">You have ${apps.length} follow-up${apps.length > 1 ? 's' : ''} due today</h2>
            <p style="color:#64748b;margin:0 0 24px;">Here are the applications you flagged for today:</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              ${apps.map(a => `
                <div style="padding:14px 18px;border-bottom:1px solid #e2e8f0;">
                  <strong>${a.company}</strong>
                  <span style="color:#64748b;"> — ${a.job_title}</span>
                  <span style="float:right;font-size:12px;background:#e0f2fe;color:#0369a1;padding:2px 10px;border-radius:999px;">${a.status}</span>
                </div>
              `).join('')}
            </div>
            <a href="${appUrl}" style="background:#0ea5e9;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;display:inline-block;">Open Trackr</a>
            <p style="color:#94a3b8;font-size:12px;margin-top:32px;">You're receiving this because you set a reminder in Trackr.</p>
          </div>
        `,
      })

      console.log(`Reminder sent → ${user.email} (${apps.length} app${apps.length > 1 ? 's' : ''})`)
    } catch (err) {
      console.error(`Reminder failed for user ${userId}:`, err.message)
    }
  }
}

// Run every day at 08:00 UTC
export function startReminderCron() {
  cron.schedule('0 8 * * *', sendReminders)
  console.log('Reminder cron: daily at 08:00 UTC')
}

// Export for manual trigger (testing)
export { sendReminders }
