import { storageService } from './storageService.js';
import { findFood } from '../data/foodLibrary.js';
import { SCENARIO_RULES } from '../data/constitutionMatrix.js';

const calculateGrade = (score) => {
  if (score >= 8.5) return '优秀';
  if (score >= 7) return '良好';
  if (score >= 5) return '达标';
  return '需改善';
};

const calculateSleepScore = (dayData) => {
  if (!dayData) return { score: 0, grade: '需改善', details: {} };

  let durationScore = 0;
  let bedtimeScore = 0;
  let wakePeriodsScore = 0;

  const duration = dayData.duration || 0;
  const sleepTime = dayData.sleepTime || '00:00';
  const wakePeriods = dayData.wakePeriods || [];

  if (duration >= 7 && duration <= 8) {
    durationScore = 4;
  } else if ((duration >= 6 && duration < 7) || (duration > 8 && duration <= 9)) {
    durationScore = 2;
  }

  const hour = parseInt(sleepTime.split(':')[0]) || 0;
  const minute = parseInt(sleepTime.split(':')[1]) || 0;
  const totalMinutes = hour * 60 + minute;

  if (totalMinutes <= 23 * 60) {
    bedtimeScore = 3;
  } else if (totalMinutes > 23 * 60 && totalMinutes <= 23 * 60 + 30) {
    bedtimeScore = 1.5;
  }

  if (wakePeriods.length === 0) {
    wakePeriodsScore = 3;
  } else if (wakePeriods.length === 1) {
    wakePeriodsScore = 1.5;
  }

  const totalScore = durationScore + bedtimeScore + wakePeriodsScore;
  const grade = calculateGrade(totalScore);

  return {
    score: totalScore,
    grade,
    details: {
      durationScore,
      bedtimeScore,
      wakePeriodsScore
    }
  };
};

const calculateDietScore = (dayData, weekData, userProfile) => {
  if (!dayData) return { score: 0, grade: '需改善', details: {} };

  let caloriesScore = 0;
  let nutrientsScore = 0;
  let dailyVarietyScore = 0;
  let weeklyVarietyScore = 0;
  let constitutionScore = 0;

  const nutrition = dayData.nutrition || { calories: 0, nutrients: { carb: 0, protein: 0, fat: 0 } };
  const targetCalories = nutrition.targetCalories || 2000;
  const currentCalories = nutrition.calories || 0;
  const ratio = targetCalories > 0 ? currentCalories / targetCalories : 0;

  if (ratio >= 0.85 && ratio <= 1.15) {
    caloriesScore = 2.5;
  } else if ((ratio >= 0.7 && ratio < 0.85) || (ratio > 1.15 && ratio <= 1.30)) {
    caloriesScore = 1.25;
  }

  const nutrients = nutrition.nutrients || { carb: 0, protein: 0, fat: 0 };
  const targetNutrients = { carb: 0.55, protein: 0.15, fat: 0.3 };
  let nutrientCount = 0;

  const totalGrams = (nutrients.carb || 0) + (nutrients.protein || 0) + (nutrients.fat || 0);
  if (totalGrams > 0) {
    const carbRatio = (nutrients.carb || 0) / totalGrams;
    const proteinRatio = (nutrients.protein || 0) / totalGrams;
    const fatRatio = (nutrients.fat || 0) / totalGrams;

    if (carbRatio >= 0.50 && carbRatio <= 0.65) nutrientCount++;
    if (proteinRatio >= 0.10 && proteinRatio <= 0.15) nutrientCount++;
    if (fatRatio >= 0.20 && fatRatio <= 0.30) nutrientCount++;
  }

  if (nutrientCount === 3) nutrientsScore = 2.5;
  else if (nutrientCount === 2) nutrientsScore = 1.5;
  else if (nutrientCount === 1) nutrientsScore = 0.5;

  const foodVariety = dayData.foodVariety || 0;
  if (foodVariety >= 12) dailyVarietyScore = 2;
  else if (foodVariety >= 8 && foodVariety < 12) dailyVarietyScore = 1;

  const weeklyVariety = weekData?.diet?.weeklyFoodVariety || 0;
  if (weeklyVariety >= 25) weeklyVarietyScore = 1.5;
  else if (weeklyVariety >= 18 && weeklyVariety < 25) weeklyVarietyScore = 0.75;

  const constitutionType = userProfile?.constitution?.type || '平和质';
  const tabooRatio = dayData.tabooRatio || 0;
  if (tabooRatio <= 0.2) constitutionScore = 1.5;
  else if (tabooRatio > 0.2 && tabooRatio <= 0.4) constitutionScore = 0.75;

  const totalScore = caloriesScore + nutrientsScore + dailyVarietyScore + weeklyVarietyScore + constitutionScore;
  const grade = calculateGrade(totalScore);

  return {
    score: totalScore,
    grade,
    details: {
      caloriesScore,
      nutrientsScore,
      dailyVarietyScore,
      weeklyVarietyScore,
      constitutionScore
    }
  };
};

