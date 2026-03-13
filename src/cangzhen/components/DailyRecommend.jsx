// src/cangzhen/components/DailyRecommend.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { FlowerIcon } from './FlowerIcons';
import { Sparkles } from 'lucide-react';
import { storageService } from '../../services/storageService';

const RECOMMENDATION_LIBRARY = {
  sensation: [
    "清晨站在窗边，听城市醒来的声音",
    "用手机慢动作拍风吹动树叶，看平时看不见的轨迹",
    "闭着眼摸遍家里 3 样东西，记下最特别的触感",
    "去超市只闻不买，把好闻的味道全部记下来",
    "雨天不打伞走一小段，感受雨落在皮肤上的轻重",
    "找一面老墙，用指尖轻轻感受它的纹路与温度",
    "戴上耳机只听环境音，录下 1 分钟身边最真实的声响",
    "正午抬头看天，分辨云是丝絮状还是棉团状",
    "吃一口食物嚼够 20 次，认真尝出每一层味道",
    "深夜不开灯，只看窗外路灯投下的光影形状",
    "用冷水和温水分别洗手，对比两种触感差异",
    "蹲下来看蚂蚁搬家，观察它们的路线和节奏",
    "闻刚晒过的被子，记住阳光独有的干燥香气",
    "听一首纯音乐，不看歌词只感受旋律起伏",
    "摸一摸不同材质的衣服，排序最舒服的触感",
    "走在不同地面，感受地砖、草地、泥土的脚感",
    "盯着一杯热水的雾气，看它飘散变化的样子",
    "咬一口脆的食物，专注听它碎裂的清脆声音",
    "傍晚看天色渐变，捕捉从蓝到粉的那一瞬间",
    "用手感受风的方向，判断今天吹的是哪阵风",
    "闻新鲜水果表皮，区分青涩与成熟的香气",
    "闭眼听脚步声，分辨身边人的步伐快慢",
    "摸一摸树皮，感受粗糙纹路里的生命力",
    "尝一口凉白开，喝出它和矿泉水的细微差别",
    "站在路口，只看行人的姿态不看脸",
    "感受阳光晒在皮肤上，区分暖、烫、柔和的区别",
    "闻刚洗好的头发，记住干净清爽的味道",
    "听窗外鸟叫，分辨至少两种不同的鸟鸣",
    "用手背感受不同布料，选出最亲肤的一种",
    "看玻璃上的水汽，用手指画一条简单弧线",
    "吃冰品时感受从冷到化在嘴里的全过程",
    "深夜听远处车声，感受城市的呼吸节奏",
    "闻刚切开的蔬菜，捕捉清新又生涩的气味",
    "赤脚踩在地板上，感受凉意从脚底往上走",
    "看风吹窗帘，观察它飘动的弧度和速度",
    "尝一口茶，分辨苦涩、清香、回甘的层次",
    "用耳朵贴近墙壁，听楼里隐约传来的生活声",
    "闻雨后泥土，捕捉潮湿又清新的自然气息",
    "摸一摸花瓣，感受它薄、软、嫩的质感",
    "听空调风声，感受它强弱变化的节奏",
    "看阳光下灰尘漂浮，像看一场无声电影",
    "闻咖啡香气，不喝只闻也能感受清醒感",
    "感受脉搏跳动，触摸自己真实存在的节奏",
    "尝一颗糖，记录甜味在嘴里散开的路径",
    "听雨声打在不同地方，分辨屋顶、玻璃、树叶声",
    "摸一摸书本纸张，感受新旧纸张的不同触感",
    "看日出前的天空，捕捉第一缕微光出现",
    "闻洗衣液香味，记住干净又安心的味道",
    "感受呼吸进出身体，只观察不控制",
    "走在落叶上，听脚下咔嚓咔嚓的治愈声音"
  ],
  emotion: [
    "把今天最烦的小事写在纸上，然后撕掉丢掉",
    "找一首和当下心情完全匹配的歌单曲循环",
    "对着镜子认真看自己 1 分钟，不评价只观察",
    "坐下来发呆 10 分钟，让情绪平静下来",
    "把心里憋的话用语音录下来，不发给任何人",
    "吃一顿完全按自己喜好来的饭，不迁就任何人",
    "关掉所有通知，给自己两小时不被打扰时间",
    "走一段平时不会走的路，换个视角看熟悉城市",
    "抱一抱枕头或玩偶，用力抱到放松为止",
    "看一段让你笑出声的短视频，放肆笑",
    "找个空地大喊大叫，释放内耗情绪",
    "喝一杯温饮，让暖意从胃里扩散到全身",
    "深夜把一句没敢发的话，发给真正懂你的人",
    "跟朋友见面只说废话，不聊目标不聊进度",
    "把某个人的朋友圈，从头认真看到第一条",
    "认真听完一段吐槽，不打断不给解决方案",
    "约人散步不玩手机，只聊最近真实的状态",
    "把 \"我没事\" 换成 \"我现在有点不太好\"",
    "给很久没联系的人，发一张你拍到的天空",
    "当面说一句真话，不圆滑不客套",
    "允许自己在信任的人面前，沉默十分钟",
    "记住别人不经意说的喜好，悄悄记在心里",
    "跟家人聊一件小事，不是汇报是分享",
    "对在乎的人说：我在，不用硬撑",
    "把委屈说给愿意听的人，不是所有人",
    "认真夸一次别人，不社交不敷衍",
    "安静陪一个人坐一会儿，什么都不用讲",
    "主动找那个你想了很久的人，不找理由",
    "把情绪说清楚，不冷暴力不阴阳",
    "跟朋友分享一首歌，附一句：这很像你",
    "不假装大度，承认你真的会在意",
    "对亲近的人减少预设，重新认识一次",
    "把没说出口的感谢，当面认真说一次",
    "接受别人的情绪，不评判不纠正",
    "约一场无目的见面，不赶时间不安排",
    "告诉别人你的边界，温和但坚定",
    "把误会摊开说，不藏着不内耗",
    "认真注视对方眼睛，听完一整段话",
    "分享一段脆弱，而不是只展示光鲜",
    "不追问为什么，只说我陪着你",
    "给关系留一点空隙，不逼不近不远",
    "用对方能接受的方式表达，不是你习惯的",
    "把 \"你怎么这样\" 换成 \"我有点不舒服\"",
    "不拿情绪惩罚亲近的人，也不委屈自己",
    "对陌生人保持一点温柔，不冷漠",
    "跟旧人好好告别，不纠缠不遗憾",
    "允许自己被安慰，不硬扛不假装坚强",
    "真心为别人开心，不嫉妒不酸",
    "把沉默变成沟通，不是冷战",
    "接受别人的好意，不总拒绝温暖"
  ],
  inspiration: [
    "用 3 种没用过的滤镜，把普通照片拍出高级感",
    "给家里旧物品重新摆位，创造新视觉角落",
    "用便签拼一句话，贴在墙上当临时装饰",
    "尝试一种从没做过的早餐搭配，好吃即创意",
    "用手机拍一组同色系物品，做极简合集",
    "给普通杯子贴小贴纸，改成专属定制款",
    "写三句不像文案的碎碎念，发一条安静朋友圈",
    "随手画三个小涂鸦，不用好看只图好玩",
    "把衣服重新搭配，穿出平时不会有的风格",
    "用一句话概括今天，写成极简朋友圈文案",
    "给桌面换一张小众壁纸，提升视觉新鲜感",
    "用不同字体写自己名字，选出最顺眼一款",
    "拍一组影子照片，用光做极简艺术",
    "尝试一种新的听歌顺序，不按排行榜",
    "把旧照片重新裁剪，发现新构图美感",
    "用身边三样东西，摆一个治愈小场景",
    "编一段很短的碎碎念，当短视频旁白",
    "给植物换个好看花盆，瞬间提升氛围感",
    "用反差感发朋友圈，正经配搞笑文案",
    "尝试单手写字，感受不一样的书写节奏",
    "把常用 APP 换位置，打破习惯制造新鲜感",
    "用水果摆成简单形状，拍照发极简风",
    "写一段不像诗的短句，记录当下灵感",
    "给钥匙扣换个小挂件，每天出门有新意",
    "拍一组 \"生活里的小圆形\"，做创意合集",
    "用两种语言混写心情，小众又高级",
    "把窗帘换一种拉法，改变房间光影氛围",
    "尝试新的拍照角度，仰拍 / 俯拍日常物品",
    "用一句话给照片配文，不啰嗦但有故事",
    "给杯子里放一片柠檬，提升喝水仪式感",
    "随手拍路边不起眼小物，发现平凡美感",
    "用黑白模式拍日常，瞬间变高级质感",
    "编一个很短小故事，主角就是身边物品",
    "把袜子按颜色排列，治愈强迫症自己",
    "尝试新的字体排版，让文字变好看",
    "用手机全景模式拍创意错位照片",
    "给书架换一种排序，按颜色 / 大小混搭",
    "写一段反向鸡汤，清醒又不矫情",
    "用耳机线绕出简单形状，随手拍艺术感",
    "把旧衣服叠出新方式，整理也有创意",
    "拍一组 \"生活中的线条\"，门框、电线、路沿",
    "用贴纸改造旧笔记本，变成专属手账本",
    "给每样随身小物起一个可爱昵称",
    "用留白构图拍日常，越简单越高级",
    "尝试不用滤镜，靠光线拍出干净原图",
    "把歌词截成短句，当朋友圈文案",
    "用三种不同笔写同一句话，对比质感",
    "拍一组 \"今天的颜色\"，做成视觉日记",
    "给桌面摆一个小摆件，提升工作幸福感",
    "用随手捡的落叶 / 花瓣，做迷你自然拼贴"
  ],
  wanxiang: [
    "今天只做一件最重要的事，其他全部延后",
    "果断取消一个让你心累但没必要的局",
    "关掉一个长期不用但舍不得删的 APP",
    "决定今天不刷短视频，把时间还给自己",
    "拒绝一个勉强答应、心里不舒服的请求",
    "清空购物车 3 件冲动想买但无用的东西",
    "决定早睡，到点直接放下手机不拖延",
    "主动约一个想见面但一直没约的人",
    "把拖延很久的小事，用 5 分钟立刻做完",
    "决定今天不解释，不向不懂你的人证明",
    "删掉通讯录里再也不会联系的人",
    "选择吃健康一点，不为情绪暴饮暴食",
    "决定不跟风，只买真正需要的东西",
    "主动结束一段消耗你的无效聊天",
    "把待办清单简化，只留 3 件核心事",
    "决定今天不内耗，发生什么都先放过自己",
    "选择走一条新路，打破机械重复生活",
    "果断退出没有意义、只刷屏的群聊",
    "决定开始做一件小事，不等待完美时机",
    "把 \"以后再说\" 换成 \"现在就做 5 分钟\"",
    "选择不回无关紧要的消息，节省精力",
    "决定给自己设边界，不随便被打扰",
    "清空收藏夹里从未看过的干货文章",
    "决定今天不抱怨，只解决能改变的事",
    "主动提出一个想法，不害怕被否定",
    "选择放下过去一件事，不再反复回想",
    "决定每天留 30 分钟完全属于自己",
    "把复杂问题拆小，只做第一步",
    "决定不强迫自己合群，舒服最重要",
    "果断丢掉一件一年没穿过的旧衣服",
    "选择相信自己一次，不先自我否定",
    "决定今天不比较，只跟昨天的自己比",
    "主动结束无意义的内耗式思考",
    "把 \"我不行\" 换成 \"我先试试\"",
    "决定不熬夜等消息，好好睡觉更重要",
    "选择少买一件衣服，多存一点钱",
    "果断关掉无限刷新的信息流",
    "决定开口求助，不硬撑假装没事",
    "把目标缩小到今天能完成的程度",
    "选择原谅但不忘记，保护自己不再受伤",
    "决定开始记录，让生活有迹可循",
    "主动断开让你焦虑的信息来源",
    "把大计划停掉，先执行最小行动",
    "决定对自己宽容，不事事严苛要求",
    "选择说 \"不\"，守住自己的时间和情绪",
    "决定今天不动气，小事不值得消耗",
    "果断归档已结束的事，不回头纠结",
    "选择投资自己，而不是跟风消费",
    "决定每天只做一个关键决策，不贪多",
    "把注意力放回自己身上，不再盯着别人"
  ]
};

