import { supabase } from './supabaseClient'

// ── Flagged keyword list ───────────────────────────────
const SPAM_KEYWORDS = [
  // Advertising / solicitation
  'buy now', 'click here', 'free money', 'earn cash', 'make money fast',
  'limited offer', 'act now', 'sign up now', 'visit my', 'check out my',
  'promo code', 'discount code', 'referral',

  // Explicit / inappropriate
  'porn', 'xxx', 'onlyfans', 'nude', 'sex',

  // Scam indicators
  'venmo me', 'cashapp me', 'send money', 'wire transfer', 'crypto',
  'bitcoin', 'investment opportunity', 'guaranteed profit',

  // Spam patterns
  'test test test', 'asdf', 'aaaa', 'zzzz', '1234567',
]

// ── Check: keyword match ───────────────────────────────
function containsSpamKeyword(text) {
  if (!text) return null
  const lower = text.toLowerCase()
  return SPAM_KEYWORDS.find(kw => lower.includes(kw)) || null
}

// ── Check: suspiciously short or repetitive content ───
function isLowQualityContent(text) {
  if (!text) return false
  const trimmed = text.trim()

  // Too short
  if (trimmed.length < 5) return true

  // All same character repeated (e.g. "aaaaaaa")
  if (/^(.)\1{4,}$/.test(trimmed)) return true

  // All numbers
  if (/^\d+$/.test(trimmed)) return true

  return false
}

// ── Check: duplicate post from same user ──────────────
async function isDuplicatePost(userId, course, building) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('posts')
    .select('id')
    .eq('user_id', userId)
    .eq('course', course)
    .eq('building', building)
    .gte('created_at', oneHourAgo)
    .limit(1)

  return data && data.length > 0
}

// ── Check: rate limit (max 3 posts per hour) ──────────
async function isRateLimited(userId) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { count } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo)

  return count >= 3
}

// ── Main parser — returns { ok, reason } ──────────────
export async function checkForSpam(userId, form) {
  const combinedText = `${form.topic || ''} ${form.course || ''} ${form.notes || ''}`

  // 1. Keyword check
  const flaggedWord = containsSpamKeyword(combinedText)
  if (flaggedWord) {
    return {
      ok: false,
      reason: `Your post contains content that isn't allowed ("${flaggedWord}"). Please revise and try again.`
    }
  }

  // 2. Low quality content check
  if (isLowQualityContent(form.topic) || isLowQualityContent(form.course)) {
    return {
      ok: false,
      reason: 'Please add a meaningful course name and description before posting.'
    }
  }

  // 3. Rate limit check
  const rateLimited = await isRateLimited(userId)
  if (rateLimited) {
    return {
      ok: false,
      reason: 'You\'ve posted 3 sessions in the last hour. Please wait before posting again.'
    }
  }

  // 4. Duplicate post check
  const buildingValue = form.room ? `${form.building}, ${form.room}` : form.building
  const duplicate = await isDuplicatePost(userId, form.topic, buildingValue)
  if (duplicate) {
    return {
      ok: false,
      reason: 'You already posted a session for this course at this location recently. Please check your existing posts.'
    }
  }

  return { ok: true, reason: null }
}
