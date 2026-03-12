import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, Camera, Sparkles, Activity, Utensils, Moon, FileText, Calendar, PlusCircle, CheckCircle, XCircle, TrendingUp, AlertCircle, ChevronDown, ChevronUp, LayoutDashboard, User } from 'lucide-react';
import DailyFeed from './DailyFeed';
import PersonalCenter from './PersonalCenter';
import { healthService } from '../services/healthService';
import { storageService } from '../services/storageService';
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
    if (!report) return null;
    // Defensive coding: Ensure all nested properties exist to prevent crashes from old/bad data
    const metrics = report.metrics || { sleepAvg: 0, exerciseDays: 0, dietScore: 0, poopStatus: '未知' };
    const correlationInsight = report.correlationInsight || { title: '暂无洞察', content: '继续保持记录，AI将为您发现健康规律。' };
    const actionCards = report.actionCards || [];

    return (
    <div className="bg-gradient-to-br from-[#FAF9F6] to-[#EDF5F0] p-5 rounded-2xl border border-gray-100 shadow-lg space-y-5 animate-fade-in-up mx-2 mb-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-brand font-serif">本周健康周报</h3>
          <p className="text-xs text-text-muted mt-1">{report.dateRange || '本周'}</p>
        </div>
        <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-brand/10 shadow-sm">
          <span className="text-xs text-text-muted block text-center">健康分</span>
          <span className="text-xl font-bold text-brand block text-center leading-none mt-0.5">{report.score || 0}</span>
        </div>
      </div>
  
      {/* 1. AI Insight + TCM */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" />
          <h4 className="text-sm font-bold text-text-main">AI 中医洞察</h4>
        </div>
        <div className="text-xs text-text-main leading-relaxed opacity-90 space-y-2">
            <p>{report.summary || '暂无总结'}</p>
            {report.tcmInsight && (
                <div className="bg-brand/5 p-3 rounded-lg border border-brand/10 text-brand-dark/90">
                    <span className="font-bold block mb-1">🌿 中医视角：</span>
                    <span dangerouslySetInnerHTML={{ __html: report.tcmInsight }}></span>
                </div>
            )}
        </div>
      </div>
  
      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="bg-indigo-50 p-2 rounded-lg">
            <Moon className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <div className="text-xs text-text-muted">平均睡眠</div>
            <div className="text-sm font-bold text-text-main">{metrics.sleepAvg}h</div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="bg-orange-50 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="text-xs text-text-muted">运动达标</div>
            <div className="text-sm font-bold text-text-main">{metrics.exerciseDays}/7天</div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="bg-green-50 p-2 rounded-lg">
            <Utensils className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <div className="text-xs text-text-muted">饮食规律</div>
            <div className="text-sm font-bold text-text-main">{metrics.dietScore}分</div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="bg-emerald-50 p-2 rounded-lg">
            <PlusCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-text-muted">排便情况</div>
            <div className="text-sm font-bold text-text-main">{metrics.poopStatus}</div>
          </div>
        </div>
      </div>

      {/* 3. Correlation Insight (New) */}
      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 space-y-2">
         <div className="flex items-center gap-2 text-orange-800">
            <TrendingUp className="w-4 h-4" />
            <h4 className="text-sm font-bold">{correlationInsight.title}</h4>
         </div>
         <p className="text-xs text-orange-900/80 leading-relaxed">
             <span dangerouslySetInnerHTML={{ __html: correlationInsight.content }}></span>
         </p>
      </div>
  
      {/* 4. Action Cards (New) */}
      {actionCards.length > 0 && (
          <div className="space-y-3">
             <h4 className="text-sm font-bold text-text-main pl-1">下周专属行动卡</h4>
             <div className="grid grid-cols-1 gap-3">
                {actionCards.map((card, idx) => {
                    const Icon = card.icon || Sparkles; // Fallback icon
                    return (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 flex gap-3 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`${card.bg || 'bg-gray-50'} p-2.5 rounded-lg h-fit shrink-0`}>
                                <Icon className={`w-5 h-5 ${card.color || 'text-gray-500'}`} />
                            </div>
                            <div>
                                <h5 className={`text-xs font-bold mb-1 ${card.color || 'text-gray-700'}`}>{card.title}</h5>
                                <p className="text-xs text-text-muted leading-relaxed">{card.content}</p>
                            </div>
                        </div>
                    );
                })}
             </div>
          </div>
      )}
    </div>
    );
};

