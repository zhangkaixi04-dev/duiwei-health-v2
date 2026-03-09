import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, Camera, Sparkles, Activity, Utensils, Moon, FileText, Calendar, PlusCircle, CheckCircle, XCircle, TrendingUp, AlertCircle, ChevronDown, ChevronUp, LayoutDashboard } from 'lucide-react';
import DailyFeed from './DailyFeed';
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
               ].map(opt => (
                 <button 
                   key={opt} 
                   onClick={() => {
                     const newGoals = info.goal.includes(opt) ? info.goal.filter(g => g !== opt) : [...info.goal, opt];
                     setInfo({...info, goal: newGoals});
                   }} 
                   className={`px-3 py-1.5 rounded-full text-xs border transition-all ${info.goal.includes(opt) ? 'bg-brand text-white border-brand' : 'border-gray-100 text-text-muted'}`}
                 >
                   {opt}
                 </button>
               ))}
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

const WeeklyReportCard = ({ report }) => (
    <div className="bg-gradient-to-br from-[#FAF9F6] to-[#EDF5F0] p-5 rounded-2xl border border-gray-100 shadow-lg space-y-5 animate-fade-in-up mx-2 mb-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-brand font-serif">本周健康周报</h3>
          <p className="text-xs text-text-muted mt-1">{report.dateRange}</p>
        </div>
        <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-brand/10 shadow-sm">
          <span className="text-xs text-text-muted block text-center">健康分</span>
          <span className="text-xl font-bold text-brand block text-center leading-none mt-0.5">{report.score}</span>
        </div>
      </div>
  
      {/* Summary - LLM Style */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-brand" />
          <h4 className="text-sm font-bold text-text-main">AI 洞察</h4>
        </div>
        <p className="text-xs text-text-main leading-relaxed opacity-90">
          {report.summary}
        </p>
      </div>
  
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="bg-indigo-50 p-2 rounded-lg">
            <Moon className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <div className="text-xs text-text-muted">平均睡眠</div>
            <div className="text-sm font-bold text-text-main">{report.metrics.sleepAvg}h</div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="bg-orange-50 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="text-xs text-text-muted">运动达标</div>
            <div className="text-sm font-bold text-text-main">{report.metrics.exerciseDays}/7天</div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="bg-green-50 p-2 rounded-lg">
            <Utensils className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <div className="text-xs text-text-muted">饮食规律</div>
            <div className="text-sm font-bold text-text-main">{report.metrics.dietScore}分</div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="bg-emerald-50 p-2 rounded-lg">
            <PlusCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-text-muted">排便情况</div>
            <div className="text-sm font-bold text-text-main">{report.metrics.poopStatus}</div>
          </div>
        </div>
      </div>
  
      {/* Suggestion */}
      <div className="bg-brand/5 p-4 rounded-xl border border-brand/10 flex gap-3 items-start">
        <TrendingUp className="w-5 h-5 text-brand shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-brand mb-1">下周建议</h4>
          <p className="text-xs text-text-main opacity-80 leading-relaxed">
            {report.suggestion}
          </p>
        </div>
      </div>
    </div>
  );

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

const SleepRecordCard = ({ onConfirm }) => {
  const [activeTab, setActiveTab] = useState('night'); // night, nap
  const [sleepTime, setSleepTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [wakePeriods, setWakePeriods] = useState([]);
  const [dreamState, setDreamState] = useState('基本无梦');
  const [subjectiveEval, setSubjectiveEval] = useState(null); // good, normal, bad

  // TCM Wake Periods
  const tcmWakeOptions = [
    { label: '23-1点 子时·胆经', value: 'zi' },
    { label: '1-3点 丑时·肝经', value: 'chou' },
    { label: '3-5点 寅时·肺经', value: 'yin' },
    { label: '5-7点 卯时·大肠经', value: 'mao' },
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
       {/* Tabs */}
       <div className="flex bg-white p-1 rounded-xl mb-2">
         <button onClick={() => setActiveTab('night')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'night' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted'}`}>夜间睡眠</button>
         <button onClick={() => setActiveTab('nap')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'nap' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted'}`}>午休小憩</button>
       </div>

       {activeTab === 'night' ? (
         <>
           {/* Time Inputs */}
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

           {/* TCM Wake Periods */}
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

const DietSummaryCard = ({ onConfirm, basicInfo, dailyFoodLog = [] }) => {
  // Use dailyFoodLog from props to pre-fill
  const [foodTypes, setFoodTypes] = useState([]);
  const [satiety, setSatiety] = useState(7); // 1-10

  // Auto-select based on log (Mock logic for now)
  useEffect(() => {
      // In a real app, we would parse dailyFoodLog items against categories
      // For now, we simulate "memory" if there are logs
      if (dailyFoodLog.length > 0) {
          const simulatedTypes = ['grain', 'meat']; // Mock extracted types
          if (dailyFoodLog.some(f => f.includes('菜') || f.includes('叶'))) simulatedTypes.push('veg');
          if (dailyFoodLog.some(f => f.includes('果') || f.includes('苹') || f.includes('梨'))) simulatedTypes.push('fruit');
          setFoodTypes(prev => [...new Set([...prev, ...simulatedTypes])]);
      }
  }, [dailyFoodLog]);

  const foodCats = [
    { id: 'grain', label: '谷薯类', icon: '🍚' },
    { id: 'veg', label: '蔬菜', icon: '🥬' },
    { id: 'fruit', label: '水果', icon: '🍎' },
    { id: 'meat', label: '肉禽蛋', icon: '🥩' },
    { id: 'dairy', label: '奶豆坚果', icon: '🥛' },
    { id: 'oil', label: '油盐糖', icon: '🧂' },
  ];

  // Calculate BMR (Yang Yuexin 2005)
  const calculateBMR = () => {
    let bmr = 0;
    const w = parseFloat(basicInfo.weight || 60);
    const h = parseFloat(basicInfo.height || 165);
    const a = parseFloat(basicInfo.age || 30);
    
    // Yang Yuexin (2005) Formula for Chinese Population
    if (basicInfo.gender === 'male') {
        bmr = (13.88 * w) + (4.16 * h) - (3.43 * a) - 112.4;
    } else {
        bmr = (9.24 * w) + (3.1 * h) - (4.33 * a) + 447.6;
    }

    const activityMultipliers = { 'light': 1.2, 'medium': 1.55, 'heavy': 1.725 }; 
    const act = activityMultipliers[basicInfo.activity === '轻度' ? 'light' : basicInfo.activity === '中度' ? 'medium' : 'heavy'] || 1.2;
    
    return Math.round(bmr * act);
  };

  const targetCal = calculateBMR();

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg mx-4 mb-4 animate-fade-in-up space-y-5">
      <div className="flex items-center justify-between mb-1">
         <div className="flex items-center gap-2">
            <span className="bg-orange-50 p-1.5 rounded-lg text-orange-500"><Utensils className="w-4 h-4" /></span>
            <h3 className="font-bold text-text-main">今日饮食复盘</h3>
         </div>
         <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-text-muted">目标: {targetCal} kcal</span>
      </div>

      {dailyFoodLog.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-xl text-xs text-text-muted space-y-1">
              <div className="font-bold text-orange-600">📝 AI 已自动记录：</div>
              <ul className="list-disc pl-4 space-y-0.5">
                  {dailyFoodLog.map((log, i) => <li key={i}>{log}</li>)}
              </ul>
          </div>
      )}

      <div className="space-y-2">
        <label className="text-xs text-text-muted block">AI 识别到以下种类，请确认补充：</label>
        <div className="grid grid-cols-3 gap-2">
           {foodCats.map(cat => (
             <button 
               key={cat.id} 
               onClick={() => setFoodTypes(prev => prev.includes(cat.id) ? prev.filter(i => i !== cat.id) : [...prev, cat.id])}
               className={`py-2 px-1 rounded-xl border text-xs flex items-center justify-center gap-1 transition-all ${foodTypes.includes(cat.id) ? 'bg-orange-50 border-orange-200 text-orange-700' : 'border-gray-100 text-text-muted'}`}
             >
               <span>{cat.icon}</span>
               <span>{cat.label}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
           <label className="text-xs text-text-muted">今日整体饱腹感</label>
           <span className="text-xs font-bold text-orange-500">{satiety}分 ({satiety > 8 ? '撑' : satiety < 5 ? '饿' : '适中'})</span>
        </div>
        <input 
          type="range" min="1" max="10" value={satiety} onChange={e => setSatiety(e.target.value)} 
          className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-[10px] text-text-muted px-1">
           <span>很饿</span>
           <span>七八分饱</span>
           <span>很撑</span>
        </div>
      </div>

      <button onClick={() => onConfirm({ foodTypes, satiety, targetCal })} className="w-full bg-orange-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-md">确认并生成总结</button>
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

const ChatInterface = () => {
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
  
  const [currentStep, setCurrentStep] = useState(() => {
    return storageService.getAppState().currentStep || 'basic_info';
  });
  
  // Data State
  const [basicInfo, setBasicInfo] = useState(() => {
    return storageService.getUserProfile().basicInfo || { gender: 'female', age: '', height: '', weight: '', activity: 'light', goal: [] };
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

  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true); // Default open

  const messagesEndRef = useRef(null);
  const foodInputRef = useRef(null);

  // --- Constants ---
  const allShortcuts = [
    { id: 'status', label: '今日状态', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'diet', label: '记饮食', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'sleep', label: '记睡眠', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'poop', label: '记排便', icon: PlusCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' }, 
    { id: 'period', label: '记月经', icon: Calendar, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'weekly', label: '周总结', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' },
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
         // Avoid duplicate if already sent recently (logic simplified for demo)
         const lastMsg = messages[messages.length - 1];
         if (lastMsg && lastMsg.text.includes('早安') && (Date.now() - lastMsg.id < 60000)) return;
         
         handleSend('触发早安提醒'); // Internal trigger
      }

      // Check Night
      if (timeStr === settings.night) {
         const lastMsg = messages[messages.length - 1];
         if (lastMsg && lastMsg.text.includes('晚安') && (Date.now() - lastMsg.id < 60000)) return;

         handleSend('触发晚安提醒'); // Internal trigger
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
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setShowActionSheet(false);

    // AI Logic (Simulated Agent)
    // Removed setTimeout to improve responsiveness for user query
    processAgentLogic(text);
  };

  const generateWeeklyReport = async () => {
    // Call the Service Layer instead of local mock
    try {
      const report = await healthService.report_weekly('current_user');
      return report;
    } catch (e) {
      console.error(e);
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
          
          const newNutrition = {
              calories: currentNutrition.calories + (data.nutrition.calories || 0),
              nutrients: {
                  carb: currentNutrition.nutrients.carb + (data.nutrition.nutrients.carb || 0),
                  protein: currentNutrition.nutrients.protein + (data.nutrition.nutrients.protein || 0),
                  fat: currentNutrition.nutrients.fat + (data.nutrition.nutrients.fat || 0)
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
    // Ignore system log messages triggered by UI actions
    if (text.startsWith('[') && text.includes(']')) return;

    // --- Handle Pending Diet Inputs ---
    if (dietPending) {
        // If it's a boolean true, we are waiting for food name (from "I want to record diet")
        if (dietPending === true) {
             text = "我吃了 " + text;
             setDietPending(null);
        } 
        // If it's a string, we are waiting for quantity (from "I ate Apple")
        else if (typeof dietPending === 'string') {
             // Check if input looks like a quantity
             const quantityMatch = text.match(/([0-9]+|[一二三四五六七八九十百千半]+)\s*(g|ml|l|kg|克|毫升|升|公斤|碗|杯|份|个|只|条|盘|勺|斤|两|瓶|盒|袋)/i);
             if (quantityMatch) {
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

        // 2. Global Shortcuts / Commands (Treat as Daily intent)
        // If user clicks a shortcut button or types a command
        if (['生成周报', '我要记', '触发', '/reset', '周报', '食谱', '记录'].some(k => text.includes(k))) {
             stepToProcess = 'daily'; 
             // Also notify user we switched
             setMessages(prev => [...prev, {
                id: Date.now() - 1, // Before the actual response
                sender: 'ai',
                text: '已为您切换到日常模式。',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    }

    // --- 1. Basic Info ---
    if (stepToProcess === 'basic_info') {
      if (text.includes('确认提交') || text.match(/档案/)) {
         // Generate personalized response based on new fields
         let feedback = `基础档案已建立。📝\n`;
         
         // Mock: Fetch constitution to see if we can infer anything early (optional)
         // const consti = await healthService.get_constitution('user'); 
         
         if (basicInfo.brainLoad === '高') feedback += `注意到您脑力消耗大，我会特别关注补脑安神的营养搭配。\n`;
         if (basicInfo.sleepHabit === '经常熬夜') feedback += `您的作息需要调整哦，我们会循序渐进地改善。\n`;
         if (basicInfo.gender === 'female' && basicInfo.painLevel === '剧烈痛') feedback += `关于痛经问题，我会结合您的体质给出针对性调理方案。\n`;
         
         responseText = `${feedback}\n为了精准辨识您的体质，请配合上传一张【舌诊照片】。`;
         nextStep = 'upload_tongue';
      } else {
         responseText = '请填写上方的基础信息卡片，让我更全面地了解您。';
      }
    }
    
    // --- 2. Tongue Diagnosis ---
    else if (stepToProcess === 'upload_tongue') {
      // Logic moved to handleTongueAnalysis for actual uploads.
      // This block handles text input or "Skip".
      if (text.includes('暂不') || text.includes('跳过')) {
          const consti = await healthService.get_constitution('user'); // Get default/mock
          responseText = `没关系，我们可以先跳过。\n\n根据您的基础信息，我初步推测您可能偏向【${consti.type}】。\n\n为了更准确，您可以随时在个人中心补充问卷。`;
          nextStep = 'diagnosis_confirm';
      } else if (text.includes('照片') || text.includes('上传')) {
          responseText = '请直接点击上方的“点击拍摄”按钮来上传照片哦。👆';
      } else {
          responseText = '请上传舌诊照片，或者告诉我“跳过”。';
      }
    }

    // --- 9. Sleep Record Flow ---
    else if (stepToProcess === 'sleep_record') {
        responseText = '请在下方卡片中填写睡眠信息。';
    }

    // --- 10. Diet Summary Flow ---
    else if (stepToProcess === 'diet_summary') {
        responseText = '请在下方卡片中回顾今日饮食。';
    }

    // --- 3. Confirm Diagnosis ---
    else if (stepToProcess === 'diagnosis_confirm') {
       if (text.includes('不准') || text.includes('不像') || text.includes('不对')) {
          responseText = '抱歉，AI 舌诊可能受光线影响。为了更准确，建议您填写一份专业的【中医体质辨识问卷】。\n\n📋 问卷说明：\n- 国家标准中医体质分类\n- 共 72 道题（分为9个模块）\n- 预计耗时 3-5 分钟\n- 支持断点续填（随时暂停，进度自动保存）\n\n是否现在开始填写？';
          nextStep = 'questionnaire_intro';
       } else {
          // User says "Yes" / "Accurate"
          const consti = await healthService.get_constitution('user');
          responseText = `太棒了！那我们就先以“${consti.type}”作为初始调理方向。💪\n\n不过，AI 视觉诊断可能存在局限。为了最科学地评估您的体质，我还为您准备了【国家标准中医体质问卷】。\n\n📋 问卷说明：\n- 国家标准中医体质分类\n- 共 72 道题（分为9个模块）\n- 预计耗时 3-5 分钟\n- 结果将生成多维雷达图\n\n您想现在进行更精准的测试，还是先跳过？`;
          nextStep = 'ask_questionnaire';
       }
    }

    // --- 3.5 Ask Questionnaire (New Step) ---
    else if (stepToProcess === 'ask_questionnaire') {
        if (text.includes('填') || text.includes('做') || text.includes('是') || text.includes('好') || text.includes('准')) {
             const firstQ = questionnaireData[0];
             responseText = `好的，您的健康态度很棒！👍\n\n我们开始第一题（1/${questionnaireData.length}）：\n\n${firstQ.question}\n(${firstQ.options.join(' / ')})`;
             nextStep = 'questionnaire_doing';
             setQuestionnaireProgress(1);
        } else {
             responseText = '没问题，那我们先基于目前的判断开始调理。日后您随时可以在“个人中心”补充问卷。\n\n接下来，为了更好地照顾您，建议设置每日提醒。';
             nextStep = 'reminder_setup';
        }
    }

    // --- 4. Questionnaire Intro ---
    else if (stepToProcess === 'questionnaire_intro') {
        if (text.includes('开始') || text.includes('好')) {
            const firstQ = questionnaireData[0];
            responseText = `好的，我们开始第一题（1/${questionnaireData.length}）：\n\n${firstQ.question}\n(${firstQ.options.join(' / ')})`;
            nextStep = 'questionnaire_doing';
            setQuestionnaireProgress(1);
        } else {
            responseText = '没关系，您可以随时告诉我“开始问卷”来补充信息。那我们先进入日常模式。';
            nextStep = 'reminder_setup';
        }
    }
    
    // --- 5. Questionnaire Doing ---
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
        responseText = '设置成功！合拍 AI 正式为您服务。🎉\n您可以随时告诉我您的饮食、运动或身体感受。';
        nextStep = 'daily';
    }

    // --- 7. Daily Flow ---
    else if (stepToProcess === 'daily') {
        // A. Explicit Commands
        if (text === '/reset') {
            return; 
        }

        // B. Debug Triggers
        if (text === '触发早安提醒') {
             responseText = '早安！☀️ 又是充满活力的一天。\n昨晚睡得怎么样？来记录一下睡眠吧。';
             nextStep = 'sleep_record';
        }
        else if (text === '触发晚安提醒') {
             responseText = '晚安。🌙 忙碌了一天辛苦了。\n让我们来复盘一下今天的饮食情况吧。';
             nextStep = 'diet_summary';
        }

        // C. Diet Recording Intent
        // Only trigger diet logic if keywords are present AND it's not a question/chat
        // Improved logic: Require specific action verbs or quantity patterns to distinguish from chat
        const dietAntiKeywords = [
            '怎么', '什么', '推荐', '吗', '?', '？', // Questions
            '上火', '便秘', '失眠', // Symptoms
            '想吃', '能不能', '可以', '好不好', // Preferences/Permissions
            '热量', '多少', '一般', '通常', '注意', // Inquiries
            '喜欢', '爱吃', '讨厌', '不吃', // Preferences
            '每天', '经常', '总是', '习惯', // Habits
            '准备', '打算', '要去', '会' // Future intent
        ];
        const isDietQuestion = dietAntiKeywords.some(kw => text.includes(kw));
        
        // Pattern 0: Explicit Intent Only (e.g. "我要记饮食", "记饮食") - Ask for details
        // This prevents sending "I want to record" to the AI analyzer
        const isDietIntentOnly = /^(我要|想)?(记|录)(一下)?(饮食|吃饭|早餐|午餐|晚餐)?$/.test(text.trim()) || text.trim() === '我要记饮食';

        if (isDietIntentOnly) {
             responseText = '好的，请告诉我您具体吃了什么？（例如：吃了一碗牛肉面，或者 200g 鸡胸肉）';
             setDietPending(true); // Update placeholder to prompt user
             // Return early to skip analysis
        }
        else {
             // Pattern A: Explicit Intent with Content (e.g. "Record diet: apple")
             const isExplicitDiet = /(记|录).*(吃|喝|饮食|餐)/.test(text) || text.includes('我要记饮食');
             
             // ... (Rest of logic)
             
             // Pattern B: Explicit Action
             const hasDietAction = ['吃了', '喝了', '吃完', '喝完', '早饭', '午饭', '晚饭', '早餐', '午餐', '晚餐', '加餐', '夜宵', '下午茶'].some(kw => text.includes(kw));
             
             // Pattern C: Quantity + Food Keyword
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

             const isDietRecord = (isExplicitDiet || hasDietAction || (hasFoodKeyword && hasQuantity)) && !isDietQuestion;

             if (isDietRecord) {
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
             // dailyFoodLog state will trigger useEffect to save to storageService
             
             // ... But here we need to update state
             const newItems = foods; // Array of strings
             setDailyFoodLog(prev => {
                 return [...prev, ...newItems];
             });

             // Real AI Analysis
             setIsAiTyping(true); // Show typing indicator
             try {
                // Get Constitution Data if available
                let constitution = { type: '未知', desc: '暂无数据' };
                if (constitutionResult) constitution = constitutionResult;

                const userProfile = {
                    gender: basicInfo.gender,
                    age: basicInfo.age,
                    constitution: constitution
                };

                const analysis = await healthService.analyze_diet(text, userProfile);
                
                // Save Nutrition Data for Dashboard
                const today = new Date().toISOString().split('T')[0];
                const dailyLogs = storageService.getDailyLogs(today);
                const currentDayNutrition = dailyLogs.nutrition || { calories: 0, nutrients: { carb: 0, protein: 0, fat: 0 } };
                
                const newNutrition = {
                    calories: currentDayNutrition.calories + (analysis.calories || 0),
                    nutrients: {
                        carb: currentDayNutrition.nutrients.carb + (analysis.nutrients?.carb || 0),
                        protein: currentDayNutrition.nutrients.protein + (analysis.nutrients?.protein || 0),
                        fat: currentDayNutrition.nutrients.fat + (analysis.nutrients?.fat || 0)
                    }
                };
                
                storageService.saveDailyLog(today, 'nutrition', newNutrition);
                
                // Trigger storage event for DailyFeed to update
                window.dispatchEvent(new Event('storage'));

                // Construct feedback message
                let feedback = `已为您记录：${foods.join('、')}。📝\n\n`;
                feedback += `🔥 热量预估：${analysis.calories} kcal\n`;
                feedback += `📊 营养分布：碳水${analysis.nutrients.carb} / 蛋白${analysis.nutrients.protein} / 脂肪${analysis.nutrients.fat}\n\n`;
                feedback += `💡 合拍建议：${analysis.advice}`;

                responseText = feedback;

             } catch (e) {
                 // Fallback if AI fails
                 const nutrition = await healthService.get_nutrition('user'); 
                 responseText = `已为您记录：${foods.join('、')}。📝\n\n今日热量摄入评估：${nutrition.summary}`;
             } finally {
                 setIsAiTyping(false); // Hide typing indicator
             }
        }
        
        }
        
        if (!responseText) {
        // D. Sleep Recording Intent
        // Improved logic: Require time pattern AND context (yesterday/today/past tense) to avoid general chat
        const sleepAntiKeywords = [
            '怎么', '什么', '影响', '好不好', '吗', '?', '？', // Questions
            '一般', '通常', '习惯', '建议', '应该', '想', // Inquiries/Habits
            '每天', '经常', '总是', '失眠', '多梦', '易醒' // Symptoms
        ];
        const isSleepQuestion = sleepAntiKeywords.some(kw => text.includes(kw));
        
        const isExplicitSleep = /(记|录).*(睡|醒|觉)/.test(text) || text.includes('我要记睡眠');

        const hasTimePattern = /\d+[:：]\d+|\d+点|\d+h|\d+小时/.test(text);
        const hasSleepAction = /(睡|醒|起)/.test(text);
        // Context MUST imply a specific recent event, not a general habit
        const hasContext = /(昨|今|了|刚|早上|晚上|夜里|凌晨)/.test(text); // e.g. "昨晚", "睡了", "刚醒"

        const isSleepRecord = (isExplicitSleep || (hasSleepAction && hasTimePattern && hasContext)) && !isSleepQuestion;

        if (isSleepRecord) {
             responseText = '好的，请在下方卡片记录您的睡眠情况。😴';
             nextStep = 'sleep_record';
        }

        // E. Poop Recording Intent
        else if (text.match(/(排便|大便|拉屎)/) && !text.includes('怎么') && !text.includes('便秘')) {
             responseText = '好的，记录排便情况有助于了解肠道健康。\n请对照下方的【布里斯托大便分类法】，选择最符合的一种：';
             nextStep = 'poop_record';
        }

        // F. Weekly Report Intent
        else if (text.includes('周报')) {
             responseText = '为您生成本周健康周报，请查收：';
             cardType = 'weekly_report';
             cardData = await generateWeeklyReport();
        }

        // G. General Chat (Default)
        // If none of the above, treat as Health Consultation
        else {
            // Use Real LLM for Chat
            try {
                // Show "typing" state is handled by UI
                setIsAiTyping(true);
                
                // Get Constitution Data if available
                let constitution = { type: '未知', desc: '暂无数据' };
                
                // Prioritize explicit result (from Tongue or Completed Questionnaire)
                if (constitutionResult) {
                    constitution = constitutionResult;
                }
                // Fallback: Try to calculate from partial answers if meaningful
                else if (Object.keys(questionnaireAnswers).length > 5) {
                    constitution = calculateConstitution(questionnaireAnswers);
                }

                const userProfile = {
                    gender: basicInfo.gender,
                    age: basicInfo.age,
                    height: basicInfo.height,
                    weight: basicInfo.weight,
                    activity: basicInfo.activity,
                    sleepTime: basicInfo.sleepTime,
                    constitution: constitution
                };

                responseText = await healthService.chat(messages, userProfile);
            } catch (e) {
                console.error("Chat Error:", e);
                responseText = '抱歉，我刚刚走神了。您能再说一遍吗？';
            } finally {
                setIsAiTyping(false);
            }
        }
    }
    }
    
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
      case 'weekly': handleSend('生成周报'); break;
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

  const handleDietSummarySubmit = (data) => {
    let feedback = `今日饮食复盘完成。✅\n\n`;
    
    // Variety Feedback
    const typeCount = data.foodTypes.length; // Approximate variety based on categories
    if (typeCount >= 5) feedback += `🥕 食材丰富度不错！覆盖了 ${typeCount} 大类，继续保持。\n`;
    else feedback += `🥕 食材种类略少（${typeCount}类），建议明天增加蔬菜和菌菇类。\n`;

    // Calories/Satiety Feedback
    feedback += `🔥 目标热量 ${data.targetCal} kcal。\n`;
    if (data.satiety >= 8) feedback += `感觉“撑”意味着可能摄入过量，晚餐建议只吃七分饱，减轻肠胃负担。`;
    else if (data.satiety <= 4) feedback += `感觉“饿”可能会降低代谢，建议加餐一杯牛奶或少量坚果。`;
    else feedback += `饱腹感适中，热量控制得很好！`;

    handleSend(`[饮食复盘] 饱腹感 ${data.satiety}分`);
    
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

  const handlePoopSubmit = (data) => {
    // Save to storage (mock or real)
    const today = new Date().toISOString().split('T')[0];
    // storageService.addHealthRecord('poop', data); // Assuming this exists or works generically

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

  return (
    <div className="flex flex-col h-full bg-bg relative">
      {/* Dashboard Area - Fixed at Top */}
      <div className="px-4 pt-4 pb-2 shrink-0 z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <button 
                onClick={() => setShowDashboard(!showDashboard)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-colors"
            >
                <div className="flex items-center gap-2 text-brand font-bold">
                    <LayoutDashboard className="w-5 h-5" />
                </div>
                {showDashboard ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            
            <div className={`transition-all duration-500 ease-in-out overflow-hidden bg-white/40 ${showDashboard ? 'max-h-[80vh] opacity-100 border-t border-gray-100/50' : 'max-h-0 opacity-0'}`}>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <DailyFeed />
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

        {currentStep === 'poop_record' && (
           <PoopRecordCard 
             onConfirm={handlePoopSubmit}
           />
        )}

        {currentStep === 'sleep_record' && (
           <SleepRecordCard 
             onConfirm={handleSleepSubmit}
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
             {(questionnaireData[questionnaireProgress - 1]?.options || ['没有', '很少', '有时', '经常', '总是']).map(opt => (
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
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {showActionSheet && (
          <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100/50 shadow-lg animate-in slide-in-from-bottom duration-300">
            <div className="px-4 py-4">
               <div className="flex justify-between items-center mb-2 px-1">
                 <span className="text-xs text-text-muted font-medium">常用功能</span>
                 <button onClick={() => setShowActionSheet(false)} className="text-xs text-brand">收起</button>
               </div>
               <div className="grid grid-cols-4 gap-4">
                 {shortcuts.map((s) => (
                   <button key={s.id} onClick={() => handleShortcut(s)} className="flex flex-col items-center gap-2 group">
                     <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center transition-transform group-active:scale-95`}>
                       <s.icon className={`w-6 h-6 ${s.color}`} />
                     </div>
                     <span className="text-[10px] text-text-muted font-medium">{s.label}</span>
                   </button>
                 ))}
               </div>
            </div>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100/50 p-3 pb-6 flex items-end gap-3">
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
            <button className="p-2.5 rounded-full bg-gray-50 text-text-muted hover:bg-gray-100 hover:text-brand transition-colors mb-0.5"><Mic className="w-6 h-6" /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
