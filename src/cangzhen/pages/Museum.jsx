import React, { useState } from 'react';
import { FlowerIcon } from '../components/FlowerIcons';

const Museum = () => {
  const [activeTab, setActiveTab] = useState('sensation');
  const [activeFilter, setActiveFilter] = useState('全部');

  // Halls Configuration
  const halls = [
    { id: 'sensation', name: '感知馆', desc: '记录看到、听到、闻到、尝到、摸到的真实瞬间' },
    { id: 'emotion', name: '情绪馆', desc: '安放喜怒哀乐，诚实地面对内心的每一次波动' },
    { id: 'inspiration', name: '灵感馆', desc: '捕捉那些转瞬即逝的思想火花与奇思妙想' },
    { id: 'wanxiang', name: '万象馆', desc: '收纳生活中的其他美好碎片，包罗万象' }
  ];

  // Tag Filters (Based on active tab)
  const filters = {
      sensation: ['全部', '视觉', '听觉', '嗅觉', '味觉', '触觉'],
      emotion: ['全部', '开心', '平静', '焦虑', '难过', '感动'],
      inspiration: ['全部', '灵感', '梦境', '思考', '脑洞'],
      wanxiang: ['全部', '美食', '旅行', '好物', '碎片']
  };

  // Mock Memories Data (Simulating User Posts)
  const memories = [
    {
      id: 1,
      hall: 'sensation',
      image: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=600&auto=format&fit=crop',
      content: '下班路上的夕阳，像打翻了的橘子汽水。',
      date: '3月8日',
      tag: '视觉'
    },
    {
      id: 2,
      hall: 'sensation',
      image: null, // No image, use default gradient
      content: '听到雨滴落在窗台的声音，滴答滴答，很治愈。',
      date: '3月7日',
      tag: '听觉'
    },
    {
      id: 3,
      hall: 'emotion',
      image: 'https://images.unsplash.com/photo-1516550893723-124266e81e72?q=80&w=600&auto=format&fit=crop',
      content: '今天虽然很累，但是在这个角落里找到了平静。',
      date: '3月6日',
      tag: '平静'
    },
    {
      id: 4,
      hall: 'inspiration',
      image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=600&auto=format&fit=crop',
      content: '如果把梦境记录下来做成一个个盲盒，会是什么样？',
      date: '3月5日',
      tag: '脑洞'
    },
    {
      id: 5,
      hall: 'wanxiang',
      image: 'https://images.unsplash.com/photo-1490750967868-58cb75065ed4?q=80&w=600&auto=format&fit=crop',
      content: '妈妈做的红烧肉，是任何米其林都复刻不了的味道。',
      date: '3月4日',
      tag: '美食'
    },
    {
      id: 6,
      hall: 'sensation',
      image: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?q=80&w=600&auto=format&fit=crop',
      content: '摸到了小猫毛茸茸的爪子，软乎乎的。',
      date: '3月3日',
      tag: '触觉'
    },
    // Add more mock data to fill the waterfall
    { id: 7, hall: 'sensation', image: null, content: '闻到了桂花的香味。', date: '3月2日', tag: '嗅觉' },
  ];

  // Filter Logic
  const currentMemories = memories.filter(m => {
      const matchHall = m.hall === activeTab;
      const matchTag = activeFilter === '全部' || m.tag === activeFilter;
      return matchHall && matchTag;
  });

  // Reorder mock data to ensure visual variety (Mix Image/Text)
  // This is just for demo purpose to show "staggered" effect
  const demoMemories = [
      memories[0], // Image (Tall)
      memories[5], // Image (Tall)
      memories[1], // Text (Short)
      memories[6], // Text (Short)
      memories[2], // Image (Tall)
      memories[3], // Image (Tall)
      memories[4], // Image (Tall)
  ];
  
  // Override currentMemories with mixed demo data if in sensation tab (for better visual demo)
  const displayMemories = activeTab === 'sensation' ? demoMemories : currentMemories;

  const col1 = [];
  const col2 = [];
  displayMemories.forEach((item, i) => {
      if (i % 2 === 0) col1.push(item);
      else col2.push(item);
  });

  const MemoryCard = ({ item }) => (
    <div className={`group relative w-full ${item.image ? 'aspect-[2/3]' : 'aspect-square'} rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-xl mb-3 glass-convex border border-white/40`}>
       
       {/* Background: Image or Gradient */}
       <div className="absolute inset-0">
           {item.image ? (
               <>
                   <img 
                     src={item.image} 
                     alt={item.tag}
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
               </>
           ) : (
               <div className={`w-full h-full bg-gradient-to-br ${
                   activeTab === 'sensation' ? 'from-[#EBE6D0] to-[#E0E6D0]' :
                   activeTab === 'emotion' ? 'from-[#E0E6D0] to-[#CDE0CD]' :
                   activeTab === 'inspiration' ? 'from-[#E2DCE8] to-[#D4D0E0]' :
                   'from-[#F0ECE4] to-[#E6E0D6]'
               } opacity-90`} />
           )}
       </div>

       {/* Content Overlay */}
       <div className={`absolute inset-0 p-4 flex flex-col z-10 ${item.image ? 'justify-between' : 'justify-center items-center text-center'}`}>
          {/* Top: Tag (Only for image mode, or repositioned for text mode) */}
          {item.image && (
            <div className="flex justify-end w-full">
                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-medium text-white tracking-wider">
                    #{item.tag}
                </span>
            </div>
          )}

          {/* Center/Bottom: Text & Date */}
          <div className={`${!item.image ? 'w-full text-cangzhen-text-main' : 'text-white'}`}>
              {!item.image && (
                  <div className="mb-3 flex justify-center">
                      <span className="px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/30 text-[10px] font-bold text-cangzhen-text-secondary tracking-wider">
                        #{item.tag}
                      </span>
                  </div>
              )}
              
              <p className={`font-serif font-medium leading-relaxed mb-2 drop-shadow-sm ${item.image ? 'text-sm line-clamp-4 text-left' : 'text-sm line-clamp-5 text-center px-1 text-cangzhen-text-main'}`}>
                  {item.content}
              </p>
              
              <div className={`flex items-center gap-1 ${item.image ? 'justify-start opacity-70' : 'justify-center mt-3 text-cangzhen-text-secondary opacity-60'}`}>
                  <span className="text-[10px]">{item.date}</span>
              </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen relative flex flex-col pt-12 pb-24 font-serif bg-gradient-to-b from-white/50 to-transparent">
      
      {/* 1. Top Tabs (Switch Halls) */}
      <div className="px-4 mb-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-3">
          {halls.map(hall => (
            <button
              key={hall.id}
              onClick={() => { setActiveTab(hall.id); setActiveFilter('全部'); }}
              className={`
                px-5 py-2.5 rounded-full text-sm whitespace-nowrap transition-all duration-300
                ${activeTab === hall.id 
                    ? 'bg-cangzhen-text-main text-white shadow-lg scale-105 font-medium' 
                    : 'glass-convex text-cangzhen-text-secondary hover:bg-white/40'}
              `}
            >
              {hall.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hall Description & Search/Filter */}
      <div className="px-6 mb-6 space-y-4">
          <p className="text-xs text-cangzhen-text-secondary/80 italic tracking-wide leading-relaxed pl-1">
              {halls.find(h => h.id === activeTab)?.desc}
          </p>
          
          {/* Filter Chips / Search Bar Area */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {filters[activeTab]?.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveFilter(tag)}
                    className={`
                        px-3 py-1.5 rounded-lg text-[11px] whitespace-nowrap transition-all border
                        ${activeFilter === tag 
                            ? 'bg-cangzhen-text-main/5 border-cangzhen-text-main text-cangzhen-text-main font-bold' 
                            : 'border-transparent bg-white/40 text-cangzhen-text-secondary hover:bg-white/60'}
                    `}
                  >
                      {tag}
                  </button>
              ))}
          </div>
      </div>

      {/* 3. Waterfall Content (2 Columns) */}
      <div className="flex gap-3 px-3 items-start">
         {/* Left Column */}
         <div className="flex-1 flex flex-col gap-3">
            {col1.map(item => <MemoryCard key={item.id} item={item} />)}
         </div>
         
         {/* Right Column (Staggered) */}
         <div className="flex-1 flex flex-col gap-3 pt-12">
            {col2.map(item => <MemoryCard key={item.id} item={item} />)}
         </div>
      </div>

      {/* Empty State */}
      {currentMemories.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-cangzhen-text-secondary/50 mt-12">
              <FlowerIcon hallKey={activeTab} size={48} className="opacity-20 mb-2" />
              <p className="text-xs">还没有记录，去添加第一笔吧</p>
          </div>
      )}
    </div>
  );
};

export default Museum;
