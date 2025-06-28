let allQuestions = [];
let questions = [];
let currentQuestion = 0;
let score = 0;
let userName = "";
let userTeam = "";
let timerInterval;
let timeLeft = 15;
let questionLimit = 5;

// Check for stored result on load
window.onload = function () {
  const stored = JSON.parse(localStorage.getItem("succinct-result"));
  if (stored && stored.score !== undefined) {
    showStoredResult(stored);
  }
};

// Load Questions
fetch("questions.json")
  .then((res) => res.json())
  .then((data) => {
    allQuestions = data;
  });

function startQuiz() {
  userName = document.getElementById("username").value.trim();
  userTeam = document.getElementById("team-select").value;
  questionLimit = parseInt(document.getElementById("question-count").value);

  if (!userName || !userTeam || !questionLimit) {
    alert("Please enter all fields before starting.");
    return;
  }

  if (allQuestions.length === 0) {
    alert("Questions are still loading. Please wait a moment.");
    return;
  }

  questions = shuffle(allQuestions).slice(0, questionLimit);
  currentQuestion = 0;
  score = 0;

  document.body.className = userTeam;
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("quiz-screen").classList.remove("hidden");

  document.getElementById("team-label").innerText = `Team: ${capitalize(
    userTeam
  )}`;
  document.getElementById("user-label").innerText = `Player: ${userName}`;
  document.getElementById("team-image").src = `images/${userTeam}.jpg`;
  updateScore();
  showQuestion();
}

function showQuestion() {
  clearInterval(timerInterval);
  timeLeft = 15;
  updateTimer();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      nextQuestion();
    }
  }, 1000);

  const container = document.getElementById("question-container");
  container.innerHTML = "";

  const q = questions[currentQuestion];

  // ✅ Add question progress indicator
  const level = document.createElement("p");
  level.innerText = `Question ${currentQuestion + 1} of ${questions.length}`;
  level.style.fontWeight = "bold";
  level.style.marginBottom = "10px";
  container.appendChild(level);

  // ✅ Question text
  const qEl = document.createElement("h3");
  qEl.innerText = q.q;
  container.appendChild(qEl);

  // ✅ Shuffle answers AND track which one is correct
  const answerObjects = q.a.map((text, index) => ({
    text,
    correct: index === q.correct,
  }));

  const shuffledAnswers = shuffle(answerObjects);

  shuffledAnswers.forEach((ans) => {
    const btn = document.createElement("button");
    btn.innerText = ans.text;
    btn.onclick = () => {
      clearInterval(timerInterval);
      if (ans.correct) {
        score++;
        btn.style.backgroundColor = "#00cc66";
        btn.innerText += " ✅ Correct!";
      } else {
        btn.style.backgroundColor = "#cc0033";
        btn.innerText += " ❌ Wrong!";
      }
      updateScore();
      disableButtons();
      setTimeout(nextQuestion, 1200);
    };
    container.appendChild(btn);
  });
}

function disableButtons() {
  const buttons = document.querySelectorAll("#question-container button");
  buttons.forEach((btn) => (btn.disabled = true));
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  clearInterval(timerInterval);
  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  const percent = Math.round((score / questions.length) * 100);
  let message = `You scored ${score}/${questions.length} (${percent}%)\n`;

  if (percent === 100) {
    message += `🎯 Perfect score, ${userName}! Team ${capitalize(
      userTeam
    )} is proud!`;
  } else if (percent >= 80) {
    message += `🔥 Awesome work, ${userName}! You crushed it for Team ${capitalize(
      userTeam
    )}!`;
  } else if (percent >= 50) {
    message += `👏 Not bad, ${userName}! Team ${capitalize(
      userTeam
    )} appreciates your effort!`;
  } else {
    message += `💡 Keep learning, ${userName}! Team ${capitalize(
      userTeam
    )} believes in you!`;
  }

  document.getElementById("result-message").innerText = message;

  const tweet = `I just played Succinct Trivia Clash and scored ${score}/${
    questions.length
  } (${percent}%) for Team ${capitalize(userTeam)}! 💫`;
  const tweetURL = `https://x.com/intent/tweet?text=${encodeURIComponent(
    tweet
  )}`;
  document.getElementById("tweet-link").href = tweetURL;

  // Save result to localStorage
  localStorage.setItem(
    "succinct-result",
    JSON.stringify({
      userName,
      userTeam,
      score,
      questionCount: questions.length,
      message,
    })
  );

  if (percent >= 80) {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  }
}

function showStoredResult(stored) {
  document.body.className = stored.userTeam;
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  document.getElementById("result-message").innerText = stored.message;

  const tweet = `I just played Succinct Trivia Clash and scored ${
    stored.score
  }/${stored.questionCount} for Team ${capitalize(stored.userTeam)}! 🔥`;
  const tweetURL = `https://x.com/intent/tweet?text=${encodeURIComponent(
    tweet
  )}`;
  document.getElementById("tweet-link").href = tweetURL;
}

function updateScore() {
  document.getElementById("scoreboard").innerText = `Score: ${score}`;
}

function updateTimer() {
  document.getElementById("timer").innerText = `Time Left: ${timeLeft}s`;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function restartQuiz() {
  localStorage.removeItem("succinct-result");
  window.location.reload();
}
