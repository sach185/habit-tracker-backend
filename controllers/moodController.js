
const { Mood, MonthlyMood, YearlyMood } = require("../models/MoodModel");


//Create and Update goal API handling
module.exports.postUserMood = async (req, res) => {
    const { userId, rating, notes, date, moodId } = req.body;

    try {

        if (moodId) {
            // If moodId is present, update the existing mood document
            await Mood.findByIdAndUpdate(moodId, { userId, rating, notes, timestamp: date });
            res.status(200).json({ message: 'Daily rating and notes updated successfully' });
        } else {
            // If moodId is not present, create a new mood document
            const moodDocument = new Mood({ userId, rating, notes, timestamp: date });
            await moodDocument.save();
            res.status(201).json({ message: 'Daily rating and notes stored successfully' });
        }

         // Update monthly and yearly ratings
         await updateMonthlyAndYearlyRatings(userId, date);
    } catch (error) {
        console.error('Error storing daily rating and notes:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const updateMonthlyRating = async (userId, year, month) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const ratings = await Mood.find({
        userId,
        timestamp: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    }).select('rating');

    const totalRating = ratings.reduce((acc, mood) => acc + mood.rating, 0);
    const averageRating = totalRating / ratings.length || 0;

    await MonthlyMood.findOneAndUpdate(
        { userId, year, month },
        { userId, year, month, avgRating: averageRating },
        { upsert: true }
    );
};

const updateYearlyRating = async (userId, year) => {
    const ratings = await Mood.find({
        userId,
        timestamp: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59, 999) }
    }).select('rating');

    const totalRating = ratings.reduce((acc, mood) => acc + mood.rating, 0);
    const averageRating = totalRating / ratings.length || 0;

    await YearlyMood.findOneAndUpdate(
        { userId, year },
        { userId, year, avgRating: averageRating },
        { upsert: true }
    );
};

const updateMonthlyAndYearlyRatings = async (userId, dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();

    await updateMonthlyRating(userId, year, month);
    await updateYearlyRating(userId, year);
};

//Fetch yearly average
module.exports.getYearlyMood = async (req, res) => {
    const userId = req.params.userId;
    const year = parseInt(req.params.year);
    try {
        const yearlyMood = await YearlyMood.findOne({ userId, year }).exec();
        if (!yearlyMood) {
            return res.json({ success: false, message: 'Yearly mood not found for the given user and year' });
        }
        res.json({ success: true, data: yearlyMood });
    } catch (error) {
        console.error('Error fetching yearly mood:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

//Fetch month wise mood for a year
module.exports.getAllMonthsMood = async (req, res) => {
    const userId = req.params.userId;
    const year = parseInt(req.params.year);
    try {
        const monthlyMood = await MonthlyMood.find({ userId, year }).exec();
        if (!monthlyMood || monthlyMood.length === 0) {
            return res.json({ success: false, message: 'Monthly mood not found for the given user and year', data: [] });
        }
        res.json({ success: true, data: monthlyMood });
    } catch (error) {
        console.error('Error fetching monthly mood:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

//Fetch day wise mood for a month
module.exports.getAllDaysMood = async (req, res) => {
    const userId = req.params.userId;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    try {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59); // Last day of the month
        const dailyMood = await Mood.find({
            userId,
            timestamp: { $gte: startOfMonth, $lte: endOfMonth }
        }).exec();
        if (!dailyMood || dailyMood.length === 0) {
            return res.json({ success: false, message: 'Daily mood not found for the given user, year, and month', data: [] });
        }
        res.json({ success: true, data: dailyMood });
    } catch (error) {
        console.error('Error fetching daily mood:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};