const DailyRecommend = () => {
  const [recommendations, setRecommendations] = useState({});
  const [userMemories, setUserMemories] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const memories = await storageService.getCangzhenMemories();
      setUserMemories(memories || []);
    };
    loadData();
  }, []);

  const getSmartRecommendation = useMemo(() => {
    return (hallType) => {
      const today = new Date().toDateString();
      const storageKey = `cangzhen_recommend_${hallType}_${today}`;
      
      let cached = localStorage.getItem(storageKey);
      if (cached) {
        return cached;
      }

      const library = RECOMMENDATION_LIBRARY[hallType] || [];
      if (library.length === 0) return "";

      const hallCount = userMemories.filter(m => m.hall === hallType).length;
      const totalCount = userMemories.length;

      let selectedIndex;
      
      if (totalCount > 0) {
        const leastUsedHall = ['sensation', 'emotion', 'inspiration', 'wanxiang']
          .map(h => ({ hall: h, count: userMemories.filter(m => m.hall === h).length }))
          .sort((a, b) => a.count - b.count)[0].hall;

        if (hallType === leastUsedHall && hallCount < totalCount / 4) {
          selectedIndex = Math.floor(Math.random() * Math.min(10, library.length));
        } else {
          selectedIndex = Math.floor(Math.random() * library.length);
        }
      } else {
        selectedIndex = Math.floor(Math.random() * library.length);
      }

      const recommendation = library[selectedIndex];
      localStorage.setItem(storageKey, recommendation);
      
      return recommendation;
    };
  }, [userMemories]);

  useEffect(() => {
    setRecommendations({
      sensation: getSmartRecommendation('sensation'),
      emotion: getSmartRecommendation('emotion'),
      inspiration: getSmartRecommendation('inspiration'),
      wanxiang: getSmartRecommendation('wanxiang')
    });
  }, [getSmartRecommendation]);

  const displayRecommendations = [
      { id: 1, type: 'sensation', text: recommendations.sensation || "去窗边看看云的形状" },
      { id: 2, type: 'emotion', text: recommendations.emotion || "深呼吸三次，告诉自己：今天已经做得很好了" },
      { id: 3, type: 'inspiration', text: recommendations.inspiration || "随手翻开一本书的第 20 页" },
      { id: 4, type: 'wanxiang', text: recommendations.wanxiang || "做一个微小的决定" }
  ];

  return (
    <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-cangzhen-text-secondary mb-1 px-1 uppercase tracking-widest">今日推荐</h3>
        {displayRecommendations.map((item, index) => (
            <div 
                key={item.id} 
                className="glass-convex rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 0.2}s` }}
            >
                <div className={`absolute inset-0 opacity-10 bg-cangzhen-${item.type}-main`} />
                
                <div 
                    className={`w-10 h-10 rounded-squircle glass-concave shadow-inner flex items-center justify-center shrink-0 border border-white/20`}
                    style={{
                        background: item.type === 'sensation' ? 'rgba(214, 206, 171, 0.15)' : 
                                   item.type === 'emotion' ? 'rgba(197, 204, 174, 0.15)' : 
                                   item.type === 'inspiration' ? 'rgba(196, 186, 208, 0.15)' : 
                                   item.type === 'wanxiang' ? 'rgba(137, 247, 254, 0.15)' : 'rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <FlowerIcon hallKey={item.type} size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-cangzhen-text-main font-medium">{item.text}</p>
                </div>
            </div>
        ))}
    </div>
  );
};

export default DailyRecommend;
