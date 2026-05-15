const express = require('express');
const router = express.Router();

// Rule-based Study Planner
router.post('/planner', (req, res) => {
  try {
    const { subjects, examDate, hoursPerDay } = req.body;
    
    if (!subjects || !examDate || !hoursPerDay) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = Math.abs(exam - today);
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return res.status(400).json({ error: 'Exam date must be in the future' });
    }

    const totalHours = daysRemaining * hoursPerDay;
    const subjectsList = subjects.split(',').map(s => s.trim());
    const hoursPerSubject = Math.floor(totalHours / subjectsList.length);

    const schedule = subjectsList.map((subject, index) => {
      return {
        id: index + 1,
        subject,
        hoursAllocated: hoursPerSubject,
        suggestion: `Dedicate ${hoursPerSubject} hours over the next ${daysRemaining} days. Focus on core concepts first.`
      };
    });

    res.json({
      daysRemaining,
      totalHoursAvailable: totalHours,
      schedule,
      message: 'This is a rule-based AI fallback. Integration with OpenAI would provide more dynamic insights.'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate study plan' });
  }
});

// Rule-based Summarizer
router.post('/summarizer', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text to summarize' });
    }

    // A very basic rule-based summarizer: extracts first sentence of each paragraph
    const paragraphs = text.split(/\n+/);
    const summaryPoints = paragraphs
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => {
        const sentences = p.split(/(?<=[.!?])\s+/);
        return sentences[0];
      });

    res.json({
      summary: summaryPoints,
      message: 'This is a rule-based summarizer extracting topic sentences.'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to summarize text' });
  }
});

module.exports = router;