const calculateExerciseScore = (weekData) => {
  if (!weekData?.exercise) return { score: 0, grade: '需改善', details: {} };

  let totalDurationScore = 0;
  let frequencyScore = 0;
  let avgSessionDurationScore = 0;

  const totalDuration = weekData.exercise.totalDuration || 0;
  const daysWithExercise = weekData.exercise.daysWithExercise || 0;
  const averageDuration = weekData.exercise.averageDuration || 0;

  if (totalDuration >= 150) totalDurationScore = 4;
  else if (totalDuration >= 100 && totalDuration < 150) totalDurationScore = 2;

  if (daysWithExercise >= 3 && daysWithExercise <= 5) frequencyScore = 3.5;
  else if (daysWithExercise === 2 || daysWithExercise === 6) frequencyScore = 1.75;

  if (averageDuration >= 30) avgSessionDurationScore = 2.5;
  else if (averageDuration >= 20 && averageDuration < 30) avgSessionDurationScore = 1.25;

  const totalScore = totalDurationScore + frequencyScore + avgSessionDurationScore;
  const grade = calculateGrade(totalScore);

  return {
    score: totalScore,
    grade,
    details: {
      totalDurationScore,
      frequencyScore,
      avgSessionDurationScore
    }
  };
};

const calculatePoopScore = (dayData) => {
  if (!dayData?.poop) return { score: 0, grade: '需改善', details: {} };

  let frequencyScore = 0;
  let shapeScore = 0;
  let issueScore = 0;

  const frequency = dayData.poop.frequency || 0;
  const shape = dayData.poop.shape || 0;
  const hasIssue = dayData.poop.hasIssue || false;
  const issueSeverity = dayData.poop.issueSeverity || 'none';

  if (frequency >= 1 && frequency <= 2) frequencyScore = 3.5;
  else if (frequency === 0.5 || frequency === 3) frequencyScore = 1.75;

  if (shape >= 3 && shape <= 4) shapeScore = 4;
  else if (shape === 2 || shape === 5) shapeScore = 2;

  if (!hasIssue) issueScore = 2.5;
  else if (issueSeverity === 'mild') issueScore = 1.25;

  const totalScore = frequencyScore + shapeScore + issueScore;
  const grade = calculateGrade(totalScore);

  return {
    score: totalScore,
    grade,
    details: {
      frequencyScore,
      shapeScore,
      issueScore
    }
  };
};

