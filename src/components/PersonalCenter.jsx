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

const PersonalCenter = ({ onClose }) => {
  const [userInfo, setUserInfo] = useState({});
  const [constitution, setConstitution] = useState(null);

  useEffect(() => {
    // Load data
    const userProfile = storageService.getUserProfile();
    if (userProfile.basicInfo) setUserInfo(userProfile.basicInfo);

    healthService.get_constitution('user').then(data => {
      setConstitution(data);
    });
  }, []);

  const [activeTab, setActiveTab] = useState('main'); // main, profile, report, questionnaire, manual_entry

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

        {/* Menu Grid - Parallel Layout */}
        <div className="grid grid-cols-3 gap-2">
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
             onClick={() => setActiveTab('report')}
             className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-emerald-200 transition-all group"
           >
              <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                 <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-text-main">健康周报</span>
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
    <div className="fixed inset-0 bg-gray-50 z-50 animate-slide-in-right overflow-y-auto">
      {/* Header - Simplified */}
      <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-gray-100">
         <h2 className="text-lg font-bold text-gray-800">个人中心</h2>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
          <X className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      <div className="px-4 pb-20 space-y-4 pt-4">
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
