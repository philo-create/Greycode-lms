import re

with open('/app/applet/src/components/dashboard/RoleSidebar.tsx', 'r') as f:
    content = f.read()

content = content.replace("BookOpen,", "BookOpen,\n  School,")

with open('/app/applet/src/components/dashboard/RoleSidebar.tsx', 'w') as f:
    f.write(content)
print("Updated RoleSidebar imports")
