import React, { useState, useEffect } from 'react';
import { Sun, Moon, Coffee, Utensils, Footprints, RefreshCw, ThumbsDown, Activity, CheckCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { healthService } from '../services/healthService';
import { dietFallback } from '../data/dietFallback';

const DailyFeed = () => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  const [exerciseProgress, setExerciseProgress] = useState({ current: 0, target: 150 });
  const [recommendedExercise, setRecommendedExercise] = useState(null);

  const exerciseDB = [
    { id: 1, name: '慢跑', type: 'conventional', intensity: 'moderate', duration: 30, calories: 280, best_time: '早晨/傍晚' },
    { id: 2, name: '快走', type: 'conventional', intensity: 'low-moderate', duration: 45, calories: 200, best_time: '全天' },
    { id: 4, name: '八段锦', type: 'tcm', intensity: 'low', duration: 15, calories: 50, best_time: '早晨', combo: { name: '站桩', duration: 20, calories: 70 } },
    { id: 5, name: '太极拳', type: 'tcm', intensity: 'low', duration: 30, calories: 120, best_time: '早晨' },
    { id: 7, name: '舒缓拉伸', type: 'gentle', intensity: 'very_low', duration: 30, calories: 80, best_time: '睡前' },
    { id: 8, name: '冥想漫步', type: 'gentle', intensity: 'very_low', duration: 30, calories: 70, best_time: '傍晚' },
  ];

  const recommendExercise = () => {
    const hour = new Date().getHours();
    let candidates = exerciseDB;

    if (hour >= 19) {
       candidates = exerciseDB.filter(ex => ex.intensity === 'low' || ex.intensity === 'very_low');
    } else {
       candidates = exerciseDB.filter(ex => ex.intensity !== 'very_low');
    }

    const random = candidates[Math.floor(Math.random() * candidates.length)];
    setRecommendedExercise(random);
  };

  useEffect(() => {
    recommendExercise(); 
  }, []);

  const [meals, setMeals] = useState(null);
  const [isGeneratingMeals, setIsGeneratingMeals] = useState(false);

  useEffect(() => {
    const loadMeals = async () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const storageKey = `hepai_daily_meal_plan_${todayStr}`;
        
        const savedMeals = localStorage.getItem(storageKey);
        if (savedMeals) {
            try {
                setMeals(JSON.parse(savedMeals));
                return;
            } catch (e) {
                console.error("Error parsing saved meals", e);
            }
        }

        setIsGeneratingMeals(true);
        try {
            const userProfile = storageService.getUserProfile();
            const aiMeals = await healthService.generate_meal_plan(userProfile);
            
            if (!aiMeals) {
                throw new Error("Failed to generate meals (empty response)");
            }
            
            if (aiMeals.breakfast) aiMeals.breakfast.id = 1;
            if (aiMeals.lunch) aiMeals.lunch.id = 2;
            if (aiMeals.dinner) aiMeals.dinner.id = 3;

            setMeals(aiMeals);
            localStorage.setItem(storageKey, JSON.stringify(aiMeals));
        } catch (error) {
            console.error("Failed to generate meals", error);
            const userProfile = storageService.getUserProfile();
            const constiType = userProfile.constitution?.type || '平和质';
            const fallbackPlan = dietFallback[constiType] || dietFallback['平和质'];
            
            setMeals(fallbackPlan);
        } finally {
            setIsGeneratingMeals(false);
        }
    };

    loadMeals();
  }, []);

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
      {/* Diet Block */}
      <div className="bg-[#F2F7F5] rounded-2xl p-4 space-y-4">
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
                    <Activity className="w-4 h-4 text-brand" />
                 </div>
                 <p className="text-xs text-text-muted">AI 正在根据您的体质定制食谱...</p>
             </div>
          ) : meals ? (
            <div className="space-y-2">
              {meals.breakfast && meals.lunch && meals.dinner ? (
                <>
                  {['breakfast', 'lunch', 'dinner'].map((type) => {
                    const meal = meals[type];
                    return (
                      <div key={type} className="bg-white p-3 rounded-xl border border-gray-100/50 shadow-sm relative group animate-fade-in">
                        <div className="flex justify-between items-start mb-2">
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
                              <span className="font-medium text-text-main text-sm line-clamp-2">{meal.name}</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded text-text-main/70">{meal.calories} kcal</span>
                        </div>
                        
                        {meal.ingredients && (
                          <div className="pl-9 mb-2">
                            <span className="text-[10px] text-text-muted">食材：</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {meal.ingredients.map((ing, idx) => (
                                <span key={idx} className="text-[9px] bg-brand/5 px-1.5 py-0.5 rounded-full text-brand/80">
                                  {ing.name} {ing.amount}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {meal.nutrients && (
                          <div className="pl-9 mb-2">
                            <div className="flex gap-2 text-[9px] text-text-muted">
                              <span>碳水: {meal.nutrients.carbs}g</span>
                              <span>蛋白质: {meal.nutrients.protein}g</span>
                              <span>脂肪: {meal.nutrients.fat}g</span>
                            </div>
                          </div>
                        )}
                        
                        {meal.nutrition_points && (
                          <div className="pl-9 mb-2">
                            <div className="flex flex-wrap gap-1">
                              {meal.nutrition_points.map((point, idx) => (
                                <span key={idx} className="text-[9px] bg-green-50 px-1.5 py-0.5 rounded text-green-600">
                                  {point}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {meal.constitution_fit && (
                          <div className="pl-9 text-[9px] text-text-muted">
                            💡 {meal.constitution_fit}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {meals.daily_summary && (
                    <div className="bg-white/80 p-3 rounded-xl border border-gray-100/50 shadow-sm">
                      <div className="text-[10px] text-text-muted mb-1">📊 每日总结</div>
                      <div className="flex flex-wrap gap-2 text-[9px]">
                        <span className="bg-gray-50 px-2 py-1 rounded">食材种类: {meals.daily_summary.ingredient_count}种</span>
                        <span className="bg-gray-50 px-2 py-1 rounded">营养比例: {meals.daily_summary.nutrition_balance}</span>
                      </div>
                      {meals.daily_summary.key_benefits && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {meals.daily_summary.key_benefits.map((benefit, idx) => (
                            <span key={idx} className="text-[9px] bg-blue-50 px-1.5 py-0.5 rounded text-blue-600">
                              ✓ {benefit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {meals.advice && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                      <div className="text-[10px] text-amber-700">💬 营养师建议</div>
                      <div className="text-[9px] text-amber-600 mt-1">{meals.advice}</div>
                    </div>
                  )}
                </>
              ) : (
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
                        <span className="bg-gray-50 px-1.5 py-0.5 rounded text-text-main/70">{meal.calories} kcal</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
