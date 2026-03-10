
const exerciseKeywords = ['运动', '锻炼', '健身', '跑步', '游泳', '瑜伽', '普拉提', '力量', '无氧', '有氧', '站桩', '八段锦', '太极', '练了', '跳绳', '骑行'];

function check(text) {
    const isExerciseRecord = exerciseKeywords.some(kw => text.includes(kw)) && (text.includes('分钟') || text.includes('小时') || text.includes('min') || text.includes('km') || text.includes('公里'));
    console.log(`"${text}" -> Match: ${isExerciseRecord}`);
    
    if (isExerciseRecord) {
        // Mock analyze logic
        const durationMatch = text.match(/(\d+|[一二三四五六七八九十]+)\s*(分钟|min|h|小时)/i);
        let duration = 30;
        if (durationMatch) {
            let val = parseInt(durationMatch[1]);
            duration = val;
        }
        console.log(`  Duration: ${duration} min`);
    }
}

check("站桩15分钟 无氧训练10分钟");
check("跑步5公里");
check("今天练了瑜伽30min");
check("我不想运动"); // Should fail (no time unit)
check("运动好累"); // Should fail
