const Question = require('../models/Question');
const Test = require('../models/Test');
const Subject = require('../models/Subject');
const TestSession = require('../models/TestSession');
const { finalizeSession } = require('../utils/sessionLifecycle');

exports.createTest = async (req, res) => {
    try {
        const { title, subject, description, duration, questions } = req.body;
        const newTest = new Test({
            title,
            subject,
            description,
            duration,
            questions
        });

        await newTest.save();
        
        res.status(201).json(newTest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getTests = async (req, res) => {
    try {
        const { subject, year } = req.query;
        
        let query = {};
        if (subject) {
            query.subject = subject;
        }

        if (year) {
            const parsedYear = parseInt(year, 10); // string -> number (base 10)
            
            if (parsedYear > 0) {
                const subjectsForYear = await Subject.find({ year: parsedYear }).select('name -_id').lean();
                const subjectNames = subjectsForYear.map((s) => s.name);

                if (subject) {
                    if (!subjectNames.includes(subject)) {
                        return res.json([]);
                    }
                } else {
                    query.subject = { $in: subjectNames };
                }
            }
        }

        const tests = await Test.find(query);
        res.json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTestById = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        const questions = await Question.find({ questionId: { $in: test.questions } }).select('-correctAnswer -difficulty -topic -subTopic');
        const orderedQuestions = test.questions.map(id => questions.find(q => q.questionId === id)).filter(Boolean);

        res.json({
            ...test.toObject(),
            questions: orderedQuestions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTestByIdForAdmin = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        const questions = await Question.find({ questionId: { $in: test.questions } });
        const orderedQuestions = test.questions.map(id => questions.find(q => q.questionId === id)).filter(Boolean); // filter to remove any missing questions

        res.json({
            ...test.toObject(),
            questions: orderedQuestions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTest = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subject, description, duration, questions } = req.body;

        const test = await Test.findById(id);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        if (title !== undefined) test.title = title;
        if (subject !== undefined) test.subject = subject;
        if (description !== undefined) test.description = description;
        if (duration !== undefined) test.duration = duration;
        if (Array.isArray(questions)) test.questions = questions;

        await test.save();

        return res.status(200).json(test);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.deleteTest = async (req, res) => {
    try {
        const { id } = req.params;

        const test = await Test.findByIdAndDelete(id);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        return res.status(200).json({ message: 'Test deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.startTestSession = async (req, res) => {
    try {
        const userId = req.userId;
        const testId = req.params.id;

        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }

        const existingSession = await TestSession.findOne({
            user: userId,
            test: testId,
            status: 'IN_PROGRESS'
        });

        if (existingSession) {
            const remaining = new Date(existingSession.endTime).getTime() - Date.now();

            if (remaining > 0) {
                return res.status(200).json({
                    message: "Resuming test session",
                    sessionId: existingSession._id,
                    startTime: existingSession.startTime,
                    endTime: existingSession.endTime,
                    remainingTime: Math.floor(remaining / 1000)
                });
            } else {
                await finalizeSession(existingSession, { status: 'EXPIRED' });
            }
        }

        const durationInMinutes = test.duration || 30;
        const endTime = new Date(Date.now() + durationInMinutes * 60000); // 60,000 milliseconds

        const newSession = new TestSession({
            user: userId,
            test: testId,
            status: 'IN_PROGRESS',
            endTime: endTime
        });

        await newSession.save();

        res.status(201).json({
            message: "Test session started",
            sessionId: newSession._id,
            startTime: newSession.startTime,
            endTime: newSession.endTime,
            remainingTime: durationInMinutes * 60
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTestSession = async (req, res) => {
    try {
        const userId = req.userId;
        const testId = req.params.id;

        const session = await TestSession.findOne({
            user: userId,
            test: testId,
            status: 'IN_PROGRESS'
        });

        if (!session) {
            return res.status(404).json({ message: "No active session found" });
        }

        res.json(session);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
