import DailyReportNotes from '../models/DailyReportNotes.js';
import { getReportDateRange } from '../services/reportAggregation.js';

const getNotesForDate = async (date) => {
    const range = getReportDateRange(date);
    const notes = await DailyReportNotes.findOne({ reportDate: range.date });
    return { date: date || range.date.toISOString().slice(0, 10), notes };
};

export const getDailyReportNotes = async (req, res) => {
    try {
        const { date, notes } = await getNotesForDate(req.query.date);
        return res.status(200).json({
            date,
            notes: {
                introduction: notes?.introduction || '',
                problemesTechniques: notes?.problemesTechniques || '',
                defisRencontres: notes?.defisRencontres || '',
                observations: notes?.observations || '',
                observationsControleur: notes?.observationsControleur || '',
            },
        });
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
};

export const updateDailyReportNotes = async (req, res) => {
    try {
        const range = getReportDateRange(req.query.date);
        const payload = {
            introduction: String(req.body?.introduction || '').trim(),
            problemesTechniques: String(req.body?.problemesTechniques || '').trim(),
            defisRencontres: String(req.body?.defisRencontres || '').trim(),
            observations: String(req.body?.observations || '').trim(),
            observationsControleur: String(req.body?.observationsControleur || '').trim(),
            updatedBy: req.user?.userId,
        };
        const notes = await DailyReportNotes.findOneAndUpdate(
            { reportDate: range.date },
            { $set: payload, $setOnInsert: { reportDate: range.date } },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );
        return res.status(200).json({ date: range.date.toISOString().slice(0, 10), notes });
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
};