import { Hash, Shield, Settings, Star, Music, Search, Filter, RefreshCw, Zap, Users, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'

const Commands = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [commands, setCommands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Category icons mapping
  const categoryIcons = {
    'General': Hash,
    'Moderation': Shield,
    'Admin': Settings,
    'Fun': Star,
    'Music': Music,
    'Utility': Zap,
    'Info': MessageSquare,
    'Social': Users
  }

  // Category colors mapping
  const categoryColors = {
    'General': 'blue',
    'Moderation': 'red',
    'Admin': 'gray',
    'Fun': 'orange',
    'Music': 'green',
    'Utility': 'purple',
    'Info': 'cyan',
    'Social': 'pink'
  }

  // Default fallback commands in case API fails
  const defaultCategories = [
    {
      name: 'General',
      icon: Hash,
      commands: [
        { name: 'help', description: 'Show help information', usage: '/help [command]' },
        { name: 'ping', description: 'Check bot latency', usage: '/ping' },
        { name: 'info', description: 'Display bot information', usage: '/info' },
        { name: 'avatar', description: 'Show user avatar', usage: '/avatar [@user]' },
        { name: 'serverinfo', description: 'Display server information', usage: '/serverinfo' }
      ],
      color: 'blue'
    },
    {
      name: 'Moderation',
      icon: Shield,
      commands: [
        { name: 'ban', description: 'Ban a user from the server', usage: '/ban @user [reason]' },
        { name: 'kick', description: 'Kick a user from the server', usage: '/kick @user [reason]' },
        { name: 'mute', description: 'Mute a user', usage: '/mute @user [duration]' },
        { name: 'warn', description: 'Warn a user', usage: '/warn @user <reason>' },
        { name: 'clear', description: 'Clear messages', usage: '/clear <amount>' }
      ],
      color: 'red'
    }
  ]

  useEffect(() => {
    fetchCommands()
  },)

  const fetchCommands = async () => {
    try {
      setError(null)
      setLoading(true)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/commands`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data) // Debug log
        
        // Process API data into our category structure
        const processedCategories = processApiCommands(data)
        setCommands(processedCategories)
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to fetch commands:', error)
      setError(error.message)
      
      // Use default categories as fallback
      setCommands(defaultCategories)
    } finally {
      setLoading(false)
    }
  }

  const processApiCommands = (apiCommands) => {
    console.log('Processing commands:', apiCommands) // Debug log
    
    if (!apiCommands || !Array.isArray(apiCommands)) {
      console.warn('Invalid API response format')
      return defaultCategories
    }

    // Create a map to group commands by category
    const categoryMap = new Map()
    
    // Process API commands
    apiCommands.forEach(cmd => {
      const category = cmd.category || 'General'
      
      if (!categoryMap.has(category)) {
        // Create new category if not exists
        categoryMap.set(category, {
          name: category,
          icon: categoryIcons[category] || Hash,
          commands: [],
          color: categoryColors[category] || 'blue'
        })
      }
      
      categoryMap.get(category).commands.push({
        name: cmd.name,
        description: cmd.description || 'No description available',
        usage: cmd.usage || `/${cmd.name}`
      })
    })
    
    // If no commands were processed, return defaults
    if (categoryMap.size === 0) {
      console.warn('No commands processed from API, using defaults')
      return defaultCategories
    }
    
    // Convert map back to array
    const processedCategories = Array.from(categoryMap.values())
    console.log('Processed categories:', processedCategories) // Debug log
    
    return processedCategories
  }

  // Use either fetched commands or default categories
  const commandCategories = commands.length > 0 ? commands : defaultCategories

  const filteredCategories = commandCategories.map(category => ({
    ...category,
    commands: category.commands.filter(cmd => 
      cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => 
    selectedCategory === 'all' || category.name.toLowerCase() === selectedCategory
  ).filter(category => category.commands.length > 0)

  const allCommands = commandCategories.flatMap(cat => 
    cat.commands.map(cmd => ({ ...cmd, category: cat.name, color: cat.color }))
  )
  
  const filteredAllCommands = allCommands.filter(cmd => 
    (cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cmd.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === 'all' || cmd.category.toLowerCase() === selectedCategory)
  )

  const totalCommands = commandCategories.reduce((total, category) => total + category.commands.length, 0)

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-l-blue-500',
      red: 'border-l-red-500',
      gray: 'border-l-gray-500', 
      orange: 'border-l-orange-500',
      green: 'border-l-green-500',
      purple: 'border-l-purple-500',
      cyan: 'border-l-cyan-500',
      pink: 'border-l-pink-500'
    }
    return colors[color] || colors.blue
  }

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredCategories.map((category, index) => {
        const Icon = category.icon
        return (
          <div key={index} className={`bg-surface border border-border ${getColorClasses(category.color)} border-l-4 rounded-lg p-4 hover:-translate-y-1 transition-all`}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
              <Icon size={18} className="text-text-muted" />
              <h3 className="text-sm font-semibold text-white flex-1">{category.name}</h3>
              <span className="text-xs bg-surface-light px-2 py-1 rounded-full text-text-muted">
                {category.commands.length}
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {category.commands.map((command, cmdIndex) => (
                <div key={cmdIndex} className="p-2 bg-surface-light rounded border border-border hover:bg-border transition-colors">
                  <div className="flex items-center gap-1 mb-1">
                    <code className="text-primary font-semibold text-xs">/{command.name}</code>
                  </div>
                  <p className="text-xs text-text-muted mb-1">{command.description}</p>
                  <div className="text-xs text-text-muted font-mono bg-background px-1 py-0.5 rounded border border-border">
                    {command.usage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  const ListView = () => (
    <div className="space-y-3">
      {filteredAllCommands.map((command, index) => (
        <div key={index} className={`bg-surface border border-border ${getColorClasses(command.color)} border-l-4 rounded-lg p-4 hover:-translate-y-1 transition-all`}>
          <div className="flex items-center gap-3 mb-2">
            <code className="text-lg font-bold text-primary">/{command.name}</code>
            <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">
              {command.category}
            </span>
          </div>
          <p className="text-text-muted mb-3">{command.description}</p>
          <div className="bg-surface-light p-2 rounded border border-border">
            <span className="text-white font-medium text-sm">Usage: </span>
            <code className="text-text-muted font-mono text-sm">{command.usage}</code>
          </div>
        </div>
      ))}
    </div>
  )

  const CompactView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {filteredAllCommands.map((command, index) => (
        <div key={index} className={`bg-surface border border-border ${getColorClasses(command.color)} border-l-3 rounded-lg p-3 hover:-translate-y-1 transition-all`}>
          <div className="flex justify-between items-center mb-2">
            <code className="text-primary font-semibold text-sm">/{command.name}</code>
            <span className="text-xs bg-surface-light px-1 py-0.5 rounded text-text-muted">
              {command.category}
            </span>
          </div>
          <p className="text-xs text-text-muted">{command.description}</p>
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-white">
        <div className="w-8 h-8 border-3 border-border border-t-primary rounded-full spinning mb-3"></div>
        <p>Loading commands...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col p-4 bg-background text-white">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent mb-1">
              Commands
            </h2>
            <p className="text-text-muted text-sm">
              {error ? 'Showing default commands (API unavailable)' : `Manage and view all ${totalCommands} available bot commands`}
            </p>
          </div>
          <button 
            onClick={fetchCommands} 
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 disabled:opacity-50"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
        
        {/* Error Banner */}
        {error && (
          <div className="mt-3 bg-red-900/20 border border-red-500/30 rounded-lg p-3 flex items-center justify-between text-red-400 text-sm">
            <span>⚠️ API Error: {error}</span>
            <button 
              onClick={fetchCommands} 
              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search commands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 bg-surface-light border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-48 text-sm"
            />
          </div>
          
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-surface-light border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="all">All Categories</option>
              {commandCategories.map(cat => (
                <option key={cat.name} value={cat.name.toLowerCase()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex gap-1 bg-surface-light p-1 rounded-lg">
          {['grid', 'list', 'compact'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded text-sm capitalize transition-all ${
                viewMode === mode 
                  ? 'bg-primary text-white' 
                  : 'text-text-muted hover:text-white hover:bg-border'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-surface border border-border rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-primary">{filteredAllCommands.length}</div>
          <div className="text-xs text-text-muted">Showing</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-primary">{filteredCategories.length}</div>
          <div className="text-xs text-text-muted">Categories</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-primary">
            {error ? 'Offline' : 'Online'}
          </div>
          <div className="text-xs text-text-muted">Status</div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'grid' && <GridView />}
        {viewMode === 'list' && <ListView />}
        {viewMode === 'compact' && <CompactView />}

        {/* No Results */}
        {filteredAllCommands.length === 0 && (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-white mb-2">No commands found</h3>
            <p className="text-text-muted text-sm">Try adjusting your search term or filter settings.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Commands