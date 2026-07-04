import re

with open('/app/applet/src/app/dashboard/learner/page.tsx', 'r') as f:
    content = f.read()

target = "const statuses = await fetchLessonStatuses(profileData.school_id);"
replacement = "const statuses = await fetchLessonStatuses(profileData.school_id, profileData.grade);"
content = content.replace(target, replacement)

with open('/app/applet/src/app/dashboard/learner/page.tsx', 'w') as f:
    f.write(content)
print("Updated learner page")
