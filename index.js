const { response, request } = require("express");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

const postBody = (req, _res) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  console.log("message received");
  response.send("<h1>Hello, World</h1>");
});

app.get("/api/persons", (_request, response) => {
  response.json(persons);
});

app.post("/api/persons", (request, response) => {
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

  const { name } = body;

  if (persons.find((p) => p.name === name)) {
    response.status(400).json({
      error: `name must be unique`,
    });
  }

  const newPerson = {
    id: generateId(),
    name,
    number: body.number,
  };

  persons = persons.concat(newPerson);

  response.json(newPerson);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.get("/info", (_request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people </p><br/>${new Date()}`
  );
});

const PORT = process.env.PORT || "8080";

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

const generateId = () => {
  const min = 100;
  const max = Number.MAX_SAFE_INTEGER;
  const id = Math.floor(Math.random() * (max - min + 1) + min); // don't like using this for id's
  return id;
};
