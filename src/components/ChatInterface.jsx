import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, Camera, Sparkles, Activity, Utensils, Moon, FileText, Calendar, PlusCircle, CheckCircle, XCircle, TrendingUp, AlertCircle, TrendingDown, Minus, Info, LayoutDashboard, Settings } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import DailyFeed from './DailyFeed';
import PersonalCenter from './PersonalCenter';
import AuthStatus from './AuthStatus';
import { healthService } from '../services/healthService';
import { storageService } from '../services/storageService';
import { scoringService } from '../services/scoringService';
import { useHealthAgent } from '../hooks/useHealthAgent.js';
import { questionnaireData, calculateConstitution } from '../data/questionnaire';

// --- Sub Components ---

const BasicInfoCard = ({ info, setInfo, onSubmit }) => {
  const [step, setStep] = useState(1);
  const totalSteps = info.gender === 'male' ? 3 : 4;

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg mx-4 mb-4 animate-fade-in-up space-y-4">
      <div className="flex items-center justify-between mb-2">
         <div className="flex items-center gap-2">
            <span className="bg-brand/10 p-1.5 rounded-lg text-brand"><FileText className="w-4 h-4" /></span>
            <h3 className="font-bold text-text-main">建立健康档案 ({step}/{totalSteps})</h3>
         </div>
         {step > 1 && <button onClick={prevStep} className="text-xs text-text-muted hover:text-brand">上一步</button>}
      </div>
      
      {/* Step 1: Basic Stats */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-3">
             <button onClick={() => setInfo({...info, gender: 'female'})} className={`flex-1 py-3 rounded-xl text-sm border transition-all ${info.gender === 'female' ? 'bg-brand text-white border-brand shadow-md' : 'border-gray-100 text-text-muted bg-gray-50'}`}>我是女生 👩</button>
             <button onClick={() => setInfo({...info, gender: 'male'})} className={`flex-1 py-3 rounded-xl text-sm border transition-all ${info.gender === 'male' ? 'bg-brand text-white border-brand shadow-md' : 'border-gray-100 text-text-muted bg-gray-50'}`}>我是男生 👨</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
             <div className="space-y-1">
               <label className="text-[10px] text-text-muted pl-1">年龄</label>
               <input type="number" value={info.age} onChange={(e) => setInfo({...info, age: e.target.value})} className="w-full bg-gray-50 p-2.5 rounded-xl text-center outline-none focus:ring-1 focus:ring-brand text-sm font-medium" placeholder="25" />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] text-text-muted pl-1">身高(cm)</label>
               <input type="number" value={info.height} onChange={(e) => setInfo({...info, height: e.target.value})} className="w-full bg-gray-50 p-2.5 rounded-xl text-center outline-none focus:ring-1 focus:ring-brand text-sm font-medium" placeholder="165" />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] text-text-muted pl-1">体重(kg)</label>
               <input type="number" value={info.weight} onChange={(e) => setInfo({...info, weight: e.target.value})} className="w-full bg-gray-50 p-2.5 rounded-xl text-center outline-none focus:ring-1 focus:ring-brand text-sm font-medium" placeholder="50" />
             </div>
          </div>
          <button onClick={nextStep} disabled={!info.age || !info.height || !info.weight} className="w-full bg-brand text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-brand/90 transition-all shadow-md">下一步</button>
        </div>
      )}

      {/* Step 2: Female Period (Only if Female) */}
      {step === 2 && info.gender === 'female' && (
        <div className="space-y-4 animate-fade-in">
          <h4 className="text-sm font-medium text-text-main">生理期记录 (用于周期预测)</h4>
          <div className="space-y-3">
             <div className="bg-gray-50 p-3 rounded-xl">
               <label className="text-xs text-text-muted block mb-2">上次月经第一天</label>
               <div className="flex gap-2">
                 <input 
                    type="date" 
                    value={info.lastPeriod} 
                    onChange={(e) => setInfo({...info, lastPeriod: e.target.value})} 
                    disabled={info.periodUnknown}
                    className={`flex-1 bg-transparent text-brand font-medium outline-none ${info.periodUnknown ? 'opacity-30' : ''}`} 
                 />
                 <button 
                    onClick={() => setInfo({...info, periodUnknown: !info.periodUnknown, lastPeriod: ''})}
                    className={`text-xs px-2 rounded-lg border transition-all ${info.periodUnknown ? 'bg-brand text-white border-brand' : 'border-gray-200 text-text-muted'}`}
                 >
                    记不清了
                 </button>
               </div>
               {info.periodUnknown && <p className="text-[10px] text-brand mt-1">没关系，下次来的时候告诉我，我帮您记下来。</p>}
             </div>
             <div className="flex gap-3">
                <div className="flex-1 bg-gray-50 p-3 rounded-xl">
                  <label className="text-xs text-text-muted block mb-1">周期(天)</label>
                  <input type="number" value={info.cycleLen} onChange={(e) => setInfo({...info, cycleLen: e.target.value})} className="w-full bg-transparent text-brand font-medium outline-none" placeholder="28" />
                </div>
                <div className="flex-1 bg-gray-50 p-3 rounded-xl">
                  <label className="text-xs text-text-muted block mb-1">经期(天)</label>
                  <input type="number" value={info.periodLen} onChange={(e) => setInfo({...info, periodLen: e.target.value})} className="w-full bg-transparent text-brand font-medium outline-none" placeholder="5" />
                </div>
             </div>
             
             {/* Period Flow */}
             <div>
                <div className="flex justify-between items-center mb-1">
                   <label className="text-xs text-text-muted">经量</label>
                   <span className="text-[10px] text-brand/80 bg-brand/5 px-2 py-0.5 rounded-full">正常：日用棉每天换3-5次 (每次湿透中心)</span>
                </div>
                <div className="flex gap-2">
                   {[
                     { id: 'light', label: '少', desc: '仅需护垫 / 点滴状' },
                     { id: 'normal', label: '正常', desc: '每天湿透中心 3-5 次' },
                     { id: 'heavy', label: '多', desc: '1-2小时完全湿透一片' }
                   ].map(opt => (
                     <button key={opt.id} onClick={() => setInfo({...info, periodFlow: opt.id})} className={`flex-1 py-2 px-1 rounded-lg border transition-all flex flex-col items-center gap-0.5 ${info.periodFlow === opt.id ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-gray-100 text-text-muted'}`}>
                       <span className="text-xs font-bold">{opt.label}</span>
                       <span className="text-[9px] opacity-70 scale-90">{opt.desc}</span>
                     </button>
                   ))}
                </div>
             </div>

             {/* Period Color */}
             <div>
                <div className="flex justify-between items-center mb-1">
                   <label className="text-xs text-text-muted">颜色</label>
                   <span className="text-[10px] text-brand/80 bg-brand/5 px-2 py-0.5 rounded-full">正常：暗红转鲜红，无血块</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                   {[
                     { id: 'pale', label: '淡红', color: 'bg-rose-200' },
                     { id: 'bright', label: '鲜红', color: 'bg-red-500' },
                     { id: 'dark', label: '暗红', color: 'bg-red-900' },
                     { id: 'clotted', label: '有血块', color: 'bg-gray-800' } // Symbolic
                   ].map(opt => (
                     <button key={opt.id} onClick={() => setInfo({...info, periodColor: opt.id})} className={`py-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${info.periodColor === opt.id ? 'ring-2 ring-rose-200 border-transparent' : 'border-gray-100'}`}>
                       <div className={`w-3 h-3 rounded-full ${opt.color}`}></div>
                       <span className={`text-[10px] ${info.periodColor === opt.id ? 'text-rose-600 font-bold' : 'text-text-muted'}`}>{opt.label}</span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="flex gap-2">
                {['无痛感', '轻微痛', '剧烈痛'].map(opt => (
                  <button key={opt} onClick={() => setInfo({...info, painLevel: opt})} className={`flex-1 py-2 text-xs rounded-lg border transition-all ${info.painLevel === opt ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-gray-100 text-text-muted'}`}>{opt}</button>
                ))}
             </div>
          </div>
          <button onClick={nextStep} className="w-full bg-brand text-white py-3 rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-md">下一步</button>
        </div>
      )}

      {/* Step 3: Activity Level */}
      {step === (info.gender === 'female' ? 3 : 2) && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h4 className="text-sm font-medium text-text-main mb-2">体力活动 (影响热量基数)</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                  { id: 'light', label: '久坐少动', desc: '坐办公室，出门坐车，几乎不运动' },
                  { id: 'medium', label: '日常活动', desc: '日常走动，做家务，或每周运动1-3次' },
                  { id: 'heavy', label: '高强度', desc: '重体力劳动，或高强度健身习惯' }
              ].map(opt => (
                <button key={opt.id} onClick={() => setInfo({...info, activity: opt.id})} className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between ${info.activity === opt.id ? 'bg-orange-50 border-orange-200' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <div>
                        <div className={`text-sm font-bold ${info.activity === opt.id ? 'text-orange-700' : 'text-text-main'}`}>{opt.label}</div>
                        <div className="text-[10px] text-text-muted mt-0.5">{opt.desc}</div>
                    </div>
                    {info.activity === opt.id && <CheckCircle className="w-4 h-4 text-orange-500" />}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-text-main mb-2">脑力强度 (影响营养配比)</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                  { id: 'low', label: '轻松不费脑', desc: '工作生活压力小，心情放松' },
                  { id: 'medium', label: '正常用脑', desc: '正常上班上学，偶尔需要集中精力' },
                  { id: 'high', label: '高压烧脑', desc: '长期精神紧绷，思考量大，容易焦虑' }
              ].map(opt => (
                <button key={opt.id} onClick={() => setInfo({...info, brainLoad: opt.id})} className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between ${info.brainLoad === opt.id ? 'bg-blue-50 border-blue-200' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <div>
                        <div className={`text-sm font-bold ${info.brainLoad === opt.id ? 'text-blue-700' : 'text-text-main'}`}>{opt.label}</div>
                        <div className="text-[10px] text-text-muted mt-0.5">{opt.desc}</div>
                    </div>
                    {info.brainLoad === opt.id && <CheckCircle className="w-4 h-4 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>

          <button onClick={nextStep} className="w-full bg-brand text-white py-3 rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-md">下一步</button>
        </div>
      )}

      {/* Step 4: Habits & Goals */}
      {step === (info.gender === 'female' ? 4 : 3) && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium text-text-main mb-2">平时入睡时间</h4>
                <div className="grid grid-cols-2 gap-2">
                {[
                    { id: 'early', label: '22:00 前', desc: '养生达人' },
                    { id: 'normal', label: '22:00 - 23:00', desc: '健康作息' },
                    { id: 'late', label: '23:00 - 0:00', desc: '现代标准' },
                    { id: 'owl', label: '0:00 后', desc: '熬夜修仙' }
                ].map(opt => (
                    <button key={opt.id} onClick={() => setInfo({...info, sleepTime: opt.id})} className={`p-2 rounded-xl border transition-all text-left ${info.sleepTime === opt.id ? 'bg-indigo-50 border-indigo-200' : 'border-gray-100'}`}>
                        <div className={`text-xs font-bold ${info.sleepTime === opt.id ? 'text-indigo-600' : 'text-text-main'}`}>{opt.label}</div>
                        <div className="text-[10px] text-text-muted">{opt.desc}</div>
                    </button>
                ))}
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium text-text-main mb-2">平均睡眠时长</h4>
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                {[
                    { id: 'short', label: '< 7h' },
                    { id: '7h', label: '7h' },
                    { id: '7-8h', label: '7-8h' },
                    { id: '8-9h', label: '8-9h' },
                    { id: 'long', label: '> 9h' }
                ].map(opt => (
                    <button key={opt.id} onClick={() => setInfo({...info, sleepDuration: opt.id})} className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${info.sleepDuration === opt.id ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-gray-100 text-text-muted'}`}>
                        {opt.label}
                    </button>
                ))}
                </div>
            </div>
          </div>

          <div>
             <h4 className="text-sm font-medium text-text-main mb-2">核心调理目标 (多选)</h4>
             <div className="flex flex-wrap gap-2">
               {[
                   '气色红润', '心情舒畅', '身体轻盈', 
                   '安睡整晚', '规律月经', '精力充沛', 
                   '护眼明目', '头发浓密'
               ].filter(opt => info.gender === 'female' || opt !== '规律月经').map(opt => {
                 const currentGoals = info.goal || [];
                 return (
                 <button 
                   key={opt} 
                   onClick={() => {
                     const newGoals = currentGoals.includes(opt) ? currentGoals.filter(g => g !== opt) : [...currentGoals, opt];
                     setInfo({...info, goal: newGoals});
                   }} 
                   className={`px-3 py-1.5 rounded-full text-xs border transition-all ${currentGoals.includes(opt) ? 'bg-brand text-white border-brand' : 'border-gray-100 text-text-muted'}`}
                 >
                   {opt}
                 </button>
               )})}
             </div>
          </div>

          <button onClick={onSubmit} className="w-full bg-brand text-white py-3 rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-md">完成档案</button>
        </div>
      )}
    </div>
  );
};

const TongueUploadCard = ({ onUpload }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmUpload = async () => {
      if (isUploading) return;
      setIsUploading(true);
      
      // Step 1: Notify Parent immediately to show "Analyzing" message in chat
      // This prevents the "stuck" feeling
      onUpload(previewUrl); 
      
      // Note: We don't reset isUploading here because the parent component 
      // will unmount this card or change the step once analysis is done.
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg mx-4 mb-4 animate-fade-in-up space-y-4">
       <div className="flex items-center gap-2 mb-1">
          <span className="bg-brand/10 p-1.5 rounded-lg text-brand"><ImageIcon className="w-4 h-4" /></span>
          <h3 className="font-bold text-text-main">上传舌诊照片</h3>
       </div>
       
       {/* Instruction Guide */}
       <div className="bg-gray-50 p-4 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-text-muted">📸 拍照标准示范</h4>
          <div className="flex gap-2">
             <div className="flex-1 bg-white p-2 rounded-lg border border-gray-100 flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-lg">☀️</div>
                <span className="text-[10px] text-text-muted text-center">自然光充足</span>
             </div>
             <div className="flex-1 bg-white p-2 rounded-lg border border-gray-100 flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-lg">👅</div>
                <span className="text-[10px] text-text-muted text-center">自然伸出</span>
             </div>
             <div className="flex-1 bg-white p-2 rounded-lg border border-gray-100 flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-lg">🚫</div>
                <span className="text-[10px] text-text-muted text-center">无美颜滤镜</span>
             </div>
          </div>
          <div className="text-[10px] text-text-muted opacity-80 leading-relaxed">
             * 请分别拍摄【舌面】和【舌底】（卷起舌头）
          </div>
       </div>

       {/* Upload Button */}
       <input 
         type="file" 
         ref={fileInputRef} 
         className="hidden" 
         accept="image/*" 
         capture="user"
         onChange={handleFileChange}
       />

       {!previewUrl ? (
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="w-full py-4 border-2 border-dashed border-brand/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-brand/5 transition-all group"
           >
             <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6 text-brand" />
             </div>
             <span className="text-xs font-bold text-brand">点击拍摄 / 上传照片</span>
           </button>
       ) : (
           <div className="space-y-3">
               <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200">
                   <img src={previewUrl} alt="Tongue Preview" className="w-full h-full object-cover" />
                   <button 
                     onClick={() => { setPreviewUrl(null); fileInputRef.current.value = ''; }}
                     className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                   >
                     <XCircle className="w-5 h-5" />
                   </button>
               </div>
               <button 
                 onClick={handleConfirmUpload}
                 disabled={isUploading}
                 className={`w-full bg-brand text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 ${isUploading ? 'opacity-80 cursor-wait' : 'hover:bg-brand/90'}`}
               >
                 {isUploading ? (
                    <>
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       正在上传并分析...
                    </>
                 ) : '确认上传并分析'}
               </button>
           </div>
       )}
       
       {!previewUrl && (
        <button onClick={() => onUpload(null)} className="w-full text-xs text-text-muted hover:text-brand underline">
            暂不上传，跳过 (影响准确度)
        </button>
       )}
    </div>
  );
};

const ReminderSetupCard = ({ settings, onConfirm, onChange }) => {
  const [activeTab, setActiveTab] = useState('workday'); // workday, weekend

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg space-y-4 animate-fade-in-up mx-4 mb-4">
      <div className="flex items-center gap-2 mb-1">
         <span className="bg-brand/10 p-1.5 rounded-lg text-brand"><Calendar className="w-4 h-4" /></span>
         <h3 className="font-bold text-text-main">专属提醒时间</h3>
      </div>
      <p className="text-xs text-text-muted leading-relaxed">
        为了不打扰您的生活，我会在这两个时间点轻轻提醒您。<br/>
        <span className="opacity-70">早安问候：开启一天能量 · 晚安记录：复盘今日健康</span>
      </p>

      {/* Tabs */}
      <div className="flex bg-gray-50 p-1 rounded-xl mb-2">
         <button onClick={() => setActiveTab('workday')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'workday' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted'}`}>工作日 (周一至周五)</button>
         <button onClick={() => setActiveTab('weekend')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'weekend' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted'}`}>周末 / 节假日</button>
      </div>
      
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-transparent focus-within:border-brand/20 transition-all">
          <span className="text-sm font-medium text-text-main">☀️ 早安问候</span>
          <input 
            type="time" 
            value={activeTab === 'workday' ? settings.workday.morning : settings.weekend.morning}
            onChange={(e) => onChange(activeTab, 'morning', e.target.value)}
            className="bg-transparent text-brand font-bold outline-none text-right"
          />
        </div>
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-transparent focus-within:border-brand/20 transition-all">
          <span className="text-sm font-medium text-text-main">🌙 晚安记录</span>
          <input 
            type="time" 
            value={activeTab === 'workday' ? settings.workday.night : settings.weekend.night}
            onChange={(e) => onChange(activeTab, 'night', e.target.value)}
            className="bg-transparent text-brand font-bold outline-none text-right"
          />
        </div>
      </div>

      <button 
        onClick={onConfirm}
        className="w-full bg-brand text-white py-3 rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-md active:scale-[0.98]"
      >
        确认时间，开始合拍之旅
      </button>
    </div>
  );
};

const DeviceSetupCard = ({ onConfirm, onSkip }) => {
  const [devices, setDevices] = useState({
    apple: false,
    huawei: false,
    xiaomi: false
  });
  const [isConnecting, setIsConnecting] = useState(null);

  const toggleDevice = (id) => {
    if (devices[id]) {
      setDevices(prev => ({ ...prev, [id]: false }));
    } else {
      setIsConnecting(id);
      setTimeout(() => {
        setDevices(prev => ({ ...prev, [id]: true }));
        setIsConnecting(null);
      }, 1000);
    }
  };

  const hasConnected = Object.values(devices).some(Boolean);

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg mx-4 mb-4 animate-fade-in-up space-y-4">
      <div className="flex items-center gap-2 mb-1">
         <span className="bg-brand/10 p-1.5 rounded-lg text-brand"><Activity className="w-4 h-4" /></span>
         <h3 className="font-bold text-text-main">绑定智能设备</h3>
      </div>
      <p className="text-xs text-text-muted leading-relaxed">
        连接您的智能手环/手表，AI 将自动同步运动与睡眠数据，提供更精准的建议。
      </p>

      <div className="space-y-3">
        {[
          { id: 'apple', name: 'Apple 健康', icon: '🍎' },
          { id: 'huawei', name: '华为运动健康', icon: '🔴' },
          { id: 'xiaomi', name: '小米运动', icon: '🟠' }
        ].map(dev => (
          <div key={dev.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-lg">{dev.icon}</span>
              <span className="text-sm font-bold text-text-main">{dev.name}</span>
            </div>
            <button 
              onClick={() => toggleDevice(dev.id)}
              disabled={isConnecting === dev.id}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                devices[dev.id] 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'bg-white text-text-muted border border-gray-200 hover:border-brand hover:text-brand'
              }`}
            >
              {isConnecting === dev.id ? '连接中...' : devices[dev.id] ? '已连接' : '连接'}
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-2">
        <button 
          onClick={() => onConfirm(devices)}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${hasConnected ? 'bg-brand text-white hover:bg-brand/90' : 'bg-gray-100 text-gray-400'}`}
          disabled={!hasConnected}
        >
          确认绑定
        </button>
        <button 
          onClick={onSkip}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-text-muted hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
        >
          暂不绑定
        </button>
      </div>
    </div>
  );
};

const WeeklyReportCard = ({ report }) => {
    const [scoreData, setScoreData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchScoreData = () => {
            try {
                const data = scoringService.calculateWeeklyScore(0);
                setScoreData(data);
            } catch (error) {
                console.error('计算评分失败:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchScoreData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4 animate-fade-in-up mx-2 mb-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-24 bg-gray-200 rounded mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!scoreData) return null;

    const getScoreInfo = (score) => {
        let level = '需改善';
        let color = 'text-red-600';
        let bg = 'bg-red-50';
        let border = 'border-red-200';
        if (score >= 8.5) {
            level = '优秀';
            color = 'text-green-600';
            bg = 'bg-green-50';
            border = 'border-green-200';
        } else if (score >= 7) {
            level = '良好';
            color = 'text-emerald-600';
            bg = 'bg-emerald-50';
            border = 'border-emerald-200';
        } else if (score >= 5) {
            level = '达标';
            color = 'text-orange-600';
            bg = 'bg-orange-50';
            border = 'border-orange-200';
        }
        return { level, color, bg, border };
    };

    const score = scoreData.totalScore || 0;
    const scoreInfo = getScoreInfo(score);

    const moduleScores = [
        { subject: '饮食', A: scoreData.moduleScores.diet.score },
        { subject: '睡眠', A: scoreData.moduleScores.sleep.score },
        { subject: '运动', A: scoreData.moduleScores.exercise.score },
        { subject: '消化', A: scoreData.moduleScores.poop.score }
    ];

    return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4 animate-fade-in-up mx-2 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold text-gray-900">{report?.dateRange || '本周'}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-400">综合得分</span>
          <div className="text-2xl font-bold text-emerald-600 leading-none font-serif flex items-baseline">
            {score}
            <span className="text-xs text-emerald-400 ml-0.5 font-sans font-normal">/10</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="font-bold text-sm text-gray-900">各模块健康分</h4>
        </div>
        <div className="flex justify-between gap-2">
          {moduleScores.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] font-medium text-gray-500">{item.subject}</span>
              <span className="text-lg font-bold text-emerald-600">{item.A}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <h4 className="font-bold text-sm text-gray-900">AI 健康洞察</h4>
        </div>
        <div className="text-xs leading-relaxed text-gray-800">
          <div className="space-y-3">
            <div>
              <div className="font-bold text-gray-900 mb-1">做得好</div>
              <div className="text-xs text-gray-800">本周饮食种类丰富，排便规律顺畅，运动习惯也在逐步养成。</div>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-1">需要改善</div>
              <div className="text-xs text-gray-800">有3天晚于23:00入睡，错过了养肝黄金期。</div>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-1">下周改善方向</div>
              <div className="text-xs text-gray-800">尽量在23:00前入睡，每周运动增加到4-5次，饮食继续保持多样性。</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-sm text-gray-900">分模块总结</h4>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-3">
            <div className="text-xs font-bold text-gray-900 mb-1">饮食</div>
            <div className="text-[10px] text-gray-600 mb-2">记录了5天，其中3天表现良好。平均食材种类为9种/天，建议增加到12种/天。</div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreData.dailyTrends} margin={{ left: -10, right: 0, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 8 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 8 }} width={30} />
                  <Tooltip contentStyle={{ fontSize: '9px', padding: '5px' }} formatter={(value) => [`${value}分`, '饮食得分']} />
                  <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-3">
            <div className="text-xs font-bold text-gray-900 mb-1">睡眠</div>
            <div className="text-[10px] text-gray-600 mb-2">记录了4天，平均睡眠时长6.5小时，其中2天在23点前入睡。建议增加到7-8小时。</div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreData.dailyTrends} margin={{ left: -10, right: 0, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 8 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 8 }} width={30} />
                  <Tooltip contentStyle={{ fontSize: '9px', padding: '5px' }} formatter={(value) => [`${value}分`, '睡眠得分']} />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-3">
            <div className="text-xs font-bold text-gray-900 mb-1">运动</div>
            <div className="text-[10px] text-gray-600 mb-2">记录了3天，运动天数达标。建议保持每周至少3次中等强度运动。</div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreData.dailyTrends} margin={{ left: -10, right: 0, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 8 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 8 }} width={30} />
                  <Tooltip contentStyle={{ fontSize: '9px', padding: '5px' }} formatter={(value) => [`${value}分`, '运动得分']} />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-3">
            <div className="text-xs font-bold text-gray-900 mb-1">消化</div>
            <div className="text-[10px] text-gray-600 mb-2">排便规律顺畅，形态正常。继续保持良好的饮食习惯。</div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreData.dailyTrends} margin={{ left: -10, right: 0, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 8 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 8 }} width={30} />
                  <Tooltip contentStyle={{ fontSize: '9px', padding: '5px' }} formatter={(value) => [`${value}分`, '消化得分']} />
                  <Line type="monotone" dataKey="score" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
};

const PeriodRecordCard = ({ onConfirm }) => {
  const [flow, setFlow] = useState('medium');
  const [pain, setPain] = useState('none');
  const [mood, setMood] = useState('normal');
  const [color, setColor] = useState('bright_red');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const flowOptions = [
    { id: 'light', l: '少量', desc: '1-2片/天', note: '护垫或迷你卫生巾' },
    { id: 'medium', l: '中量', desc: '3-5片/天', note: '普通卫生巾' },
    { id: 'heavy', l: '多量', desc: '6片以上/天', note: '需要频繁更换' }
  ];

  const painOptions = [
    { id: 'none', l: '无', e: '无不适' },
    { id: 'mild', l: '轻微', e: '轻微胀痛' },
    { id: 'moderate', l: '中等', e: '需要休息' },
    { id: 'severe', l: '严重', e: '影响生活' }
  ];

  const moodOptions = [
    { id: 'happy', l: '开心', e: '😀' },
    { id: 'normal', l: '正常', e: '🙂' },
    { id: 'anxious', l: '焦虑', e: '😰' },
    { id: 'irritable', l: '烦躁', e: '😤' },
    { id: 'sad', l: '低落', e: '😔' }
  ];

  const colorOptions = [
    { id: 'bright_red', l: '鲜红色', e: '正常初期' },
    { id: 'dark_red', l: '暗红色', e: '正常后期' },
    { id: 'brown', l: '褐色', e: '开始/结束' },
    { id: 'pink', l: '淡粉色', e: '量少' }
  ];

  const handleConfirm = () => {
    onConfirm({ flow, pain, mood, color, date });
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg mx-4 mb-4 animate-fade-in-up space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="bg-rose-50 p-1.5 rounded-lg text-rose-500"><Calendar className="w-4 h-4" /></span>
        <h3 className="font-bold text-text-main">经期记录</h3>
      </div>

      <div className="space-y-3">
        {/* Date */}
        <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
          <span className="text-xs text-text-muted">日期</span>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-sm font-bold text-text-main outline-none text-right"
          />
        </div>

        {/* Flow */}
        <div>
          <label className="text-xs text-text-muted mb-2 block">经血量</label>
          <div className="grid grid-cols-3 gap-2">
            {flowOptions.map(opt => (
              <button 
                key={opt.id}
                onClick={() => setFlow(opt.id)}
                className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${flow === opt.id ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-gray-100 text-text-muted'}`}
              >
                <span className="text-lg">{opt.id === 'light' ? '🩸' : opt.id === 'medium' ? '🩸🩸' : '🩸🩸🩸'}</span>
                <span className="text-xs font-bold">{opt.l}</span>
                <span className="text-[9px] opacity-80">{opt.desc}</span>
                <span className="text-[8px] opacity-60">{opt.note}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="text-xs text-text-muted mb-2 block">颜色</label>
          <div className="flex gap-2">
            {colorOptions.map(opt => (
              <button 
                key={opt.id}
                onClick={() => setColor(opt.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 ${color === opt.id ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-gray-100 text-text-muted'}`}
              >
                <span className="text-xs">{opt.l}</span>
                <span className="text-[9px] opacity-70">{opt.e}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pain */}
        <div>
          <label className="text-xs text-text-muted mb-2 block">痛感</label>
          <div className="grid grid-cols-4 gap-2">
            {painOptions.map(opt => (
              <button 
                key={opt.id}
                onClick={() => setPain(opt.id)}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${pain === opt.id ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-gray-100 text-text-muted'}`}
              >
                <span className="block">{opt.l}</span>
                <span className="text-[9px] opacity-70">{opt.e}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div>
          <label className="text-xs text-text-muted mb-2 block">心情</label>
          <div className="grid grid-cols-5 gap-1">
            {moodOptions.map(opt => (
              <button 
                key={opt.id}
                onClick={() => setMood(opt.id)}
                className={`py-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 ${mood === opt.id ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-gray-100 text-text-muted'}`}
              >
                <span className="text-lg">{opt.e}</span>
                <span className="text-[9px]">{opt.l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleConfirm} className="w-full bg-rose-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-rose-600 transition-all shadow-md">
        确认记录
      </button>
    </div>
  );
};

const DailyStatusCard = ({ onConfirm }) => {
  const [selected, setSelected] = useState([]);
  const [showCustom, setShowCustom] = useState(false);
  const [customText, setCustomText] = useState('');
  
  const options = [
    { id: 'happy', label: '开心', icon: '😊' },
    { id: 'calm', label: '平静', icon: '😌' },
    { id: 'anxious', label: '焦虑', icon: '😰' },
    { id: 'nervous', label: '紧张', icon: '😓' },
    { id: 'sad', label: '难过', icon: '😔' },
  ];

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
  };

  const handleConfirm = () => {
    let finalSelected = [...selected];
    if (showCustom && customText.trim()) {
      finalSelected.push(customText.trim());
    }
    onConfirm(finalSelected);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg mx-4 mb-4 animate-fade-in-up space-y-4">
       <div className="flex items-center gap-2 mb-1">
          <span className="bg-blue-50 p-1.5 rounded-lg text-blue-500"><Activity className="w-4 h-4" /></span>
          <h3 className="font-bold text-text-main">记心情</h3>
       </div>

       <div className="grid grid-cols-5 gap-2">
          {options.map(opt => (
             <button key={opt.id} onClick={() => toggle(opt.id)} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${selected.includes(opt.id) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-100 bg-gray-50 text-text-muted'}`}>
                <span className="text-xl">{opt.icon}</span>
                <span className="text-[10px] font-bold">{opt.label}</span>
             </button>
          ))}
       </div>

       <button onClick={() => setShowCustom(!showCustom)} className={`w-full py-2 text-xs font-medium rounded-lg transition-colors border ${showCustom ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-text-muted'}`}>
         {showCustom ? '收起自定义' : '+ 自定义心情'}
       </button>

       {showCustom && (
         <div className="space-y-2">
           <input
             type="text"
             value={customText}
             onChange={(e) => setCustomText(e.target.value)}
             placeholder="请输入您的心情..."
             className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-brand"
           />
         </div>
       )}

       <button onClick={handleConfirm} disabled={selected.length === 0 && (!showCustom || !customText.trim())} className="w-full bg-blue-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-md disabled:opacity-50">
         记录
       </button>
    </div>
  );
};

const PoopRecordCard = ({ onConfirm }) => {
  const [shape, setShape] = useState(null);
  const [color, setColor] = useState('黄褐');
  const [smell, setSmell] = useState('正常');
  const [amount, setAmount] = useState('约一根');
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const shapes = [
    { id: 1, label: '硬块状', desc: '一颗颗硬球 便秘', svg: (
      <svg viewBox="0 0 100 50" className="w-20 h-10">
        <ellipse cx="20" cy="25" rx="10" ry="8" fill="#8B4513"/>
        <ellipse cx="45" cy="25" rx="10" ry="8" fill="#8B4513"/>
        <ellipse cx="72" cy="25" rx="10" ry="8" fill="#8B4513"/>
      </svg>
    )},
    { id: 2, label: '干硬状', desc: '偏硬，小块黏在一起', svg: (
      <svg viewBox="0 0 100 50" className="w-20 h-10">
        <ellipse cx="25" cy="25" rx="15" ry="12" fill="#8B4513"/>
        <ellipse cx="55" cy="25" rx="15" ry="12" fill="#8B4513"/>
      </svg>
    )},
    { id: 3, label: '裂纹状', desc: '香肠形态，布满裂纹', svg: (
      <svg viewBox="0 0 100 50" className="w-20 h-10">
        <ellipse cx="50" cy="25" rx="40" ry="14" fill="#8B4513"/>
        <line x1="30" y1="15" x2="30" y2="35" stroke="#654321" strokeWidth="2"/>
        <line x1="50" y1="14" x2="50" y2="36" stroke="#654321" strokeWidth="2"/>
        <line x1="70" y1="15" x2="70" y2="35" stroke="#654321" strokeWidth="2"/>
      </svg>
    )},
    { id: 4, label: '香蕉状', desc: '顺滑柔软', svg: (
      <svg viewBox="0 0 100 50" className="w-20 h-10">
        <path d="M 12 30 Q 30 12, 50 25 Q 70 38, 88 20" 
              stroke="#8B4513" strokeWidth="14" fill="none" strokeLinecap="round"/>
      </svg>
    )},
    { id: 5, label: '柔块状', desc: '容易通过 边缘光滑', svg: (
      <svg viewBox="0 0 100 50" className="w-20 h-10">
        <rect x="15" y="18" width="22" height="14" rx="4" fill="#8B4513"/>
        <rect x="40" y="18" width="22" height="14" rx="4" fill="#8B4513"/>
        <rect x="65" y="20" width="20" height="10" rx="4" fill="#8B4513"/>
      </svg>
    )},
    { id: 6, label: '糊状', desc: '边缘粗糙，蓬松', svg: (
      <svg viewBox="0 0 100 50" className="w-20 h-10">
        <ellipse cx="50" cy="25" rx="42" ry="14" fill="#8B4513" opacity="0.7"/>
        <circle cx="25" cy="22" r="6" fill="#8B4513"/>
        <circle cx="45" cy="28" r="5" fill="#8B4513"/>
        <circle cx="65" cy="20" r="6" fill="#8B4513"/>
        <circle cx="80" cy="26" r="5" fill="#8B4513"/>
      </svg>
    )},
    { id: 7, label: '水状', desc: '无固体，纯水', svg: (
      <svg viewBox="0 0 100 50" className="w-20 h-10">
        <ellipse cx="50" cy="30" rx="45" ry="12" fill="#8B4513" opacity="0.5"/>
      </svg>
    )},
  ];

  const colors = [
    { id: 'yellow_brown', label: '黄褐', color: '#Cca464' },
    { id: 'dark_brown', label: '深棕', color: '#654321' },
    { id: 'dark_green', label: '墨绿', color: '#2F4F4F' },
    { id: 'black', label: '黑色', color: '#000000' },
    { id: 'pale', label: '浅白', color: '#F0E68C' },
    { id: 'red', label: '血丝', color: '#8B0000' },
  ];

  const smells = ['正常', '较臭', '酸臭', '腥臭', '无味'];

  const amounts = [
    { id: 'less', label: '不到半根', desc: '偏少', icon: '🍌' },
    { id: 'normal', label: '约一根', desc: '健康参考', icon: '🍌' },
    { id: 'more', label: '超一根半', desc: '偏多', icon: '🍌🍌' },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg mx-4 mb-4 animate-fade-in-up space-y-4">
       <div className="flex items-center gap-2 mb-1">
          <span className="bg-emerald-50 p-1.5 rounded-lg text-emerald-500"><PlusCircle className="w-4 h-4" /></span>
          <h3 className="font-bold text-text-main">排便记录</h3>
       </div>

       {/* 1. Shape (Bristol) */}
       <div>
         <label className="text-xs text-text-muted mb-2 block">形态 (Bristol分型)</label>
         <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {shapes.map(s => (
                <button 
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all min-w-[90px] ${shape === s.id ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-100 bg-gray-50'}`}
                >
                    {s.svg}
                    <span className="text-[10px] font-bold text-text-main">{s.label}</span>
                    <span className="text-[8px] text-text-muted leading-tight text-center">{s.desc}</span>
                </button>
            ))}
         </div>
       </div>

       {/* 2. Color */}
       <div>
         <label className="text-xs text-text-muted mb-2 block">颜色</label>
         <div className="grid grid-cols-4 gap-2">
            {colors.map(c => (
                <button
                    key={c.id}
                    onClick={() => setColor(c.label)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${color === c.label ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100'}`}
                >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></div>
                    <span className="text-xs text-text-main">{c.label}</span>
                </button>
            ))}
         </div>
       </div>

       {/* 3. Amount */}
       <div>
         <label className="text-xs text-text-muted mb-2 block">量</label>
         <div className="space-y-2">
            {amounts.map(a => (
                <button
                    key={a.id}
                    onClick={() => setAmount(a.label)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${amount === a.label ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{a.icon}</span>
                        <span className="text-sm font-bold text-text-main">{a.label}</span>
                    </div>
                    <span className="text-xs text-text-muted">{a.desc}</span>
                </button>
            ))}
         </div>
       </div>

       {/* 4. Time & Smell */}
       <div className="flex gap-3">
           <div className="flex-1">
               <label className="text-xs text-text-muted mb-1 block">时间</label>
               <input 
                 type="time" 
                 value={time}
                 onChange={(e) => setTime(e.target.value)}
                 className="w-full bg-gray-50 p-2 rounded-xl text-center text-sm font-bold text-text-main outline-none focus:ring-1 focus:ring-emerald-500"
               />
           </div>
           <div className="flex-[2]">
               <label className="text-xs text-text-muted mb-1 block">气味</label>
               <div className="flex gap-1 overflow-x-auto no-scrollbar">
                  {smells.map(s => (
                      <button
                        key={s}
                        onClick={() => setSmell(s)}
                        className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs transition-all ${smell === s ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-100 text-text-muted'}`}
                      >
                        {s}
                      </button>
                  ))}
               </div>
           </div>
       </div>

       <button 
         onClick={() => onConfirm({ shape, color, smell, amount, time })}
         disabled={!shape}
         className="w-full bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
       >
         记录完成
       </button>
    </div>
  );
};

const SleepDataVerifyCard = ({ data, onConfirm, onReject }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg mx-4 mb-4 animate-fade-in-up space-y-4">
      <div className="flex items-center gap-2 mb-1">
         <span className="bg-indigo-50 p-1.5 rounded-lg text-indigo-500"><Activity className="w-4 h-4" /></span>
         <h3 className="font-bold text-text-main">智能设备数据同步</h3>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-xl space-y-3">
         <div className="flex justify-between items-center">
            <span className="text-xs text-text-muted">入睡时间</span>
            <span className="text-sm font-bold text-text-main">{data.sleepTime}</span>
         </div>
         <div className="flex justify-between items-center">
            <span className="text-xs text-text-muted">起床时间</span>
            <span className="text-sm font-bold text-text-main">{data.wakeTime}</span>
         </div>
         <div className="flex justify-between items-center border-t border-gray-200 pt-2">
            <span className="text-xs text-text-muted">总睡眠时长</span>
            <span className="text-lg font-bold text-indigo-600">{data.duration}</span>
         </div>
         <div className="flex justify-between items-start border-t border-gray-200 pt-2">
            <span className="text-xs text-text-muted">易醒时段</span>
            <div className="text-right">
                {data.wakePeriods && data.wakePeriods.length > 0 && !data.wakePeriods.includes('none') ? (
                    data.wakePeriods.map(p => (
                        <span key={p} className="text-xs font-medium text-text-main bg-white border border-gray-200 px-1.5 py-0.5 rounded-md ml-1 inline-block mb-1">
                            {p === 'zi' ? '23:00-01:00 (子时)' : p === 'chou' ? '01:00-03:00 (丑时)' : p === 'yin' ? '03:00-05:00 (寅时)' : p === 'mao' ? '05:00-07:00 (卯时)' : p}
                        </span>
                    ))
                ) : <span className="text-xs text-text-muted">无明显易醒</span>}
            </div>
         </div>
      </div>

      <p className="text-xs text-center text-text-muted">请确认以上数据是否准确？</p>

      <div className="flex gap-3">
        <button onClick={onConfirm} className="flex-1 bg-brand text-white py-3 rounded-xl text-sm font-bold shadow-md hover:bg-brand/90">
          准确 (去补充感受)
        </button>
        <button onClick={onReject} className="flex-1 bg-white text-text-muted border border-gray-200 py-3 rounded-xl text-sm font-bold hover:bg-gray-50">
          不准 (手动修改)
        </button>
      </div>
    </div>
  );
};

const SleepRecordCard = ({ onConfirm, mode = 'full', initialData = {} }) => {
  const [activeTab, setActiveTab] = useState('night'); // night, nap
  const [sleepTime, setSleepTime] = useState(initialData.sleepTime || '23:00');
  const [wakeTime, setWakeTime] = useState(initialData.wakeTime || '06:30');
  const [wakePeriods, setWakePeriods] = useState(initialData.wakePeriods || []);
  const [dreamState, setDreamState] = useState('基本无梦');
  const [subjectiveEval, setSubjectiveEval] = useState(null); // good, normal, bad

  // TCM Wake Periods
  const tcmWakeOptions = [
    { label: '23:00-01:00 (子时)', value: 'zi' },
    { label: '01:00-03:00 (丑时)', value: 'chou' },
    { label: '03:00-05:00 (寅时)', value: 'yin' },
    { label: '05:00-07:00 (卯时)', value: 'mao' },
    { label: '没有', value: 'none' },
  ];

  const dreamOptions = ['基本无梦', '有梦不影响', '多梦影响休息', '常做噩梦'];

  const calculateDuration = () => {
    const [sH, sM] = sleepTime.split(':').map(Number);
    const [wH, wM] = wakeTime.split(':').map(Number);
    let diff = (wH * 60 + wM) - (sH * 60 + sM);
    if (diff < 0) diff += 24 * 60;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h${m}m`;
  };

  const handleWakePeriodToggle = (val) => {
    if (val === 'none') {
        setWakePeriods(['none']);
        return;
    }
    setWakePeriods(prev => {
        if (prev.includes('none')) return [val];
        if (prev.includes(val)) return prev.filter(v => v !== val);
        return [...prev, val];
    });
  };

  const getScore = () => {
     if (subjectiveEval === 'good') return 95;
     if (subjectiveEval === 'normal') return 75;
     if (subjectiveEval === 'bad') return 50;
     return 80;
  };

  return (
    <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100 shadow-lg mx-4 mb-4 animate-fade-in-up space-y-4">
       {/* Tabs - Only show in full mode or if user wants to switch */}
       {mode === 'full' && (
        <div className="flex bg-white p-1 rounded-xl mb-2">
            <button onClick={() => setActiveTab('night')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'night' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted'}`}>夜间睡眠</button>
            <button onClick={() => setActiveTab('nap')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'nap' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted'}`}>午休小憩</button>
        </div>
       )}

       {activeTab === 'night' ? (
         <>
           {/* Time Inputs - Only in Full Mode */}
           {mode === 'full' ? (
               <>
                <div className="bg-white p-4 rounded-xl flex items-center justify-between">
                    <div className="text-center">
                        <div className="text-xs text-text-muted mb-1">入睡</div>
                        <input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)} className="text-xl font-bold text-text-main bg-transparent outline-none w-20 text-center" />
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-text-muted mb-1">起床</div>
                        <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="text-xl font-bold text-text-main bg-transparent outline-none w-20 text-center" />
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-text-muted mb-1">时长</div>
                        <div className="text-xl font-bold text-emerald-500">{calculateDuration()}</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-text-muted font-bold ml-1">夜间易醒时段</label>
                    <div className="flex flex-wrap gap-2">
                    {tcmWakeOptions.map(opt => (
                        <button 
                        key={opt.value} 
                        onClick={() => handleWakePeriodToggle(opt.value)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${wakePeriods.includes(opt.value) ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-bold' : 'bg-white border-gray-100 text-text-muted'}`}
                        >
                        {opt.label}
                        </button>
                    ))}
                    </div>
                </div>
               </>
           ) : (
               // Supplement Mode: Show read-only summary
               <div className="bg-white p-3 rounded-xl flex items-center justify-between opacity-80">
                  <div className="text-xs text-text-muted">已确认数据：<br/>{sleepTime} - {wakeTime} ({calculateDuration()})</div>
                  <button onClick={() => alert('请在完整模式下修改')} className="text-xs text-brand font-bold">已同步设备</button>
               </div>
           )}

           {/* Dreams */}
           <div className="space-y-2">
             <label className="text-xs text-text-muted font-bold ml-1">梦境</label>
             <div className="flex flex-wrap gap-2">
               {dreamOptions.map(opt => (
                 <button 
                   key={opt} 
                   onClick={() => setDreamState(opt)}
                   className={`px-3 py-1.5 rounded-full text-xs border transition-all ${dreamState === opt ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-bold' : 'bg-white border-gray-100 text-text-muted'}`}
                 >
                   {opt}
                 </button>
               ))}
             </div>
           </div>

           {/* Subjective Evaluation */}
           <div className="space-y-2 pt-2 border-t border-gray-100">
             <label className="text-sm font-bold text-text-main ml-1">整体自评</label>
             <div className="flex gap-3">
               <button onClick={() => setSubjectiveEval('good')} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${subjectiveEval === 'good' ? 'bg-green-50 border-green-200 text-green-700 ring-1 ring-green-200' : 'bg-white border-gray-100 text-text-muted'}`}>
                 <span className="text-xl">😊</span> <span className="font-bold">好</span>
               </button>
               <button onClick={() => setSubjectiveEval('normal')} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${subjectiveEval === 'normal' ? 'bg-orange-50 border-orange-200 text-orange-700 ring-1 ring-orange-200' : 'bg-white border-gray-100 text-text-muted'}`}>
                 <span className="text-xl">😐</span> <span className="font-bold">一般</span>
               </button>
               <button onClick={() => setSubjectiveEval('bad')} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${subjectiveEval === 'bad' ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-200' : 'bg-white border-gray-100 text-text-muted'}`}>
                 <span className="text-xl">😓</span> <span className="font-bold">差</span>
               </button>
             </div>
           </div>

           <button 
             disabled={!subjectiveEval}
             onClick={() => onConfirm({ sleepTime, wakeTime, duration: calculateDuration(), wakePeriods, dreamState, subjectiveEval, score: getScore() })} 
             className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-md mt-2 ${subjectiveEval ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
           >
             提交记录
           </button>
         </>
       ) : (
         <div className="bg-white p-8 rounded-xl text-center text-text-muted">
           <p>午休功能暂未开放</p>
           <button onClick={() => setActiveTab('night')} className="text-emerald-500 font-bold mt-2 text-sm">返回夜间睡眠</button>
         </div>
       )}
    </div>
  );
};

const DietSummaryCard = ({ onConfirm, basicInfo }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const logs = storageService.getDailyLogs(today);
    const dietList = logs.diet || [];
    const nutrition = logs.nutrition || { calories: 0, nutrients: { carb: 0, protein: 0, fat: 0 } };

    // 1. Calculate Target (TDEE)
    let bmr = 0;
    const w = parseFloat(basicInfo.weight || 60);
    const h = parseFloat(basicInfo.height || 165);
    const a = parseFloat(basicInfo.age || 30);
    
    if (basicInfo.gender === 'male') {
        bmr = (13.88 * w) + (4.16 * h) - (3.43 * a) - 112.4;
    } else {
        bmr = (9.24 * w) + (3.1 * h) - (4.33 * a) + 447.6;
    }
    const activityFactors = { 'light': 1.2, 'medium': 1.55, 'heavy': 1.725 };
    const targetCal = Math.round(bmr * (activityFactors[basicInfo.activity] || 1.2)) || 1800;

    // 2. Judgment Logic
    const currentCal = parseFloat(nutrition.calories || 0);
    const ratio = targetCal > 0 ? currentCal / targetCal : 0;
    
    let judgmentTitle = "";
    let judgmentDesc = "";
    const constitutionType = storageService.getUserProfile().constitution?.type || '平和质';
    const goals = basicInfo.goal || [];

    if (currentCal === 0) {
        judgmentTitle = "暂无记录";
        judgmentDesc = "今天还没有记录饮食哦，快去告诉 AI 你吃了什么吧。";
    } else if (ratio < 0.85) {
        judgmentTitle = "摄入不足";
        judgmentDesc = "热量未达标。";
        if (constitutionType.includes('虚')) judgmentDesc += " 气虚体质切忌过度节食，容易导致代谢降低，建议适当加餐。";
        else if (goals.includes('精力充沛')) judgmentDesc += " 能量不足会影响精力，建议补充优质碳水。";
        else judgmentDesc += " 长期低热量可能导致代谢损伤，建议适当加餐。";
    } else if (ratio > 1.15) {
        judgmentTitle = "摄入超标";
        judgmentDesc = "热量略高于目标。";
        if (constitutionType.includes('痰') || constitutionType.includes('湿')) judgmentDesc += " 痰湿体质代谢较慢，建议晚餐少吃，多吃绿叶菜。";
        else if (goals.includes('身体轻盈')) judgmentDesc += " 想要身体轻盈，记得控制总量哦。";
        else judgmentDesc += " 建议饭后散步消食。";
    } else {
        judgmentTitle = "摄入适宜";
        judgmentDesc = "热量控制得很棒！";
        if (constitutionType === '平和质') judgmentDesc += " 继续保持，均衡饮食最重要。";
        else judgmentDesc += " 非常符合您当前的体质调理节奏。";
    }

    setData({
        count: dietList.length,
        nutrition,
        targetCal,
        judgmentTitle,
        judgmentDesc
    });
  }, [basicInfo]);

  if (!data) return <div className="p-4 text-center text-xs text-text-muted">正在分析数据...</div>;

  // Helpers for progress bars
  const getPercent = (cur, target) => Math.min((cur / target) * 100, 100);
  
  // Targets for Macros (Approximate: 55/15/30)
  const targetCarb = Math.round(data.targetCal * 0.55 / 4);
  const targetProtein = Math.round(data.targetCal * 0.15 / 4);
  const targetFat = Math.round(data.targetCal * 0.30 / 9);

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg mx-4 mb-4 animate-fade-in-up space-y-5">
      <div className="flex items-center justify-between mb-1">
         <div className="flex items-center gap-2">
            <span className="bg-orange-50 p-1.5 rounded-lg text-orange-500"><Utensils className="w-4 h-4" /></span>
            <h3 className="font-bold text-text-main">今日饮食复盘</h3>
         </div>
         <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-text-muted">{new Date().toLocaleDateString()}</span>
      </div>

      {/* 1. Summary Stats */}
      <div className="flex gap-4 items-end">
          <div className="flex-1">
              <div className="text-xs text-text-muted mb-1">总热量 / 目标</div>
              <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-bold text-orange-600">{Math.round(data.nutrition.calories)}</span>
                 <span className="text-xs text-text-muted">/ {data.targetCal} kcal</span>
              </div>
          </div>
          <div className="text-right">
              <div className="text-xs text-text-muted mb-1">已记录食物</div>
              <div className="font-bold text-text-main">{data.count} 种</div>
          </div>
      </div>

      {/* 2. Judgment Box */}
      <div className={`p-3 rounded-xl border ${data.judgmentTitle === '摄入适宜' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-orange-50 border-orange-100 text-orange-800'}`}>
          <div className="flex items-center gap-2 mb-1">
             <Sparkles className="w-4 h-4" />
             <span className="font-bold text-sm">{data.judgmentTitle}</span>
          </div>
          <p className="text-xs opacity-90 leading-relaxed">{data.judgmentDesc}</p>
      </div>

      {/* 3. Nutrient Progress */}
      <div className="space-y-3 pt-2 border-t border-gray-50">
          <h4 className="text-xs font-bold text-text-muted">三大营养素达标情况</h4>
          
          {/* Carbs */}
          <div className="space-y-1">
             <div className="flex justify-between text-[10px] text-text-muted">
                <span>碳水化合物</span>
                <span>{Math.round(data.nutrition.nutrients.carb)} / {targetCarb}g</span>
             </div>
             <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${getPercent(data.nutrition.nutrients.carb, targetCarb)}%` }}></div>
             </div>
          </div>

          {/* Protein */}
          <div className="space-y-1">
             <div className="flex justify-between text-[10px] text-text-muted">
                <span>蛋白质</span>
                <span>{Math.round(data.nutrition.nutrients.protein)} / {targetProtein}g</span>
             </div>
             <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${getPercent(data.nutrition.nutrients.protein, targetProtein)}%` }}></div>
             </div>
          </div>

          {/* Fat */}
          <div className="space-y-1">
             <div className="flex justify-between text-[10px] text-text-muted">
                <span>脂肪</span>
                <span>{Math.round(data.nutrition.nutrients.fat)} / {targetFat}g</span>
             </div>
             <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${getPercent(data.nutrition.nutrients.fat, targetFat)}%` }}></div>
             </div>
          </div>
      </div>

      <button onClick={() => onConfirm(data.count === 0 ? 'record' : 'confirm')} className="w-full bg-gray-100 text-text-main py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">
         {data.count > 0 ? '我已了解' : '去记录饮食'}
      </button>
    </div>
  );
};

const FoodAnalysisCard = ({ data, onConfirm }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3 w-full max-w-sm">
     <div className="relative h-32 rounded-xl overflow-hidden bg-gray-100 mb-2">
        {/* Placeholder for the actual uploaded image if we had it passed down, or a generic food banner */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
           <Utensils className="w-8 h-8" />
        </div>
        {data.imageUrl && <img src={data.imageUrl} alt="Food" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
           <h3 className="text-white font-bold text-lg leading-none">{data.food}</h3>
           <p className="text-white/80 text-xs mt-1">预估重量: {data.weight}</p>
        </div>
     </div>

     <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
        <div className="flex justify-between items-center mb-2">
           <span className="text-xs font-bold text-orange-800">🔥 热量预估</span>
           <span className="text-lg font-bold text-orange-600">{data.nutrition.calories} <span className="text-xs font-normal text-orange-400">kcal</span></span>
        </div>
        <div className="flex gap-2 text-center">
           <div className="flex-1 bg-white rounded-lg p-1.5 shadow-sm">
              <div className="text-[10px] text-gray-400">碳水</div>
              <div className="text-xs font-bold text-gray-700">{data.nutrition.nutrients.carb}g</div>
           </div>
           <div className="flex-1 bg-white rounded-lg p-1.5 shadow-sm">
              <div className="text-[10px] text-gray-400">蛋白质</div>
              <div className="text-xs font-bold text-gray-700">{data.nutrition.nutrients.protein}g</div>
           </div>
           <div className="flex-1 bg-white rounded-lg p-1.5 shadow-sm">
              <div className="text-[10px] text-gray-400">脂肪</div>
              <div className="text-xs font-bold text-gray-700">{data.nutrition.nutrients.fat}g</div>
           </div>
        </div>
     </div>

     <div className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-xl">
        <span className="font-bold text-gray-700">🤖 AI 分析：</span>
        {data.analysis}
     </div>

     <div className="flex gap-2 pt-1">
        <button onClick={() => onConfirm(true)} className="flex-1 bg-brand text-white py-2 rounded-xl text-xs font-bold shadow-md hover:bg-brand/90 transition-colors">
           确认记录
        </button>
        <button onClick={() => onConfirm(false)} className="flex-1 bg-white text-gray-400 border border-gray-200 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">
           修正信息
        </button>
     </div>
  </div>
);

const WeeklyReportPanel = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeInsightTab, setActiveInsightTab] = useState('today');
  const [dailyLog, setDailyLog] = useState({
    calories: { current: 0, target: 0 },
    nutrients: {
      carbs: { current: 0, target: 0 },
      protein: { current: 0, target: 0 },
      fat: { current: 0, target: 0 }
    },
    food_variety: 0,
    judgment: "今天也要好好吃饭哦",
    records: {
      sleep: false,
      exercise: false,
      diet: false,
      poop: false
    }
  });

  const getProgressWidth = (current, target) => {
    if (!target || target <= 0) return '0%';
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100) + '%';
  };

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

      const todayRecords = {
        sleep: !!dailyLogs.sleep,
        exercise: !!dailyLogs.exercise,
        diet: !!dailyLogs.diet && dailyLogs.diet.length > 0,
        poop: !!dailyLogs.poop
      };

      setDailyLog({
          calories: { current: currentCalories, target: dynamicTarget },
          nutrients: {
            carbs: { current: nutrients.carb, target: Math.round(dynamicTarget * 0.55 / 4) },
            protein: { current: nutrients.protein, target: Math.round(dynamicTarget * 0.15 / 4) },
            fat: { current: nutrients.fat, target: Math.round(dynamicTarget * 0.3 / 9) },
          },
          food_variety: dailyLogs.diet ? new Set(dailyLogs.diet.map(d => d.name)).size : 0,
          judgment: judgment,
          records: todayRecords
      });
    };

    window.addEventListener('storage', updateFromStorage);
    updateFromStorage();

    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
         await new Promise(r => setTimeout(r, 800));
         const mockReport = {
            dateRange: '2023.10.23 - 2023.10.29',
            score: 8.5,
            summary: '本周健康状况整体平稳，但作息与饮食存在改善空间。',
            tcmInsight: '本周有 3 天晚于 23:00 入睡，此时正是<strong>胆经当令</strong>（23点-1点），“凡十一脏取决于胆”，此时熬夜最伤阳气，易致口苦、两肋胀痛。此外，饮食中<strong>辛辣油腻</strong>占比 40%，这与您的<strong>湿热体质</strong>相悖，如同“火上浇油”，容易加重困倦乏力感。',
            correlationInsight: {
                title: '健康连锁反应',
                content: '监测到您周二、周三连续<strong>熬夜</strong>（睡眠<6h），紧接着周四记录了<strong>“精神不振”</strong>且<strong>排便干结</strong>。这形成了一条明显的证据链：熬夜伤阴 -> 肠道津液不足 -> 排便困难。您的身体正在抗议作息的不规律。'
            },
            metrics: {
                sleepAvg: 6.8,
                exerciseDays: 3,
                dietScore: 72,
                poopStatus: '干结'
            },
            actionCards: [
                {
                    type: 'diet',
                    title: '饮食调理',
                    icon: Utensils,
                    color: 'text-orange-500',
                    bg: 'bg-orange-50',
                    content: '下周重点“清热祛湿”。建议晚餐尝试绿豆薏米粥，减少麻辣火锅频次。多吃冬瓜、丝瓜等甘淡食物。'
                },
                {
                    type: 'exercise',
                    title: '运动建议',
                    icon: Activity,
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-50',
                    content: '避免大汗淋漓的剧烈运动。推荐每日 15 分钟八段锦，或傍晚进行快走，以微汗为度，疏通气机。'
                },
                {
                    type: 'mood',
                    title: '情志调节',
                    icon: Moon,
                    color: 'text-indigo-500',
                    bg: 'bg-indigo-50',
                    content: '睡前 1 小时放下手机，尝试正念冥想或腹式呼吸。周末建议去森林/公园徒步，吸氧洗肺，舒缓焦虑。'
                }
            ]
         };
         setReport(mockReport);
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
    };
    
    fetchReport();
  }, []);

  if (loading) {
    return (
        <div className="p-8 flex flex-col items-center justify-center text-text-muted">
            <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin mb-2"></div>
            <span className="text-xs">正在生成健康洞察...</span>
        </div>
    );
  }

  if (!report) return <div className="p-4 text-center text-text-muted text-xs">暂无数据</div>;

  return (
    <div className="space-y-4">
      {/* Insight Tabs - Today vs Week */}
      <div className="flex bg-gray-50 p-1 rounded-xl mx-2">
          <button 
              onClick={() => setActiveInsightTab('today')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeInsightTab === 'today' ? 'bg-white shadow-sm text-brand' : 'text-gray-400 hover:text-gray-600'}`}
          >
              今日洞察
          </button>
          <button 
              onClick={() => setActiveInsightTab('week')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeInsightTab === 'week' ? 'bg-white shadow-sm text-brand' : 'text-gray-400 hover:text-gray-600'}`}
          >
              本周洞察
          </button>
      </div>

      {/* Today Insight */}
      {activeInsightTab === 'today' && (
          <div className="space-y-4">
              {/* 1. 营养概览 */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mx-2">
                  <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-text-main text-sm">营养概览</h3>
                      <span className="text-[10px] text-text-muted">目标 {dailyLog.calories.target} kcal</span>
                  </div>

                  {/* Calories Progress */}
                  <div className="mb-3">
                      <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-text-muted">热量摄入</span>
                          <span className="font-medium text-brand">{dailyLog.calories.current} / {dailyLog.calories.target}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div 
                              className="h-full bg-brand rounded-full transition-all duration-500" 
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
                              <Utensils className="w-8 h-8 text-brand" />
                          </div>
                          <span className="text-xl font-bold text-brand">{dailyLog.food_variety}<span className="text-xs font-normal text-text-muted">/12</span></span>
                          <span className="text-[10px] text-text-muted">食材种类</span>
                      </div>
                  </div>
              </div>

              {/* 2. 运动时长统计 */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mx-2">
                  <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-orange-500" />
                      <h3 className="font-semibold text-text-main text-sm">运动时长统计</h3>
                  </div>
                  <div className="text-xs text-text-muted">
                      今日还未记录运动，建议进行30分钟中等强度运动。
                  </div>
              </div>

              {/* 3. 明日建议 */}
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 space-y-2 mx-2">
                  <div className="flex items-center gap-2 text-orange-800">
                      <Sparkles className="w-4 h-4" />
                      <h4 className="text-sm font-bold">明日建议</h4>
                  </div>
                  <p className="text-xs text-orange-900/80 leading-relaxed">
                      根据您的体质特点，明天建议适当增加一些温补食物，避免生冷。保持心情舒畅，适当运动，会让您感觉更有活力！
                  </p>
              </div>
          </div>
      )}

      {/* Week Insight */}
      {activeInsightTab === 'week' && (
          <WeeklyReportCard report={report} />
      )}
    </div>
  );
};

const ChatInterface = ({ onOpenProfile }) => {
  // --- Smart Agent Integration ---
  const { processMessage: agentProcessMessage, isTyping: agentIsTyping } = useHealthAgent();

  // --- Constants ---
  const INITIAL_MESSAGE = {
      id: 1,
      sender: 'ai',
      text: '您好！我是您的专属健康管家。我会提醒您记录饮食、睡眠、运动等信心，帮您不费力做好健康管理。为了给您提供最准确的建议，我们需要先建立一份您的健康档案，请您填写对应信息。',
      time: '10:00'
  };

  // --- State with Persistence ---
  const [messages, setMessages] = useState(() => {
    const msgs = storageService.getMessages();
    return msgs.length ? msgs : [INITIAL_MESSAGE];
  });

  const [inputValue, setInputValue] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  
  // Top Panel State: 'profile', 'weekly', 'daily', or null
  // Default to null (closed) to let user focus on Chat/Morning Check-in first
  const [activeTab, setActiveTab] = useState(null); 
  
  const toggleTab = (tab) => {
    setActiveTab(prev => prev === tab ? null : tab);
  };

  const [currentStep, setCurrentStep] = useState(() => {
    return storageService.getAppState().currentStep || 'basic_info';
  });
  
  // Data State
  const [basicInfo, setBasicInfo] = useState(() => {
    const saved = storageService.getUserProfile().basicInfo;
    const defaults = { gender: 'female', age: '', height: '', weight: '', activity: 'light', goal: [] };
    return { ...defaults, ...saved };
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  
  const [reminderSettings, setReminderSettings] = useState(() => {
     return storageService.getSettings().reminders;
  });
  
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  const [dietPending, setDietPending] = useState(null); 
  const [dailyFoodLog, setDailyFoodLog] = useState(() => {
     const today = new Date().toISOString().split('T')[0];
     const logs = storageService.getDailyLogs(today).diet || [];
     return logs.map(l => typeof l === 'string' ? l : l.name);
  });
  
  const [questionnaireProgress, setQuestionnaireProgress] = useState(() => {
    return storageService.getAppState().questionnaireProgress || 0;
  });

  const [questionnaireAnswers, setQuestionnaireAnswers] = useState(() => {
    return storageService.getAppState().questionnaireAnswers || {};
  });

  const [lastSleepData, setLastSleepData] = useState(() => {
     return storageService.getLatestHealthRecord('sleep');
  });

  const [constitutionResult, setConstitutionResult] = useState(() => {
    return storageService.getUserProfile().constitution;
  });

  const [sleepRecordMode, setSleepRecordMode] = useState('full');
  const [tempSleepData, setTempSleepData] = useState(null);

  const [isAiTyping, setIsAiTyping] = useState(false);
  // const [showDashboard, setShowDashboard] = useState(true); // Replaced by activeTab

  const messagesEndRef = useRef(null);
  const foodInputRef = useRef(null);

  // --- Constants ---
  const allShortcuts = [
    { id: 'status', label: '记心情', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'sleep', label: '记睡眠', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'poop', label: '记排便', icon: PlusCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' }, 
  ];

  const shortcuts = allShortcuts;

  const symptomOptions = [
    { category: '睡眠', options: ['失眠', '多梦', '夜间易醒', '睡不醒', '入睡困难'] },
    { category: '消化', options: ['胃胀', '便秘', '腹泻', '大便不成形', '食欲不振'] },
    { category: '精力', options: ['容易疲劳', '精神不振', '情绪烦躁', '焦虑'] },
    { category: '身体', options: ['手脚冰凉', '容易出汗', '怕冷', '怕热'] },
  ];

  // --- Persistence Effects ---
  useEffect(() => {
    // Safety check for invalid states on load
    // Check for critical fields to determine if profile is "complete enough" to skip onboarding
    const hasProfile = basicInfo.age && basicInfo.height && basicInfo.weight && basicInfo.activity;

    // 1. Fix Zombie Questionnaire State
    // User reported getting stuck in questionnaire_doing state.
    // We aggressively reset this state on load to prevent "Zombie Questionnaire" state.
    if (currentStep === 'questionnaire_doing' || currentStep === 'questionnaire_intro') {
        setCurrentStep(hasProfile ? 'daily' : 'basic_info');
    }

    // 2. Fix Missing Profile in Daily Mode
    // MODIFIED: Do NOT force back to basic_info if messages exist (User has already started chatting)
    // This fixes the issue where user is chatting and suddenly gets thrown into onboarding.
    if (currentStep === 'daily' && !hasProfile) {
        // We strictly avoid forcing basic_info here to prevent "Forced Onboarding" bugs.
        // If the user is in Daily mode, they should stay there.
        // Onboarding is only for fresh users (handled by initial state).
        console.log("Profile incomplete but user is in Daily mode. Staying.");
    }
  }, []);

  useEffect(() => {
    storageService.saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    storageService.saveAppState({ currentStep });
  }, [currentStep]);

  useEffect(() => {
    storageService.saveUserProfile({ basicInfo });
  }, [basicInfo]);

  useEffect(() => {
    storageService.saveSettings({ reminders: reminderSettings });
  }, [reminderSettings]);

  useEffect(() => {
    storageService.saveAppState({ questionnaireProgress });
  }, [questionnaireProgress]);

  useEffect(() => {
    storageService.saveAppState({ questionnaireAnswers });
  }, [questionnaireAnswers]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const logObjects = dailyFoodLog.map(f => ({ name: f, time: new Date().toLocaleTimeString() }));
    storageService.updateDailyLog(today, 'diet', logObjects);
  }, [dailyFoodLog]);

  // Sleep data is saved on submit via handleSleepSubmit

  useEffect(() => {
    if (constitutionResult) storageService.updateUserProfileSection('constitution', constitutionResult);
  }, [constitutionResult]);

  // --- Effects ---
  // Active Reminder Check
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentStep !== 'daily') return;

      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${currentH}:${currentM}`;
      
      // Check if user is active recently (within 5 mins)
      if (Date.now() - lastInteractionTime < 5 * 60 * 1000) return;

      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      const settings = isWeekend ? reminderSettings.weekend : reminderSettings.workday;

      // Check Morning
      if (timeStr === settings.morning) {
         const lastMsg = messages[messages.length - 1];
         // Only trigger if last message was NOT from AI about morning (avoid spam)
         // And check if user has already interacted today about sleep
         const hasMorningInteraction = messages.some(m => 
            m.sender === 'ai' && m.time > settings.morning && m.text.includes('早安')
         );
         
         if (!hasMorningInteraction) {
             handleSend('触发早安提醒');
         }
      }

      // Check Night
      if (timeStr === settings.night) {
         const lastMsg = messages[messages.length - 1];
         const hasNightInteraction = messages.some(m => 
            m.sender === 'ai' && m.time > settings.night && m.text.includes('晚安')
         );

         if (!hasNightInteraction) {
             handleSend('触发晚安提醒');
         }
      }

    }, 30000); // Check every 30s

    return () => clearInterval(timer);
  }, [currentStep, reminderSettings, lastInteractionTime, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showActionSheet, currentStep]);

  // --- Handlers ---
  const handleSend = (text = inputValue) => {
    if (!text.trim()) return;

    setLastInteractionTime(Date.now());

    if (text === '/reset') {
      storageService.clearAll();
      window.location.reload();
      return;
    }
    
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      imageUrl: null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setShowActionSheet(false);

    processAgentLogic(text);
  };

  const generateWeeklyReport = async () => {
    // Call the Service Layer for REAL data analysis
    try {
      // 1. Get Analysis from Health Service
      const report = await healthService.report_weekly('user');
      
      if (!report.success) {
          return {
              dateRange: '本周数据不足',
              score: 0,
              summary: '本周记录较少，暂时无法生成深度报告。请多记录饮食和睡眠哦！',
              metrics: { sleepAvg: 0, exerciseDays: 0, dietScore: 0, poopStatus: '无记录' },
              actionCards: []
          };
      }

      // 2. Map Service Result to UI Card Format
      const { stats, summary } = report;
      
      // Calculate a simple health score based on stats
      let healthScore = 60; // Base
      if (stats.avgCalories > 1200 && stats.avgCalories < 2500) healthScore += 10;
      if (stats.exerciseMins > 60) healthScore += 10;
      if (stats.poopIssues === 0) healthScore += 10;
      if (stats.sleepAvg > 6) healthScore += 10;

      return {
        dateRange: '本周健康周报',
        score: healthScore,
        summary: summary.replace(/<[^>]+>/g, ''), // Strip HTML for summary preview if needed, or keep it
        tcmInsight: summary, // Use the AI summary as the main insight
        correlationInsight: {
            title: '健康趋势',
            content: `本周平均热量 ${stats.avgCalories}kcal，运动 ${stats.exerciseMins}分钟。`
        },
        metrics: {
            sleepAvg: stats.sleepAvg || 0, // Need to ensure report_weekly returns this
            exerciseDays: Math.ceil(stats.exerciseMins / 30), // Approx
            dietScore: stats.avgCalories > 0 ? 80 : 0,
            poopStatus: stats.poopIssues > 0 ? '需关注' : '正常'
        },
        actionCards: [
            {
                type: 'diet',
                title: '饮食建议',
                icon: Utensils,
                color: 'text-orange-500',
                bg: 'bg-orange-50',
                content: stats.avgCalories > 2500 ? '热量略高，建议下周增加蔬菜摄入。' : '热量控制不错，继续保持。'
            },
            {
                type: 'exercise',
                title: '运动建议',
                icon: Activity,
                color: 'text-emerald-500',
                bg: 'bg-emerald-50',
                content: stats.exerciseMins < 100 ? '运动量稍显不足，下周试试快走或瑜伽？' : '运动习惯很好，为您点赞！'
            }
        ]
      };
    } catch (e) {
      console.error("Generate Report Error:", e);
      return null;
    }
  };

  const handleTongueAnalysis = async (imageUrl) => {
     // 1. User Message (Image placeholder)
     const newMsg = {
        id: Date.now(),
        sender: 'user',
        text: '【已上传舌诊照片】', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
     };
     setMessages(prev => [...prev, newMsg]);

     // 2. AI Processing Message
     setMessages(prev => [...prev, {
         id: Date.now() + 1,
         sender: 'ai',
         text: '收到照片，正在调用 AI 视觉引擎分析...',
         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
     }]);

     // Use setTimeout to allow UI to update before heavy async call
     setTimeout(async () => {
         try {
             // 3. Call Service
             const response = await healthService.analyze_tongue(imageUrl, 'zhipu'); 
             
             if (response.success) {
                 const { result } = response;
                 const feedback = `【AI 舌诊结论】\n\n舌质：${result.tongueColor}\n舌苔：${result.coating}\n舌体：${result.shape}\n\n🔍 辨识结果：您的体质偏向【${result.type}】。\n${result.desc}\n\n（置信度：${(result.confidence * 100).toFixed(0)}%）`;
                 
                 // Save result for Chat Context
                 setConstitutionResult(result);

                 setMessages(prev => [...prev, {
                     id: Date.now(),
                     sender: 'ai',
                     text: feedback + '\n\n请问这个判断符合您平时的感受吗？',
                     time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                 }]);
                 setCurrentStep('diagnosis_confirm');
             }
         } catch (e) {
             const newMsg = {
                id: Date.now(),
                sender: 'ai',
                text: '分析失败，请重试。可能是网络原因或图片不清晰。',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, newMsg]);
            // Allow retry
            setCurrentStep('upload_tongue'); 
         }
     }, 100);
  };

  const handleFoodImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const imageUrl = URL.createObjectURL(file);
      
      // 1. User Message with Image
      const newMsg = {
          id: Date.now(),
          sender: 'user',
          text: '',
          imageUrl: imageUrl,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMsg]);

      // 2. AI Processing
      setIsAiTyping(true);
      
      try {
          // Simulate Service Call
          const result = await healthService.analyze_food_image(file);
          
          // Add preview URL to result for card display
          result.imageUrl = imageUrl;

          // 3. AI Response with Card
          setMessages(prev => [...prev, {
              id: Date.now() + 1,
              sender: 'ai',
              text: '识别成功！看来是一顿美味。😋',
              cardType: 'food_analysis',
              cardData: result,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);

      } catch (error) {
          setMessages(prev => [...prev, {
              id: Date.now() + 1,
              sender: 'ai',
              text: '抱歉，图片识别失败，请重试。',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
      } finally {
          setIsAiTyping(false);
          // Clear input
          if (foodInputRef.current) foodInputRef.current.value = '';
      }
  };

  const handleFoodConfirm = (data, isConfirmed) => {
      if (isConfirmed) {
          // Save to log
          const today = new Date().toISOString().split('T')[0];
          
          // Update Food Log Text
          setDailyFoodLog(prev => [...prev, data.food]);
          
          // Update Nutrition Log
          const currentDayLogs = storageService.getDailyLogs(today);
          const currentNutrition = currentDayLogs.nutrition || { calories: 0, nutrients: { carb: 0, protein: 0, fat: 0 } };
          
          // Helper to safely parse numbers
          const safeParse = (val) => {
             if (typeof val === 'number') return val;
             if (typeof val === 'string') return parseFloat(val) || 0;
             return 0;
          };

          const newNutrition = {
              calories: safeParse(currentNutrition.calories) + safeParse(data.nutrition.calories),
              nutrients: {
                  carb: safeParse(currentNutrition.nutrients?.carb) + safeParse(data.nutrition.nutrients?.carb),
                  protein: safeParse(currentNutrition.nutrients?.protein) + safeParse(data.nutrition.nutrients?.protein),
                  fat: safeParse(currentNutrition.nutrients?.fat) + safeParse(data.nutrition.nutrients?.fat)
              }
          };
          
          storageService.saveDailyLog(today, 'nutrition', newNutrition);
          window.dispatchEvent(new Event('storage')); // Trigger updates

          handleSend(`[系统] 已记录：${data.food} (${data.nutrition.calories}kcal)`);
      } else {
          handleSend('我要手动修改饮食记录');
      }
  };

  const processAgentLogic = async (text) => {
    if (text.startsWith('[') && text.includes(']')) return;

    try {
      setIsAiTyping(true);
      const result = await agentProcessMessage(text);
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'ai',
        text: result.content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error('Smart agent error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'ai',
        text: '抱歉，智能体遇到了问题。',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const submitBasicInfo = () => {
    handleSend(`确认提交基础档案`);
  };

  const handleShortcut = (shortcut) => {
    switch (shortcut.id) {
      case 'trigger_morning': handleSend('触发早安提醒'); break;
      case 'trigger_night': handleSend('触发晚安提醒'); break;
      case 'status': handleSend('记心情'); break;
      case 'diet': handleSend('我要记饮食'); break;
      case 'sleep': handleSend('我要记睡眠'); break;
      case 'poop': handleSend('我要记排便'); break;
      case 'period': handleSend('我要记经期'); break;
      // case 'weekly': handleSend('生成周报'); break; // Removed Weekly Report from Action Sheet as per user request
      default: break;
    }
  };

  const handleSleepSubmit = (data) => {
    setLastSleepData(data);
    storageService.addHealthRecord('sleep', data);
    
    // 1. Subjective Feedback First
    const evalMap = { 'good': '精神饱满', 'normal': '感觉还行', 'bad': '没睡好' };
    let feedback = `收到反馈：${evalMap[data.subjectiveEval]} (${data.score}分)。\n\n`;

    if (data.subjectiveEval === 'bad') {
        feedback += `抱歉听到您没睡好。🥺 今晚我们可以试着做个睡前冥想。\n`;
    } else if (data.subjectiveEval === 'good') {
        feedback += `太棒了！良好的睡眠是健康的基石。🌟\n`;
    }

    // 2. TCM Analysis
    const tcmMap = {
        'zi': '子时(23-1点)易醒：可能与【胆经】不通有关，建议少吃夜宵，敲打大腿外侧。',
        'chou': '丑时(1-3点)易醒：可能与【肝经】郁结有关，建议睡前泡脚，推肝经。',
        'yin': '寅时(3-5点)易醒：可能与【肺经】气虚有关，建议练习深呼吸，注意保暖。',
        'mao': '卯时(5-7点)早醒：这是【大肠经】当令，如果有便意是正常的排毒反应。'
    };

    if (data.wakePeriods && data.wakePeriods.length > 0 && !data.wakePeriods.includes('none')) {
        feedback += `\n🔍 中医时钟分析：\n`;
        data.wakePeriods.forEach(p => {
            if (tcmMap[p]) feedback += `- ${tcmMap[p]}\n`;
        });
    }

    // 3. Duration & Bedtime
    const [sH] = data.sleepTime.split(':').map(Number);
    if (sH >= 23 || sH < 4) feedback += `\n⚠️ 此外，入睡时间（${data.sleepTime}）偏晚，错过了养肝黄金期，建议尽量 23:00 前躺下。`;

    handleSend(`[睡眠记录] ${evalMap[data.subjectiveEval]} - ${data.duration}`);
    
    setTimeout(() => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'ai',
            text: feedback,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setCurrentStep('daily');
    }, 1000);
  };

  const handleDietSummarySubmit = (action) => {
    if (action === 'record') {
        // Redirect to recording
        handleSend('我要记饮食');
        return;
    }

    // Just close the summary
    handleSend('收到，我会继续保持。'); 
    
    setTimeout(() => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'ai',
            text: '好的，加油！💪',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setCurrentStep('daily');
    }, 500);
  };

  const handlePoopSubmit = (data) => {
    // Save to storage
    const today = new Date().toISOString().split('T')[0];
    storageService.saveDailyLog(today, 'poop', data);

    // Feedback Logic
    const shapeFeedbacks = {
      1: '属于严重便秘，建议多喝水',
      2: '属于轻度便秘，多吃膳食纤维',
      3: '形态基本正常',
      4: '完美的大便形态',
      5: '纤维摄入可能不足',
      6: '轻度腹泻，注意饮食卫生',
      7: '严重腹泻，注意补液'
    };
    
    let feedback = `已为您记录排便情况。📝\n`;
    feedback += `形态：${data.shape}型 (${shapeFeedbacks[data.shape]})\n`;
    feedback += `颜色：${data.color}\n`;
    if (data.color === '血丝' || data.color === '黑色') feedback += `⚠️ 颜色异常（${data.color}），请持续关注，必要时就医。\n`;
    
    handleSend(`[排便记录] ${data.shape}型 - ${data.color}`);

    setTimeout(() => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'ai',
            text: feedback,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setCurrentStep('daily');
    }, 1000);
  };

  const handlePeriodSubmit = (data) => {
    const today = new Date().toISOString().split('T')[0];
    storageService.saveDailyLog(today, 'period', data);

    let feedback = `已记录您的经期状况。🌸\n`;
    if (data.pain === 'heavy') feedback += '检测到痛感强烈，建议喝点红糖姜茶，注意保暖。\n';
    if (data.mood === 'bad') feedback += '心情烦躁是正常的激素波动，抱抱您，今晚早点休息吧。\n';
    
    handleSend(`[经期记录] 经量${data.flow === 'heavy' ? '多' : data.flow === 'medium' ? '中' : '少'} - ${data.pain === 'none' ? '无痛' : '痛'}`);

    setTimeout(() => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'ai',
            text: feedback,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setCurrentStep('daily');
    }, 1000);
  };

  const handleStatusSubmit = (selectedIds) => {
    const today = new Date().toISOString().split('T')[0];
    storageService.saveDailyLog(today, 'status', selectedIds);

    const statusMap = {
        'happy': '开心', 'calm': '平静', 'anxious': '焦虑',
        'nervous': '紧张', 'sad': '难过'
    };

    const labels = selectedIds.map(id => statusMap[id] || id).join('、');
    let feedback = `收到，已记录您今天的心情：${labels}。`;

    if (selectedIds.includes('happy')) feedback += '\n\n开心的心情很重要，继续保持哦！';
    if (selectedIds.includes('anxious')) feedback += '\n\n焦虑时可以试试深呼吸，或者出去散散步。';
    if (selectedIds.includes('nervous')) feedback += '\n\n紧张是正常的，告诉自己慢慢来，你可以的。';
    if (selectedIds.includes('sad')) feedback += '\n\n难过的时候别憋着，找朋友聊聊天或者做些自己喜欢的事。';

    handleSend(`[心情记录] ${labels}`);

    setTimeout(() => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'ai',
            text: feedback,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setCurrentStep('daily');
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-bg relative">
      {/* Auth Status for Hepai (Isolated) */}
      <div className="fixed top-4 right-4 z-[60]">
          <AuthStatus appName="hepai" />
      </div>

      {/* Dashboard Area - Fixed at Top */}
      <div className="px-4 pt-safe-top pb-2 shrink-0 z-50 space-y-2 sticky top-0 bg-bg/95 backdrop-blur-sm">
        {/* Top Buttons - 3 Tabs */}
        <div className="flex gap-2">
            <button 
                onClick={() => toggleTab('daily')}
                className={`flex-1 backdrop-blur-md p-3 rounded-xl border shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${activeTab === 'daily' ? 'bg-brand text-white border-brand' : 'bg-white/80 border-white/50 text-text-main hover:bg-white'}`}
            >
                <Sparkles className={`w-4 h-4 ${activeTab === 'daily' ? 'text-white' : 'text-brand'}`} />
                <span className="text-xs font-bold">每日推荐</span>
            </button>
            <button 
                onClick={() => toggleTab('weekly')}
                className={`flex-1 backdrop-blur-md p-3 rounded-xl border shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${activeTab === 'weekly' ? 'bg-brand text-white border-brand' : 'bg-white/80 border-white/50 text-text-main hover:bg-white'}`}
            >
                <FileText className={`w-4 h-4 ${activeTab === 'weekly' ? 'text-white' : 'text-brand'}`} />
                <span className="text-xs font-bold">健康洞察</span>
            </button>
            <button 
                onClick={() => toggleTab('profile')}
                className={`flex-1 backdrop-blur-md p-3 rounded-xl border shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${activeTab === 'profile' ? 'bg-brand text-white border-brand' : 'bg-white/80 border-white/50 text-text-main hover:bg-white'}`}
            >
                <Settings className={`w-4 h-4 ${activeTab === 'profile' ? 'text-white' : 'text-brand'}`} />
                <span className="text-xs font-bold">个人档案</span>
            </button>
        </div>

        {/* Collapsible Content Area */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden rounded-3xl ${activeTab ? 'max-h-[80vh] opacity-100 shadow-md' : 'max-h-0 opacity-0'}`}>
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-white/40 backdrop-blur-md">
                <div className={activeTab === 'daily' ? 'block' : 'hidden'}>
                   <DailyFeed />
                </div>
                <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
                   {/* Pass currentStep to detect if we are in onboarding mode */}
                   <PersonalCenter isModal={false} onClose={() => toggleTab(null)} isSetupMode={currentStep === 'basic_info'} />
                </div>
                <div className={activeTab === 'weekly' ? 'block' : 'hidden'}>
                   <WeeklyReportPanel />
                </div>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-[100px] scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2 animate-fade-in`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center border border-brand/20 shadow-sm flex-shrink-0">
                <Sparkles className="w-4 h-4 text-brand" />
              </div>
            )}
            
            <div className={`max-w-[85%] space-y-2`}>
               {/* Text Bubble */}
               {msg.text && (
                 <div className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user' ? 'bg-brand text-white rounded-br-sm' : 'bg-white text-text-main rounded-bl-sm border border-gray-100'
                 }`}>
                   {msg.text}
                 </div>
               )}

               {/* Rich Cards */}
               {msg.cardType === 'weekly_report' && (
                 <WeeklyReportCard report={msg.cardData} />
               )}

               <div className={`text-[10px] text-right ${msg.sender === 'user' ? 'text-white/70' : 'text-text-muted'}`}>{msg.time}</div>
            </div>
          </div>
        ))}
        
        {/* Dynamic Cards based on Step */}
        {currentStep === 'basic_info' && (
           <BasicInfoCard 
             info={basicInfo} 
             setInfo={setBasicInfo} 
             onSubmit={submitBasicInfo} 
           />
        )}

        {currentStep === 'upload_tongue' && (
           <TongueUploadCard 
             onUpload={(url) => {
                 if (url) {
                     handleTongueAnalysis(url);
                 } else {
                     handleSend('暂不上传');
                 }
             }} 
           />
        )}

        {currentStep === 'reminder_setup' && (
           <ReminderSetupCard 
             settings={reminderSettings}
             onChange={(key, val) => setReminderSettings(prev => ({ ...prev, [key]: val }))}
             onConfirm={() => handleSend('确认提醒时间')}
           />
        )}

        {currentStep === 'device_bind' && (
           <DeviceSetupCard 
             onConfirm={(devices) => {
                 // In a real app, save devices here
                 handleSend('完成设备绑定');
             }}
             onSkip={() => handleSend('暂不绑定')}
           />
        )}

        {currentStep === 'poop_record' && (
           <PoopRecordCard 
             onConfirm={handlePoopSubmit}
           />
        )}

        {currentStep === 'period_record' && (
           <PeriodRecordCard 
             onConfirm={handlePeriodSubmit}
           />
        )}

        {currentStep === 'status_record' && (
           <DailyStatusCard 
             onConfirm={handleStatusSubmit}
           />
        )}

        {currentStep === 'sleep_verify' && tempSleepData && (
           <SleepDataVerifyCard 
             data={tempSleepData}
             onConfirm={() => handleSend('数据准确')}
             onReject={() => handleSend('数据不准')}
           />
        )}

        {currentStep === 'sleep_record' && (
           <SleepRecordCard 
             onConfirm={handleSleepSubmit}
             mode={sleepRecordMode}
             initialData={tempSleepData || {}}
           />
        )}

        {currentStep === 'diet_summary' && (
           <DietSummaryCard 
             basicInfo={basicInfo}
             onConfirm={handleDietSummarySubmit}
           />
        )}
        
        {/* Mock Action Buttons for Demo */}
        {currentStep === 'diagnosis_confirm' && (
           <div className="flex gap-2 justify-center pb-4">
             <button onClick={() => handleSend('挺准的')} className="bg-white text-brand px-6 py-2 rounded-full border border-brand/20 shadow-sm hover:bg-brand/5 transition-colors">挺准的</button>
             <button onClick={() => handleSend('不太准')} className="bg-white text-text-muted px-6 py-2 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">不太准</button>
           </div>
        )}

        {currentStep === 'ask_questionnaire' && (
           <div className="flex gap-2 justify-center pb-4">
             <button onClick={() => handleSend('我要填写')} className="bg-brand text-white px-6 py-2 rounded-full shadow-md hover:bg-brand/90 transition-colors text-sm">现在填写 (推荐)</button>
             <button onClick={() => handleSend('暂不填写')} className="bg-white text-text-muted px-6 py-2 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-sm">暂不填写</button>
           </div>
        )}
        
        {currentStep === 'questionnaire_doing' && (
           <div className="flex gap-2 justify-center pb-4 overflow-x-auto px-4 no-scrollbar">
             {/* Dynamic Options based on current question */}
             {(questionnaireData[questionnaireProgress - 1]?.options || []).map(opt => (
                <button key={opt} onClick={() => handleSend(opt)} className="bg-white text-text-main px-4 py-2 rounded-full border border-gray-200 text-xs shadow-sm whitespace-nowrap">{opt}</button>
             ))}
           </div>
        )}

        {isAiTyping && (
          <div className="flex justify-start items-end gap-2 animate-fade-in">
             <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center border border-brand/20 shadow-sm flex-shrink-0">
               <Sparkles className="w-4 h-4 text-brand" />
             </div>
             <div className="p-3.5 rounded-2xl shadow-sm text-sm bg-white text-text-main rounded-bl-sm border border-gray-100 flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
             </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Area */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        {showActionSheet && (
          <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100/50 shadow-lg animate-in slide-in-from-bottom duration-300">
            <div className="px-4 py-4">
               <div className="flex justify-between items-center mb-2 px-1">
                 <span className="text-xs text-text-muted font-medium">常用功能</span>
                 <button onClick={() => setShowActionSheet(false)} className="text-xs text-brand">收起</button>
               </div>
               {/* 5-column grid for shortcuts */}
               <div className="grid grid-cols-5 gap-2">
                 {shortcuts.map((s) => (
                   <button key={s.id} onClick={() => handleShortcut(s)} className="flex flex-col items-center gap-1.5 group p-1 active:scale-95 transition-transform">
                     <div className={`w-10 h-10 rounded-2xl ${s.bg} flex items-center justify-center shadow-sm`}>
                       <s.icon className={`w-5 h-5 ${s.color}`} />
                     </div>
                     <span className="text-[10px] text-text-muted font-bold whitespace-nowrap">{s.label}</span>
                   </button>
                 ))}
               </div>
            </div>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100/50 p-3 pb-safe-bottom flex items-end gap-3">
          <button onClick={() => setShowActionSheet(!showActionSheet)} className={`p-2.5 rounded-full transition-colors mb-0.5 ${showActionSheet ? 'bg-brand/10 text-brand' : 'bg-gray-50 text-text-muted hover:bg-gray-100'}`}>
            <PlusCircle className={`w-6 h-6 transition-transform duration-300 ${showActionSheet ? 'rotate-45' : ''}`} />
          </button>
          
          {/* Hidden File Input */}
          <input 
              type="file" 
              ref={foodInputRef} 
              className="hidden" 
              accept="image/*" 
              capture="environment"
              onChange={handleFoodImageUpload} 
          />
          
          <button 
              onClick={() => foodInputRef.current?.click()} 
              className="p-2.5 rounded-full bg-gray-50 text-text-muted hover:bg-gray-100 hover:text-brand transition-colors mb-0.5"
          >
            <Camera className="w-6 h-6" />
          </button>

          <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5 flex items-center gap-2 border border-transparent focus-within:border-brand/20 focus-within:bg-white transition-all min-h-[44px]">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={dietPending === true ? "请告诉我具体吃了什么..." : (typeof dietPending === 'string' ? "请补充克数，如：200克..." : "越聊越合拍...")}
              className="flex-1 bg-transparent border-none outline-none text-sm text-text-main placeholder:text-text-muted/70"
            />
          </div>

          {inputValue.trim() ? (
            <button onClick={() => handleSend()} className="p-2.5 rounded-full bg-brand text-white hover:bg-brand/90 transition-all shadow-md mb-0.5"><Send className="w-5 h-5" /></button>
          ) : (
            <button 
              onClick={() => handleSend('[语音输入] (模拟)')}
              className="p-2.5 rounded-full bg-gray-50 text-text-muted hover:bg-gray-100 hover:text-brand transition-colors mb-0.5"
            >
              <Mic className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
