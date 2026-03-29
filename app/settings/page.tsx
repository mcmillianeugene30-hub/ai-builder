"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState({
    name: "User Name",
    email: "user@example.com",
    defaultFramework: "next.js",
    defaultLanguage: "typescript",
    theme: "dark",
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-850 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold">Settings</h1>
            <Button variant="ghost" size="sm">Back</Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-6">Profile</h2>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
              <Input
                label="Name"
                value={userSettings.name}
                onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={userSettings.email}
                onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Preferences</h2>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Default Framework</label>
                <select
                  value={userSettings.defaultFramework}
                  onChange={(e) => setUserSettings({ ...userSettings, defaultFramework: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="next.js">Next.js</option>
                  <option value="react">React</option>
                  <option value="vue">Vue</option>
                  <option value="angular">Angular</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Default Language</label>
                <select
                  value={userSettings.defaultLanguage}
                  onChange={(e) => setUserSettings({ ...userSettings, defaultLanguage: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
                <select
                  value={userSettings.theme}
                  onChange={(e) => setUserSettings({ ...userSettings, theme: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Danger Zone</h2>
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Delete Account</h3>
              <p className="text-slate-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="danger">Delete Account</Button>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button variant="ghost">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
