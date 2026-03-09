import React, { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { questionnaireData, calculateConstitution } from '../../data/questionnaire';
import { storageService } from '../../services/storageService';

const QuestionnaireWrapper = ({ onComplete, onBack }) => {
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: score }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questionnaireData[currentQuestionIndex];
  const totalQuestions = questionnaireData.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleStart = () => {
    setStarted(true);
  };

  const handleAnswer = (optionIndex) => {
    // Option index 0-4 corresponds to score 1-5 (or reverse?)
    // In TCM questionnaires:
    // "没有" (None) -> 1
    // "很少" (Rarely) -> 2
    // "有时" (Sometimes) -> 3
    // "经常" (Often) -> 4
    // "总是" (Always) -> 5
    
    let score = optionIndex + 1;
    if (currentQuestion.question.includes('反向计分')) {
        score = 6 - score;
    }

    const newAnswers = { ...answers, [currentQuestion.id]: score };
    setAnswers(newAnswers);

    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 250); // Small delay for visual feedback
    } else {
      finishQuestionnaire(newAnswers);
    }
  };

  const finishQuestionnaire = (finalAnswers) => {
    setIsSubmitting(true);
    // Calculate result
    const result = calculateConstitution(finalAnswers);
    
    // Save to storage
    // 1. Save constitution result
    storageService.updateUserProfileSection('constitution', result);
    
    // Create historical record (Activation Archive)
    storageService.addHealthRecord('constitution', result);
    
    // 2. Save answers (optional, for resume)
    storageService.saveAppState({ 
        questionnaireAnswers: finalAnswers,
        questionnaireProgress: 100 
    });

    setTimeout(() => {
        setIsSubmitting(false);
        if (onComplete) onComplete(result);
    }, 1000);
  };

  if (!started) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in h-full flex flex-col items-center justify-center text-center">
        {onBack && (
          <button onClick={onBack} className="absolute top-4 left-4 p-2 text-text-muted hover:text-brand">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
        )}
        
        <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mb-6">
           <svg className="w-10 h-10 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
             <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
           </svg>
        </div>

        <h2 className="text-2xl font-bold text-text-main mb-3">中医体质辨识</h2>
        <p className="text-text-muted mb-8 max-w-xs mx-auto leading-relaxed">
          本问卷基于国家中医药管理局《中医体质分类与判定》标准，共72题。请基于您近3~6个月的感受回答。
        </p>
        
        <button 
          onClick={handleStart}
          className="bg-brand text-white px-8 py-3 rounded-full font-medium shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 active:scale-95 transition-all w-full max-w-[200px]"
        >
          开始测评
        </button>
        
        <p className="mt-4 text-xs text-text-muted/60">预计用时 5-10 分钟</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fade-in h-full flex flex-col relative overflow-hidden">
       {/* Header */}
       <div className="flex items-center gap-2 mb-6">
         {onBack && (
            <button onClick={onBack} className="p-1 -ml-1 text-text-muted hover:text-brand">
                <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
         )}
         <div className="flex-1">
            <h3 className="font-bold text-lg text-text-main">体质辨识问卷</h3>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                    className="h-full bg-brand transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
         </div>
         <span className="text-xs text-text-muted font-mono">{currentQuestionIndex + 1}/{totalQuestions}</span>
       </div>

       {/* Question */}
       <div className="flex-1 flex flex-col justify-center overflow-y-auto custom-scrollbar">
         <h2 className="text-xl font-bold text-text-main mb-8 leading-relaxed">
            {currentQuestion.question.replace('(反向计分)', '')}
         </h2>

         <div className="space-y-3 pb-4">
            {currentQuestion.options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className="w-full p-4 rounded-xl border border-gray-100 text-left hover:border-brand hover:bg-brand/5 transition-all flex items-center justify-between group"
                >
                    <span className="text-text-main font-medium group-hover:text-brand">{option}</span>
                    <div className="w-5 h-5 rounded-full border border-gray-200 group-hover:border-brand flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </button>
            ))}
         </div>
       </div>
       
       {isSubmitting && (
         <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
            <div className="flex flex-col items-center animate-pulse">
                <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white mb-4">
                    <Check className="w-6 h-6" />
                </div>
                <p className="font-bold text-brand">分析中...</p>
            </div>
         </div>
       )}
    </div>
  );
};

export default QuestionnaireWrapper;
