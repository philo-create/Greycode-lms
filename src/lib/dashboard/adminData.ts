import { supabase } from '../supabase';

export async function getSuperAdminData() {
  const defaultData = {
    stats: {
      schools: 0,
      learners: 0,
      teachers: 0,
      classes: 0,
    },
    recentSchools: [],
    capsProgress: 65,
    practicalAssessments: 42
  };

  try {
    if (!supabase) return defaultData;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return defaultData;
    }

    const response = await fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to fetch admin stats:', await response.text());
      return defaultData;
    }
  } catch (err) {
    console.error('Failed in getSuperAdminData, returning default stats:', err);
    return defaultData;
  }
}
