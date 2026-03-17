import React, { useState } from 'react';
import { Save, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { storageService } from '../../services/storageService';

const CONSTITUTION_TYPES = [
  '平和质', '气虚质', '阳虚质', '阴虚质', 
  '痰湿质', '湿热质', '血瘀质', '气郁质', '特禀质'
];

const ManualEntry = ({ onBack, onSaveSuccess }) => {
  const [mainType, setMainType] = useState('平和质');
  const [subTypes, setSubTypes] = useState([]);
  const [notes, setNotes] = useState('');

  const toggleSubType = (type) => {
    if (subTypes.includes(type)) {
      setSubTypes(subTypes.filter(t => t !== type));
    } else if (subTypes.length < 2) {
      setSubTypes([...subTypes, type]);
    }
  };

  const handleSave = () => {
    const mockRadarData = [
      { subject: '气虚', A: mainType === '气虚质' ? 90 : 30, fullMark: 100 },
      { subject: '阳虚', A: mainType === '阳虚质' ? 90 : 20, fullMark: 100 },
      { subject: '阴虚', A: mainType === '阴虚质' ? 90 : 20, fullMark: 100 },
      { subject: '痰湿', A: mainType === '痰湿质' ? 90 : 25, fullMark: 100 },
      { subject: '湿热', A: mainType === '湿热质' ? 90 : 15, fullMark: 100 },
      { subject: '血瘀', A: mainType === '血瘀质' ? 90 : 10, fullMark: 100 },
      { subject: '气郁', A: mainType === '气郁质' ? 90 : 40, fullMark: 100 },
      { subject: '特禀', A: mainType === '特禀质' ? 90 : 10, fullMark: 100 },
      { subject: '平和', A: mainType === '平和质' ? 90 : 60, fullMark: 100 },
    ];

    const typeDisplay = subTypes.length > 0 
      ? `${mainType} (兼${subTypes.join('、')})` 
      : mainType;

    const constitutionData = {
      type: typeDisplay,
      mainType: mainType,
      subTypes: subTypes,
      source: 'manual',
      updatedAt: new Date().toISOString(),
      desc: getConstitutionDesc(mainType),
      score: 85,
      radarData: mockRadarData,
      notes: notes
    };

    storageService.updateUserProfileSection('constitution', constitutionData);
    storageService.addHealthRecord('constitution', constitutionData);
    
    if (onSaveSuccess) {
      onSaveSuccess();
    } else {
        alert('体质档案已激活！');
        if (onBack) onBack();
    }
  };

  const getConstitutionDesc = (type) => {
    const descriptions = {
      '平和质': '体态适中，面色红润，精力充沛。调理重点：维护现状，适度运动。',
      '气虚质': '元气不足，容易疲乏，气短懒言。调理重点：益气健脾。',
      '阳虚质': '阳气不足，畏寒怕冷，手足不温。调理重点：温补阳气。',
      '阴虚质': '阴液亏少，口燥咽干，手足心热。调理重点：滋补肾阴。',
      '痰湿质': '体形肥胖，腹部肥满，口黏苔腻。调理重点：健脾利湿。',
      '湿热质': '面垢油光，易生痤疮，口苦口干。调理重点：清热利湿。',
      '血瘀质': '肤色晦暗，色素沉着，容易出现瘀斑。调理重点：活血化瘀。',
      '气郁质': '神情抑郁，情感脆弱，烦闷不乐。调理重点：疏肝行气。',
      '特禀质': '先天失常，以生理缺陷、过敏反应等为主要特征。调理重点：益气固表。'
    };
    return descriptions[type] || '请咨询专业医师进行详细调理。';
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fade-in h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-brand transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h3 className="font-bold text-lg text-gray-800">录入体质结论</h3>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
           <div className="flex gap-3">
             <div className="mt-0.5 text-blue-500"><CheckCircle2 className="w-5 h-5" /></div>
             <div>
               <h4 className="font-bold text-blue-700 text-sm mb-1">激活体质档案</h4>
               <p className="text-xs text-blue-600 leading-relaxed">
                 如果您已在医院或专业机构做过体质辨识，可直接在此录入结果，我们将为您定制专属健康方案。
               </p>
             </div>
           </div>
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">主体质（必选）</label>
          <div className="relative">
            <select 
              value={mainType}
              onChange={(e) => setMainType(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all appearance-none font-medium text-gray-700"
            >
              {CONSTITUTION_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronLeft className="w-5 h-5 -rotate-90" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">兼夹体质（可选，最多2个）</label>
          <div className="grid grid-cols-3 gap-2">
            {CONSTITUTION_TYPES.filter(t => t !== mainType).map(type => (
              <button 
                key={type}
                onClick={() => toggleSubType(type)}
                disabled={!subTypes.includes(type) && subTypes.length >= 2}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  subTypes.includes(type) 
                    ? 'bg-brand/10 border-brand text-brand' 
                    : subTypes.length >= 2 
                      ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                      : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">医生结论（补充）</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="请输入医生的诊断结论..."
            rows={4}
            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all font-medium text-gray-700 resize-none"
          />
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full py-3.5 bg-brand text-white rounded-xl font-bold mt-4 shadow-lg shadow-brand/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        <Save className="w-5 h-5" />
        保存并激活档案
      </button>
    </div>
  );
};

export default ManualEntry;
