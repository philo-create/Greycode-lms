const fs = require('fs');
const file = 'src/app/dashboard/teacher/student/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add activitiesLoaded state
content = content.replace(
  'const [classPeers, setClassPeers] = useState<any[]>([]);',
  'const [classPeers, setClassPeers] = useState<any[]>([]);\n  const [activitiesLoaded, setActivitiesLoaded] = useState(false);'
);

// Update useEffect to set activitiesLoaded
const useEffectTarget = `        } catch (e) {
          console.error('Error parsing activities:', e);
        }
      }
    }
  }, [student?.grade]);`;

const useEffectReplacement = `        } catch (e) {
          console.error('Error parsing activities:', e);
        }
      }
      setActivitiesLoaded(true);
    }
  }, [student?.grade]);`;

content = content.replace(useEffectTarget, useEffectReplacement);

// Update subjectGrades memo
const memoTarget = `  const subjectGrades = React.useMemo(() => student?.progress?.subjectGrades || {}, [student]);`;

const memoReplacement = `  const subjectGrades = React.useMemo(() => {
    const raw = student?.progress?.subjectGrades || {};
    if (!activitiesLoaded) return raw;
    
    const validActivityIds = new Set(activities.map(a => a.id));
    const cleaned: Record<string, any[]> = {};
    
    for (const [subject, grades] of Object.entries(raw)) {
      cleaned[subject] = (grades as any[]).filter(g => 
        !g.activityId || validActivityIds.has(g.activityId)
      );
    }
    return cleaned;
  }, [student, activities, activitiesLoaded]);`;

content = content.replace(memoTarget, memoReplacement);

fs.writeFileSync(file, content);
console.log('Patched teacher student page');