const PeriodRecordCard = ({ onConfirm }) => {
  const [flow, setFlow] = useState('medium'); // light, medium, heavy
  const [pain, setPain] = useState('none'); // none, light, heavy
  const [mood, setMood] = useState('normal'); // good, normal, bad
  const [color, setColor] = useState('bright_red'); // bright_red, dark_red, brown, pale
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

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
             <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent text-sm font-bold text-text-main outline-none text-right" />
          </div>

          {/* Flow */}
          <div>
             <label className="text-xs text-text-muted mb-2 block">经血量</label>
             <div className="flex gap-2">
                {[{id:'light', l:'少'}, {id:'medium', l:'中'}, {id:'heavy', l:'多'}].map(opt => (
                   <button key={opt.id} onClick={() => setFlow(opt.id)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${flow === opt.id ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-gray-100 text-text-muted'}`}>
                      {opt.l}
                   </button>
                ))}
             </div>
          </div>

          {/* Color (New) */}
          <div>
             <label className="text-xs text-text-muted mb-2 block">颜色</label>
             <div className="flex gap-2">
                {[
                    {id:'bright_red', l:'鲜红', color: 'bg-red-500'}, 
                    {id:'dark_red', l:'暗红', color: 'bg-red-800'}, 
                    {id:'brown', l:'褐色', color: 'bg-[#8B4513]'}, // Changed '咖啡色' to '褐色' (Brown) for better UX
                    {id:'pale', l:'淡红', color: 'bg-red-300'}
                ].map(opt => (
                   <button key={opt.id} onClick={() => setColor(opt.id)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 ${color === opt.id ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-gray-100 text-text-muted'}`}>
                      <span className={`w-3 h-3 rounded-full ${opt.color}`}></span>
                      {opt.l}
                   </button>
                ))}
             </div>
          </div>

          {/* Pain */}
          <div>
             <label className="text-xs text-text-muted mb-2 block">痛感</label>
             <div className="flex gap-2">
                {[{id:'none', l:'无痛'}, {id:'light', l:'轻微'}, {id:'heavy', l:'剧烈'}].map(opt => (
                   <button key={opt.id} onClick={() => setPain(opt.id)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${pain === opt.id ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-gray-100 text-text-muted'}`}>
                      {opt.l}
                   </button>
                ))}
             </div>
          </div>

          {/* Mood */}
          <div>
             <label className="text-xs text-text-muted mb-2 block">心情</label>
             <div className="flex gap-2">
                {[{id:'good', l:'开心😊'}, {id:'normal', l:'平静😐'}, {id:'bad', l:'烦躁😫'}].map(opt => (
                   <button key={opt.id} onClick={() => setMood(opt.id)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${mood === opt.id ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-gray-100 text-text-muted'}`}>
                      {opt.l}
                   </button>
                ))}
             </div>
          </div>
       </div>

       <button onClick={() => onConfirm({ date, flow, pain, mood, color })} className="w-full bg-rose-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-rose-600 transition-all shadow-md">
         确认记录
       </button>
    </div>
  );
};

const DailyStatusCard = ({ onConfirm }) => {
  const [selected, setSelected] = useState([]);
  
  const options = [
    { id: 'energetic', label: '精力充沛', icon: '💪' },
    { id: 'tired', label: '疲劳乏力', icon: '😫' },
    { id: 'bloated', label: '胃胀气', icon: '🐡' },
    { id: 'headache', label: '头痛', icon: '🤕' },
    { id: 'anxious', label: '焦虑', icon: '😰' },
    { id: 'happy', label: '心情好', icon: '😄' },
    { id: 'cold', label: '手脚冰凉', icon: '🧊' },
    { id: 'hot', label: '燥热', icon: '🔥' },
  ];

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg mx-4 mb-4 animate-fade-in-up space-y-4">
       <div className="flex items-center gap-2 mb-1">
          <span className="bg-blue-50 p-1.5 rounded-lg text-blue-500"><Activity className="w-4 h-4" /></span>
          <h3 className="font-bold text-text-main">今日状态记录</h3>
       </div>

       <div className="grid grid-cols-4 gap-2">
          {options.map(opt => (
             <button key={opt.id} onClick={() => toggle(opt.id)} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${selected.includes(opt.id) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-100 bg-gray-50 text-text-muted'}`}>
                <span className="text-xl">{opt.icon}</span>
                <span className="text-[10px] font-bold">{opt.label}</span>
             </button>
          ))}
       </div>

       <button onClick={() => onConfirm(selected)} disabled={selected.length === 0} className="w-full bg-blue-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-md disabled:opacity-50">
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
    { id: 1, label: '1型', desc: '硬球', emoji: '🟤' },
    { id: 2, label: '2型', desc: '凹凸条', emoji: '💩' },
    { id: 3, label: '3型', desc: '裂纹条', emoji: '🌭' },
    { id: 4, label: '4型', desc: '光滑条', emoji: '🍌' },
    { id: 5, label: '5型', desc: '软块', emoji: '🍪' },
    { id: 6, label: '6型', desc: '糊状', emoji: '🥣' },
    { id: 7, label: '7型', desc: '水状', emoji: '💧' },
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
         <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {shapes.map(s => (
                <button 
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${shape === s.id ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-100 bg-gray-50'}`}
                >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-xs font-bold text-text-main">{s.id}</span>
                    <span className="text-[9px] text-text-muted">{s.desc}</span>
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

  useEffect(() => {
    // Simulate fetching report
    const fetchReport = async () => {
      setLoading(true);
      try {
         // In real app: await healthService.report_weekly('current_user');
         // Mock data for now
         await new Promise(r => setTimeout(r, 800));
         const mockReport = {
            dateRange: '2023.10.23 - 2023.10.29',
            score: 85,
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
            <span className="text-xs">正在生成健康周报...</span>
        </div>
    );
  }

  if (!report) return <div className="p-4 text-center text-text-muted text-xs">暂无周报数据</div>;

  return <WeeklyReportCard report={report} />;
};

const ChatInterface = ({ onOpenProfile }) => {
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
    { id: 'status', label: '今日状态', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'diet', label: '记饮食', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'sleep', label: '记睡眠', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'poop', label: '记排便', icon: PlusCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' }, 
    { id: 'period', label: '记月经', icon: Calendar, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  const shortcuts = basicInfo.gender === 'male' 
    ? allShortcuts.filter(s => s.id !== 'period') 
    : allShortcuts;

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

    setLastInteractionTime(Date.now()); // Update interaction time

    // Dev Command: Reset
    if (text === '/reset') {
      storageService.clearAll();
      window.location.reload();
      return;
    }
    
    // User Message
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      imageUrl: null, // Default
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setShowActionSheet(false);

    // AI Logic (Simulated Agent)
    // Removed setTimeout to improve responsiveness for user query
    processAgentLogic(text, updatedMessages);
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

  const processAgentLogic = async (text, currentMessages = messages) => {
    // Ignore system log messages triggered by UI actions
    if (text.startsWith('[') && text.includes(']')) return;

    // GLOBAL INTERRUPT: Commands that should always switch context to 'daily'
    // This allows switching from Sleep Card to Poop Card directly without "Exiting" first.
    // AND it must clear any pending diet input state.
    if (['生成周报', '我要记', '触发', '/reset', '周报', '食谱', '记录'].some(k => text.includes(k))) {
         setDietPending(null); // Fix: Clear diet pending state so "周报" isn't treated as food name
         // stepToProcess will be set later, but we need to ensure we don't fall into dietPending logic below
    }

    // --- Handle Pending Diet Inputs ---
    // Only proceed if NOT a global interrupt command (which we just checked, but dietPending state might still be true in this render cycle)
    // We check text again to be safe, or rely on the setDietPending(null) above effectively invalidating it for NEXT render? 
    // No, setDietPending(null) won't update 'dietPending' const in this function execution immediately.
    // So we must check the text again here.
    const isGlobalCommand = ['生成周报', '我要记', '触发', '/reset', '周报', '食谱', '记录'].some(k => text.includes(k));

    if (dietPending && !isGlobalCommand) {
        // If it's a boolean true, we are waiting for food name (from "I want to record diet")
        if (dietPending === true) {
             text = "我吃了 " + text;
             setDietPending(null);
        } 
        // If it's a string, we are waiting for quantity (from "I ate Apple")
        else if (typeof dietPending === 'string') {
             // Check if input looks like a quantity (relaxed regex to allow descriptors like "一大碗", "2小勺")
             const quantityMatch = text.match(/([0-9]+|[一二三四五六七八九十百千半]+)\s*([\u4e00-\u9fa5]{0,5})\s*(g|ml|l|kg|克|毫升|升|公斤|碗|杯|份|个|只|条|盘|勺|斤|两|瓶|盒|袋)/i);
             if (quantityMatch || text.match(/\d+(g|克|ml)/i)) {
                  // Avoid duplication: "我吃了" + "坚果" + "吃了25克" -> "我吃了 坚果 25克"
                  let cleanInput = text.replace(/^(我|我们|咱们)?(吃了?|喝了?|想要?|记|录|吃|喝)\s*/, '');
                  if (cleanInput.includes(dietPending)) {
                      text = `我吃了 ${cleanInput}`;
                  } else {
                      text = `我吃了 ${dietPending} ${cleanInput}`;
                  }
                  setDietPending(null);
             } else {
                  // User ignored quantity prompt. Clear pending state.
                  setDietPending(null);
             }
        }
    }

    let responseText = '';
    let nextStep = currentStep;
    let cardData = null;
    let cardType = null;

    // Logic to handle Global Interrupts (Escape the Questionnaire Trap)
    let stepToProcess = currentStep;
    // Treat diet_summary as daily mode for text processing, allowing users to record new data while viewing summary
    if (stepToProcess === 'diet_summary') stepToProcess = 'daily';

    // GLOBAL INTERRUPT: Commands that should always switch context to 'daily'
    // This allows switching from Sleep Card to Poop Card directly without "Exiting" first.
    // Also covers Diet inputs like "早饭吃了..." to break out of other modes.
    if (['生成周报', '我要记', '触发', '/reset', '周报', '食谱', '记录', '早饭', '午饭', '晚饭', '早餐', '午餐', '晚餐', '吃了', '喝了'].some(k => text.includes(k))) {
         stepToProcess = 'daily';
         nextStep = 'daily'; // FORCE RESET: Clear any previous card state immediately
    }

    const isQuestionnaireFlow = ['questionnaire_doing', 'questionnaire_intro', 'ask_questionnaire', 'diagnosis_confirm'].includes(currentStep);
    
    if (isQuestionnaireFlow) {
        // 1. Explicit Exit
        if (['退出', '取消', '停止', '不填了', '结束', '别问了', '返回', 'exit'].some(k => text.toLowerCase().includes(k))) {
            responseText = '已为您暂停问卷。您的进度已自动保存，随时可以回来继续。';
            
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'ai',
                text: responseText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setCurrentStep('daily');
            return;
        }
    }

    // --- 1. Basic Info ---
    if (stepToProcess === 'basic_info') {
      if (text.includes('确认提交') || text.match(/档案/)) {
         // Generate personalized response based on new fields
         let feedback = `基础档案已建立。📝\n`;
         
         if (basicInfo.brainLoad === '高') feedback += `注意到您脑力消耗大，我会特别关注补脑安神的营养搭配。\n`;
         if (basicInfo.sleepHabit === '经常熬夜') feedback += `您的作息需要调整哦，我们会循序渐进地改善。\n`;
         if (basicInfo.gender === 'female' && basicInfo.painLevel === '剧烈痛') feedback += `关于痛经问题，我会结合您的体质给出针对性调理方案。\n`;
         
         responseText = `${feedback}\n接下来，为了更好地照顾您，建议设置每日提醒。`;
         nextStep = 'reminder_setup';
      } else {
         responseText = '请填写上方的基础信息卡片，让我更全面地了解您。';
      }
    }

    // --- 2. Reminder Setup (Habits First) ---
    else if (stepToProcess === 'reminder_setup') {
        responseText = '设置成功！接下来，是否需要绑定您的智能设备？\n\n绑定后，我可以自动同步您的步数、心率和睡眠数据，分析更精准。';
        nextStep = 'device_bind';
    }

    // --- 3. Device Bind (Habits First) ---
    else if (stepToProcess === 'device_bind') {
        if (text.includes('不') || text.includes('跳过')) {
             responseText = '没问题，您随时可以在“个人中心”进行设备绑定。\n\n最后一步，为了精准辨识您的体质，请配合上传一张【舌诊照片】。';
             nextStep = 'upload_tongue';
        } else if (text.includes('完成') || text.includes('绑定')) {
             responseText = '设备绑定成功！\n\n最后一步，为了精准辨识您的体质，请配合上传一张【舌诊照片】。';
             nextStep = 'upload_tongue';
        } else {
             responseText = '请在下方卡片操作绑定，或者点击“暂不绑定”。';
        }
    }
    
    // --- 4. Tongue Diagnosis ---
    else if (stepToProcess === 'upload_tongue') {
      // Logic moved to handleTongueAnalysis for actual uploads.
      // This block handles text input or "Skip".
      if (text.includes('暂不') || text.includes('跳过')) {
          const consti = await healthService.get_constitution('user'); // Get default/mock
          responseText = `没关系，我们可以先跳过。\n\n根据您的基础信息，我初步推测您可能偏向【${consti.type}】。\n\n合拍 AI 正式为您服务。🎉\n您可以随时告诉我您的饮食、运动或身体感受。`;
          nextStep = 'daily';
      } else if (text.includes('照片') || text.includes('上传')) {
          responseText = '请直接点击上方的“点击拍摄”按钮来上传照片哦。👆';
      } else {
          responseText = '请上传舌诊照片，或者告诉我“跳过”。';
      }
    }

    // --- 5. Confirm Diagnosis ---
    else if (stepToProcess === 'diagnosis_confirm') {
       if (text.includes('不准') || text.includes('不像') || text.includes('不对')) {
          responseText = '抱歉，AI 舌诊可能受光线影响。没关系，我们先以您的主观感受为准。\n\n您可以稍后在“个人档案”中填写更详细的体质问卷来校准。\n\n合拍 AI 正式为您服务。🎉';
          nextStep = 'daily';
       } else {
          // User says "Yes" / "Accurate"
          const consti = await healthService.get_constitution('user');
          responseText = `太棒了！那我们就先以“${consti.type}”作为初始调理方向。💪\n\n合拍 AI 正式为您服务。🎉\n您可以随时告诉我您的饮食、运动或身体感受。`;
          nextStep = 'daily';
       }
    }

    // --- REMOVED: Questionnaire Intro & Doing from Onboarding Flow ---
    // They are now only accessible via "Personal Profile" or specific user intent later.
    
    // --- 5. Questionnaire Doing (Standalone / Profile Mode) ---
    else if (stepToProcess === 'questionnaire_doing') {
        // Parse Answer
        const currentQ = questionnaireData[questionnaireProgress - 1];
        let score = 0;
        
        // Simple mapping: first option = 1 point, last = 5 points
        if (text.includes(currentQ.options[0])) score = 1;
        else if (text.includes(currentQ.options[1])) score = 2;
        else if (text.includes(currentQ.options[2])) score = 3;
        else if (text.includes(currentQ.options[3])) score = 4;
        else if (text.includes(currentQ.options[4])) score = 5;
        // Fuzzy matching for "Sometimes/Often" variation
        else if (text.includes('没有')) score = 1;
        else if (text.includes('很少') || text.includes('偶尔')) score = 2;
        else if (text.includes('有时')) score = 3;
        else if (text.includes('经常')) score = 4;
        else if (text.includes('总是')) score = 5;
        else if (text.match(/[1-5]/)) score = parseInt(text.match(/[1-5]/)[0]);
        // Allow free text input with LLM if no direct match (Mocking LLM classification here)
        else {
             // In a real agent, we would ask LLM: "User said '${text}', which option (1-5) is this?"
             // For now, we'll try to be lenient or ask again more gently.
             
             // REMOVED: Fallback "text.length > 5" which caused infinite loops.
             // Instead, we ask for clarification or offer to exit.
             
             responseText = `抱歉，我没太理解。您是指：${currentQ.options.join(' / ')} 哪一种呢？\n\n(如果您想暂停问卷，请回复“退出”)`;
             setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'ai',
                text: responseText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
             }]);
             return;
        }

        // Save Answer
        const newAnswers = { ...questionnaireAnswers, [currentQ.id]: score };
        setQuestionnaireAnswers(newAnswers);

        // Next Question
        if (questionnaireProgress < questionnaireData.length) {
            const nextQ = questionnaireData[questionnaireProgress];
            setQuestionnaireProgress(prev => prev + 1);
            responseText = `收到。第 ${questionnaireProgress + 1} 题：\n\n${nextQ.question}\n(${nextQ.options.join(' / ')})`;
        } else {
            // Finished
            const result = calculateConstitution(newAnswers);
            setConstitutionResult(result); // Update context
            responseText = `感谢耐心填写！🎉\n\n结合您的回答，AI 深度分析结果如下：\n\n【主体质】：${result.type}\n【健康分】：${result.score}\n\n${result.desc}\n\n接下来，让我们设置一下日常提醒吧。`;
            nextStep = 'reminder_setup';
        }
    }

    // --- 6. Reminder Setup ---
    else if (stepToProcess === 'reminder_setup') {
        responseText = '设置成功！最后一步，是否需要绑定您的智能设备？\n\n绑定后，我可以自动同步您的步数、心率和睡眠数据，分析更精准。';
        nextStep = 'device_bind';
    }

    // --- 6.5 Device Bind ---
    else if (stepToProcess === 'device_bind') {
        if (text.includes('不') || text.includes('跳过')) {
             responseText = '没问题，您随时可以在“个人中心”进行设备绑定。\n\n合拍 AI 正式为您服务。🎉\n您可以随时告诉我您的饮食、运动或身体感受。';
             nextStep = 'daily';
        } else if (text.includes('完成') || text.includes('绑定')) {
             responseText = '设备绑定成功！合拍 AI 正式为您服务。🎉';
             nextStep = 'daily';
        } else {
             responseText = '请在下方卡片操作绑定，或者点击“暂不绑定”。';
        }
    }

    // --- 7. Daily Flow ---
    else if (stepToProcess === 'daily') {
        // A. Explicit Commands
        if (text === '/reset') {
            return; 
        }

        // B. Debug Triggers
        if (text === '触发早安提醒') {
             // Check device sync (Mock)
             const hasDevice = true; // storageService.getDevices().length > 0
             let morningMsg = '早安！☀️ 又是充满活力的一天。';
             
             if (hasDevice) {
                 // Mock Data
                 const mockSleepData = {
                     sleepTime: '23:30',
                     wakeTime: '07:15',
                     duration: '7h45m',
                     wakePeriods: ['chou'] // 1-3am
                 };
                 setTempSleepData(mockSleepData);

                 const wakePeriodMap = {
                    'zi': '23:00-01:00 (子时)',
                    'chou': '01:00-03:00 (丑时)',
                    'yin': '03:00-05:00 (寅时)',
                    'mao': '05:00-07:00 (卯时)'
                 };
                 const wakeText = mockSleepData.wakePeriods.map(p => wakePeriodMap[p] || p).join('、');

                 morningMsg += `\n⌚️ 收到您的睡眠数据：昨晚睡了 7小时45分，易醒时段：${wakeText}。\n请确认数据是否准确？`;
                 nextStep = 'sleep_verify'; 
             } else {
                 morningMsg += '\n昨晚睡得怎么样？来记录一下睡眠吧。';
                 setSleepRecordMode('full'); // No device, so full manual
                 setTempSleepData(null);
                 nextStep = 'sleep_record';
             }
             responseText = morningMsg;
        }
        else if (text === '触发晚安提醒') {
             // Summarize the day
             const today = new Date().toISOString().split('T')[0];
             const dietLogs = storageService.getDailyLogs(today).diet || [];
             const sleepData = storageService.getLatestHealthRecord('sleep');
             
             let summary = '晚安。🌙 忙碌了一天辛苦了。\n\n【今日复盘】\n';
             if (sleepData && sleepData.date === today) summary += `😴 昨夜睡眠：${sleepData.duration} (${sleepData.subjectiveEval === 'good' ? '不错' : '一般'})\n`;
             else summary += `😴 昨夜睡眠：暂无记录\n`;
             
             if (dietLogs.length === 0) summary += '\n⚠️ 还没有记录今天的饮食哦，要不要补记一下？';
             
             responseText = summary + '\n\n最后，让我们回顾一下今天的饱腹感和整体状态，为明天生成建议。';
             nextStep = 'diet_summary';
        }
        else {
            // C. Intent Recognition (Mutually Exclusive Chain)
            
            // 1. Diet Regexes
            const dietAntiKeywords = [
                '怎么', '什么', '推荐', '吗', '?', '？', 
                '上火', '便秘', '失眠', 
                '想吃', '能不能', '可以', '好不好', 
                '热量', '多少', '一般', '通常', '注意', 
                '喜欢', '爱吃', '讨厌', '不吃', 
                '每天', '经常', '总是', '习惯', 
                '准备', '打算', '要去', '会' 
            ];
            const isDietSummary = /(今天|今日).*(吃|饮食).*(咋样|怎么样|如何|好不好|评价|总结|复盘)/.test(text);
            const isDietQuestion = dietAntiKeywords.some(kw => text.includes(kw));
            
            // Allow "Diet Record" and "Record Diet"
            const isDietIntentOnly = /^(我要|想)?(记|录)(一下)?(饮食|吃饭|早餐|午餐|晚餐)?$/.test(text.trim()) || /(饮食|吃饭|早餐|午餐|晚餐)(记录|打卡)/.test(text) || text.trim() === '我要记饮食';

            const isExplicitDiet = /(记|录|记录).*(吃|喝|饮食|餐)/.test(text) || /(吃|喝|饮食|餐).*(记|录|记录)/.test(text);
            const hasDietAction = ['吃了', '喝了', '吃完', '喝完', '早饭', '午饭', '晚饭', '早餐', '午餐', '晚餐', '加餐', '夜宵', '下午茶'].some(kw => text.includes(kw));
            const quantityRegex = /([0-9]+|[一二三四五六七八九十百千半]+)\s*(g|ml|l|kg|克|毫升|升|公斤|碗|杯|份|个|只|条|盘|勺|斤|两|瓶|盒|袋)/i;
            const hasQuantity = quantityRegex.test(text);
            const foodKeywords = [
                 '吃', '喝', '餐', '饭', '饮', '食', 
                 '果', '肉', '菜', '蛋', '奶', '面', '米', '豆', 
                 '水', '茶', '酒', '汤', '鱼', '虾', '鸡', '鸭', '牛', '羊', '猪',
                 '饺', '饼', '包', '粥', '粉', '瓜', '薯', '蔬', '莓', '橙', '梨', '桃', '蕉', '葡', '提', '榴', '芒', '枣', '麦', '粮', '糖', '盐', '油', '酱', '醋',
                 '咖啡', '拿铁', '美式', '三明治', '汉堡', '薯条', '披萨', '沙拉', '蛋糕', '甜点', '零食', '巧克力', '坚果', '酸奶', '牛奶', '燕麦', '玉米', '红薯', '紫薯'
            ];
            const hasFoodKeyword = foodKeywords.some(kw => text.includes(kw));
            const isSleepRelated = /(睡眠|睡觉|睡得|补觉|失眠|早睡|熬夜)/.test(text);

            const isDietRecord = (isExplicitDiet || hasDietAction || (hasFoodKeyword && hasQuantity)) && !isDietQuestion && !isSleepRelated && !text.includes('排便') && !text.includes('睡眠');

            // 2. Exercise Regexes
            const exerciseKeywords = ['运动', '锻炼', '健身', '跑步', '游泳', '瑜伽', '普拉提', '力量', '无氧', '有氧', '站桩', '八段锦', '太极', '练了', '跳绳', '骑行'];
            const isExerciseRecord = exerciseKeywords.some(kw => text.includes(kw)) && (text.includes('分钟') || text.includes('小时') || text.includes('min') || text.includes('km') || text.includes('公里'));

            // 3. Sleep Regexes
            const sleepAntiKeywords = [
                '怎么', '什么', '影响', '好不好', '吗', '?', '？', 
                '一般', '通常', '习惯', '建议', '应该', '想', 
                '每天', '经常', '总是', '失眠', '多梦', '易醒' 
            ];
            const isSleepQuestion = sleepAntiKeywords.some(kw => text.includes(kw));
            const sleepKeywordsRegex = /(睡眠|睡觉|入睡|起床|早起|晚起|熬夜|失眠|睡着|补觉)/;
            const isExplicitSleep = (/(记|录)/.test(text) && sleepKeywordsRegex.test(text)) || text.includes('我要记睡眠') || text.trim() === '睡眠记录';
            const hasTimePattern = /\d+[:：]\d+|\d+点|\d+h|\d+小时/.test(text);
            const hasSleepAction = /(睡了|睡着|起床|醒来|刚醒|早起|晚起)/.test(text);
            const hasContext = /(昨|今|了|刚|早上|晚上|夜里|凌晨)/.test(text);
            
            // STRICTER SLEEP LOGIC: Exclude Diet/Poop keywords explicitly
            const isSleepRecord = (isExplicitSleep || (hasSleepAction && hasTimePattern && hasContext)) && !isSleepQuestion && !text.includes('排便') && !text.includes('饮食') && !text.includes('吃饭');

            // 4. Poop Regexes
            const isPoopRecord = (text.match(/(排便|大便|拉屎|便便|通便)/) && !text.includes('怎么') && !text.includes('便秘')) || text.includes('我要记排便');

            // 5. Period Regexes
            const isPeriodRecord = (text.match(/(经期|月经|大姨妈|生理期)/) && !text.includes('怎么') && !text.includes('什么')) || text.includes('我要记经期');

            // 6. Status Regexes
            const isStatusRecord = (text.match(/(状态|感受|不舒服|头痛|乏力|难受|开心|焦虑|心情)/) && !text.includes('怎么')) || text.includes('记录今日身体状态');

            console.log(`[Intent Check] Text: "${text}"`);
            console.log(`Diet: ${isDietRecord} (IntentOnly: ${isDietIntentOnly})`);
            console.log(`Poop: ${isPoopRecord}`);
            console.log(`Sleep: ${isSleepRecord}`);
            console.log(`Period: ${isPeriodRecord}`);
            console.log(`Status: ${isStatusRecord}`);

            // --- Logic Chain ---

            if (isDietSummary) {
                 const today = new Date().toISOString().split('T')[0];
                 const dietLogs = storageService.getDailyLogs(today).diet || [];
                 let summary = '为您生成今日饮食复盘。📝';
                 if (dietLogs.length === 0) summary += '\n⚠️ 还没有记录今天的饮食哦，要不要补记一下？';
                 responseText = summary;
                 nextStep = 'diet_summary';
            }
            else if (isDietIntentOnly) {
                 responseText = '好的，请告诉我您具体吃了什么？（例如：吃了一碗牛肉面，或者 200g 鸡胸肉）';
                 setDietPending(true); 
            }
            else if (isDietRecord) {
                  // Check if quantity is missing
                  if (!hasQuantity) {
                       const potentialFoods = text.split(/[,，\s]+/).filter(t => t.length > 0 && !['我', '了', '吃', '喝', '要', '想', '记', '录', '饮食', '餐', '饭', '今天', '中午', '晚上', '早上', '我吃了', '吃了', '喝了', '我喝了'].includes(t));
                       // Clean up foods list
                       const validFoods = potentialFoods.filter(f => !/^(我要|记|录|一下)$/.test(f)); 
                       
                       if (validFoods.length > 0) {
                           const foodStr = validFoods.join('、');
                           setDietPending(foodStr);
                           responseText = `收到，您吃了 ${foodStr}。请告诉我具体的分量？（例如：一碗、200g）`;
                           
                           setMessages(prev => [...prev, {
                                id: Date.now(),
                                sender: 'ai',
                                text: responseText,
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                           }]);
                           return;
                       }
                  }

                  const foods = text.split(/[,，\s]+/).filter(t => t.length > 0 && !['我', '了', '吃', '喝', '我吃了', '吃了', '喝了', '我喝了'].includes(t));
             
                 // Update Food Log
                 const newItems = foods; 
                 setDailyFoodLog(prev => {
                     if (prev.length > 0 && prev[prev.length - 1] === newItems[0] && newItems.length === 1) {
                         return prev;
                     }
                     return [...prev, ...newItems];
                 });

                 // Real AI Analysis
                 setIsAiTyping(true); 
                 try {
                    let constitution = { type: '未知', desc: '暂无数据' };
                    if (constitutionResult) constitution = constitutionResult;

                    const userProfile = {
                        gender: basicInfo.gender,
                        age: basicInfo.age,
                        constitution: constitution
                    };

                    const analysis = await healthService.analyze_diet(text, userProfile);
                    
                    if (analysis.needClarification) {
                         const clarificationMsg = {
                             id: Date.now() + 1,
                             text: analysis.clarificationQuestion || "请问您吃的这份大约是多少克？或者拍张照给我看看，这样估算更准确。",
                             sender: 'ai',
                             type: 'text'
                         };
                         setMessages(prev => [...prev, clarificationMsg]);
                         const foodName = text.replace(/^(我|我们|咱们)?(吃了?|喝了?|想要?|记|录|吃|喝)\s*/, '');
                         setDietPending(foodName);
                         setIsAiTyping(false); 
                         return; 
                    }

                    if (analysis.nutrients) {
                        const today = new Date().toISOString().split('T')[0];
                        const dailyLogs = storageService.getDailyLogs(today);
                        const currentDayNutrition = dailyLogs.nutrition || { calories: 0, nutrients: { carb: 0, protein: 0, fat: 0 } };
                        
                        const safeParse = (val) => {
                            if (typeof val === 'number') return val;
                            if (typeof val === 'string') return parseFloat(val) || 0;
                            return 0;
                        };

                        const newNutrition = {
                            calories: safeParse(currentDayNutrition.calories) + safeParse(analysis.calories),
                            nutrients: {
                                carb: safeParse(currentDayNutrition.nutrients?.carb) + safeParse(analysis.nutrients?.carb),
                                protein: safeParse(currentDayNutrition.nutrients?.protein) + safeParse(analysis.nutrients?.protein),
                                fat: safeParse(currentDayNutrition.nutrients?.fat) + safeParse(analysis.nutrients?.fat)
                            }
                        };
                        
                        storageService.saveDailyLog(today, 'nutrition', newNutrition);
                        window.dispatchEvent(new Event('storage'));

                        let feedback = `已为您记录：${foods.join('、')}。📝\n\n`;
                        feedback += `🔥 热量预估：${analysis.calories} kcal\n`;
                        feedback += `📊 营养分布：碳水${analysis.nutrients.carb} / 蛋白${analysis.nutrients.protein} / 脂肪${analysis.nutrients.fat}\n\n`;
                        
                        if (analysis.suitability) {
                            const iconMap = { '适宜': '🟢', '推荐': '🟢', '少吃': '🟠', '不宜': '🔴', '谨慎': '⚠️' };
                            const icon = iconMap[analysis.suitability] || '💡';
                            feedback += `${icon} 体质分析：${analysis.suitability}\n`;
                            feedback += `> ${analysis.reason}\n\n`;
                        }

                        feedback += `💡 合拍建议：${analysis.advice}`;

                        responseText = feedback;
                        nextStep = 'daily'; 
                    }

                 } catch (e) {
                     const nutrition = await healthService.get_nutrition('user'); 
                     responseText = `已为您记录：${foods.join('、')}。📝\n\n今日热量摄入评估：${nutrition.summary}`;
                     nextStep = 'daily';
                 } finally {
                     setIsAiTyping(false); 
                 }
            }
            else if (isExerciseRecord) {
                 setIsAiTyping(true);
                 try {
                     const result = await healthService.analyze_exercise(text, { constitution: constitutionResult });
                     const today = new Date().toISOString().split('T')[0];
                     storageService.saveDailyLog(today, 'exercise', result);
                     window.dispatchEvent(new Event('storage')); 
                     
                     responseText = `已记录您的运动：${result.type} ${result.duration}分钟。💪\n消耗约 ${result.calories} 千卡。\n\n${result.advice}`;
                     nextStep = 'daily';
                 } catch (e) {
                     console.error(e);
                     responseText = '记录运动失败，请稍后再试。';
                     nextStep = 'daily';
                 } finally {
                     setIsAiTyping(false);
                 }
            }
            else if (isSleepRecord) {
                 responseText = '好的，请在下方卡片记录您的睡眠情况。😴';
                 nextStep = 'sleep_record';
            }
            else if (isPoopRecord) {
                 responseText = '好的，记录排便情况有助于了解肠道健康。\n请对照下方的【布里斯托大便分类法】，选择最符合的一种：';
                 nextStep = 'poop_record';
            }
            else if (isPeriodRecord) {
                 responseText = '请在下方卡片记录您的经期情况。📅';
                 nextStep = 'period_record';
            }
            else if (isStatusRecord) {
                 responseText = '请选择您今天的身体状态感受：';
                 nextStep = 'status_record';
            }
            else if (text.includes('周报')) {
                 responseText = '为您生成本周健康周报，请查收：';
                 cardType = 'weekly_report';
                 cardData = await generateWeeklyReport();
            }
            else {
                // General Chat
                 try {
                    setIsAiTyping(true);
                    let constitution = { type: '未知', desc: '暂无数据' };
                    if (constitutionResult) constitution = constitutionResult;
                    else if (Object.keys(questionnaireAnswers).length > 5) constitution = calculateConstitution(questionnaireAnswers);

                    const userProfile = {
                        gender: basicInfo.gender,
                        age: basicInfo.age,
                        height: basicInfo.height,
                        weight: basicInfo.weight,
                        activity: basicInfo.activity,
                        sleepTime: basicInfo.sleepTime,
                        constitution: constitution
                    };
                    responseText = await healthService.chat(currentMessages, userProfile);
                    if (currentStep === 'diet_summary') nextStep = 'daily';
                } catch (e) {
                    console.error("Chat Error:", e);
                    responseText = '抱歉，我刚刚走神了。您能再说一遍吗？';
                } finally {
                    setIsAiTyping(false);
                }
            }
        }
    } // Close main try block
    
    // --- 8. Poop Record Flow ---
    else if (stepToProcess === 'poop_record') {
        if (text.includes('Type')) {
            const typeId = parseInt(text.match(/Type (\d)/)[1]);
            const feedbacks = {
                1: '这属于【严重便秘】。😰\n建议：多喝水（每天至少2L），多吃蔬菜水果，必要时补充益生菌。',
                2: '这属于【轻度便秘】。😐\n建议：增加膳食纤维摄入，如燕麦、红薯，并保持适量运动。',
                3: '这是【基本正常】的大便。👍\n建议：继续保持良好的饮食习惯。',
                4: '太棒了！这是【完美】的大便形态。🎉\n说明您的肠道非常健康，请继续保持！',
                5: '这表明【纤维摄入不足】。🍪\n建议：多吃绿叶蔬菜，减少精制碳水化合物。',
                6: '这属于【轻度腹泻】。🥣\n注意：最近是否吃了不洁食物或受凉？建议清淡饮食。',
                7: '这属于【严重腹泻】。💧\n警惕：注意补液防止脱水，如持续请及时就医。'
            };
            responseText = `已记录。${feedbacks[typeId] || '收到。'}`;
            nextStep = 'daily';
        } else {
            responseText = '已记录您的反馈。';
            nextStep = 'daily';
        }
    }

    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'ai',
      text: responseText,
      cardType: cardType,
      cardData: cardData,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    
    if (nextStep !== currentStep) {
        setCurrentStep(nextStep);
    }
  };

  const submitBasicInfo = () => {
    handleSend(`确认提交基础档案`);
  };

  const handleShortcut = (shortcut) => {
    switch (shortcut.id) {
      case 'trigger_morning': handleSend('触发早安提醒'); break;
      case 'trigger_night': handleSend('触发晚安提醒'); break;
      case 'status': handleSend('记录今日身体状态'); break;
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
        'energetic': '精力充沛', 'tired': '疲劳乏力', 'bloated': '胃胀气',
        'headache': '头痛', 'anxious': '焦虑', 'happy': '心情好',
        'cold': '手脚冰凉', 'hot': '燥热'
    };

    const labels = selectedIds.map(id => statusMap[id]).join('、');
    let feedback = `收到，已记录您今天的状态：${labels}。`;

    if (selectedIds.includes('tired')) feedback += '\n\n感觉累了就休息一下，不要硬撑哦。';
    if (selectedIds.includes('bloated')) feedback += '\n\n胃胀气建议饭后散步，或者喝点陈皮水。';
    if (selectedIds.includes('cold')) feedback += '\n\n手脚冰凉是阳虚的表现，睡前可以泡个脚。';

    handleSend(`[状态记录] ${labels}`);

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
      {/* Dashboard Area - Fixed at Top */}
      <div className="px-4 pt-safe-top pb-2 shrink-0 z-50 space-y-2 sticky top-0 bg-bg/95 backdrop-blur-sm">
        {/* Top Buttons - Original 3 Tabs */}
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
                <span className="text-xs font-bold">健康周报</span>
            </button>
            <button 
                onClick={() => toggleTab('profile')}
                className={`flex-1 backdrop-blur-md p-3 rounded-xl border shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${activeTab === 'profile' ? 'bg-brand text-white border-brand' : 'bg-white/80 border-white/50 text-text-main hover:bg-white'}`}
            >
                <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-white' : 'text-brand'}`} />
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
