import { create } from 'zustand';

const buildQuestionsFromTest = (testData) => (
  testData.questions.map((question) => ({
    id: question._id,
    text: question.question,
    options: question.options
  }))
);

const buildQuestionsFromAnalysis = (resultAnalysis) => (
  resultAnalysis.map((question) => ({
    id: question.id,
    text: question.text,
    options: question.options,
    difficulty: question.difficulty,
    correctAnswer: question.correctAnswer,
    topic: question.topic,
    subTopic: question.subTopic
  }))
);

const buildAnswerMap = (sessionData) => {
  const initialAnswers = {};

  if (sessionData.resultAnalysis) {
    sessionData.resultAnalysis.forEach((question) => {
      if (question.selectedOption !== undefined && question.selectedOption !== null) {
        initialAnswers[question.id] = Number(question.selectedOption);
      }
    });
    return initialAnswers;
  }

  (sessionData.answers || []).forEach((answer) => {
    if (answer.selectedOption !== undefined && answer.selectedOption !== null) {
      initialAnswers[answer.question] = Number(answer.selectedOption);
    }
  });

  return initialAnswers;
};

const getSessionStorageKey = (sessionId) => `test-session:${sessionId}`;

const getCurrentUserIdFromLocalStorage = () => {
  if (typeof window === 'undefined') return null;

  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return null;
    const parsedUser = JSON.parse(rawUser);
    return parsedUser?._id || parsedUser?.user_id || null;
  } catch {
    return null;
  }
};

const readLocalSessionState = (sessionId) => {
  if (typeof window === 'undefined' || !sessionId) return null;

  try {
    const raw = localStorage.getItem(getSessionStorageKey(sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    return {
      answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
      marked: Array.isArray(parsed.marked) ? parsed.marked : [],
      currentQuestionIndex: Number.isInteger(parsed.currentQuestionIndex)
        ? parsed.currentQuestionIndex
        : 0
    };
  } catch {
    return null;
  }
};

const writeLocalSessionState = (sessionId, state) => {
  if (typeof window === 'undefined' || !sessionId) return;

  try {
    localStorage.setItem(
      getSessionStorageKey(sessionId),
      JSON.stringify({
        ...state,
        userId: state?.userId || getCurrentUserIdFromLocalStorage()
      })
    );
  } catch {
    // Ignore storage failures.
  }
};

const getExpiredSessionsFromLocalStorage = () => {
  if (typeof window === 'undefined') return [];

  try {
    const currentUserId = getCurrentUserIdFromLocalStorage();
    const keys = Object.keys(localStorage);
    const now = Date.now();
    const expiredSessions = [];

    keys.forEach((key) => {
      if (key.startsWith('test-session:')) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return;
          const parsed = JSON.parse(raw);

          if (currentUserId && parsed.userId && parsed.userId !== currentUserId) {
            localStorage.removeItem(key);
            return;
          }

          if (parsed.endTime && new Date(parsed.endTime).getTime() <= now) {
            const sessionId = key.replace('test-session:', '');
            expiredSessions.push({
              sessionId,
              endTime: parsed.endTime
            });
          }
        } catch {
          // Ignore parse errors.
        }
      }
    });

    return expiredSessions;
  } catch {
    return [];
  }
};

const clearLocalSessionState = (sessionId) => {
  if (typeof window === 'undefined' || !sessionId) return;

  try {
    localStorage.removeItem(getSessionStorageKey(sessionId));
  } catch {
    // Ignore storage failures.
  }
};

