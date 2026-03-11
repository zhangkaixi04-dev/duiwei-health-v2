import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Save, ChevronLeft } from 'lucide-react';
import { storageService } from '../../services/storageService';

const HealthProfile = ({ onBack }) => {
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    allergies: '',
    medicalHistory: '',
    goals: []
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const profile = storageService.getUserProfile();
    setFormData({
      height: profile.basicInfo?.height || '',
      weight: profile.basicInfo?.weight || '',
      tongueResult: profile.constitution?.type || '',
      tongueDate: profile.constitution?.updatedAt || '', 
      allergies: Array.isArray(profile.medicalHistory?.allergies) 
        ? profile.medicalHistory.allergies.join(', ') 
        : (profile.medicalHistory?.allergies || ''),
      medicalHistory: Array.isArray(profile.medicalHistory?.diseases) 
        ? profile.medicalHistory.diseases.join(', ') 
        : (profile.medicalHistory?.diseases || ''),
      goals: profile.goals || []
    });
  }, []);

  const handleSave = () => {
    // Update Basic Info (Height, Weight)
    storageService.updateUserProfileSection('basicInfo', {
      height: formData.height,
      weight: formData.weight
    });

    const allergiesList = formData.allergies.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    const diseasesList = formData.medicalHistory.split(/[,，]/).map(s => s.trim()).filter(Boolean);

    storageService.updateUserProfileSection('medicalHistory', {
      allergies: allergiesList,
      diseases: diseasesList
    });
    
    storageService.updateUserProfileSection('goals', formData.goals);

    setIsEditing(false);
    alert('保存成功');
  };

  const toggleGoal = (goal) => {
    const newGoals = formData.goals.includes(goal) 
        ? formData.goals.filter(g => g !== goal)
        : [...formData.goals, goal];
    setFormData({ ...formData, goals: newGoals });
  };

  const goalOptions = [
    '改善睡眠', '减肥减脂', '调理月经', '增强体质', '缓解焦虑', '改善肠胃', '备孕调理', '美容养颜'
  ];

  if (!isEditing) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fade-in h-full flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-brand transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h3 className="font-bold text-lg text-gray-800">健康档案</h3>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium block mb-1">身高</span>
            <div className="font-bold text-lg text-gray-800">{formData.height ? `${formData.height} cm` : '未设置'}</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium block mb-1">体重</span>
            <div className="font-bold text-lg text-gray-800">{formData.weight ? `${formData.weight} kg` : '未设置'}</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium block mb-2">调理目标</span>
            <div className="flex flex-wrap gap-2">
                {formData.goals && formData.goals.length > 0 ? (
                    formData.goals.map(goal => (
                        <span key={goal} className="px-2.5 py-1 bg-brand/10 text-brand text-xs font-bold rounded-lg border border-brand/20">
                            {goal}
                        </span>
                    ))
                ) : (
                    <span className="text-sm text-gray-400">暂未设置目标</span>
                )}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium block mb-1">过敏史/忌口</span>
            <div className="font-medium text-gray-800">
              {formData.allergies ? formData.allergies.split(/[,，]/).join('、') : '暂无记录'}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium block mb-1">既往病史</span>
            <div className="font-medium text-gray-800">
              {formData.medicalHistory ? formData.medicalHistory.split(/[,，]/).join('、') : '暂无记录'}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs text-text-muted font-medium block mb-1">舌诊记录</span>
            <div className="flex justify-between items-center">
                <span className="font-medium text-text-main">
                    {formData.tongueResult || '暂无舌诊记录'}
                </span>
                <span className="text-[10px] text-brand bg-brand/5 px-2 py-1 rounded-lg">
                    {formData.tongueDate || '去对话框拍摄'}
                </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsEditing(true)}
          className="w-full py-3.5 bg-brand text-white rounded-xl font-bold mt-4 shadow-lg shadow-brand/20 active:scale-[0.98] transition-all"
        >
          编辑档案
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fade-in h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setIsEditing(false)} className="p-1 -ml-1 text-gray-400 hover:text-brand transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h3 className="font-bold text-lg text-gray-800">编辑健康档案</h3>
      </div>

      <div className="space-y-5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">调理目标 (多选)</label>
          <div className="grid grid-cols-2 gap-2">
            {goalOptions.map(opt => (
                <button 
                    key={opt}
                    onClick={() => toggleGoal(opt)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${formData.goals.includes(opt) ? 'bg-brand/10 border-brand text-brand' : 'bg-gray-50 border-gray-100 text-text-muted hover:bg-gray-100'}`}
                >
                    {opt}
                </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">身高 (cm)</label>
          <input 
            type="number" 
            value={formData.height}
            onChange={(e) => setFormData({...formData, height: e.target.value})}
            placeholder="请输入身高"
            className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all font-medium"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">体重 (kg)</label>
          <input 
            type="number" 
            value={formData.weight}
            onChange={(e) => setFormData({...formData, weight: e.target.value})}
            placeholder="请输入体重"
            className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all font-medium"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">过敏史/忌口</label>
          <textarea 
            value={formData.allergies}
            onChange={(e) => setFormData({...formData, allergies: e.target.value})}
            placeholder="如：海鲜、芒果、花生（用逗号分隔）"
            rows={3}
            className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all font-medium resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">既往病史</label>
          <textarea 
            value={formData.medicalHistory}
            onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
            placeholder="如：高血压、糖尿病（用逗号分隔）"
            rows={3}
            className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all font-medium resize-none"
          />
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full py-3.5 bg-brand text-white rounded-xl font-bold mt-4 shadow-lg shadow-brand/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        <Save className="w-5 h-5" />
        保存修改
      </button>
    </div>
  );
};

export default HealthProfile;

HealthProfile.propTypes = {
  onBack: PropTypes.func
};
