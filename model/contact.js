const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(url)
  .then(() => console.log("connected to MongoDB"))
  .catch((err) => console.log("error connecting to mongodb", err));

const contactSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
    minLength: 3,
  },
  number: {
    required: true,
    type: String,
    validate: {
      validator: (value) => /^\d{2,3}-\d+$/.test(value),
      message: ({ value }) => `${value} is not a valid phone number`,
    },
  },
});

contactSchema.set("toJSON", {
  transform: (_document, returnedObj) => {
    const { name, number, _id } = returnedObj;
    return {
      id: _id.toString(),
      name,
      number,
    };
  },
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
