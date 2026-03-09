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
  ResponsiveContainer 
} from 'recharts';
import { healthService } from '../../services/healthService';

const HealthReport = ({ onBack }) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('emotion');

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const data = await healthService.report_weekly('current_user', currentWeekOffset);
        setReportData(data);
      } catch (e) {
        console.error("Failed to load report", e);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [currentWeekOffset]);

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
                  <span className="text-xs text-gray-400">正在生成周报...</span>
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
            <h3 className="font-bold text-lg text-emerald-900">健康周报</h3>
            
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
        
        {/* AI Summary Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <h4 className="font-bold text-sm">AI 整体综述</h4>
          </div>
          <p className="text-xs leading-relaxed text-emerald-50 relative z-10 text-justify">
            {reportData.summary}
          </p>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm relative">
           <div className="absolute top-2 left-3 text-xs font-bold text-gray-400">五维健康模型</div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={reportData.radar}>
                <PolarGrid stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={({ payload, x, y, textAnchor }) => (
                    <text
                      x={x}
                      y={y}
                      className="text-[10px] font-bold fill-gray-500"
                      textAnchor={textAnchor}
                    >
                      {payload.value}
                      <tspan className="fill-emerald-600 font-bold" dx={2}>
                         {reportData.radar.find(r => r.subject === payload.value)?.A}
                      </tspan>
                    </text>
                  )}
                />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
                <Radar
                  name="Health"
                  dataKey="A"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="#10b981"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

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
    </div>
  );
};

export default HealthReport;

HealthReport.propTypes = {
  onBack: PropTypes.func
};
