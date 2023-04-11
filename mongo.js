const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@cluster0.1iijure.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Contact = mongoose.model("Contact", contactSchema);

if (process.argv.length === 3) {
  // Password only: list out all contacts
  console.log("phonebook: ");
  Contact.find({}).then((res) => {
    res.forEach((contact) => {
      console.log(contact);
    });
    mongoose.connection.close();
  });
} else {
  const name = process.argv[3];
  const number = process.argv[4];

  const contact = new Contact({
    name,
    number,
  });
  contact.save().then((res) => {
    console.log("contact saved!");
    mongoose.connection.close();
  });
}
