import React, { useState, useEffect } from 'react';
import { Settings, Calendar, FileText, X, ChevronRight, ClipboardList, Camera, User, Plus, Smartphone, Edit2, Save } from 'lucide-react';
import { healthService } from '../services/healthService';
import { storageService } from '../services/storageService';
import QuestionnaireWrapper from './personal/QuestionnaireWrapper';
import ManualEntry from './personal/ManualEntry';
import DeviceConnect from './personal/DeviceConnect';

const PersonalCenter = ({ onClose, isModal = true, isSetupMode = false }) => {
  const [userInfo, setUserInfo] = useState({});
  const [constitution, setConstitution] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (isSetupMode) return;

    const userProfile = storageService.getUserProfile();
    if (userProfile.basicInfo) {
      setUserInfo(userProfile.basicInfo);
      setEditFormData({
        height: userProfile.basicInfo.height || '',
        weight: userProfile.basicInfo.weight || '',
        age: userProfile.basicInfo.age || '',
        gender: userProfile.basicInfo.gender || '',
        allergies: Array.isArray(userProfile.medicalHistory?.allergies) 
          ? userProfile.medicalHistory.allergies.join(', ') 
          : (userProfile.medicalHistory?.allergies || ''),
        medicalHistory: Array.isArray(userProfile.medicalHistory?.diseases) 
          ? userProfile.medicalHistory.diseases.join(', ') 
          : (userProfile.medicalHistory?.diseases || '')
      });
    }
    if (userProfile.goals) setGoals(userProfile.goals);

    const mockConstitution = {
        type: '阳虚质 (兼血虚)',
        desc: '阳气不足，失于温煦，兼有面色苍白、唇甲淡白等血虚表现。建议温补阳气，兼顾养血。',
        radarData: [
            { subject: '阳虚', A: 90, fullMark: 100 },
            { subject: '血虚', A: 75, fullMark: 100 },
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
    
    storageService.updateUserProfileSection('constitution', mockConstitution);
    setConstitution(mockConstitution);
  }, []);

  const goalOptions = [
    '提升精力', '改善疲劳感',
    '入睡困难', '睡眠浅易醒',
    '健康减重', '增肌塑形',
    '经期调理', '皮肤改善',
    '减少焦虑', '稳定情绪',
    '肠胃调理', '免疫力提升'
  ];

  const toggleGoal = (goal) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal));
    } else if (goals.length < 2) {
      setGoals([...goals, goal]);
    }
  };

  const handleSave = () => {
    storageService.updateUserProfileSection('basicInfo', {
      ...userInfo,
      height: editFormData.height,
      weight: editFormData.weight,
      age: editFormData.age,
      gender: editFormData.gender
    });

    const allergiesList = editFormData.allergies.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    const diseasesList = editFormData.medicalHistory.split(/[,，]/).map(s => s.trim()).filter(Boolean);

    storageService.updateUserProfileSection('medicalHistory', {
      allergies: allergiesList,
      diseases: diseasesList
    });
    
    storageService.updateUserProfileSection('goals', goals);

    const userProfile = storageService.getUserProfile();
    if (userProfile.basicInfo) setUserInfo(userProfile.basicInfo);
    
    setIsEditing(false);
  };

  const renderSection = () => {
    switch(activeSection) {
      case 'questionnaire':
        return (
          <QuestionnaireWrapper 
            onBack={() => setActiveSection(null)}
            onComplete={(result) => {
              setConstitution(result);
              setActiveSection(null);
            }}
          />
        );
      case 'manual_entry':
        return (
          <ManualEntry 
            onBack={() => setActiveSection(null)} 
            onSaveSuccess={() => {
              healthService.get_constitution('user').then(data => {
                setConstitution(data);
                setActiveSection(null);
              });
            }}
          />
        );
      case 'device_connect':
        return <DeviceConnect onBack={() => setActiveSection(null)} />;
      default:
        return renderMainContent();
    }
  };

  const renderMainContent = () => {
    if (isSetupMode) {
      return (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center animate-pulse">
            <FileText className="w-10 h-10 text-brand" />
          </div>
          <h3 className="text-lg font-bold text-text-main">档案建立中...</h3>
          <p className="text-sm text-text-muted text-center px-6">
            请在对话框中回答问题，我将为您生成专属健康档案。
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* 体质补充 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-brand rounded-full"></span>
            体质补充
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setActiveSection('questionnaire')}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-brand/5 border border-brand/20 hover:bg-brand/10 transition-all"
            >
              <ClipboardList className="w-5 h-5 text-brand" />
              <span className="text-xs font-bold text-brand">问卷</span>
            </button>
            <button 
              onClick={() => {
                onClose();
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('trigger-tongue-upload'));
                }, 300);
              }}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all"
            >
              <Camera className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-bold text-blue-500">舌诊</span>
            </button>
            <button 
              onClick={() => setActiveSection('manual_entry')}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all"
            >
              <FileText className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500">医生结论</span>
            </button>
          </div>
        </div>

        {/* 基础信息 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
              <span className="w-1 h-4 bg-brand rounded-full"></span>
              基础信息
            </h3>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-brand hover:bg-brand/10 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">身高 (cm)</label>
                <input 
                  type="number" 
                  value={editFormData.height || ''}
                  onChange={(e) => setEditFormData({...editFormData, height: e.target.value})}
                  placeholder="请输入身高"
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">体重 (kg)</label>
                <input 
                  type="number" 
                  value={editFormData.weight || ''}
                  onChange={(e) => setEditFormData({...editFormData, weight: e.target.value})}
                  placeholder="请输入体重"
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">年龄</label>
                <input 
                  type="number" 
                  value={editFormData.age || ''}
                  onChange={(e) => setEditFormData({...editFormData, age: e.target.value})}
                  placeholder="请输入年龄"
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">性别</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditFormData({...editFormData, gender: 'female'})}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${editFormData.gender === 'female' ? 'bg-brand text-white border-brand' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                  >
                    女
                  </button>
                  <button 
                    onClick={() => setEditFormData({...editFormData, gender: 'male'})}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${editFormData.gender === 'male' ? 'bg-brand text-white border-brand' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                  >
                    男
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-2">调理目标 (最多选2个)</label>
                <div className="grid grid-cols-2 gap-2">
                  {goalOptions.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => toggleGoal(opt)}
                      disabled={!goals.includes(opt) && goals.length >= 2}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        goals.includes(opt) 
                          ? 'bg-brand/10 border-brand text-brand' 
                          : goals.length >= 2 
                            ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' 
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">过敏史/忌口</label>
                <textarea 
                  value={editFormData.allergies || ''}
                  onChange={(e) => setEditFormData({...editFormData, allergies: e.target.value})}
                  placeholder="如：海鲜、芒果、花生（用逗号分隔）"
                  rows={2}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">病史</label>
                <textarea 
                  value={editFormData.medicalHistory || ''}
                  onChange={(e) => setEditFormData({...editFormData, medicalHistory: e.target.value})}
                  placeholder="如：高血压、糖尿病（用逗号分隔）"
                  rows={2}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-text-main">身高</span>
                <span className="text-sm font-medium text-text-muted">{userInfo.height ? `${userInfo.height} cm` : '未设置'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-text-main">体重</span>
                <span className="text-sm font-medium text-text-muted">{userInfo.weight ? `${userInfo.weight} kg` : '未设置'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-text-main">年龄</span>
                <span className="text-sm font-medium text-text-muted">{userInfo.age ? `${userInfo.age} 岁` : '未设置'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-text-main">性别</span>
                <span className="text-sm font-medium text-text-muted">
                  {userInfo.gender === 'female' ? '女' : userInfo.gender === 'male' ? '男' : '未设置'}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-main">调理目标</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {goals && goals.length > 0 ? (
                    goals.map(goal => (
                      <span key={goal} className="px-2 py-0.5 bg-brand/10 text-brand text-[10px] font-bold rounded-lg border border-brand/20">
                        {goal}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">暂未设置目标</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="text-sm text-text-main block">过敏史/忌口</span>
                  <span className="text-xs text-text-muted">
                    {editFormData.allergies ? editFormData.allergies.split(/[,，]/).join('、') : '暂无记录'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="text-sm text-text-main block">病史</span>
                  <span className="text-xs text-text-muted">
                    {editFormData.medicalHistory ? editFormData.medicalHistory.split(/[,，]/).join('、') : '暂无记录'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 绑定硬件 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setActiveSection('device_connect')}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-text-main">绑定硬件</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gray-50 z-50 animate-slide-in-right overflow-y-auto ${isModal ? 'fixed inset-0' : 'w-full h-full min-h-[400px]'}`}>
      {isModal && (
        <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-gray-100">
           <h2 className="text-lg font-bold text-gray-800">设置</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>
      )}

      <div className={`px-4 pb-20 ${isModal ? 'pt-4' : 'pt-2'}`}>
         {renderSection()}
         
         {!activeSection && !isSetupMode && (
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
