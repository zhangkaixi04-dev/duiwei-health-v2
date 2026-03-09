import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Check, X, Leaf, Droplets, Flame } from 'lucide-react';

const data = [
  { subject: '气虚', A: 80, fullMark: 100 },
  { subject: '阳虚', A: 45, fullMark: 100 },
  { subject: '阴虚', A: 30, fullMark: 100 },
  { subject: '痰湿', A: 90, fullMark: 100 },
  { subject: '湿热', A: 65, fullMark: 100 },
  { subject: '血瘀', A: 50, fullMark: 100 },
];

const ReportView = () => {
  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Summary Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <h2 className="text-lg font-semibold text-text-main mb-1">今日体质指数</h2>
        <p className="text-sm text-text-muted mb-6">更新于: 2026-03-05</p>
        
        <div className="h-[250px] w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="#EDF5F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#888888', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="我的体质"
                dataKey="A"
                stroke="#4A7C59"
                strokeWidth={2}
                fill="#4A7C59"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-brand-light/50 rounded-xl p-4 mt-2 flex items-start gap-3">
          <div className="bg-brand text-white p-2 rounded-lg">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-brand text-sm">主要体质：痰湿质</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              体内湿气较重，易疲劳。建议清淡饮食，少食甜腻。
            </p>
          </div>
        </div>
      </div>

      {/* Nutrition Advice */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-main px-2">每日营养建议</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Recommended */}
          <div className="bg-white p-4 rounded-2xl border-l-4 border-brand shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-green-100 p-1.5 rounded-full text-green-600">
                <Check className="w-4 h-4" />
              </div>
              <span className="font-medium text-text-main">宜食</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                薏米
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                赤小豆
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                冬瓜
              </li>
            </ul>
          </div>

          {/* Avoid */}
          <div className="bg-white p-4 rounded-2xl border-l-4 border-accent shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-orange-100 p-1.5 rounded-full text-accent">
                <X className="w-4 h-4" />
              </div>
              <span className="font-medium text-text-main">忌食</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                冰镇饮料
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                油炸食品
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                甜点
              </li>
            </ul>
          </div>
        </div>

        {/* Tip Card */}
        <div className="bg-gradient-to-r from-accent/10 to-transparent p-4 rounded-2xl flex items-center gap-4">
          <div className="bg-white p-2 rounded-full shadow-sm text-accent">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-main">今日运动推荐</h4>
            <p className="text-xs text-text-muted">慢跑 30 分钟或八段锦 2 遍</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
