import React, { useState, useEffect } from 'react';
import { Settings, Calendar, FileText, X } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { healthService } from '../services/healthService';
import { storageService } from '../services/storageService';
import HealthProfile from './personal/HealthProfile';
import ManualEntry from './personal/ManualEntry';
import HealthReport from './personal/HealthReport';
import QuestionnaireWrapper from './personal/QuestionnaireWrapper';
import DeviceConnect from './personal/DeviceConnect';

const PersonalCenter = ({ onClose, isModal = true }) => {
  const [userInfo, setUserInfo] = useState({});
  const [constitution, setConstitution] = useState(null);

  useEffect(() => {
    // Load data
    const userProfile = storageService.getUserProfile();
    if (userProfile.basicInfo) setUserInfo(userProfile.basicInfo);

    // MOCK DATA for "Yang Deficiency + Blood Deficiency"
    // Overriding the actual service call for visualization purposes as requested
    const mockConstitution = {
        type: '阳虚质 (兼血虚)',
        desc: '阳气不足，失于温煦，兼有面色苍白、唇甲淡白等血虚表现。建议温补阳气，兼顾养血。',
        radarData: [
            { subject: '阳虚', A: 90, fullMark: 100 },
            { subject: '血虚', A: 75, fullMark: 100 }, // Added specific dimension
            { subject: '气虚', A: 65, fullMark: 100 },
            { subject: '平和', A: 30, fullMark: 100 },
            { subject: '湿热', A: 20, fullMark: 100 },
            { subject: '阴虚', A: 25, fullMark: 100 },
            { subject: '痰湿', A: 35, fullMark: 100 },
            { subject: '气郁', A: 40, fullMark: 100 },
            { subject: '血瘀', A: 15, fullMark: 100 },
            { subject: '特禀', A: 10, fullMark: 100 },
        ]
    };
    
    // CRITICAL: Persist mock data to storage so HealthService can see it!
    storageService.updateUserProfileSection('constitution', mockConstitution);
    setConstitution(mockConstitution);

    // Original Logic (Commented out for mock)
    /*
    healthService.get_constitution('user').then(data => {
      setConstitution(data);
    });
    */
  }, []);

  const [activeTab, setActiveTab] = useState('main'); // main, profile, report, questionnaire, manual_entry, goals

  // --- New Goal Component ---
  const GoalsSection = () => {
    const [goals, setGoals] = useState([]);
    
    useEffect(() => {
        const profile = storageService.getUserProfile();
        if (profile.goals) setGoals(profile.goals);
    }, []);

    const toggleGoal = (goal) => {
        const newGoals = goals.includes(goal) 
            ? goals.filter(g => g !== goal)
            : [...goals, goal];
        setGoals(newGoals);
        storageService.updateUserProfileSection('goals', newGoals);
    };

    const options = [
        '改善睡眠', '减肥减脂', '调理月经', '增强体质', '缓解焦虑', '改善肠胃', '备孕调理', '美容养颜'
    ];

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-brand rounded-full"></span>
                调理目标
            </h3>
            <div className="grid grid-cols-2 gap-2">
                {options.map(opt => (
                    <button 
                        key={opt}
                        onClick={() => toggleGoal(opt)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${goals.includes(opt) ? 'bg-brand/10 border-brand text-brand' : 'bg-gray-50 border-gray-100 text-text-muted hover:bg-gray-100'}`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return <HealthProfile onBack={() => setActiveTab('main')} />;
      case 'report':
        return <HealthReport onBack={() => setActiveTab('main')} />;
      case 'questionnaire':
         return (
            <QuestionnaireWrapper 
                onBack={() => setActiveTab('main')}
                onComplete={(result) => {
                    setConstitution(result);
                    setActiveTab('main');
                }}
            />
         );
      case 'manual_entry':
         return (
            <ManualEntry 
              onBack={() => setActiveTab('main')} 
              onSaveSuccess={() => {
                // Refresh constitution data
                healthService.get_constitution('user').then(data => {
                  setConstitution(data);
                  setActiveTab('main');
                });
              }}
            />
         );
      case 'device_connect':
        return <DeviceConnect onBack={() => setActiveTab('main')} />;
      default:
        return (
          <>
        {/* Constitution Radar Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
           {constitution?.radarData ? (
             <>
               <div className="mb-4 text-center">
                  <h2 className="text-xl font-bold text-emerald-800">
                    {constitution.type}
                    <span className="text-sm font-normal text-text-muted ml-2">为主</span>
                  </h2>
                  <p className="text-xs text-text-muted mt-2 px-4">
                     {constitution.desc ? constitution.desc.split('。')[0] : ''}
                  </p>
               </div>
               
               {/* Radar Chart */}
               <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={constitution.radarData}>
                      <PolarGrid stroke="#94a3b8" strokeDasharray="4 4" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="体质"
                        dataKey="A"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="#10b981"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
               
               {/* Action Buttons */}
               <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => setActiveTab('questionnaire')}
                    className="flex-1 py-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all"
                  >
                    补充问卷
                  </button>
                  <button 
                    onClick={() => setActiveTab('manual_entry')}
                    className="flex-1 py-3 bg-white border border-gray-200 text-text-main text-xs font-bold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    录入结论
                  </button>
               </div>
             </>
           ) : (
             <div className="flex flex-col items-center gap-4 text-center px-4 py-6">
                <div className="w-20 h-20 bg-brand/5 rounded-full flex items-center justify-center text-4xl mb-2">🧬</div>
                <div>
                   <h3 className="text-lg font-bold text-text-main mb-1">开启您的体质档案</h3>
                   <p className="text-xs text-text-muted max-w-[200px] mx-auto leading-relaxed">
                     了解自己是阳虚、湿热还是平和质？获取专属调理方案。
                   </p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                    <button 
                        onClick={() => setActiveTab('questionnaire')}
                        className="flex-1 py-2.5 bg-brand text-white text-xs font-bold rounded-xl shadow-brand/20 shadow-md hover:bg-brand-dark transition-all"
                    >
                        补充问卷
                    </button>
                    <button 
                        onClick={() => setActiveTab('manual_entry')}
                        className="flex-1 py-2.5 bg-white border border-gray-200 text-text-main text-xs font-bold rounded-xl hover:bg-gray-50 transition-all"
                    >
                        录入结论
                    </button>
                </div>
             </div>
           )}
        </div>
        
        {/* Goals Section (Removed) - Moved to HealthProfile */}

        {/* Menu Grid - Parallel Layout */}
        <div className="grid grid-cols-2 gap-2">
           <button 
             onClick={() => setActiveTab('profile')}
             className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-emerald-200 transition-all relative overflow-hidden group"
           >
              <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                 <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-text-main">健康档案</span>
           </button>

           <button 
             onClick={() => setActiveTab('device_connect')}
             className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-emerald-200 transition-all group"
           >
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                 <Settings className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-text-main">设备连接</span>
           </button>
        </div>
          </>
        );
    }
  };

  return (
    <div className={`bg-gray-50 z-50 animate-slide-in-right overflow-y-auto ${isModal ? 'fixed inset-0' : 'w-full h-full min-h-[400px]'}`}>
      {/* Header - Simplified */}
      {isModal && (
        <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-gray-100">
           <h2 className="text-lg font-bold text-gray-800">个人中心</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>
      )}

      <div className={`px-4 pb-20 space-y-4 ${isModal ? 'pt-4' : 'pt-2'}`}>
         {renderContent()}
         
         {/* Debug / Reset - Only show on main tab */}
         {activeTab === 'main' && (
            <div className="pt-4">
               <button 
                 onClick={() => {
                    if(window.confirm('确定要清除所有数据并重置吗？')) {
                        storageService.clearAll();
                        window.location.reload();
                    }
                 }}
                 className="w-full py-3 text-xs text-red-400 font-medium hover:bg-red-50 rounded-xl transition-all"
               >
                 重置所有数据 (Debug)
               </button>
            </div>
         )}
      </div>
    </div>
  );
};

export default PersonalCenter;
