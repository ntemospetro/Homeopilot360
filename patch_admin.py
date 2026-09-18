import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

if 'AdminNameChangeRequests' not in content:
    content = content.replace("import { AdminConfigEditor } from './AdminConfigEditor';", "import { AdminConfigEditor } from './AdminConfigEditor';\nimport { AdminNameChangeRequests } from './AdminNameChangeRequests';")

# Update activeTab state
if "'requests'" not in content:
    content = content.replace("useState<'therapists' | 'packages' | 'terms' | 'config'>('therapists')", "useState<'therapists' | 'packages' | 'terms' | 'config' | 'requests'>('therapists')")

# Add the new button to the sidebar
new_button = '''
        <button
          id="admin-tab-requests"
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-teal-50 text-teal-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Namensänderungen
        </button>
'''
if 'id="admin-tab-requests"' not in content:
    content = content.replace('        <button\n          id="admin-tab-config"', new_button + '        <button\n          id="admin-tab-config"')

# Add the tab content
new_content = '''
        {activeTab === 'requests' && <AdminNameChangeRequests />}
'''
if "activeTab === 'requests'" not in content:
    content = content.replace("{activeTab === 'config' && <AdminConfigEditor />}", "{activeTab === 'config' && <AdminConfigEditor />}\n" + new_content)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)