const useTestStore = create((set, get) => ({
  activeTest: null,
  questions: [],
  answers: {},
  marked: [],
  summary: null,
  resultAnalysis: [],
  sessionMeta: null,
  currentQuestionIndex: 0,
  status: 'idle',
  timeLeft: 0,
  error: null,

  hydrateSession: async (sessionId, testData) => {
    const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/sessions/${sessionId}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!sessionRes.ok) {
      const errData = await sessionRes.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to load session');
    }

    const sessionData = await sessionRes.json();
    const isCompleted = sessionData.session.status === 'SUBMITTED' || sessionData.session.status === 'EXPIRED';

    const questions = sessionData.resultAnalysis
      ? buildQuestionsFromAnalysis(sessionData.resultAnalysis)
      : buildQuestionsFromTest(testData);

    const serverAnswers = buildAnswerMap(sessionData);
    const localState = readLocalSessionState(sessionId);

    const answers = !isCompleted && localState ? localState.answers : serverAnswers;
    const marked = !isCompleted && localState ? localState.marked : (sessionData.state?.marked || []);
    const currentQuestionIndex = !isCompleted && localState
      ? localState.currentQuestionIndex
      : (sessionData.state?.currentQuestionIndex || 0);

    if (isCompleted) {
      clearLocalSessionState(sessionId);
    }

    set({
      activeTest: {
        id: testData._id,
        title: testData.title,
        duration: testData.duration,
        subject: testData.subject,
        sessionId
      },
      questions,
      answers,
      marked,
      summary: sessionData.summary || null,
      resultAnalysis: sessionData.resultAnalysis || [],
      sessionMeta: {
        ...sessionData.session,
        timeTakenSeconds: sessionData.timeTakenSeconds ?? null
      },
      currentQuestionIndex,
      status: isCompleted ? 'completed' : 'running',
      timeLeft: sessionData.remainingTime ?? (testData.duration || 30) * 60,
      error: null
    });

    if (!isCompleted) {
      writeLocalSessionState(sessionId, {
        answers,
        marked,
        currentQuestionIndex,
        endTime: sessionData.session.endTime
      });
    }
  },

  loadSession: async (sessionId) => {
    try {
      set({ status: 'idle', error: null });

      const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/sessions/${sessionId}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!sessionRes.ok) throw new Error('Failed to load session');
      const sessionData = await sessionRes.json();

      const testId = sessionData.session.test;
      const testRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tests/${testId}`);
      if (!testRes.ok) throw new Error('Failed to fetch test details');
      const testData = await testRes.json();

      const questions = sessionData.resultAnalysis
        ? buildQuestionsFromAnalysis(sessionData.resultAnalysis)
        : buildQuestionsFromTest(testData);

      const isCompleted = sessionData.session.status === 'SUBMITTED' || sessionData.session.status === 'EXPIRED';
      const serverAnswers = buildAnswerMap(sessionData);
      const localState = readLocalSessionState(sessionId);

      const answers = !isCompleted && localState ? localState.answers : serverAnswers;
      const marked = !isCompleted && localState ? localState.marked : (sessionData.state?.marked || []);
      const currentQuestionIndex = !isCompleted && localState
        ? localState.currentQuestionIndex
        : (sessionData.state?.currentQuestionIndex || 0);

      if (isCompleted) {
        clearLocalSessionState(sessionId);
      }

      set({
        activeTest: {
          id: testData._id,
          title: testData.title,
          duration: testData.duration,
          subject: testData.subject,
          sessionId
        },
        questions,
        answers,
        marked,
        summary: sessionData.summary || null,
        resultAnalysis: sessionData.resultAnalysis || [],
        sessionMeta: {
          ...sessionData.session,
          timeTakenSeconds: sessionData.timeTakenSeconds ?? null
        },
        currentQuestionIndex,
        status: isCompleted ? 'completed' : 'running',
        timeLeft: sessionData.remainingTime ?? 0,
        error: null
      });

      if (!isCompleted) {
        writeLocalSessionState(sessionId, {
          answers,
          marked,
          currentQuestionIndex,
          endTime: sessionData.session.endTime
        });
      }
    } catch (err) {
      console.error(err);
      set({ status: 'error', error: err.message });
    }
  },

  loadReviewSession: async (sessionId) => {
    try {
      set({ status: 'idle', error: null });

      const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/sessions/${sessionId}/review`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!sessionRes.ok) {
        const errData = await sessionRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to load review');
      }

      const sessionData = await sessionRes.json();
      const review = sessionData.review || {};
      const reviewQuestions = Array.isArray(review.questions) ? review.questions : [];

      const mappedQuestions = reviewQuestions.map((question) => ({
        id: question.id,
        text: question.text,
        options: question.options,
        difficulty: question.difficulty,
        correctAnswer: question.correctAnswer,
        correctOptionIndex: question.correctOptionIndex,
        topic: question.topic,
        subTopic: question.subTopic,
        isCorrect: question.isCorrect,
        selectedOption: question.selectedOption,
        selectedValue: question.selectedValue
      }));

      const mappedAnswers = {};
      reviewQuestions.forEach((question) => {
        if (question.selectedOption !== undefined && question.selectedOption !== null) {
          mappedAnswers[question.id] = Number(question.selectedOption);
        }
      });

      set({
        activeTest: {
          id: review.test?.id,
          title: review.test?.title,
          duration: review.test?.duration,
          subject: review.test?.subject,
          sessionId
        },
        questions: mappedQuestions,
        answers: mappedAnswers,
        marked: sessionData.state?.marked || [],
        summary: sessionData.summary || null,
        resultAnalysis: sessionData.resultAnalysis || [],
        sessionMeta: {
          ...sessionData.session,
          timeTakenSeconds: sessionData.timeTakenSeconds ?? null
        },
        currentQuestionIndex: 0,
        status: 'completed',
        timeLeft: 0,
        error: null
      });
    } catch (err) {
      console.error(err);
      set({ status: 'error', error: err.message });
    }
  },

  startTest: async (testId) => {
    try {
      set({ status: 'idle', error: null });

      const startRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tests/${testId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!startRes.ok) {
        const errData = await startRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to start test session');
      }

      const startData = await startRes.json();
      const testRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tests/${testId}`);
      if (!testRes.ok) throw new Error('Failed to fetch test details');
      const testData = await testRes.json();

      await get().hydrateSession(startData.sessionId, testData);
    } catch (err) {
      console.error(err);
      set({ status: 'error', error: err.message });
    }
  },

  persistSessionState: async (partialState = {}) => {
    const { activeTest, status, currentQuestionIndex, marked, answers, sessionMeta } = get();
    if (!activeTest?.sessionId || status !== 'running') return;

    writeLocalSessionState(activeTest.sessionId, {
      answers,
      marked,
      currentQuestionIndex,
      endTime: sessionMeta?.endTime,
      ...partialState
    });
  },

  toggleMark: (questionId) => {
    let nextMarked = [];

    set((state) => {
      const isMarked = state.marked.includes(questionId);
      nextMarked = isMarked
        ? state.marked.filter((id) => id !== questionId)
        : [...state.marked, questionId];

      return { marked: nextMarked };
    });

    void get().persistSessionState({ marked: nextMarked });
  },

  selectAnswer: async (questionId, optionIndex) => {
    set((state) => {
      const nextAnswers = { ...state.answers };

      if (optionIndex === undefined || optionIndex === null) {
        delete nextAnswers[questionId];
      } else {
        nextAnswers[questionId] = optionIndex;
      }

      return { answers: nextAnswers };
    });

    void get().persistSessionState();
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      set({ currentQuestionIndex: nextIndex });
      void get().persistSessionState({ currentQuestionIndex: nextIndex });
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      const nextIndex = currentQuestionIndex - 1;
      set({ currentQuestionIndex: nextIndex });
      void get().persistSessionState({ currentQuestionIndex: nextIndex });
    }
  },

  jumpToQuestion: (index) => {
    set({ currentQuestionIndex: index });
    void get().persistSessionState({ currentQuestionIndex: index });
  },

  completeTest: async ({ forceExpire = false } = {}) => {
    const { activeTest, answers, marked, currentQuestionIndex } = get();
    if (!activeTest?.sessionId) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/sessions/${activeTest.sessionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          forceExpire,
          answers,
          marked,
          currentQuestionIndex
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to submit test');
      }

      clearLocalSessionState(activeTest.sessionId);
      await get().loadSession(activeTest.sessionId);
    } catch (err) {
      console.error('Failed to submit test:', err);
      set({ status: 'error', error: err.message });
    }
  },

  resetTest: () => {
    const sessionId = get().activeTest?.sessionId;
    clearLocalSessionState(sessionId);

    set({
      activeTest: null,
      questions: [],
      answers: {},
      marked: [],
      summary: null,
      resultAnalysis: [],
      sessionMeta: null,
      currentQuestionIndex: 0,
      status: 'idle',
      timeLeft: 0,
      error: null
    });
  },

  decrementTimer: () => {
    const { timeLeft, status } = get();
    if (status !== 'running') return;

    if (timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 });
      return;
    }

    void get().completeTest({ forceExpire: true });
  }
}));

export const finalizeExpiredSessionsOnClient = async () => {
  const currentUserId = getCurrentUserIdFromLocalStorage();
  if (!currentUserId) return;

  const expiredSessions = getExpiredSessionsFromLocalStorage();

  for (const session of expiredSessions) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/sessions/${session.sessionId}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ answers: {}, forceExpire: true })
        }
      );

      if (res.ok) {
        clearLocalSessionState(session.sessionId);
      } else {
        if ([401, 403, 404].includes(res.status)) {
          clearLocalSessionState(session.sessionId);
          continue;
        }

        console.warn(`Failed to finalize session ${session.sessionId}`);
      }
    } catch (error) {
      console.error(`Error finalizing session ${session.sessionId}:`, error);
    }
  }
};

export default useTestStore;