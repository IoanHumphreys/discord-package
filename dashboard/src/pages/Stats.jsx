const Stats = () => {
  return (
    <div className="h-screen p-6 bg-background text-white overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent mb-2">
          Statistics
        </h2>
        <p className="text-text-muted">Detailed analytics and performance metrics</p>
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Command Usage */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Command Usage</h3>
          <p className="text-text-muted mb-6">Track which commands are used most frequently</p>
          <div className="bg-surface-light border border-border rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-text-muted">Charts and analytics will be implemented here</p>
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">User Activity</h3>
          <p className="text-text-muted mb-6">Track user interactions and engagement patterns</p>
          <div className="bg-surface-light border border-border rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-text-muted">User activity heatmaps and trends</p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Stats
