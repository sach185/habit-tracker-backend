
const { Mood, MonthlyMood, YearlyMood } = require("../models/MoodModel");


//Create and Update goal API handling
module.exports.postUserMood = async (req, res) => {
    const { userId, rating, notes, date } = req.body;

    try {
        const moodDocument = new Mood({ userId, rating, notes, timestamp: date });
        await moodDocument.save();

        res.status(201).json({ message: 'Daily rating and notes stored successfully' });

         // Update monthly and yearly ratings
         await updateMonthlyAndYearlyRatings();
    } catch (error) {
        console.error('Error storing daily rating and notes:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// Calculate and store monthly ratings
async function calculateAndStoreMonthlyRatings() {
    try {
        const monthlyRatings = await Mood.aggregate([
            {
                $group: {
                    _id: {
                        userId: '$userId',
                        year: { $year: '$timestamp' },
                        month: { $month: '$timestamp' }
                    },
                    avgRating: { $avg: '$rating' }
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: '$_id.userId',
                    year: '$_id.year',
                    month: '$_id.month',
                    avgRating: 1
                }
            }
        ]);

        // Ensure uniqueness by removing duplicates for each user-month combination
        const uniqueMonthlyRatings = monthlyRatings.reduce((acc, rating) => {
            const key = `${rating.userId}_${rating.year}_${rating.month}`;
            if (!acc[key]) {
                acc[key] = rating;
            }
            return acc;
        }, {});

        await MonthlyMood.insertMany(Object.values(uniqueMonthlyRatings));

        console.log('Monthly ratings calculated and stored successfully!');
    } catch (error) {
        console.error('Error calculating and storing monthly ratings:', error);
    }
}

// Calculate and store yearly ratings
async function calculateAndStoreYearlyRatings() {
    try {
        const yearlyRatings = await MonthlyMood.aggregate([
            {
                $group: {
                    _id: {
                        userId: '$userId',
                        year: '$year'
                    },
                    avgRating: { $avg: '$avgRating' }
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: '$_id.userId',
                    year: '$_id.year',
                    avgRating: 1
                }
            }
        ]);

        // Ensure uniqueness by removing duplicates for each user-year combination
        const uniqueYearlyRatings = yearlyRatings.reduce((acc, rating) => {
            const key = `${rating.userId}_${rating.year}`;
            if (!acc[key]) {
                acc[key] = rating;
            }
            return acc;
        }, {});

        await YearlyMood.insertMany(Object.values(uniqueYearlyRatings));

        console.log('Yearly ratings calculated and stored successfully!');
    } catch (error) {
        console.error('Error calculating and storing yearly ratings:', error);
    }
}


async function updateMonthlyAndYearlyRatings() {
    await calculateAndStoreMonthlyRatings();
    await calculateAndStoreYearlyRatings();
}

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