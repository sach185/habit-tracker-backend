module.exports = {
  getDbConnectionString: function () {
    return (
      process.env.MONGO_URI ||
      "mongodb+srv://sachin:mongo%40test123@cluster0.ssxpp.mongodb.net/HabitDB?retryWrites=true&w=majority"
    );
  },
};
