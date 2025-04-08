import mongoose from 'mongoose';

mongoose
  .connect("mongodb+srv://nayan:nayan123@cluster0.y4naf.mongodb.net/test?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('MongoDB: Connected'))
  .catch((err) => console.log(err.message));
