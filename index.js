require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Contact = require("./model/contact");

const app = express();

const postBody = (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return null;
};

morgan.token("postBody", postBody);

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :postBody"
  )
);
app.use(express.json());
app.use(express.static("build"));

app.use(cors());

app.get("/", (_request, response) => {
  console.log("message received");
  response.send("<h1>Hello, World</h1>");
});

app.get("/api/persons", (_request, response) => {
  Contact.find({}).then((personData) => {
    response.json(personData);
  });
});

app.post("/api/persons", (request, response, next) => {
  const { body } = request;
  if (!body || Object.keys(body).length === 0) {
    response.status(400).json({
      error: "body is missing",
    });
  } else if (!body.name) {
    response.status(400).json({
      error: "name is missing",
    });
  } else if (!body.number) {
    response.status(400).json({
      error: "number is missing",
    });
  }

  const { name, number } = body;

  const newPerson = new Contact({
    name,
    number,
  });

  newPerson
    .save()
    .then((newPersonData) => response.json(newPersonData))
    .catch((err) => next(err));
});

app.get("/api/persons/:id", (request, response, next) => {
  Contact.findById(request.params.id)
    .then((personData) => {
      response.json(personData);
    })
    .catch((err) => next(err));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Contact.findByIdAndUpdate(
    request.params.id,
    {
      name,
      number,
    },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((err) => next(err));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Contact.findByIdAndRemove(request.params.id)
    .then(() => response.status(204).end())
    .catch((err) => next(err));
});

app.get("/info", (_request, response, next) => {
  Contact.count()
    .then((count) => {
      response.send(
        `<p>Phonebook has info for ${count} people </p><br/>${new Date()}`
      );
    })
    .catch((err) => next(err));
});

const PORT = process.env.PORT || "8080";

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

const errorHandler = (error, _request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }

  next(error);
  return null;
};

app.use(errorHandler);
