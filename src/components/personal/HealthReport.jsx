import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Smile, 
  Utensils, 
  Moon, 
  Activity, 
  Stethoscope,
  Info,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { healthService } from '../../services/healthService';
import { storageService } from '../../services/storageService';

const HealthReport = ({ onBack }) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('emotion');
  const [activeInsightTab, setActiveInsightTab] = useState('today');
  const [dailyLog, setDailyLog] = useState({
    calories: { current: 0, target: 0 },
    nutrients: {
      carbs: { current: 0, target: 0 },
      protein: { current: 0, target: 0 },
      fat: { current: 0, target: 0 }
    },
    food_variety: 0,
    judgment: "今天也要好好吃饭哦"
  });

  const getProgressWidth = (current, target) => {
    if (!target || target <= 0) return '0%';
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100) + '%';
  };

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const userProfile = storageService.getUserProfile();
        const constitutionType = userProfile.constitution?.type || '平和质';
        
        const data = await healthService.report_weekly('current_user', currentWeekOffset);
        
        // 收集今日数据
        const today = new Date().toISOString().split('T')[0];
        const dailyLogs = storageService.getDailyLogs(today);
        const dailyData = {
          diet_logs: dailyLogs.diet ? dailyLogs.diet.length : 0,
          food_variety: dailyLogs.diet ? new Set(dailyLogs.diet.map(d => d.name)).size : 0,
          sleep_record: storageService.getLatestHealthRecord('sleep') || null,
          exercise_logs: dailyLogs.exercise ? dailyLogs.exercise.length : 0
        };
        
        // 收集本周数据
        const weekData = {
          stats: data.stats || {},
          days_recorded: data.daysRecorded || 0
        };
        
        // 调用豆包API生成动态洞察
        const dynamicInsight = await healthService.generate_dynamic_insight(userProfile, dailyData, weekData);
        
        // 合并数据
        if (dynamicInsight.today_insight) {
          setDailyLog(prev => ({
            ...prev,
            insight: {
              coreIssue: dynamicInsight.today_insight.core_issue,
              actions: dynamicInsight.today_insight.actions,
              constitutionFit: dynamicInsight.today_insight.analysis,
              periodTip: prev.insight?.periodTip
            }
          }));
        }
        
        if (dynamicInsight.week_insight) {
          data.weekInsight = {
            longTermProblems: dynamicInsight.week_insight.long_term_problems,
            nextWeekGoals: dynamicInsight.week_insight.next_week_goals,
            scientificEvidence: dynamicInsight.week_insight.scientific_evidence
          };
        }
        
        setReportData(data);
      } catch (e) {
        console.error("Failed to load report", e);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [currentWeekOffset]);

  useEffect(() => {
    const updateFromStorage = () => {
      const userProfile = storageService.getUserProfile();
      const basicInfo = userProfile.basicInfo || {};
      
      const weight = basicInfo.weight || 60;
      const height = basicInfo.height || 165;
      const age = basicInfo.age || 25;
      const gender = basicInfo.gender || 'female';
      
      let bmr = gender === 'female' 
        ? 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age)
        : 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
      
      const baseTDEE = Math.round(bmr * 1.4);

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
      
      const dynamicTarget = baseTDEE;

      const ratio = dynamicTarget > 0 ? currentCalories / dynamicTarget : 0;
      let judgment = "今天也要好好吃饭哦";
      
      const constitutionType = userProfile.constitution?.type || '平和质';
      const goals = basicInfo.goal || [];
      
      if (currentCalories === 0) {
          judgment = "还没有记录饮食，快去记录一下吧。";
      } else if (ratio < 0.85) {
          judgment = "热量摄入不足。";
          if (constitutionType.includes('虚')) {
              judgment += "气虚体质切忌过度节食，容易导致代谢降低，建议加餐。";
          } else if (goals.includes('精力充沛')) {
              judgment += "能量不足会影响精力，建议补充优质碳水。";
          } else {
              judgment += "长期低热量可能导致代谢损伤，建议适当加餐。";
          }
      } else if (ratio > 1.15) {
          judgment = "热量摄入略高。";
          if (constitutionType.includes('痰') || constitutionType.includes('湿')) {
              judgment += "痰湿体质代谢较慢，建议晚餐少吃，多吃绿叶菜。";
          } else if (goals.includes('身体轻盈')) {
              judgment += "想要身体轻盈，记得控制总量哦。";
          } else {
              judgment += "建议饭后散步消食。";
          }
      } else {
          judgment = "热量摄入达标！";
          if (constitutionType === '平和质') {
              judgment += "继续保持，均衡饮食最重要。";
          } else {
              judgment += "非常棒，适合您当前的体质调理节奏。";
          }
      }

      // 获取经期信息
      const periodInfo = dailyLogs.period || {};
      const isPeriod = periodInfo.status === 'period' || periodInfo.status === 'pms';

      // 生成今日洞察内容
      const generateTodayInsight = () => {
        let coreIssue = "";
        let actions = [];
        let constitutionFit = "";
        let periodTip = "";

        // 基于体质生成核心问题和行动建议
        switch (constitutionType) {
          case '气虚质':
            coreIssue = "气虚体质容易感到疲劳，能量不足";
            actions = ["上午10点左右喝一杯温热的蜂蜜水", "午餐增加优质蛋白质如鸡肉、鱼肉"];
            constitutionFit = "气虚体质需要补气养身，避免过度消耗";
            break;
          case '阳虚质':
            coreIssue = "阳虚体质手脚冰凉，怕冷";
            actions = ["早餐喝一杯生姜红糖水", "避免食用生冷食物"];
            constitutionFit = "阳虚体质需要温补阳气，注意保暖";
            break;
          case '阴虚质':
            coreIssue = "阴虚体质容易口干舌燥，睡眠不佳";
            actions = ["多喝水，保持身体水分", "晚餐避免辛辣刺激食物"];
            constitutionFit = "阴虚体质需要滋阴润燥，避免燥热";
            break;
          case '痰湿质':
            coreIssue = "痰湿体质代谢较慢，容易疲劳";
            actions = ["饭后散步30分钟", "减少油腻食物摄入"];
            constitutionFit = "痰湿体质需要健脾利湿，促进代谢";
            break;
          case '湿热质':
            coreIssue = "湿热体质容易长痘，口气重";
            actions = ["多喝水，促进排毒", "多吃清热利湿的食物如绿豆汤"];
            constitutionFit = "湿热体质需要清热利湿，避免辛辣刺激";
            break;
          case '血瘀质':
            coreIssue = "血瘀体质容易痛经，手脚麻木";
            actions = ["适当运动促进血液循环", "避免久坐久站"];
            constitutionFit = "血瘀体质需要活血化瘀，促进气血运行";
            break;
          case '气郁质':
            coreIssue = "气郁体质容易情绪波动，胸闷";
            actions = ["进行深呼吸练习", "听舒缓的音乐放松心情"];
            constitutionFit = "气郁体质需要疏肝解郁，保持心情舒畅";
            break;
          case '特禀质':
            coreIssue = "特禀体质容易过敏，需要特别注意饮食";
            actions = ["避免接触过敏原", "保持室内清洁"];
            constitutionFit = "特禀体质需要避免过敏原，增强体质";
            break;
          default: // 平和质
            coreIssue = "平和体质状态良好，需要保持";
            actions = ["保持规律作息", "均衡饮食"];
            constitutionFit = "平和体质是理想状态，需要维持";
        }

        // 经期提示
        if (gender === 'female' && isPeriod) {
          periodTip = "经期注意：不建议剧烈运动，忌生冷、注意保暖，情绪波动易加重气滞/血瘀";
        }

        return { coreIssue, actions, constitutionFit, periodTip };
      };

      const todayInsight = generateTodayInsight();

      setDailyLog({
          calories: { current: currentCalories, target: dynamicTarget },
          nutrients: {
            carbs: { current: nutrients.carb, target: Math.round(dynamicTarget * 0.55 / 4) },
            protein: { current: nutrients.protein, target: Math.round(dynamicTarget * 0.15 / 4) },
            fat: { current: nutrients.fat, target: Math.round(dynamicTarget * 0.3 / 9) },
          },
          food_variety: dailyLogs.diet ? new Set(dailyLogs.diet.map(d => d.name)).size : 0,
          judgment: judgment,
          insight: todayInsight
      });
    };

    window.addEventListener('storage', updateFromStorage);
    updateFromStorage();

    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  const handlePrevWeek = () => {
    setCurrentWeekOffset(prev => prev + 1);
  };

  const handleNextWeek = () => {
    if (currentWeekOffset > 0) {
      setCurrentWeekOffset(prev => prev - 1);
    }
  };

  const tabs = [
    { id: 'emotion', label: '情绪', icon: Smile },
    { id: 'diet', label: '饮食', icon: Utensils },
    { id: 'sleep', label: '睡眠', icon: Moon },
    { id: 'exercise', label: '运动', icon: Activity },
    { id: 'digestion', label: '消化', icon: Stethoscope },
  ];

  if (loading) {
      return (
          <div className="h-full flex items-center justify-center bg-white rounded-2xl">
              <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-400">正在生成健康洞察...</span>
              </div>
          </div>
      );
  }

  if (!reportData) return null;

  const activeDetail = reportData.details?.[activeTab];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-50 flex-none bg-white z-10 flex flex-col gap-2 rounded-t-2xl">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            {onBack && (
                <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-emerald-600 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}
            <h3 className="font-bold text-lg text-emerald-900">健康洞察</h3>
            
            {/* Date Switcher - Small Component following title */}
            <div className="flex items-center bg-gray-50 rounded-lg px-1 py-0.5 ml-1 border border-gray-100">
                    <button 
                        onClick={handlePrevWeek}
                        className="p-0.5 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] font-mono text-gray-500 px-1 min-w-[65px] text-center">
                        {reportData.dateRange}
                    </span>
                    <button 
                        onClick={handleNextWeek}
                        disabled={currentWeekOffset === 0}
                        className="p-0.5 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-20"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>
            </div>
            </div>
            
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400">综合得分</span>
                <div className="text-2xl font-bold text-emerald-600 leading-none font-serif flex items-baseline">
                    {reportData.totalScore}
                    <span className="text-xs text-emerald-400 ml-0.5 font-sans font-normal">/10</span>
                </div>
            </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 space-y-4">
        
        {/* Insight Tabs - Today vs Week */}
        <div className="flex bg-gray-50 p-1 rounded-xl">
            <button 
                onClick={() => setActiveInsightTab('today')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeInsightTab === 'today' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                今日洞察
            </button>
            <button 
                onClick={() => setActiveInsightTab('week')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeInsightTab === 'week' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                本周洞察
            </button>
        </div>

        {/* Today Insight */}
        {activeInsightTab === 'today' && (
            <div className="space-y-4">
                {/* Nutrition Overview */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-text-main text-sm">今日营养概览</h3>
                        <span className="text-[10px] text-text-muted">目标 {dailyLog.calories.target} kcal</span>
                    </div>

                    {/* Calories Progress */}
                    <div className="mb-3">
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-text-muted">热量摄入</span>
                            <span className="font-medium text-emerald-600">{dailyLog.calories.current} / {dailyLog.calories.target}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                            <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                                style={{ width: getProgressWidth(dailyLog.calories.current, dailyLog.calories.target) }}
                            ></div>
                        </div>
                        {/* AI Judgment */}
                        <div className="text-[10px] text-orange-800 bg-orange-50 px-2 py-1.5 rounded-lg border border-orange-100/50 leading-relaxed flex items-start gap-1.5">
                           <Sparkles className="w-3 h-3 shrink-0 mt-0.5 text-orange-500" />
                           <span>{dailyLog.judgment || "今天也要好好吃饭哦"}</span>
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
                               <div className="h-full bg-teal-500 rounded-full" style={{ width: getProgressWidth(dailyLog.nutrients.carbs.current, dailyLog.nutrients.carbs.target) }}></div>
                            </div>

                            <div className="flex justify-between text-[10px] text-text-muted">
                                <span>蛋白质 (10-15%)</span>
                                <span>{dailyLog.nutrients.protein.current}g / {dailyLog.nutrients.protein.target}g</span>
                            </div>
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-600 rounded-full" style={{ width: getProgressWidth(dailyLog.nutrients.protein.current, dailyLog.nutrients.protein.target) }}></div>
                            </div>

                            <div className="flex justify-between text-[10px] text-text-muted">
                                <span>脂肪 (20-30%)</span>
                                <span>{dailyLog.nutrients.fat.current}g / {dailyLog.nutrients.fat.target}g</span>
                            </div>
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                               <div className="h-full bg-yellow-400 rounded-full" style={{ width: getProgressWidth(dailyLog.nutrients.fat.current, dailyLog.nutrients.fat.target) }}></div>
                            </div>
                        </div>

                        {/* Food Variety */}
                        <div className="bg-gray-50 rounded-lg p-2 flex flex-col justify-center items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-1 opacity-10">
                                <Utensils className="w-8 h-8 text-emerald-500" />
                            </div>
                            <span className="text-xl font-bold text-emerald-600">{dailyLog.food_variety}<span className="text-xs font-normal text-text-muted">/12</span></span>
                            <span className="text-[10px] text-text-muted">食材种类</span>
                        </div>
                    </div>
                </div>

                {/* Today Summary Card */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <h4 className="font-bold text-sm text-gray-900">今日状态</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-800">
                        今天是健康管理的重要一天！根据您的体质和近期记录，建议重点关注以下方面。保持规律的作息和均衡的饮食，您的身体会越来越棒！
                    </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                        <div className="bg-indigo-50 p-2 rounded-lg">
                            <Moon className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <div className="text-xs text-text-muted">睡眠状态</div>
                            <div className="text-sm font-bold text-text-main">良好</div>
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                        <div className="bg-orange-50 p-2 rounded-lg">
                            <Activity className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <div className="text-xs text-text-muted">运动状态</div>
                            <div className="text-sm font-bold text-text-main">达标</div>
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                        <div className="bg-green-50 p-2 rounded-lg">
                            <Utensils className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <div className="text-xs text-text-muted">饮食状态</div>
                            <div className="text-sm font-bold text-text-main">均衡</div>
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                        <div className="bg-emerald-50 p-2 rounded-lg">
                            <Stethoscope className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <div className="text-xs text-text-muted">消化状态</div>
                            <div className="text-sm font-bold text-text-main">正常</div>
                        </div>
                    </div>
                </div>

                {/* Today's Insight */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-sm font-bold text-gray-900">今日洞察</h4>
                    </div>
                    
                    {dailyLog.insight && (
                        <div className="space-y-4">
                            {/* Core Issue */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-gray-900">核心问题</div>
                                <div className="text-xs text-gray-800">
                                    {dailyLog.insight.coreIssue}
                                </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-gray-900">立即行动</div>
                                <div className="space-y-1">
                                    {dailyLog.insight.actions.map((action, index) => (
                                        <div key={index} className="text-xs text-gray-800 flex items-start gap-2">
                                            <span className="text-emerald-600 font-bold mt-0.5">
                                                {index + 1}.
                                            </span>
                                            <span>{action}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Constitution Fit */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-gray-900">体质适配</div>
                                <div className="text-xs text-gray-800">
                                    {dailyLog.insight.constitutionFit}
                                </div>
                            </div>
                            
                            {/* Period Tip */}
                            {dailyLog.insight.periodTip && (
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-gray-900">经期提示</div>
                                    <div className="text-xs text-gray-800">
                                        {dailyLog.insight.periodTip}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Week Insight */}
        {activeInsightTab === 'week' && (
            <div className="space-y-4">
                {/* AI Summary Card */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <h4 className="font-bold text-sm text-gray-900">AI 健康洞察</h4>
                    </div>
                    <div className="text-xs leading-relaxed text-gray-800">
                        {reportData.summary}
                    </div>
                </div>

                {/* Health Scores */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-bold text-sm text-gray-900">各模块健康分</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {reportData.radar && reportData.radar.map((item, index) => (
                            <div key={index} className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full">
                                <span className="text-xs font-medium text-gray-700">{item.subject}</span>
                                <span className="text-xs font-bold text-emerald-600">{item.A}/10</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Key Data Display */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-bold text-sm text-gray-900">关键数据</h4>
                    </div>
                    
                    {/* Module Summaries */}
                    <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs font-bold text-gray-900 mb-1">饮食</div>
                            <div className="text-xs text-gray-800">记录了5天，其中3天表现良好。平均食材种类为9种/天，建议增加到12种/天。</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs font-bold text-gray-900 mb-1">睡眠</div>
                            <div className="text-xs text-gray-800">记录了4天，平均睡眠时长6.5小时，其中2天在23点前入睡。建议增加到7-8小时。</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs font-bold text-gray-900 mb-1">运动</div>
                            <div className="text-xs text-gray-800">记录了3天，运动天数达标。建议保持每周至少3次中等强度运动。</div>
                        </div>
                    </div>
                    
                    {/* Trend Chart */}
                    <div className="mt-4">
                        <div className="text-xs font-bold text-gray-900 mb-2">每日得分趋势</div>
                        <div className="h-[150px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[
                                    { day: '周一', score: 7 },
                                    { day: '周二', score: 6 },
                                    { day: '周三', score: 8 },
                                    { day: '周四', score: 7 },
                                    { day: '周五', score: 9 },
                                    { day: '周六', score: 7 },
                                    { day: '周日', score: 8 }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                                    <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                                    <Tooltip 
                                        contentStyle={{ fontSize: '10px', padding: '8px' }}
                                        formatter={(value) => [`${value}/10分`, '健康得分']}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke="#10b981" 
                                        strokeWidth={2}
                                        dot={{ fill: '#10b981', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Week Insight */}
                {reportData.weekInsight && (
                    <div className="space-y-4">
                        {/* Long Term Problems */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingDown className="w-4 h-4 text-red-500" />
                                <h4 className="font-bold text-sm text-gray-900">长期问题</h4>
                            </div>
                            <div className="space-y-2">
                                {reportData.weekInsight.longTermProblems.map((problem, index) => (
                                    <div key={index} className="text-xs text-gray-800 flex items-start gap-2">
                                        <span className="text-red-500 font-bold mt-0.5">
                                            {index + 1}.
                                        </span>
                                        <span>{problem}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Next Week Goals */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <h4 className="font-bold text-sm text-gray-900">下周目标</h4>
                            </div>
                            <div className="space-y-2">
                                {reportData.weekInsight.nextWeekGoals.map((goal, index) => (
                                    <div key={index} className="text-xs text-gray-800 flex items-start gap-2">
                                        <span className="text-green-500 font-bold mt-0.5">
                                            {index + 1}.
                                        </span>
                                        <span>{goal}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Scientific Evidence */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <Info className="w-4 h-4 text-blue-500" />
                                <h4 className="font-bold text-sm text-gray-900">科学依据</h4>
                            </div>
                            <div className="text-xs text-gray-800">
                                {reportData.weekInsight.scientificEvidence}
                            </div>
                        </div>
                    </div>
                )}

                {/* Detailed Metrics Tabs */}
                <div className="space-y-3">
                  {/* Tab Headers */}
                  <div className="flex justify-between bg-gray-50 p-1 rounded-xl">
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center justify-center py-2 px-1 flex-1 rounded-lg transition-all ${isActive ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-emerald-500' : ''}`} />
                                <span className="text-[10px] font-medium">{tab.label}</span>
                            </button>
                        )
                    })}
                  </div>

                  {/* Active Tab Content */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-fade-in">
                     {activeDetail ? (
                     <>
                     <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                {activeDetail.title}
                                <span className={`text-xs px-2 py-0.5 rounded-full font-normal ${
                                    activeDetail.score >= 8 ? 'bg-emerald-100 text-emerald-700' :
                                    activeDetail.score >= 6 ? 'bg-orange-100 text-orange-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {activeDetail.status}
                                </span>
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{activeDetail.desc}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-2xl font-bold text-gray-900">{activeDetail.score}<span className="text-xs text-gray-400 font-normal">/10</span></div>
                            {/* Trend Indicator */}
                            <div className="flex items-center text-[10px] text-gray-400 gap-1">
                                {activeDetail.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-500" />}
                                {activeDetail.trend === 'down' && <TrendingDown className="w-3 h-3 text-green-500" />}
                                {activeDetail.trend === 'flat' && <Minus className="w-3 h-3 text-gray-400" />}
                                <span>较上周</span>
                            </div>
                        </div>
                     </div>

                     {/* Detailed Breakdown */}
                     <div className="bg-gray-50 rounded-xl p-3 mb-3">
                         <div className="text-xs text-gray-500 mb-1 font-bold">📊 数据详情</div>
                         <p className="text-sm text-gray-800 leading-relaxed">
                             {activeDetail.breakdown}
                         </p>
                     </div>

                     {/* Suggestion */}
                     <div className="flex items-start gap-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                         <Info className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                         <p className="text-xs text-emerald-800 leading-relaxed">
                             <span className="font-bold">合拍建议：</span>
                             {activeDetail.suggestion}
                         </p>
                     </div>
                     </>
                     ) : (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            暂无 {tabs.find(t => t.id === activeTab)?.label} 数据
                        </div>
                     )}
                  </div>
                </div>

            </div>
        )}

      </div>
    </div>
  );
};

export default HealthReport;

HealthReport.propTypes = {
  onBack: PropTypes.func
};
