const express = require("express");
const { auth } = require("./helpers.js");
const { findTimersByUser, createTimer, stopTimer } = require("./DB/db.js");

const timerRouter = express.Router();

timerRouter.get("/", auth(), async (req, res) => {
  const isActive = req.query.isActive;
  const user = req.user;

  if (!user) {
    return [];
  }

  const userTimers = await findTimersByUser(user.id);

  const timerForSend = [];

  for (const timer of userTimers) {
    if (`${timer.isActive}` === isActive) {
      if (timer.isActive) {
        timer.start = Number(timer.start);
        timer.progress = Date.now() - Number(timer.start);
      } else {
        timer.start = Number(timer.start);
        timer.end = Number(timer.end);
        timer.duration = timer.end - timer.start;
      }

      timerForSend.push(timer);
    }
  }

  res.json({ ...timerForSend });
});

timerRouter.post("/", auth(), async (req, res) => {
  const description = req.body.description;
  const user = req.user;

  const newTimerId = await createTimer(user.id, description);

  res.json(newTimerId);
});

timerRouter.post("/:id/stop", (req, res) => {
  const idTimer = req.params.id;

  const oldTimer = stopTimer(idTimer);

  res.json(oldTimer);
});

module.exports = timerRouter;
