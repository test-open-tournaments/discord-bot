import env from '@env'
import { createClient } from '@supabase/supabase-js'

import type { Database } from '~/types/database.types'

export const supabase = createClient<Database>(
	env.SUPABASE_URL,
	env.SUPABASE_SERVICE_ROLE_KEY
)
