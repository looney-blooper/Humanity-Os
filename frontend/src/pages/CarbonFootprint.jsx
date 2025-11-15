import React, { useState, useEffect } from 'react';
import { 
  Leaf, Car, Home, Plane, ShoppingBag, Lightbulb, TrendingDown, 
  Sparkles, Trash2, Coffee, Utensils, Zap, Droplet, Recycle,
  Wind, Train, Bike, Package, Smartphone, Tv, AlertCircle, Target
} from 'lucide-react';

// Custom localStorage hook with error handling
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

const CarbonFootprintTracker = () => {
  const [activities, setActivities] = useLocalStorage('carbonActivities', []);
  const [input, setInput] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Enhanced AI analysis with comprehensive pattern matching and fallback logic
  const analyzeWithAI = (activityText) => {
    const text = activityText.toLowerCase();
    let matched = false;
    
    // Transportation patterns - Driving
    if ((text.includes('drive') || text.includes('drove') || text.includes('car')) && !matched) {
      const distance = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 50;
      const isMiles = text.includes('mile');
      const distanceKm = isMiles ? distance * 1.609 : distance;
      matched = true;
      return {
        category: 'transportation',
        icon: 'Car',
        emissions: parseFloat((distanceKm * 0.21).toFixed(2)),
        activity: `Drove ${distance}${isMiles ? ' miles' : 'km'} by car`,
        suggestions: [
          'Consider carpooling to reduce emissions by 50%',
          'Use public transport for 75% less emissions',
          'Try biking for short distances under 5km',
          'Electric vehicles produce 60% less CO2'
        ]
      };
    }
    
    // Transportation - Flights
    if ((text.includes('flight') || text.includes('fly') || text.includes('flew') || text.includes('plane')) && !matched) {
      let emissions = 250;
      let flightType = 'flight';
      
      if (text.includes('international') || text.includes('long')) {
        emissions = 1200;
        flightType = 'international flight';
      } else if (text.includes('domestic') || text.includes('short')) {
        emissions = 250;
        flightType = 'domestic flight';
      }
      
      matched = true;
      return {
        category: 'transportation',
        icon: 'Plane',
        emissions,
        activity: `Took a ${flightType}`,
        suggestions: [
          'Choose direct flights to reduce emissions by 20%',
          'Consider train travel for distances under 500km',
          'Video conferencing can eliminate flight needs',
          'Offset emissions through verified carbon programs'
        ]
      };
    }
    
    // Transportation - Public Transit
    if ((text.includes('bus') || text.includes('train') || text.includes('metro') || text.includes('subway') || text.includes('transit')) && !matched) {
      const distance = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 20;
      matched = true;
      return {
        category: 'transportation',
        icon: 'Train',
        emissions: parseFloat((distance * 0.04).toFixed(2)),
        activity: `Used public transit for ${distance}km`,
        suggestions: [
          'Great choice! Public transit is 80% cleaner than cars',
          'Consider a monthly pass for even more savings',
          'Combine with walking or biking for first/last mile'
        ]
      };
    }
    
    // Transportation - Bike
    if ((text.includes('bike') || text.includes('biked') || text.includes('bicycle') || text.includes('cycling')) && !matched) {
      matched = true;
      return {
        category: 'transportation',
        icon: 'Bike',
        emissions: 0,
        activity: 'Biked or walked (zero emissions!)',
        suggestions: [
          'Excellent! Zero emissions transportation',
          'Biking 10km saves 2.1kg CO2 vs. driving',
          'Consider an e-bike for longer distances'
        ]
      };
    }
    
    // Transportation - Taxi/Uber
    if ((text.includes('taxi') || text.includes('uber') || text.includes('lyft') || text.includes('cab')) && !matched) {
      const distance = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 15;
      matched = true;
      return {
        category: 'transportation',
        icon: 'Car',
        emissions: parseFloat((distance * 0.25).toFixed(2)),
        activity: `Took taxi/rideshare for ${distance}km`,
        suggestions: [
          'Choose shared rides to cut emissions in half',
          'Use public transit when possible',
          'Walk or bike for trips under 3km'
        ]
      };
    }
    
    // Energy - Electricity
    if ((text.includes('electricity') || text.includes('power') || text.includes('kwh')) && !matched) {
      const kwh = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 100;
      matched = true;
      return {
        category: 'energy',
        icon: 'Zap',
        emissions: parseFloat((kwh * 0.5).toFixed(2)),
        activity: `Used ${kwh} kWh electricity`,
        suggestions: [
          'Switch to renewable energy providers',
          'LED bulbs use 75% less energy',
          'Unplug devices when not in use (phantom power)',
          'Smart thermostats can reduce usage by 20%'
        ]
      };
    }
    
    // Energy - Heating/Cooling
    if ((text.includes('heating') || text.includes('cooling') || text.includes('ac') || text.includes('air condition') || text.includes('hvac')) && !matched) {
      const hours = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 8;
      matched = true;
      return {
        category: 'energy',
        icon: 'Home',
        emissions: parseFloat((hours * 2.5).toFixed(2)),
        activity: `Used heating/cooling for ${hours} hours`,
        suggestions: [
          'Improve insulation to reduce energy by 30%',
          'Set thermostat 2°C lower in winter/higher in summer',
          'Use programmable thermostats',
          'Ceiling fans use 98% less energy than AC'
        ]
      };
    }
    
    // Energy - Gas/Natural Gas
    if ((text.includes('gas') || text.includes('natural gas') || text.includes('heating gas')) && !matched) {
      const amount = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 50;
      matched = true;
      return {
        category: 'energy',
        icon: 'Droplet',
        emissions: parseFloat((amount * 0.2).toFixed(2)),
        activity: `Used ${amount} units of natural gas`,
        suggestions: [
          'Consider heat pump alternatives',
          'Improve home insulation',
          'Service boiler annually for efficiency',
          'Lower water heater temperature to 120°F'
        ]
      };
    }
    
    // Food - Beef
    if ((text.includes('beef') || text.includes('steak') || text.includes('burger') || text.includes('red meat')) && !matched) {
      const servings = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 1;
      matched = true;
      return {
        category: 'food',
        icon: 'Utensils',
        emissions: parseFloat((servings * 27).toFixed(2)),
        activity: `Ate ${servings} beef meal(s)`,
        suggestions: [
          'Beef has 10x the emissions of chicken',
          'Try plant-based alternatives 2-3x per week',
          'Choose chicken or fish (70% lower emissions)',
          'Support local, grass-fed farms when possible'
        ]
      };
    }
    
    // Food - Chicken/Poultry
    if ((text.includes('chicken') || text.includes('poultry') || text.includes('turkey')) && !matched) {
      const servings = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 1;
      matched = true;
      return {
        category: 'food',
        icon: 'Utensils',
        emissions: parseFloat((servings * 6.9).toFixed(2)),
        activity: `Ate ${servings} chicken meal(s)`,
        suggestions: [
          'Good choice! 74% less emissions than beef',
          'Try plant-based proteins occasionally',
          'Local, free-range options have lower impact',
          'Reduce food waste to maximize impact'
        ]
      };
    }
    
    // Food - Dairy
    if ((text.includes('dairy') || text.includes('milk') || text.includes('cheese') || text.includes('yogurt')) && !matched) {
      const amount = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 1;
      matched = true;
      return {
        category: 'food',
        icon: 'Coffee',
        emissions: parseFloat((amount * 3.2).toFixed(2)),
        activity: `Consumed dairy products`,
        suggestions: [
          'Try oat or soy milk (80% less emissions)',
          'Reduce cheese consumption',
          'Choose local dairy products',
          'Plant-based alternatives have 1/3 the impact'
        ]
      };
    }
    
    // Food - Vegetarian/Vegan
    if ((text.includes('vegetarian') || text.includes('vegan') || text.includes('plant') || text.includes('salad')) && !matched) {
      const servings = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 1;
      matched = true;
      return {
        category: 'food',
        icon: 'Leaf',
        emissions: parseFloat((servings * 2).toFixed(2)),
        activity: `Ate ${servings} plant-based meal(s)`,
        suggestions: [
          'Excellent! Plant-based meals have 90% less impact',
          'Buy local and seasonal produce',
          'Reduce food waste for even more savings',
          'Share recipes to inspire others'
        ]
      };
    }
    
    // Food - Restaurant/Takeout
    if ((text.includes('restaurant') || text.includes('takeout') || text.includes('food delivery')) && !matched) {
      matched = true;
      return {
        category: 'food',
        icon: 'Utensils',
        emissions: 8.5,
        activity: 'Ordered restaurant/takeout food',
        suggestions: [
          'Bring reusable containers for leftovers',
          'Choose restaurants with local ingredients',
          'Avoid excessive packaging',
          'Cook at home when possible (50% less emissions)'
        ]
      };
    }
    
    // Consumption - Shopping/General
    if ((text.includes('shopping') || text.includes('bought') || text.includes('purchase')) && !matched) {
      let emissions = 15;
      let itemType = 'item';
      
      if (text.includes('clothes') || text.includes('clothing') || text.includes('fashion')) {
        emissions = 20;
        itemType = 'clothing item';
      }
      
      matched = true;
      return {
        category: 'consumption',
        icon: 'ShoppingBag',
        emissions,
        activity: `Purchased ${itemType}`,
        suggestions: [
          'Buy second-hand when possible (90% less impact)',
          'Choose quality over quantity',
          'Support brands with carbon-neutral commitments',
          'Repair instead of replace when possible'
        ]
      };
    }
    
    // Consumption - Electronics
    if ((text.includes('phone') || text.includes('laptop') || text.includes('computer') || text.includes('tablet') || text.includes('electronic')) && !matched) {
      matched = true;
      return {
        category: 'consumption',
        icon: 'Smartphone',
        emissions: 85,
        activity: 'Purchased electronics',
        suggestions: [
          'Keep devices longer (each extra year = 50% less impact)',
          'Buy refurbished electronics',
          'Recycle old devices properly',
          'Choose energy-efficient models'
        ]
      };
    }
    
    // Consumption - Streaming/Internet
    if ((text.includes('stream') || text.includes('netflix') || text.includes('youtube') || text.includes('video')) && !matched) {
      const hours = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 2;
      matched = true;
      return {
        category: 'consumption',
        icon: 'Tv',
        emissions: parseFloat((hours * 0.05).toFixed(2)),
        activity: `Streamed video for ${hours} hours`,
        suggestions: [
          'Download content on WiFi instead of streaming',
          'Lower video quality (SD uses 60% less energy)',
          'Use smaller screens when possible',
          'Enable auto-sleep features'
        ]
      };
    }
    
    // Consumption - Package Delivery
    if ((text.includes('package') || text.includes('delivery') || text.includes('amazon') || text.includes('shipping')) && !matched) {
      matched = true;
      return {
        category: 'consumption',
        icon: 'Package',
        emissions: 12,
        activity: 'Received package delivery',
        suggestions: [
          'Consolidate shipments to reduce deliveries',
          'Choose slower shipping (40% less emissions)',
          'Buy local when possible',
          'Recycle packaging materials'
        ]
      };
    }
    
    // Waste - General Waste
    if ((text.includes('waste') || text.includes('trash') || text.includes('garbage')) && !matched) {
      const amount = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 5;
      matched = true;
      return {
        category: 'waste',
        icon: 'Trash2',
        emissions: parseFloat((amount * 0.8).toFixed(2)),
        activity: `Generated ${amount}kg of waste`,
        suggestions: [
          'Recycle to reduce emissions by 70%',
          'Compost organic waste',
          'Avoid single-use plastics',
          'Choose products with minimal packaging'
        ]
      };
    }
    
    // Waste - Recycling
    if ((text.includes('recycle') || text.includes('recycled')) && !matched) {
      const amount = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 5;
      matched = true;
      return {
        category: 'waste',
        icon: 'Recycle',
        emissions: parseFloat((-amount * 0.5).toFixed(2)),
        activity: `Recycled ${amount}kg (saved emissions!)`,
        suggestions: [
          'Great job! Recycling saves significant CO2',
          'Clean recyclables for better processing',
          'Learn what can be recycled in your area',
          'Reduce consumption for even more impact'
        ]
      };
    }
    
    // Water Usage
    if ((text.includes('water') || text.includes('shower') || text.includes('bath')) && !matched) {
      const minutes = parseFloat(text.match(/\d+\.?\d*/)?.[0]) || 10;
      matched = true;
      return {
        category: 'energy',
        icon: 'Droplet',
        emissions: parseFloat((minutes * 0.15).toFixed(2)),
        activity: `Used hot water for ${minutes} minutes`,
        suggestions: [
          'Reduce shower time by 2 minutes',
          'Install low-flow showerheads',
          'Fix leaks promptly',
          'Lower water heater temperature'
        ]
      };
    }
    
    // Fallback logic - Advanced NLP-style analysis
    if (!matched) {
      // Try to extract numbers for generic estimation
      const numbers = text.match(/\d+\.?\d*/g);
      const hasNumber = numbers && numbers.length > 0;
      
      // Keywords for category detection
      if (text.includes('km') || text.includes('mile') || text.includes('travel')) {
        const distance = hasNumber ? parseFloat(numbers[0]) : 30;
        return {
          category: 'transportation',
          icon: 'Car',
          emissions: parseFloat((distance * 0.15).toFixed(2)),
          activity: `Travel activity: ${activityText}`,
          confidence: 'medium',
          suggestions: [
            'Consider lower-emission transport options',
            'Track specific activities for better insights',
            'Use public transit or carpool when possible'
          ]
        };
      }
      
      if (text.includes('energy') || text.includes('electric') || text.includes('power')) {
        const amount = hasNumber ? parseFloat(numbers[0]) : 50;
        return {
          category: 'energy',
          icon: 'Zap',
          emissions: parseFloat((amount * 0.4).toFixed(2)),
          activity: `Energy usage: ${activityText}`,
          confidence: 'medium',
          suggestions: [
            'Switch to renewable energy sources',
            'Improve energy efficiency',
            'Use energy monitoring devices'
          ]
        };
      }
      
      if (text.includes('food') || text.includes('eat') || text.includes('meal')) {
        return {
          category: 'food',
          icon: 'Utensils',
          emissions: 8,
          activity: `Food consumption: ${activityText}`,
          confidence: 'low',
          suggestions: [
            'Choose plant-based meals more often',
            'Reduce meat consumption',
            'Buy local and seasonal produce',
            'Minimize food waste'
          ]
        };
      }
      
      if (text.includes('buy') || text.includes('purchase') || text.includes('shop')) {
        return {
          category: 'consumption',
          icon: 'ShoppingBag',
          emissions: 12,
          activity: `Purchase: ${activityText}`,
          confidence: 'low',
          suggestions: [
            'Buy second-hand when possible',
            'Choose sustainable brands',
            'Repair instead of replace',
            'Avoid impulse purchases'
          ]
        };
      }
      
      // Ultimate fallback - general estimate
      return {
        category: 'other',
        icon: 'Leaf',
        emissions: 5,
        activity: activityText.length > 50 ? activityText.substring(0, 47) + '...' : activityText,
        confidence: 'low',
        suggestions: [
          'Try being more specific (e.g., "drove 50km", "ate beef", "used 100 kwh")',
          'Track activities regularly for insights',
          'Small daily changes compound over time',
          'Every action counts toward reducing emissions'
        ]
      };
    }
  };

  const handleAddActivity = () => {
    if (!input.trim()) return;
    
    const analysis = analyzeWithAI(input);
    const newActivity = {
      id: Date.now(),
      ...analysis,
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleString()
    };
    
    setActivities([newActivity, ...activities]);
    setAiSuggestion(analysis.suggestions[Math.floor(Math.random() * analysis.suggestions.length)]);
    setShowSuggestion(true);
    setInput('');
    
    setTimeout(() => setShowSuggestion(false), 6000);
  };

  const clearAllData = () => {
    setActivities([]);
    setShowClearConfirm(false);
  };

  const totalEmissions = activities.reduce((sum, activity) => sum + activity.emissions, 0);
  
  // Calculate category breakdown
  const categoryTotals = activities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + activity.emissions;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals).map(([category, emissions]) => ({
    category,
    emissions,
    percentage: ((emissions / totalEmissions) * 100).toFixed(1)
  })).sort((a, b) => b.emissions - a.emissions);

  // Calculate daily/monthly/yearly projections
  const oldestActivity = activities.length > 0 
    ? new Date(activities[activities.length - 1].timestamp) 
    : new Date();
  const daysSinceStart = Math.max(1, Math.ceil((new Date() - oldestActivity) / (1000 * 60 * 60 * 24)));
  const dailyAverage = totalEmissions / daysSinceStart;
  const monthlyProjection = dailyAverage * 30;
  const yearlyProjection = dailyAverage * 365;

  const getIcon = (iconName) => {
    const icons = { 
      Car, Home, Plane, ShoppingBag, Lightbulb, Leaf, Train, Bike, 
      Utensils, Zap, Droplet, Trash2, Recycle, Coffee, Package, Smartphone, Tv 
    };
    const Icon = icons[iconName] || Leaf;
    return <Icon size={20} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      transportation: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      energy: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
      food: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
      consumption: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
      waste: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
      other: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
    };
    return colors[category] || colors.other;
  };

  const getImpactLevel = () => {
    const daily = dailyAverage;
    if (daily < 5) return { level: 'Excellent', color: 'text-green-400', message: 'Well below climate goals!', icon: '🌟' };
    if (daily < 15) return { level: 'Good', color: 'text-lime-400', message: 'On track to meet targets!', icon: '✅' };
    if (daily < 30) return { level: 'Moderate', color: 'text-yellow-400', message: 'Room for improvement.', icon: '⚠️' };
    return { level: 'High', color: 'text-red-400', message: 'Significant changes needed.', icon: '🚨' };
  };

  const impact = getImpactLevel();

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-[1800px] mx-auto">
        
        {/* Header */}
        <div className="rounded-2xl shadow-xl p-6 md:p-8 mb-6 border" style={{ backgroundColor: '#0b0b0b', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Leaf className="text-green-400" size={36} />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">AI Carbon Footprint Tracker</h1>
                <p className="text-gray-400 text-sm">Track activities and get AI-powered sustainability insights</p>
              </div>
            </div>
            {activities.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors flex items-center gap-2 border border-red-500/30"
              >
                <Trash2 size={16} />
                Clear Data
              </button>
            )}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          
          {/* Left Column - Statistics & Input (2/3 width on xl screens) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/20">
                <p className="text-xs text-gray-400 mb-1">Total Emissions</p>
                <p className="text-3xl font-bold text-green-400">{totalEmissions.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">kg CO₂e</p>
              </div>
              
              <div className="bg-blue-500/10 rounded-xl p-5 border border-blue-500/20">
                <p className="text-xs text-gray-400 mb-1">Daily Average</p>
                <p className="text-3xl font-bold text-blue-400">{dailyAverage.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">kg CO₂e/day</p>
              </div>
              
              <div className="bg-purple-500/10 rounded-xl p-5 border border-purple-500/20">
                <p className="text-xs text-gray-400 mb-1">Activities</p>
                <p className="text-3xl font-bold text-purple-400">{activities.length}</p>
                <p className="text-xs text-gray-500 mt-1">entries logged</p>
              </div>
              
              <div className={`${impact.color === 'text-green-400' ? 'bg-green-500/10 border-green-500/20' : impact.color === 'text-yellow-400' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20'} rounded-xl p-5 border`}>
                <p className="text-xs text-gray-400 mb-1">Impact Level</p>
                <p className={`text-3xl font-bold ${impact.color}`}>{impact.level}</p>
                <p className="text-xs text-gray-500 mt-1">{impact.icon} {impact.message}</p>
              </div>
            </div>

            {/* Projections & Targets */}
            {activities.length > 0 && (
              <div className="rounded-2xl shadow-xl p-6 border" style={{ backgroundColor: '#0b0b0b', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="text-green-400" size={24} />
                  Projections & Climate Targets
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                    <p className="text-sm text-gray-400">Monthly Projection</p>
                    <p className="text-2xl font-bold text-blue-400">{monthlyProjection.toFixed(0)} kg</p>
                    <p className="text-xs text-gray-500 mt-1">Based on current rate</p>
                  </div>
                  <div className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-sm text-gray-400">Yearly Projection</p>
                    <p className="text-2xl font-bold text-purple-400">{yearlyProjection.toFixed(0)} kg</p>
                    <p className="text-xs text-gray-500 mt-1">~{(yearlyProjection / 1000).toFixed(1)} tonnes/year</p>
                  </div>
                  <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/20">
                    <p className="text-sm text-gray-400">Climate Target</p>
                    <p className="text-2xl font-bold text-green-400">2,000 kg</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {yearlyProjection > 2000 
                        ? `${((yearlyProjection - 2000) / yearlyProjection * 100).toFixed(0)}% above target` 
                        : `${((2000 - yearlyProjection) / 2000 * 100).toFixed(0)}% below target`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Input Section */}
            <div className="rounded-2xl shadow-xl p-6 border" style={{ backgroundColor: '#0b0b0b', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="text-green-400" />
                Log Activity
              </h2>
              <div className="flex gap-3 flex-col sm:flex-row">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
                  placeholder="Describe your activity (e.g., 'drove 30km', 'flight to Paris', 'ate beef', 'used 100 kwh')"
                  className="flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500"
                  style={{ backgroundColor: '#0a0a0a', border: '2px solid rgba(255, 255, 255, 0.2)' }}
                />
                <button
                  onClick={handleAddActivity}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center gap-2 justify-center"
                >
                  <Sparkles size={20} />
                  Analyze
                </button>
              </div>

              {showSuggestion && (
                <div className="mt-4 bg-green-500/10 rounded-xl p-4 border-2 border-green-500/30 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="text-yellow-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-white">💡 AI Suggestion</p>
                      <p className="text-gray-300 text-sm">{aiSuggestion}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activities */}
            <div className="rounded-2xl shadow-xl p-6 border" style={{ backgroundColor: '#0b0b0b', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="text-green-400" />
                Recent Activities
                {activities.length > 10 && (
                  <span className="text-sm text-gray-500 font-normal">(Showing last 10)</span>
                )}
              </h2>
              
              {activities.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Leaf size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="mb-2">No activities logged yet</p>
                  <p className="text-sm">Start tracking to see your carbon footprint!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {activities.slice(0, 10).map((activity) => {
                    const colors = getCategoryColor(activity.category);
                    return (
                      <div key={activity.id} className={`rounded-xl p-4 hover:bg-white/5 transition-colors border ${colors.border}`} style={{ backgroundColor: '#0a0a0a' }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`p-3 rounded-lg ${colors.bg} ${colors.text} flex-shrink-0`}>
                              {getIcon(activity.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white truncate">{activity.activity}</p>
                              <p className="text-xs text-gray-500 mt-1">{activity.displayTime}</p>
                              {activity.confidence && (
                                <span className={`text-xs ${activity.confidence === 'low' ? 'text-yellow-400' : 'text-blue-400'} flex items-center gap-1 mt-1`}>
                                  <AlertCircle size={12} />
                                  {activity.confidence} confidence estimate
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-2xl font-bold ${activity.emissions < 0 ? 'text-green-400' : 'text-white'}`}>
                              {activity.emissions > 0 ? '+' : ''}{activity.emissions}
                            </p>
                            <p className="text-xs text-gray-500">kg CO₂e</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Visualizations (1/3 width on xl screens) */}
          <div className="space-y-6">
            
            {/* Category Breakdown */}
            {categoryData.length > 0 && (
              <div className="rounded-2xl shadow-xl p-6 border" style={{ backgroundColor: '#0b0b0b', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <h2 className="text-xl font-bold text-white mb-6">📊 Category Breakdown</h2>
                <div className="space-y-4">
                  {categoryData.map(({ category, emissions, percentage }) => {
                    const colors = getCategoryColor(category);
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-semibold ${colors.text} capitalize`}>
                            {category}
                          </span>
                          <span className="text-sm text-gray-400">
                            {emissions.toFixed(1)} kg ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full ${colors.bg} ${colors.text} transition-all duration-500 flex items-center justify-end pr-2`}
                            style={{ width: `${percentage}%` }}
                          >
                            {parseFloat(percentage) > 15 && (
                              <span className="text-xs font-bold">{percentage}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Insights & Tips */}
            <div className="rounded-2xl shadow-xl p-6 border bg-gradient-to-br from-green-600/10 to-blue-600/10" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <h2 className="text-xl font-bold text-white mb-4">💡 Smart Insights</h2>
              <div className="space-y-3">
                {activities.length > 0 ? (
                  <>
                    <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                      <p className="text-sm text-gray-300">
                        <span className="font-semibold text-white">Daily Impact:</span> You're producing {dailyAverage.toFixed(1)} kg CO₂e per day
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                      <p className="text-sm text-gray-300">
                        <span className="font-semibold text-white">Yearly Path:</span> At this rate, you'll emit {(yearlyProjection / 1000).toFixed(2)} tonnes this year
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                      <p className="text-sm text-gray-300">
                        <span className="font-semibold text-white">Global Context:</span> Average person emits ~10 tonnes/year
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                      <p className="text-sm text-gray-300">
                        <span className="font-semibold text-white">Climate Goal:</span> We need to reach ~2 tonnes/year by 2050
                      </p>
                    </div>
                    {categoryData[0] && (
                      <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                        <p className="text-sm text-gray-300">
                          <span className="font-semibold text-white">Top Category:</span> {categoryData[0].category.charAt(0).toUpperCase() + categoryData[0].category.slice(1)} accounts for {categoryData[0].percentage}% of your emissions
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Start logging activities to see personalized insights
                  </p>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="rounded-2xl shadow-xl p-6 border bg-gradient-to-br from-purple-600/10 to-pink-600/10" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <h3 className="font-semibold text-lg mb-3 text-white">🚀 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Data auto-saves in your browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Be specific: "drove 50km", "ate 2 beef meals"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Track daily for best insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Small changes = big impact over time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Share your progress with others!</span>
                </li>
              </ul>
            </div>

            {/* Activity Examples */}
            <div className="rounded-2xl shadow-xl p-6 border" style={{ backgroundColor: '#0b0b0b', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <h3 className="font-semibold text-lg mb-3 text-white">📝 Try These Examples</h3>
              <div className="space-y-2 text-sm">
                {[
                  'drove 100km',
                  'international flight',
                  'used 200 kwh electricity',
                  'ate 2 beef meals',
                  'bought new phone',
                  'streamed netflix 4 hours',
                  'took train 50km',
                  'ate vegetarian meal',
                  'recycled 5kg',
                  'bike 10km'
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(example)}
                    className="block w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/10"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b0b0b] rounded-2xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-xl font-bold text-white mb-3">Clear All Data?</h3>
            <p className="text-gray-400 mb-6">This will permanently delete all your logged activities. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearAllData}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonFootprintTracker;
