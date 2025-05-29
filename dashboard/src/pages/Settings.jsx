const Settings = () => {
  return (
    <div className="h-screen p-6 bg-background text-white overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent mb-2">
          Settings
        </h2>
        <p className="text-text-muted">Configure your bot settings and preferences</p>
      </div>
      
      {/* Settings Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bot Configuration */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Bot Configuration</h3>
          <div className="space-y-6">
            <div>
              <label htmlFor="botName" className="block text-sm font-medium text-white mb-2">
                Bot Name
              </label>
              <input 
                type="text" 
                id="botName" 
                className="w-full px-4 py-3 bg-surface-light border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                defaultValue="Discord Bot" 
                placeholder="Enter bot name"
              />
            </div>
            
            <div>
              <label htmlFor="prefix" className="block text-sm font-medium text-white mb-2">
                Command Prefix
              </label>
              <input 
                type="text" 
                id="prefix" 
                className="w-full px-4 py-3 bg-surface-light border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                defaultValue="!" 
                placeholder="Enter command prefix"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-white mb-2">
                Bot Status
              </label>
              <select 
                id="status" 
                className="w-full px-4 py-3 bg-surface-light border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="online">Online</option>
                <option value="idle">Idle</option>
                <option value="dnd">Do Not Disturb</option>
                <option value="invisible">Invisible</option>
              </select>
            </div>

            <button className="w-full bg-primary hover:bg-primary-hover text-white py-3 px-4 rounded-lg font-medium transition-all hover:-translate-y-0.5">
              Save Settings
            </button>
          </div>
        </div>

        {/* Database Settings */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Database Settings</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Supabase Connection
              </label>
              <div className="flex items-center gap-3 p-4 bg-surface-light border border-border rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">Connected</span>
                <span className="ml-auto text-text-muted text-sm">Last checked: 2m ago</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-surface-light hover:bg-border text-white py-3 px-4 rounded-lg font-medium transition-all hover:-translate-y-0.5 border border-border">
                Test Connection
              </button>
              <button className="bg-surface-light hover:bg-border text-white py-3 px-4 rounded-lg font-medium transition-all hover:-translate-y-0.5 border border-border">
                View Tables
              </button>
            </div>

            <div className="bg-surface-light border border-border rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Database Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Tables:</span>
                  <span className="text-white">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Storage Used:</span>
                  <span className="text-white">12.5 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Last Backup:</span>
                  <span className="text-white">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Settings