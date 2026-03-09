import React, { useState, useEffect } from 'react';
import { Sun, Moon, CloudRain, Coffee, Utensils, Footprints, Smile, RefreshCw, ThumbsDown, AlertCircle, Timer, Activity, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';
import { healthService } from '../services/healthService';
import { dietFallback } from '../data/dietFallback';

const DailyFeed = () => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  // Mock Daily Log Data
  const [dailyLog, setDailyLog] = useState({
    calories: { current: 0, target: 1800 },
    nutrients: {
      carbs: { current: 0, target: 250 }, // grams
      protein: { current: 0, target: 90 },
      fat: { current: 0, target: 60 },
    },
    food_variety: 0, // Target 12
  });
  
  const [selectedMood, setSelectedMood] = useState(null);
  const [userStrategy, setUserStrategy] = useState(null);
  const [cycleDates, setCycleDates] = useState({ start: '', end: '', day: 1 });
  
  // Exercise State
  const [exerciseProgress, setExerciseProgress] = useState({ current: 0, target: 150 });
  const [recommendedExercise, setRecommendedExercise] = useState(null);

  // Mock Exercise Database
  // All exercises should be 30-45 mins (unless very low intensity)
  const exerciseDB = [
    // Conventional
    { id: 1, name: '慢跑', type: 'conventional', intensity: 'moderate', duration: 30, calories: 280, best_time: '早晨/傍晚' },
    { id: 2, name: '快走', type: 'conventional', intensity: 'low-moderate', duration: 45, calories: 200, best_time: '全天' },
    // TCM / Mind-Body (Extended duration to meet 30min requirement)
    { id: 4, name: '八段锦', type: 'tcm', intensity: 'low', duration: 15, calories: 50, best_time: '早晨', combo: { name: '站桩', duration: 20, calories: 70 } },
    { id: 5, name: '太极拳', type: 'tcm', intensity: 'low', duration: 30, calories: 120, best_time: '早晨' },
    // Gentle / Evening
    { id: 7, name: '舒缓拉伸', type: 'gentle', intensity: 'very_low', duration: 30, calories: 80, best_time: '睡前' },
    { id: 8, name: '冥想漫步', type: 'gentle', intensity: 'very_low', duration: 30, calories: 70, best_time: '傍晚' },
  ];

  const recommendExercise = () => {
    const hour = new Date().getHours();
    let candidates = exerciseDB;

    // Evening Logic: Avoid high intensity after 19:00
    if (hour >= 19) {
       candidates = exerciseDB.filter(ex => ex.intensity === 'low' || ex.intensity === 'very_low');
    } else {
       // Day Logic: Mix of conventional and TCM
       candidates = exerciseDB.filter(ex => ex.intensity !== 'very_low');
    }

    const random = candidates[Math.floor(Math.random() * candidates.length)];
    setRecommendedExercise(random);
  };

  useEffect(() => {
    recommendExercise(); 
  }, []);

  // Listen for updates from ChatInterface
  useEffect(() => {
    const updateFromStorage = () => {
      // 1. Get Base TDEE & Strategy from User Profile
      const userProfile = storageService.getUserProfile();
      const basicInfo = userProfile.basicInfo || {};
      
      let baseTDEE = 1800;
      let weeklyTarget = 150;
      let userStrategy = null;

      if (Object.keys(basicInfo).length > 0) {
        // Calculate TDEE based on basic info
        if (basicInfo.weight && basicInfo.height && basicInfo.age) {
            // Yang Yuexin (2005) Formula for Chinese Population
            // Male: (13.88 × weight) + (4.16 × height) - (3.43 × age) - 112.4
            // Female: (9.24 × weight) + (3.1 × height) - (4.33 × age) + 447.6
            let bmr = 0;
            if (basicInfo.gender === 'male') {
                bmr = (13.88 * basicInfo.weight) + (4.16 * basicInfo.height) - (3.43 * basicInfo.age) - 112.4;
            } else {
                bmr = (9.24 * basicInfo.weight) + (3.1 * basicInfo.height) - (4.33 * basicInfo.age) + 447.6;
            }
            
            const activityFactors = { 'light': 1.2, 'medium': 1.55, 'heavy': 1.725 };
            baseTDEE = Math.round(bmr * (activityFactors[basicInfo.activity] || 1.2));
        }
        
        // Mock Strategy from Constitution if available
        const constitution = userProfile.constitution;
        if (constitution && constitution.desc) {
            setUserStrategy({ strategy: { desc: constitution.desc } });
        }
      }
      
      // 2. Get Daily Log (Calories, Nutrients)
      const today = new Date().toISOString().split('T')[0];
      const dailyLogs = storageService.getDailyLogs(today);
      const todayData = dailyLogs.nutrition || { calories: 0, nutrients: { carb: 0, protein: 0, fat: 0 } };
      
      const currentCalories = parseFloat(todayData.calories) || 0;
      const rawNutrients = todayData.nutrients || {};
      const nutrients = {
          carb: parseFloat(rawNutrients.carb) || 0,
          protein: parseFloat(rawNutrients.protein) || 0,
          fat: parseFloat(rawNutrients.fat) || 0
      };
      
      // 3. Calculate Dynamic Target (Simplified for now)
      const dynamicTarget = baseTDEE;

      setDailyLog(prev => ({
          ...prev,
          calories: { current: currentCalories, target: dynamicTarget },
          nutrients: {
            carbs: { current: nutrients.carb, target: Math.round(dynamicTarget * 0.55 / 4) }, // 55% Carbs
            protein: { current: nutrients.protein, target: Math.round(dynamicTarget * 0.15 / 4) }, // 15% Protein
            fat: { current: nutrients.fat, target: Math.round(dynamicTarget * 0.3 / 9) }, // 30% Fat
          },
          food_variety: dailyLogs.diet ? new Set(dailyLogs.diet.map(d => d.name)).size : 0 // Count unique food items
      }));
    };

    window.addEventListener('storage', updateFromStorage);
    updateFromStorage();

    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  // Mock Meal Recommendations
  const [meals, setMeals] = useState(null); // Initialize as null to show loading/empty state first
  const [isGeneratingMeals, setIsGeneratingMeals] = useState(false);

  // Load or Generate Meals
  useEffect(() => {
    const loadMeals = async () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const storageKey = `hepai_daily_meal_plan_${todayStr}`;
        
        // 1. Try to load from local storage
        const savedMeals = localStorage.getItem(storageKey);
        if (savedMeals) {
            try {
                setMeals(JSON.parse(savedMeals));
                return;
            } catch (e) {
                console.error("Error parsing saved meals", e);
            }
        }

        // 2. Generate new meals via AI
        setIsGeneratingMeals(true);
        try {
            const userProfile = storageService.getUserProfile();
            const aiMeals = await healthService.generate_meal_plan(userProfile);
            
            if (!aiMeals) {
                throw new Error("Failed to generate meals (empty response)");
            }
            
            // Add IDs for rendering if not present
            if (aiMeals.breakfast) aiMeals.breakfast.id = 1;
            if (aiMeals.lunch) aiMeals.lunch.id = 2;
            if (aiMeals.dinner) aiMeals.dinner.id = 3;

            setMeals(aiMeals);
            localStorage.setItem(storageKey, JSON.stringify(aiMeals));
        } catch (error) {
            console.error("Failed to generate meals", error);
            // Fallback
            const userProfile = storageService.getUserProfile();
            const constiType = userProfile.constitution?.type || '平和质';
            const fallbackPlan = dietFallback[constiType] || dietFallback['平和质'];
            
            const meals = {
                breakfast: { ...fallbackPlan.breakfast, id: 1 },
                lunch: { ...fallbackPlan.lunch, id: 2 },
                dinner: { ...fallbackPlan.dinner, id: 3 }
            };
            setMeals(meals);
        } finally {
            setIsGeneratingMeals(false);
        }
    };

    loadMeals();
  }, []);

  // Updated to 3 times per day
  const [refreshCount, setRefreshCount] = useState(0); // Disable refresh for now as per requirement "Real AI ... remove refresh button"

  const handleRefresh = (type) => {
    // Disabled
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    // In a real app, save to storage
    alert(`心情已记录：${mood}`);
  };

  const handleExerciseCheckIn = () => {
    if (!recommendedExercise) return;
    const duration = recommendedExercise.duration + (recommendedExercise.combo ? recommendedExercise.combo.duration : 0);
    setExerciseProgress(prev => ({
        ...prev,
        current: Math.min(prev.current + duration, prev.target)
    }));
    alert('打卡成功！运动时长已更新。💪');
  };

  return (
    <div className="p-2 space-y-4">
      {/* Mood Block */}
      <div className="bg-[#F0F4FF] rounded-2xl p-4">
        <h3 className="font-semibold text-text-main mb-3 flex items-center gap-2 text-sm">
          <Smile className="w-4 h-4 text-indigo-400" /> 心情签到
        </h3>
        <div className="flex justify-between gap-2">
          {['平静', '开心', '疲惫', '焦虑', '期待'].map((mood) => (
            <button 
                key={mood} 
                onClick={() => handleMoodSelect(mood)}
                className={`flex-1 py-2 border rounded-xl text-xs transition-all shadow-sm ${selectedMood === mood ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white border-indigo-100/50 text-text-muted hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'}`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Diet Block */}
      <div className="bg-[#F2F7F5] rounded-2xl p-4 space-y-4">
        {/* Nutrition Dashboard */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-text-main text-sm">今日营养概览</h3>
            <span className="text-[10px] text-text-muted">目标 {dailyLog.calories.target} kcal</span>
          </div>

          {/* Calories Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-text-muted">热量摄入</span>
              <span className="font-medium text-brand">{dailyLog.calories.current} / {dailyLog.calories.target}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand rounded-full transition-all duration-500" 
                style={{ width: `${dailyLog.calories.target > 0 ? (dailyLog.calories.current / dailyLog.calories.target) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Nutrients & Variety Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Nutrients */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>碳水 (50-65%)</span>
                <span>{dailyLog.nutrients.carbs.current}g / {dailyLog.nutrients.carbs.target}g</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-accent rounded-full" style={{ width: `${dailyLog.nutrients.carbs.target > 0 ? (dailyLog.nutrients.carbs.current / dailyLog.nutrients.carbs.target) * 100 : 0}%` }}></div>
              </div>

              <div className="flex justify-between text-[10px] text-text-muted">
                <span>蛋白质 (10-15%)</span>
                <span>{dailyLog.nutrients.protein.current}g / {dailyLog.nutrients.protein.target}g</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-brand-light rounded-full bg-brand" style={{ width: `${dailyLog.nutrients.protein.target > 0 ? (dailyLog.nutrients.protein.current / dailyLog.nutrients.protein.target) * 100 : 0}%` }}></div>
              </div>

              <div className="flex justify-between text-[10px] text-text-muted">
                <span>脂肪 (20-30%)</span>
                <span>{dailyLog.nutrients.fat.current}g / {dailyLog.nutrients.fat.target}g</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${dailyLog.nutrients.fat.target > 0 ? (dailyLog.nutrients.fat.current / dailyLog.nutrients.fat.target) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Food Variety */}
            <div className="bg-bg-secondary rounded-lg p-2 flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-10">
                <Utensils className="w-8 h-8 text-brand" />
              </div>
              <span className="text-xl font-bold text-brand">{dailyLog.food_variety}<span className="text-xs font-normal text-text-muted">/12</span></span>
              <span className="text-[10px] text-text-muted">食材种类</span>
            </div>
          </div>
        </div>

        {/* Today's Meal Plan */}
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="font-semibold text-text-main flex items-center gap-2 text-sm">
              <Utensils className="w-4 h-4 text-brand" /> 美味推荐
            </h3>
          </div>
          
          {isGeneratingMeals ? (
             <div className="bg-white p-4 rounded-xl border border-gray-100/50 shadow-sm flex flex-col items-center justify-center py-8 animate-pulse">
                 <div className="w-8 h-8 bg-brand/20 rounded-full mb-3 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-brand" />
                 </div>
                 <p className="text-xs text-text-muted">AI 正在根据您的体质定制食谱...</p>
             </div>
          ) : meals ? (
            <div className="space-y-2">
              {Object.entries(meals).map(([type, meal]) => (
                <div key={type} className="bg-white p-3 rounded-xl border border-gray-100/50 shadow-sm relative group animate-fade-in">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        type === 'breakfast' ? 'bg-orange-50 text-orange-500' :
                        type === 'lunch' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-indigo-50 text-indigo-500'
                      }`}>
                        {type === 'breakfast' ? <Coffee className="w-4 h-4" /> :
                         type === 'lunch' ? <Sun className="w-4 h-4" /> :
                         <Moon className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted block capitalize leading-none mb-0.5">{type === 'breakfast' ? '早餐' : type === 'lunch' ? '午餐' : '晚餐'}</span>
                        <span className="font-medium text-text-main text-sm line-clamp-1">{meal.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-text-muted pl-9">
                    <span className="bg-gray-50 px-1.5 py-0.5 rounded text-text-main/70">{meal.calories} kcal · {meal.tag}</span>
                    
                    <div className="flex gap-2">
                      <button onClick={() => alert('感谢反馈，我们将为您优化推荐')} className="p-1 hover:text-red-500" title="不喜欢">
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-text-muted">暂无推荐</div>
          )}
        </div>
      </div>

      {/* Exercise Block */}
      <div className="bg-[#FFF8F0] rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-text-main flex items-center gap-2 text-sm">
            <Footprints className="w-4 h-4 text-orange-400" /> 运动灵感
          </h3>
          <div className="flex items-center gap-2">
             <span className="text-[10px] text-text-muted">本周目标</span>
             <div className="flex items-center gap-1.5 bg-white/60 px-2 py-0.5 rounded-full">
               <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${exerciseProgress.current >= exerciseProgress.target ? 'bg-green-500' : 'bg-orange-400'}`} 
                    style={{ width: `${Math.min((exerciseProgress.current / exerciseProgress.target) * 100, 100)}%` }}
                  ></div>
               </div>
               <span className="text-[10px] font-mono text-orange-600 font-medium">{exerciseProgress.current}/{exerciseProgress.target}m</span>
             </div>
          </div>
        </div>

        {/* Dynamic Exercise Card (Clean) */}
        {recommendedExercise && (
          <div className="bg-white rounded-xl p-4 border border-orange-100/50 shadow-sm relative">
            <div className="absolute top-3 right-3">
               <button onClick={recommendExercise} className="p-1.5 hover:bg-gray-50 rounded-full text-text-muted hover:text-brand transition-colors">
                 <RefreshCw className="w-3.5 h-3.5" />
               </button>
            </div>

            <div className="flex items-start gap-3 mb-3">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                 recommendedExercise.type === 'tcm' ? 'bg-orange-100 text-orange-600' : 
                 recommendedExercise.type === 'gentle' ? 'bg-indigo-100 text-indigo-600' : 
                 'bg-green-100 text-green-600'
               }`}>
                  <Activity className="w-5 h-5" />
               </div>
               <div>
                 <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-text-main text-base">{recommendedExercise.name}</h4>
                    {recommendedExercise.combo && <span className="font-medium text-text-main text-base">+ {recommendedExercise.combo.name}</span>}
                 </div>
                 
                 {recommendedExercise.combo ? (
                    <div className="flex flex-col gap-1.5">
                        <div className="flex gap-1.5 items-center">
                            <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-100">{recommendedExercise.name} {recommendedExercise.duration}分钟</span>
                            <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-100">{recommendedExercise.combo.name} {recommendedExercise.combo.duration}分钟</span>
                        </div>
                        <div className="flex gap-1.5">
                            <span className="text-[10px] bg-gray-50 text-text-muted px-1.5 py-0.5 rounded border border-gray-100 capitalize">{recommendedExercise.intensity}强度</span>
                            <span className="text-[10px] bg-gray-50 text-text-muted px-1.5 py-0.5 rounded border border-gray-100">共约{recommendedExercise.calories + (recommendedExercise.combo.calories || 0)}kcal</span>
                        </div>
                    </div>
                 ) : (
                    <div className="flex gap-1.5">
                        <span className="text-[10px] bg-gray-50 text-text-muted px-1.5 py-0.5 rounded border border-gray-100">{recommendedExercise.duration}分钟</span>
                        <span className="text-[10px] bg-gray-50 text-text-muted px-1.5 py-0.5 rounded border border-gray-100 capitalize">{recommendedExercise.intensity}强度</span>
                        <span className="text-[10px] bg-gray-50 text-text-muted px-1.5 py-0.5 rounded border border-gray-100">约{recommendedExercise.calories}kcal</span>
                    </div>
                 )}
               </div>
            </div>

            {/* Smart Tip */}
            {new Date().getHours() >= 19 && (recommendedExercise.intensity === 'low' || recommendedExercise.intensity === 'very_low') && (
               <div className="bg-indigo-50 text-indigo-600 text-[10px] p-2 rounded-lg mb-3 flex items-center gap-1.5">
                 <Moon className="w-3 h-3 shrink-0" />
                 <span>夜深了，为您推荐助眠运动。</span>
               </div>
            )}

            <button onClick={handleExerciseCheckIn} className="w-full py-2 bg-orange-50 text-orange-600 text-xs font-medium rounded-lg hover:bg-orange-100 transition-colors">
              开始打卡
            </button>
          </div>
        )}
      </div>



    </div>
  );
};

export default DailyFeed;