const collectWeekData = (weekOffset = 0) => {
  const now = new Date();
  const currentDay = now.getDay();
  const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(diff + (weekOffset * 7));
  startOfWeek.setHours(0,0,0,0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23,59,59,999);

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const days = [];
  let exerciseTotalDuration = 0;
  let exerciseDays = 0;
  let allFoods = new Set();

  for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
    const dateStr = formatDate(d);
    const logs = storageService.getDailyLogs(dateStr);

    const dayData = {
      date: dateStr,
      sleep: null,
      diet: null,
      exercise: null,
      poop: null
    };

    if (logs.sleep) {
      dayData.sleep = logs.sleep;
    }

    const allSleep = storageService.getHealthRecords().sleep || [];
    const sleepForDay = allSleep.find(s => s.timestamp.startsWith(dateStr));
    if (sleepForDay) {
      dayData.sleep = sleepForDay;
    }

    if (logs.diet && logs.diet.length > 0) {
      const foodNames = logs.diet.map(item => item.name || item);
      foodNames.forEach(name => allFoods.add(name));
      dayData.diet = {
        items: logs.diet,
        nutrition: logs.nutrition,
        foodVariety: new Set(foodNames).size
      };
    }

    if (logs.exercise && logs.exercise.length > 0) {
      const dayExerciseDuration = logs.exercise.reduce((sum, ex) => sum + (ex.duration || 0), 0);
      exerciseTotalDuration += dayExerciseDuration;
      exerciseDays++;
      dayData.exercise = {
        totalDuration: dayExerciseDuration
      };
    }

    if (logs.poop && logs.poop.length > 0) {
      const lastPoop = logs.poop[logs.poop.length - 1];
      dayData.poop = {
        frequency: 1,
        shape: lastPoop.shape || 4,
        hasIssue: lastPoop.issue && lastPoop.issue !== '正常',
        issueSeverity: lastPoop.issue === '正常' ? 'none' : 'mild'
      };
    }

    days.push(dayData);
  }

  return {
    startDate: formatDate(startOfWeek),
    endDate: formatDate(endOfWeek),
    days,
    exercise: {
      totalDuration: exerciseTotalDuration,
      daysWithExercise: exerciseDays,
      averageDuration: exerciseDays > 0 ? exerciseTotalDuration / exerciseDays : 0
    },
    diet: {
      weeklyFoodVariety: allFoods.size
    }
  };
};

const calculateWeeklyScore = (weekOffset = 0) => {
  const userProfile = storageService.getUserProfile();
  const weekData = collectWeekData(weekOffset);

  const dailyTrends = [];
  let totalSleepScore = 0;
  let sleepCount = 0;
  let totalDietScore = 0;
  let dietCount = 0;
  let totalPoopScore = 0;
  let poopCount = 0;

  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  weekData.days.forEach((dayData, index) => {
    const sleepResult = calculateSleepScore(dayData.sleep);
    const dietResult = calculateDietScore(dayData.diet, weekData, userProfile);
    const poopResult = calculatePoopScore(dayData.poop);

    if (dayData.sleep) {
      if (sleepResult.score > 0) {
        totalSleepScore += sleepResult.score;
        sleepCount++;
      }
      if (dietResult.score > 0) {
        totalDietScore += dietResult.score;
        dietCount++;
      }
      if (poopResult.score > 0) {
        totalPoopScore += poopResult.score;
        poopCount++;
      }
    }

    const dayTotalScore = (sleepResult.score + dietResult.score + 0 + poopResult.score) / 4;
    dailyTrends.push({
      day: dayNames[index],
      score: Math.round(dayTotalScore * 10) / 10
    });
  });

  const exerciseResult = calculateExerciseScore(weekData);

  const avgSleepScore = sleepCount > 0 ? totalSleepScore / sleepCount : 0;
  const avgDietScore = dietCount > 0 ? totalDietScore / dietCount : 0;
  const avgPoopScore = poopCount > 0 ? totalPoopScore / poopCount : 0;

  const totalScore = (avgSleepScore + avgDietScore + exerciseResult.score + avgPoopScore) / 4;
  const totalGrade = calculateGrade(totalScore);

  return {
    totalScore: Math.round(totalScore * 10) / 10,
    totalGrade,
    moduleScores: {
      sleep: {
        score: Math.round(avgSleepScore * 10) / 10,
        grade: calculateGrade(avgSleepScore)
      },
      diet: {
        score: Math.round(avgDietScore * 10) / 10,
        grade: calculateGrade(avgDietScore)
      },
      exercise: {
        score: Math.round(exerciseResult.score * 10) / 10,
        grade: exerciseResult.grade
      },
      poop: {
        score: Math.round(avgPoopScore * 10) / 10,
        grade: calculateGrade(avgPoopScore)
      }
    },
    dailyTrends
  };
};

export const scoringService = {
  calculateSleepScore,
  calculateDietScore,
  calculateExerciseScore,
  calculatePoopScore,
  calculateWeeklyScore,
  calculateGrade
};
