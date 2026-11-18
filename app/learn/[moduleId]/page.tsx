'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MODULES } from '@/types';
import { get10KNarrative } from '@/lib/mock-data/10k-narratives';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, CheckCircle2, XCircle } from 'lucide-react';
import { MODULE_CONTENT } from '@/lib/learn/questions';

// Mock company data for selection
const COMPANIES = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
];

export default function ModulePage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  
  const module = MODULES.find(m => m.id === moduleId);
  const content = MODULE_CONTENT[moduleId];
  
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'select' | 'lesson' | 'questions'>('select');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const saveInProgressRef = useRef(false);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    }
    getUser();
  }, []);

  // Calculate valid completions (only correct MCQ and written answers with score >= 70)
  const getValidCompletions = (currentFeedback: Record<number, any>) => {
    let validCount = 0;
    
    Object.entries(currentFeedback).forEach(([questionId, fb]: [string, any]) => {
      const question = customizedQuestions.find((q: any) => q.id === parseInt(questionId));
      if (question) {
        if (question.type === 'mcq') {
          // Only count if correct
          if (fb.isCorrect) {
            validCount++;
          }
        } else if (question.type === 'written') {
          // Only count if score >= 70
          if (fb.overall_score !== undefined && fb.overall_score >= 70) {
            validCount++;
          }
        }
      }
    });
    
    return validCount;
  };

  // Calculate wrong answers (incorrect MCQ or written with score < 70)
  const getWrongAnswers = (currentFeedback: Record<number, any>) => {
    let wrongCount = 0;
    
    Object.entries(currentFeedback).forEach(([questionId, fb]: [string, any]) => {
      const question = customizedQuestions.find((q: any) => q.id === parseInt(questionId));
      if (question) {
        if (question.type === 'mcq') {
          // Count if incorrect
          if (fb.isCorrect === false) {
            wrongCount++;
          }
        } else if (question.type === 'written') {
          // Count if score < 70
          if (fb.overall_score !== undefined && fb.overall_score < 70) {
            wrongCount++;
          }
        }
      }
    });
    
    return wrongCount;
  };

  // Function to save progress to database using API route for better reliability
  const saveProgress = async (currentFeedback: Record<number, any>, totalQuestions: number) => {
    if (!userId || saveInProgressRef.current) {
      console.warn('Cannot save progress: userId missing or save in progress', { userId, saveInProgress: saveInProgressRef.current });
      return;
    }

    saveInProgressRef.current = true;
    setIsSaving(true);

    // Count only valid completions (correct MCQ or written with score >= 70)
    const validCompletions = getValidCompletions(currentFeedback);
    const completionPercentage = validCompletions === totalQuestions ? 100 : Math.round((validCompletions / totalQuestions) * 100);
    
    // Calculate correct answers and average score
    let correctAnswers = 0;
    let totalScore = 0;
    let scoredCount = 0;

    Object.entries(currentFeedback).forEach(([questionId, fb]: [string, any]) => {
      const question = customizedQuestions.find((q: any) => q.id === parseInt(questionId));
      if (question) {
        if (question.type === 'mcq') {
          if (fb.isCorrect) correctAnswers++;
        } else if (question.type === 'written' && fb.overall_score !== undefined) {
          totalScore += fb.overall_score;
          scoredCount++;
          // Written answers scoring 70+ are considered correct
          if (fb.overall_score >= 70) correctAnswers++;
        }
      }
    });

    const averageScore = scoredCount > 0 ? totalScore / scoredCount : 0;
    const status = completionPercentage === 100 ? 'completed' : completionPercentage > 0 ? 'in_progress' : 'not_started';

    try {
      // First, verify user is authenticated
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('User not authenticated:', authError);
        throw new Error('User not authenticated');
      }

      if (user.id !== userId) {
        console.error('User ID mismatch:', { expected: userId, actual: user.id });
        throw new Error('User ID mismatch');
      }

      // Use API route for more reliable server-side saving
      const response = await fetch(`/api/progress/${moduleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completionPercentage,
          status,
          totalQuestions,
          correctAnswers,
          averageScore: Math.round(averageScore),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save progress: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Progress saved successfully for ${moduleId}: ${completionPercentage}%`, result.data);
      
      // Fallback: Also try direct client save if API route fails (for debugging)
    } catch (error: any) {
      console.error('Error saving progress via API route, trying direct client save:', error);
      
      // Fallback to direct client-side save
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated for fallback save');
        }

        // Ensure user exists in users table (client-side might not have permission, but try anyway)
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingUser) {
          // Try to create user (may fail due to RLS, but worth trying)
          await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || null,
            });
        }

        const updateData: any = {
          user_id: user.id,
          module_id: moduleId,
          completion_percentage: completionPercentage,
          status: status,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          average_score: Math.round(averageScore),
          last_accessed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Check if progress exists to preserve timestamps
        const { data: existing } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .maybeSingle();

        // Preserve or set started_at
        if (status === 'in_progress' && !existing?.started_at) {
          updateData.started_at = new Date().toISOString();
        } else if (existing?.started_at) {
          updateData.started_at = existing.started_at;
        }

        // Preserve or set completed_at
        if (completionPercentage === 100 && !existing?.completed_at) {
          updateData.completed_at = new Date().toISOString();
        } else if (existing?.completed_at) {
          updateData.completed_at = existing.completed_at;
        }

        const { error: upsertError, data: savedData } = await supabase
          .from('user_progress')
          .upsert(updateData, {
            onConflict: 'user_id,module_id'
          })
          .select();
        
        if (upsertError) {
          console.error('Fallback save also failed:', upsertError);
          throw upsertError;
        } else {
          console.log(`Progress saved via fallback for ${moduleId}: ${completionPercentage}%`, savedData);
        }
      } catch (fallbackError) {
        console.error('Both API route and fallback save failed:', fallbackError);
        // Show error to user in production
        alert('Failed to save progress. Please check your connection and try again.');
      }
    } finally {
      saveInProgressRef.current = false;
      setIsSaving(false);
    }
  };

  // Auto-save progress whenever feedback changes
  useEffect(() => {
    if (userId && Object.keys(feedback).length > 0 && content) {
      const totalQuestions = content.questions.length;
      saveProgress(feedback, totalQuestions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback, userId]);

  // Handle back button click - ensure progress is saved before navigating
  const handleBackClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Save progress one more time before navigating
    if (userId && Object.keys(feedback).length > 0) {
      await saveProgress(feedback, content.questions.length);
    }
    
    // Wait longer to ensure save completes and database is updated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    router.push('/learn');
  };

  if (!module || !content) {
    return <div>Module not found</div>;
  }

  const companyData = selectedCompany ? get10KNarrative(selectedCompany) : null;
  const selectedCompanyName = selectedCompany && companyData ? companyData.companyName : null;

  // Customize questions based on selected company
  const getCustomizedQuestions = () => {
    if (!selectedCompany || !companyData) {
      return content.questions;
    }

    return content.questions.map((q: any) => {
      // Only customize written questions (MCQ questions stay generic)
      if (q.type === 'written') {
        // Replace placeholders in questions
        let customizedQuestion = q.question
          .replace(/your selected company/gi, companyData.companyName)
          .replace(/the company you selected/gi, companyData.companyName)
          .replace(/selected company/gi, companyData.companyName)
          .replace(/this company/gi, companyData.companyName)
          .replace(/the company/gi, companyData.companyName);

        // If question doesn't mention company, add it
        if (!customizedQuestion.toLowerCase().includes(companyData.companyName.toLowerCase()) && 
            !customizedQuestion.toLowerCase().includes(selectedCompany.toLowerCase())) {
          customizedQuestion = `For ${companyData.companyName} (${selectedCompany}): ${customizedQuestion}`;
        }

        return {
          ...q,
          question: customizedQuestion,
          originalQuestion: q.question // Keep original for reference
        };
      }
      return q;
    });
  };

  const customizedQuestions = getCustomizedQuestions();

  const handleCompanySelect = (symbol: string) => {
    setSelectedCompany(symbol);
    setCurrentStep('lesson');
    // Clear answers and feedback when changing company
    setAnswers({});
    setFeedback({});
  };

  const handleSubmitMCQ = async (questionId: number, answer: string) => {
    const question = content.questions.find((q: any) => q.id === questionId);
    
    setIsSubmitting(true);
    
    try {
      // Get company context for better AI feedback
      const companyContext = companyData 
        ? `Company: ${companyData.companyName} (${selectedCompany})\nBusiness: ${companyData.businessDescription}`
        : undefined;
      
      // Call AI grading API
      const response = await fetch(`/api/modules/${moduleId}/grade-mcq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.question,
          selectedAnswer: answer,
          correctAnswer: question.correctAnswer,
          options: question.options,
          context: companyContext
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to grade answer');
      }

      const result = await response.json();
      const aiFeedback = result.data;
      
      const newFeedback = {
        ...feedback,
        [questionId]: {
          isCorrect: aiFeedback.isCorrect,
          explanation: aiFeedback.explanation,
          whyWrong: aiFeedback.whyWrong,
          howToUnderstand: aiFeedback.howToUnderstand,
          correctAnswerExplanation: aiFeedback.correctAnswerExplanation
        }
      };
      
      setFeedback(newFeedback);
      // Progress will be auto-saved via useEffect
    } catch (error) {
      console.error('Error grading MCQ:', error);
      // Fallback to simple check if API fails
      const isCorrect = answer === question.correctAnswer;
      const newFeedback = {
        ...feedback,
        [questionId]: {
          isCorrect,
          explanation: question.explanation,
          error: 'AI grading unavailable. Showing basic feedback.'
        }
      };
      setFeedback(newFeedback);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWritten = async (questionId: number) => {
    setIsSubmitting(true);
    
    const question = customizedQuestions.find((q: any) => q.id === questionId);
    const answer = answers[questionId];
    
    if (!answer || answer.length < 50) {
      setFeedback({
        ...feedback,
        [questionId]: {
          error: 'Please provide a more detailed answer (minimum 50 characters)'
        }
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Get company context for better AI grading
      const companyContext = companyData 
        ? `Company: ${companyData.companyName} (${selectedCompany})\nBusiness: ${companyData.businessDescription}\nRisk Factors: ${companyData.riskFactors}\nFinancial Discussion: ${companyData.financialDiscussion}`
        : '';
      
      // Call AI grading API
      const response = await fetch(`/api/modules/${moduleId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          questionId: questionId,
          questionText: question.question,
          answerText: answer,
          context: companyContext,
          symbol: selectedCompany,
          expectedCompanyName: companyData?.companyName || null,
          expectedCompanySymbol: selectedCompany || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || 'Failed to grade answer';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.data || !result.data.feedback) {
        throw new Error(result.error || 'Invalid response from server');
      }
      
      const aiFeedback = result.data.feedback;
      
      const newFeedback = {
        ...feedback,
        [questionId]: aiFeedback
      };
      
      setFeedback(newFeedback);
      // Progress will be auto-saved via useEffect
    } catch (error: any) {
      console.error('Error grading written answer:', error);
      const errorMessage = error?.message || 'Failed to grade answer. Please try again.';
      setFeedback({
        ...feedback,
        [questionId]: {
          error: errorMessage,
          overall_score: 0
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress based on valid completions only
  const validCompletions = getValidCompletions(feedback);
  const wrongAnswers = getWrongAnswers(feedback);
  const progress = content.questions.length > 0 
    ? (validCompletions / content.questions.length) * 100 
    : 0;
  const wrongProgress = content.questions.length > 0
    ? (wrongAnswers / content.questions.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-[#f5f4f2] dark:hover:bg-[#222220]"
            onClick={handleBackClick}
            disabled={isSaving}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#2d2d2d] dark:text-[#e8e6e3]">{content.title}</h1>
            <p className="text-[#6a6a6a] dark:text-[#9a9a98]">
              {module.description}
            </p>
          </div>
        </div>
        <Badge 
          className={`capitalize ${
            module.level === 'easy' 
              ? 'bg-[#d4e4d8] text-[#2d2d2d] border-[#b4d4b4]' 
              : module.level === 'expert' 
              ? 'bg-[#f4d5c6] text-[#2d2d2d] border-[#e4c5b6]' 
              : 'bg-[#e6dfe6] text-[#2d2d2d] border-[#d6cfd6]'
          }`}
        >
          {module.level}
        </Badge>
      </div>

      {/* Progress */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#2d2d2d] dark:text-[#e8e6e3]">Progress</span>
            <span className="text-sm text-[#6a6a6a] dark:text-[#9a9a98]">
              {validCompletions}/{content.questions.length} correct
              {wrongAnswers > 0 && ` • ${wrongAnswers} need redo`}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#f5f4f2] dark:bg-[#222220]">
            {/* Red portion for wrong answers */}
            {wrongProgress > 0 && (
              <div
                className="absolute left-0 top-0 h-full bg-red-500 dark:bg-red-600 transition-all"
                style={{ width: `${wrongProgress}%` }}
              />
            )}
            {/* Green portion for correct answers (positioned after red) */}
            {progress > 0 && (
              <div
                className="absolute left-0 top-0 h-full bg-[#b4d4b4] dark:bg-[#8fb48f] transition-all"
                style={{ 
                  width: `${progress}%`,
                  left: `${wrongProgress}%`
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Company Selection */}
      {currentStep === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Company to Analyze</CardTitle>
            <CardDescription>
              Choose a company to focus your learning on. You'll analyze their financials and business throughout this module.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COMPANIES.map((company) => (
                <Button
                  key={company.symbol}
                  variant="outline"
                  className="h-auto py-4 justify-start"
                  onClick={() => handleCompanySelect(company.symbol)}
                >
                  <div className="text-left">
                    <div className="font-semibold">{company.symbol}</div>
                    <div className="text-sm text-muted-foreground">{company.name}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      {currentStep === 'lesson' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Lesson: {content.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedCompany}</Badge>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep('select')}>
                  Change Company
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {content.lesson.split('\n\n').map((paragraph: string, index: number) => {
                // Bold text formatting
                const formatText = (text: string) => {
                  const parts = text.split(/(\*\*.*?\*\*)/g);
                  return parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={i} className="font-semibold text-[#2d2d2d] dark:text-[#e8e6e3]">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={i}>{part}</span>;
                  });
                };

                // Detect list items
                if (paragraph.startsWith('-')) {
                  const listItems = paragraph.split('\n').filter(item => item.trim());
                  return (
                    <ul key={index} className="space-y-2 ml-6 list-none">
                      {listItems.map((item, i) => (
                        <li key={i} className="relative pl-6 text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed">
                          <span className="absolute left-0 text-[#b4d4b4]">•</span>
                          {formatText(item.replace(/^-\s*/, ''))}
                        </li>
                      ))}
                    </ul>
                  );
                }

                // Detect numbered lists
                if (/^\d+\./.test(paragraph)) {
                  const listItems = paragraph.split('\n').filter(item => item.trim());
                  return (
                    <ol key={index} className="space-y-3 ml-6">
                      {listItems.map((item, i) => (
                        <li key={i} className="text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed pl-2">
                          {formatText(item.replace(/^\d+\.\s*\*\*/, '').replace(/\*\*:/, ':'))}
                        </li>
                      ))}
                    </ol>
                  );
                }

                // Regular paragraphs
                return (
                  <p key={index} className="text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed">
                    {formatText(paragraph)}
                  </p>
                );
              })}
            </CardContent>
          </Card>

          {companyData && (
            <Card className="bg-[#f9f7f5] dark:bg-[#222220] border-[#e0ddd8] dark:border-[#3a3a38]">
              <CardHeader>
                <CardTitle className="text-lg text-[#2d2d2d] dark:text-[#e8e6e3]">
                  Company Context: {companyData.companyName} ({selectedCompany})
                </CardTitle>
                <CardDescription className="text-[#6a6a6a] dark:text-[#9a9a98]">
                  {moduleId === 'module-1' && 'Use this context to understand the company\'s fundamentals and apply financial metrics.'}
                  {moduleId === 'module-2' && 'Review the business model and risk factors to analyze how the company presents itself in its 10-K filing.'}
                  {moduleId === 'module-3' && 'Examine the financial performance and discussion to understand the company\'s financial statements and accounting practices.'}
                  {moduleId === 'module-4' && 'Analyze the competitive position, business model, and risk factors to identify competitive advantages and market moats.'}
                  {moduleId === 'module-5' && 'Use all available context to conduct a comprehensive comparative analysis and build a complete investment thesis.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {moduleId === 'module-1' && (
                  <div>
                    <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Company Overview for Fundamental Analysis</h4>
                    <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.businessDescription}</p>
                    <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                      <strong>Why this matters:</strong> Understanding {companyData.companyName}'s business model helps you interpret financial metrics like P/E ratios, EBITDA margins, and ROE in context. Different industries have different typical ranges for these ratios, so knowing what the company does is essential for meaningful analysis.
                    </p>
                  </div>
                )}
                
                {moduleId === 'module-2' && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Business Description (Item 1)</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.businessDescription}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>What to look for:</strong> How does {companyData.companyName} describe its business model, revenue streams, and competitive position? Pay attention to how they frame their value proposition and market positioning.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Risk Factors (Item 1A)</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.riskFactors}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>What to analyze:</strong> Companies are required to disclose material risks. Consider how {companyData.companyName} prioritizes and presents these risks. Are they transparent about challenges, or do they minimize concerns? How do these risks relate to the business description?
                      </p>
                    </div>
                  </>
                )}
                
                {moduleId === 'module-3' && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Business Model Context</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.businessDescription}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Connection to financials:</strong> Understanding {companyData.companyName}'s business model helps you interpret the balance sheet and income statement. For example, asset-heavy businesses will show different balance sheet structures than software companies.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Management's Discussion & Analysis (MD&A)</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.financialDiscussion}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>What to examine:</strong> The MD&A section provides management's interpretation of the financial statements. Look for how {companyData.companyName} explains revenue trends, margin changes, and balance sheet movements. Compare their narrative to what the numbers actually show.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Key Risk Factors Affecting Financials</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.riskFactors}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Financial impact:</strong> Consider how these risks could affect {companyData.companyName}'s financial statements. For example, supply chain risks might impact inventory levels, while regulatory risks could affect revenue recognition or require reserves.
                      </p>
                    </div>
                  </>
                )}
                
                {moduleId === 'module-4' && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Business Model & Competitive Position</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.businessDescription}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Moat analysis:</strong> Identify what gives {companyData.companyName} its competitive advantage. Is it network effects, brand strength, cost advantages, switching costs, or regulatory barriers? Look for language about market share, customer loyalty, or unique capabilities.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Competitive Threats & Risk Factors</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.riskFactors}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Competitive landscape:</strong> The risk factors reveal {companyData.companyName}'s vulnerabilities and competitive pressures. Analyze which risks suggest weak moats (e.g., intense competition) versus external threats (e.g., regulation) that might actually indicate a strong position.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Financial Performance Indicators</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.financialDiscussion}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Moat validation:</strong> Strong competitive advantages should translate to financial results. Look for evidence in {companyData.companyName}'s financial performance—sustained margins, pricing power, or consistent market share gains suggest durable moats.
                      </p>
                    </div>
                  </>
                )}
                
                {moduleId === 'module-5' && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Complete Business Profile</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.businessDescription}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>For comparison:</strong> Use this business description to understand {companyData.companyName}'s core operations, revenue model, and market position. When comparing to another company, identify similarities and differences in business models, even within the same industry.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Risk Profile & Competitive Position</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.riskFactors}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Comparative risk analysis:</strong> Compare {companyData.companyName}'s risk factors to another company's. Which company faces more significant threats? Are the risks company-specific or industry-wide? This helps assess relative investment attractiveness.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Financial Performance & Strategy</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.financialDiscussion}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Comparative financial analysis:</strong> Use {companyData.companyName}'s financial discussion to understand their performance trends, capital allocation strategy, and management priorities. Compare these to another company's financial narrative to identify which management team is executing better or has a more compelling strategy.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              size="lg" 
              onClick={() => setCurrentStep('questions')}
              className="bg-[#b4d4b4] hover:bg-[#a0c5a0] text-[#2d2d2d] font-medium shadow-sm border border-[#9cc09c] dark:bg-[#8fb48f] dark:hover:bg-[#a0c5a0] dark:text-[#1a1a18]"
            >
              Continue to Questions
            </Button>
          </div>
        </>
      )}

      {/* Questions */}
      {currentStep === 'questions' && (
        <div className="space-y-6">
          {!selectedCompany && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Please select a company first to view questions.</p>
              </CardContent>
            </Card>
          )}
          {selectedCompany && customizedQuestions.map((question: any, index: number) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">
                      Question {index + 1} of {content.questions.length}
                    </Badge>
                    <CardTitle className="text-lg">{question.question}</CardTitle>
                    {question.guidance && (
                      <CardDescription className="mt-2">
                        <strong>Guidance:</strong> {question.guidance}
                      </CardDescription>
                    )}
                  </div>
                  {feedback[question.id] ? (
                    question.type === 'mcq' ? (
                      feedback[question.id].isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-6 w-6 text-red-600" />
                          <Badge variant="destructive" className="text-xs">Redo Required</Badge>
                        </div>
                      )
                    ) : (
                      <Badge 
                        variant={feedback[question.id].overall_score >= 70 ? 'default' : 'destructive'}
                        className={feedback[question.id].overall_score < 70 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                      >
                        {feedback[question.id].overall_score}/100
                        {feedback[question.id].overall_score < 70 && ' - Redo Required'}
                      </Badge>
                    )
                  ) : isSubmitting && answers[question.id] && question.type === 'mcq' ? (
                    <Badge variant="outline">Grading...</Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {question.type === 'mcq' ? (
                  // Multiple Choice Question
                  <div className="space-y-2">
                    {question.options.map((option: any) => (
                      <Button
                        key={option.label}
                        variant={
                          feedback[question.id]
                            ? option.label === question.correctAnswer
                              ? 'default'
                              : answers[question.id] === option.label
                              ? 'destructive'
                              : 'outline'
                            : answers[question.id] === option.label
                            ? 'secondary'
                            : 'outline'
                        }
                        className="w-full justify-start h-auto py-3 text-left"
                        onClick={async () => {
                          setAnswers({ ...answers, [question.id]: option.label });
                          // Allow resubmission if answer was wrong
                          if ((!feedback[question.id] || !feedback[question.id].isCorrect) && !isSubmitting) {
                            await handleSubmitMCQ(question.id, option.label);
                          }
                        }}
                        disabled={(feedback[question.id]?.isCorrect === true) || isSubmitting}
                      >
                        <span className="font-semibold mr-2">{option.label}.</span>
                        {option.text}
                      </Button>
                    ))}
                  </div>
                ) : (
                  // Written Response
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Write your detailed analysis here..."
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                      rows={8}
                      disabled={feedback[question.id]?.overall_score >= 70}
                    />
                    {(!feedback[question.id] || (feedback[question.id].overall_score !== undefined && feedback[question.id].overall_score < 70)) && (
                      <>
                        {answers[question.id] && answers[question.id].length < 50 && (
                          <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98]">
                            Please provide at least 50 characters ({answers[question.id].length}/50)
                          </p>
                        )}
                        {feedback[question.id] && feedback[question.id].overall_score < 70 && (
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
                            Score below 70. Please revise and resubmit to count towards progress.
                          </p>
                        )}
                        <Button 
                          onClick={() => handleSubmitWritten(question.id)}
                          disabled={isSubmitting || !answers[question.id] || answers[question.id].length < 50}
                          className="w-full"
                        >
                          {isSubmitting ? 'Grading...' : feedback[question.id]?.overall_score < 70 ? 'Resubmit for AI Grading' : 'Submit for AI Grading'}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Feedback Display */}
                {feedback[question.id] && (
                  <Card className={question.type === 'mcq' 
                    ? feedback[question.id].isCorrect 
                      ? 'bg-[#e8f4e8] dark:bg-[#2a3a2a] border-[#b4d4b4] dark:border-[#4a6a4a]' 
                      : 'bg-[#fce8e8] dark:bg-[#3a2a2a] border-[#e4b4b4] dark:border-[#6a4a4a]'
                    : 'bg-[#f9f7f5] dark:bg-[#222220] border-[#e0ddd8] dark:border-[#3a3a38]'
                  }>
                    <CardHeader>
                      <CardTitle className="text-lg text-[#2d2d2d] dark:text-[#e8e6e3]">
                        {question.type === 'mcq' 
                          ? feedback[question.id].isCorrect ? '✓ Correct!' : '✗ Incorrect'
                          : `Score: ${feedback[question.id].overall_score}/100`
                        }
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {question.type === 'mcq' ? (
                        <div className="space-y-3">
                          {!feedback[question.id].isCorrect && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-3">
                              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                Incorrect answer. This question does not count towards progress. Please select the correct answer to proceed.
                              </p>
                            </div>
                          )}
                          <p className="text-sm text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed">
                            <strong>Explanation:</strong> {feedback[question.id].explanation}
                          </p>
                          {feedback[question.id].whyWrong && (
                            <div className="bg-[#fff4e6] dark:bg-[#3a2e1a] p-3 rounded border border-[#ffd699] dark:border-[#5a4a2a]">
                              <p className="text-sm font-semibold text-[#2d2d2d] dark:text-[#e8e6e3] mb-1">Why this answer is incorrect:</p>
                              <p className="text-sm text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed">{feedback[question.id].whyWrong}</p>
                            </div>
                          )}
                          {feedback[question.id].howToUnderstand && (
                            <div className="bg-[#e8f4e8] dark:bg-[#2a3a2a] p-3 rounded border border-[#b4d4b4] dark:border-[#4a6a4a]">
                              <p className="text-sm font-semibold text-[#2d2d2d] dark:text-[#e8e6e3] mb-1">How to better understand this:</p>
                              <p className="text-sm text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed">{feedback[question.id].howToUnderstand}</p>
                            </div>
                          )}
                          {feedback[question.id].correctAnswerExplanation && (
                            <div className="bg-[#f0f8ff] dark:bg-[#1a2a3a] p-3 rounded border border-[#b4d4f4] dark:border-[#4a6a8a]">
                              <p className="text-sm font-semibold text-[#2d2d2d] dark:text-[#e8e6e3] mb-1">Correct answer explanation:</p>
                              <p className="text-sm text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed">{feedback[question.id].correctAnswerExplanation}</p>
                            </div>
                          )}
                        </div>
                      ) : feedback[question.id].error ? (
                        <p className="text-sm text-[#c45a5a]">{feedback[question.id].error}</p>
                      ) : (
                        <>
                          {feedback[question.id].overall_score < 70 && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-3">
                              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                Score below 70. This answer does not count towards progress. Please revise and resubmit to achieve a passing score.
                              </p>
                            </div>
                          )}
                          <p className="text-sm font-medium text-[#2d2d2d] dark:text-[#e8e6e3]">{feedback[question.id].summary}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            {Object.entries(feedback[question.id].criteria).map(([key, value]: [string, any]) => (
                              <div key={key} className="text-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold capitalize text-[#2d2d2d] dark:text-[#e8e6e3]">{key.replace('_', ' ')}</span>
                                  <Badge className="bg-[#e8e6e3] text-[#2d2d2d] border-[#d0cdc8]">{value.score}/20</Badge>
                                </div>
                                <p className="text-xs text-[#6a6a6a] dark:text-[#9a9a98]">{value.feedback}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ))}

          {progress === 100 && (
            <Card className="bg-[#d4e4d8] dark:bg-[#3a4a3e] border-[#b4d4b4] dark:border-[#5a7a5e]">
              <CardContent className="py-8 text-center">
                <h2 className="text-2xl font-bold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">🎉 Module Complete!</h2>
                <p className="mb-6 text-[#4a4a4a] dark:text-[#b8b8b8]">
                  Great job completing {content.title}. Continue to the next module to keep learning.
                </p>
                <Button 
                  size="lg" 
                  onClick={async () => {
                    // Ensure progress is saved before navigating
                    if (userId && Object.keys(feedback).length > 0) {
                      await saveProgress(feedback, content.questions.length);
                      // Wait a bit more to ensure database commit
                      await new Promise(resolve => setTimeout(resolve, 300));
                    }
                    router.push('/learn');
                  }}
                  disabled={isSaving}
                  className="border border-border bg-card text-card-foreground shadow-sm hover:bg-muted-bg"
                >
                  {isSaving ? 'Saving...' : 'Back to Modules'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

