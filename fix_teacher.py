import re

with open('/app/applet/src/app/dashboard/teacher/preparation/page.tsx', 'r') as f:
    content = f.read()

target_fetch = """        if (profileData?.school_id) {
          setSchoolId(profileData.school_id);
          const statuses = await fetchLessonStatuses(profileData.school_id);
          setLessonStatuses(statuses);
        }"""
replacement_fetch = """        if (profileData?.school_id) {
          setSchoolId(profileData.school_id);
          // We will fetch statuses when activeGrade changes, but we can do an initial fetch if grade is single
        }"""
content = content.replace(target_fetch, replacement_fetch)

# Add effect to fetch statuses when grade changes
target_effect = """  const handleExitMap = () => {
    setActiveGrade(null);
  };"""
replacement_effect = """  useEffect(() => {
    if (activeGrade && schoolId) {
      fetchLessonStatuses(schoolId, activeGrade).then(setLessonStatuses);
    }
  }, [activeGrade, schoolId]);

  const handleExitMap = () => {
    setActiveGrade(null);
  };"""
content = content.replace(target_effect, replacement_effect)

# Update Dashboard props to pass teacherId
target_dash = """<Dashboard 
              activeStudentId={teacherId}"""
replacement_dash = """<Dashboard 
              activeStudentId={teacherId}
              teacherId={teacherId}"""
content = content.replace(target_dash, replacement_dash)

with open('/app/applet/src/app/dashboard/teacher/preparation/page.tsx', 'w') as f:
    f.write(content)
print("Updated teacher page")
