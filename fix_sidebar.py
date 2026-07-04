import re

with open('/app/applet/src/components/dashboard/RoleSidebar.tsx', 'r') as f:
    content = f.read()

target = """      case 'super_admin':
        return [
          { href: `${base}/admin`, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: `${base}/admin/schools`, label: 'Schools', icon: <BookOpen className="w-5 h-5" /> },
          { href: `${base}/admin/users`, label: 'Users', icon: <Users className="w-5 h-5" /> },
        ];"""
replacement = """      case 'super_admin':
        return [
          { href: `${base}/admin`, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: `${base}/admin/schools`, label: 'Schools', icon: <School className="w-5 h-5" /> },
          { href: `${base}/admin/curriculum`, label: 'Curriculums', icon: <BookOpen className="w-5 h-5" /> },
          { href: `${base}/admin/users`, label: 'Users', icon: <Users className="w-5 h-5" /> },
        ];"""
content = content.replace(target, replacement)

with open('/app/applet/src/components/dashboard/RoleSidebar.tsx', 'w') as f:
    f.write(content)
print("Updated RoleSidebar")
