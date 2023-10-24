const express = require("express");
const nunjucks = require("nunjucks");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const timerRouter = require("./timers.js");
const {
  findUserByUserName,
  createUser,
  createSession,
  deleteSession,
  findUserByUsernameAndPassword,
} = require("./DB/db.js");
const { auth } = require("./helpers.js");

const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  tags: {
    blockStart: "[%",
    blockEnd: "%]",
    variableStart: "[[",
    variableEnd: "]]",
    commentStart: "[#",
    commentEnd: "#]",
  },
});

app.set("view engine", "njk");

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use("/api/timers", timerRouter);

app.get("/", auth(), (req, res) => {
  res.render("index", {
    user: req.user,
    authError: req.query.authError === "true" ? "Wrong username or password" : req.query.authError,
  });
});

app.post("/login", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;

  const user = await findUserByUsernameAndPassword(username, password);

  if (user.rowCount === 0) {
    return res.redirect("/?authError=true");
  }

  const sessionId = await createSession(user.rows[0].id);

  res.cookie("sessionId", sessionId, { httpOnly: true }).redirect("/");
});

app.post("/signup", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  const user = await findUserByUserName(username);

  if (user) {
    return res.redirect("/?authError=There is already a user with this nickname");
  } else if (password === "") {
    return res.redirect("/?authError=You must enter password");
  } else {
    const id = await createUser(username, password);
    const sessionId = await createSession(id);

    res.cookie("sessionId", sessionId, { httpOnly: true, expires: 0 }).redirect("/");
  }
});

app.get("/logout", auth(), async (req, res) => {
  if (!req.user) {
    return res.redirect("/");
  }

  await deleteSession(req.sessionId);

  res.clearCookie("sessionId").redirect("/");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});
