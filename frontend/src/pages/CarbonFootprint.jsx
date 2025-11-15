import React, { useState } from 'react';
import { Leaf, Car, Home, Plane, ShoppingBag, Lightbulb, TrendingDown, Sparkles } from 'lucide-react';

const CarbonFootprintTracker = () => {
  const [activities, setActivities] = useState([]);
  const [input, setInput] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Simulated AI analysis (in production, this would call an actual AI API)
  const analyzeWithAI = (activityText) => {
    const text = activityText.toLowerCase();
    
    // Pattern matching to simulate AI understanding
    if (text.includes('drive') || text.includes('car') || text.includes('km') || text.includes('mile')) {
      const distance = text.match(/\d+/)?.[0] || 50;
      return {
        category: 'transportation',
        icon: 'Car',
        emissions: parseFloat((distance * 0.21).toFixed(2)), // kg CO2 per km
        activity: `Drove ${distance}km by car`,
        suggestions: [
          'Consider carpooling to reduce emissions by 50%',
          'Use public transport for 75% less emissions',
          'Try biking for short distances under 5km'
        ]
      };
    }
    
    if (text.includes('flight') || text.includes('fly') || text.includes('plane')) {
      return {
        category: 'transportation',
        icon: 'Plane',
        emissions: 250,
        activity: 'Took a flight',
        suggestions: [
          'Choose direct flights when possible',
          'Consider train travel for distances under 500km',
          'Offset emissions through verified carbon programs'
        ]
      };
    }
    
    if (text.includes('electricity') || text.includes('power') || text.includes('kwh')) {
      const kwh = text.match(/\d+/)?.[0] || 100;
      return {
        category: 'energy',
        icon: 'Lightbulb',
        emissions: parseFloat((kwh * 0.5).toFixed(2)),
        activity: `Used ${kwh} kWh electricity`,
        suggestions: [
          'Switch to LED bulbs for 75% energy savings',
          'Use smart thermostats to optimize heating/cooling',
          'Consider solar panels for long-term savings'
        ]
      };
    }
    
    if (text.includes('meat') || text.includes('beef') || text.includes('steak')) {
      return {
        category: 'food',
        icon: 'ShoppingBag',
        emissions: 27,
        activity: 'Ate beef meal',
        suggestions: [
          'Try plant-based alternatives 2-3 times per week',
          'Choose chicken or fish (70% lower emissions)',
          'Support local, sustainable farms'
        ]
      };
    }
    
    if (text.includes('shopping') || text.includes('bought') || text.includes('purchase')) {
      return {
        category: 'consumption',
        icon: 'ShoppingBag',
        emissions: 15,
        activity: 'Shopping/Purchase',
        suggestions: [
          'Buy second-hand when possible',
          'Choose quality items that last longer',
          'Support brands with carbon-neutral commitments'
        ]
      };
    }
    
    if (text.includes('heating') || text.includes('cooling') || text.includes('ac')) {
      return {
        category: 'energy',
        icon: 'Home',
        emissions: 45,
        activity: 'Home heating/cooling',
        suggestions: [
          'Improve insulation to reduce energy use by 30%',
          'Set thermostat 2°C lower in winter',
          'Use fans instead of AC when possible'
        ]
      };
    }
    
    // Default fallback
    return {
      category: 'other',
      icon: 'Leaf',
      emissions: 10,
      activity: activityText,
      suggestions: [
        'Track your activities regularly for insights',
        'Small daily changes compound over time',
        'Share tips with friends and family'
      ]
    };
  };

  const handleAddActivity = () => {
    if (!input.trim()) return;
    
    const analysis = analyzeWithAI(input);
    const newActivity = {
      id: Date.now(),
      ...analysis,
      timestamp: new Date().toLocaleString()
    };
    
    setActivities([newActivity, ...activities]);
    setAiSuggestion(analysis.suggestions[Math.floor(Math.random() * analysis.suggestions.length)]);
    setShowSuggestion(true);
    setInput('');
    
    setTimeout(() => setShowSuggestion(false), 5000);
  };

  const totalEmissions = activities.reduce((sum, activity) => sum + activity.emissions, 0);

  const getIcon = (iconName) => {
    const icons = { Car, Home, Plane, ShoppingBag, Lightbulb, Leaf };
    const Icon = icons[iconName] || Leaf;
    return <Icon size={20} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      transportation: 'bg-blue-500/20 text-blue-400',
      energy: 'bg-yellow-500/20 text-yellow-400',
      food: 'bg-green-500/20 text-green-400',
      consumption: 'bg-purple-500/20 text-purple-400',
      other: 'bg-gray-500/20 text-gray-400'
    };
    return colors[category] || colors.other;
  };

  const getImpactLevel = () => {
    if (totalEmissions < 50) return { level: 'Low', color: 'text-green-400', message: 'Great job! Keep it up!' };
    if (totalEmissions < 150) return { level: 'Moderate', color: 'text-yellow-400', message: 'Good start! Room to improve.' };
    return { level: 'High', color: 'text-red-400', message: 'Consider reducing your footprint.' };
  };

  const impact = getImpactLevel();

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl shadow-xl p-8 mb-6 border" style={{ backgroundColor: '#0b0b0b', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="text-green-400" size={36} />
            <h1 className="text-3xl font-bold text-white">AI Carbon Footprint Tracker</h1>
          </div>
          <p className="text-gray-400">Track your activities and get AI-powered suggestions to reduce your carbon footprint</p>
        </div>

        <div className="rounded-2xl shadow-xl p-8 mb-6 border" style={{ backgroundColor: '#0b0b0b', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
              <p className="text-sm text-gray-400 mb-1">Total Emissions</p>
              <p className="text-3xl font-bold text-green-400">{totalEmissions.toFixed(1)} kg</p>
              <p className="text-xs text-gray-500 mt-1">CO₂ equivalent</p>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
              <p className="text-sm text-gray-400 mb-1">Activities Logged</p>
              <p className="text-3xl font-bold text-blue-400">{activities.length}</p>
              <p className="text-xs text-gray-500 mt-1">Total entries</p>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/20">
              <p className="text-sm text-gray-400 mb-1">Impact Level</p>
              <p className={`text-3xl font-bold ${impact.color}`}>{impact.level}</p>
              <p className="text-xs text-gray-500 mt-1">{impact.message}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
              placeholder="Describe your activity (e.g., 'drove 30km', 'took a flight', 'ate beef')"
              className="flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500"
              style={{ backgroundColor: '#0a0a0a', border: '2px solid rgba(255, 255, 255, 0.2)' }}
            />
            <button
              onClick={handleAddActivity}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
            >
              <Sparkles size={20} />
              Analyze
            </button>
          </div>

          {showSuggestion && (
            <div className="mt-4 bg-green-500/10 rounded-xl p-4 border-2 border-green-500/30">
              <div className="flex items-start gap-3">
                <Lightbulb className="text-yellow-400 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-white">AI Suggestion</p>
                  <p className="text-gray-300">{aiSuggestion}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl shadow-xl p-8 border" style={{ backgroundColor: '#0b0b0b', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingDown className="text-green-400" />
            Activity Log
          </h2>
          
          {activities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Leaf size={48} className="mx-auto mb-4 opacity-30" />
              <p>No activities logged yet. Start tracking to see your carbon footprint!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="rounded-xl p-4 hover:bg-white/5 transition-colors border" style={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${getCategoryColor(activity.category)}`}>
                        {getIcon(activity.icon)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{activity.activity}</p>
                        <p className="text-sm text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{activity.emissions}</p>
                      <p className="text-xs text-gray-500">kg CO₂</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl shadow-xl p-6 mt-6 border bg-gradient-to-r from-blue-600/20 to-green-600/20" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <h3 className="font-semibold text-lg mb-2 text-white">💡 Quick Tips</h3>
          <ul className="space-y-1 text-sm text-gray-300">
            <li>• Try describing: "drove 50km", "used 100 kwh electricity", "took a flight", "ate beef"</li>
            <li>• Average person emits ~10,000 kg CO₂ per year</li>
            <li>• Goal: Aim for under 2,000 kg to meet climate targets</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprintTracker;