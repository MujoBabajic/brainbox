// START MENU REFERENCES
const startMenuContainer = document.querySelector("#start-menu-container");
const header = document.querySelector("#main-header");
const nicknameInput = document.querySelector("#nickname-input");
const nicknamesList = document.querySelector("#nicknames-list");
const numberOfQuestionsInput = document.querySelector(
  "#number-of-questions-input"
);
const numberOfQuestionsInputDisplay = document.querySelector("#slider-value");
const difficultyInput = document.querySelector("#difficulty-input");
const challengerMode = document.querySelector("#challenger-mode");
const startButton = document.querySelector("#start-button");
const infoContainer = document.querySelector("#info-container");
const categories = document.querySelectorAll(".category-container");

// QUIZ REFERENCES
const quizContainer = document.querySelector("#quiz-container");
const questionDiv = document.querySelector("#question-div");
const questionCategory = document.querySelector("#question-category");
const answersContainer = document.querySelector("#answers-container");
const answerA = document.querySelector("#answerA");
const answerB = document.querySelector("#answerB");
const answerC = document.querySelector("#answerC");
const answerD = document.querySelector("#answerD");
const answersArray = document.querySelectorAll(".answers");
const timerDiv = document.querySelector("#timer-div");
const scoreDiv = document.querySelector("#score-div");

// GAME OVER REFERENCES
const gameFinishedContainer = document.querySelector(
  "#game-finished-container"
);
const finalTime = document.querySelector("#final-time");
const finalScore = document.querySelector("#final-score");
const playAgainButton = document.querySelector("#play-again-button");

// ERROR MESSAGE REFERENCES
const errorMessageContainer = document.querySelector(
  "#error-message-container"
);

// GLOBAL VARIABLES AND ARRAYS
let SCORE_COUNTER = 0;
let CURRENT_QUESTION_NUMBER = 1;
let NUMBER_OF_QUESTIONS = "";
let INDEX_OF_QUESTION = 0;
let MAIN_TIMER_SECONDS = 0;
let MAIN_TIMER_INTERVAL;
let QUESTION_COUNTDOWN_SECONDS = 10;
let QUESTION_COUNTDOWN_INTERVAL;
let IS_CHALLENGER_MODE_SELECTED = false;
let questionsArray = [];

const savedNicknames = JSON.parse(localStorage.getItem("nickname")) || [];

async function startQuiz() {
  //Setting up the url for API
  let url = "https://the-trivia-api.com/api/questions?";

  let numberOfQuestions = numberOfQuestionsInput.value;

  NUMBER_OF_QUESTIONS = numberOfQuestions;

  let difficulty = difficultyInput.value;

  const checkedCheckboxes = document.querySelectorAll(
    ".category-checkbox:checked"
  );
  const checkedCategoriesArr = [];
  checkedCheckboxes.forEach((checkbox) => {
    checkedCategoriesArr.push(checkbox.value);
  });

  if (difficulty != "random") {
    if (checkedCategoriesArr.length > 0) {
      url += `categories=${checkedCategoriesArr.join(",")}`;
    }
    url += `&limit=${numberOfQuestions}&difficulty=${difficulty}`;
  } else {
    if (checkedCategoriesArr.length > 0) {
      url += `categories=${checkedCategoriesArr.join(",")}`;
    }
    url += `&limit=${numberOfQuestions}`;
  }

  //Fetching data and setting the questionsArray
  try {
    const response = await fetch(url);
    data = await response.json();
    questionsArray = data;
  } catch (error) {
    console.log("ERROR", error);
    document.body.removeChild(quizContainer);
    displayErrorMessage();
  }

  //Challenger mode
  if (challengerMode.checked) {
    IS_CHALLENGER_MODE_SELECTED = true;
    QUESTION_COUNTDOWN_SECONDS = 5;
  }

  startMenuContainer.style.display = "none";
  quizContainer.style.display = "block";

  saveNickname();

  displayQuestionAndAnswers();

  startMainTimer();
  startQuestionCountdown();
}

function displayQuestionAndAnswers() {
  let correctAnswer = questionsArray[INDEX_OF_QUESTION].correctAnswer;
  let incorrectAnswers = questionsArray[INDEX_OF_QUESTION].incorrectAnswers;
  let optionsList = [];

  optionsList.push(
    incorrectAnswers[0],
    incorrectAnswers[1],
    incorrectAnswers[2]
  );

  //Insert correctAnswer on a random index in optionsList array
  optionsList.splice(
    Math.floor(Math.random() * (incorrectAnswers.length + 1)),
    0,
    correctAnswer
  );

  questionDiv.innerText = `${CURRENT_QUESTION_NUMBER}. ${questionsArray[INDEX_OF_QUESTION].question}`;
  questionCategory.innerText = questionsArray[INDEX_OF_QUESTION].category;
  answerA.innerText = `${optionsList[0]}`;
  answerB.innerText = `${optionsList[1]}`;
  answerC.innerText = `${optionsList[2]}`;
  answerD.innerText = `${optionsList[3]}`;

  scoreDiv.innerText = `Score: ${SCORE_COUNTER}/${NUMBER_OF_QUESTIONS}`;

  checkAnswer();
  updateQuestionCountdown();
}

function displayNextQuestion() {
  resetQuestionCountdown();

  answersArray.forEach((button) => {
    button.style.backgroundColor = ""; //Reset bgColor of buttons on next question
  });

  CURRENT_QUESTION_NUMBER++;
  INDEX_OF_QUESTION++;

  if (INDEX_OF_QUESTION == NUMBER_OF_QUESTIONS) {
    stopMainTimer();
    stopQuestionCountdown();
    displayGameOverScreen();
  } else displayQuestionAndAnswers();
}

function checkAnswer() {
  answerA.addEventListener("click", clickAnswer, { once: true });
  answerB.addEventListener("click", clickAnswer, { once: true });
  answerC.addEventListener("click", clickAnswer, { once: true });
  answerD.addEventListener("click", clickAnswer, { once: true });
}

function clickAnswer() {
  if (this.innerText == questionsArray[INDEX_OF_QUESTION].correctAnswer) {
    SCORE_COUNTER++;
    this.style.backgroundColor = "green";
    playAudio("correct_answer.wav");
  } else {
    this.style.backgroundColor = "red";
    playAudio("incorrect_answer.wav");
    answersArray.forEach((button) => {
      if (button.innerText == questionsArray[INDEX_OF_QUESTION].correctAnswer)
        button.style.backgroundColor = "green";
    });
  }
  answersArray.forEach((button) => {
    button.removeEventListener("click", clickAnswer); //Prevents clicking multiple buttons
  });
  stopQuestionCountdown();

  timerAudio.pause();
  timerAudio.currentTime = 0;

  setTimeout(() => {
    MAIN_TIMER_SECONDS -= 2;
    displayNextQuestion();
  }, 2000);
}

function displayGameOverScreen() {
  const endMessage = document.querySelector("#end-message");
  quizContainer.style.display = "none";

  gameFinishedContainer.style.display = "block";

  finalScore.innerText = `Final Score: ${SCORE_COUNTER}/${NUMBER_OF_QUESTIONS}`;
  finalTime.innerText = `Total Time: ${MAIN_TIMER_SECONDS} seconds`;
}

function displayErrorMessage() {
  startMenuContainer.style.display = "none";
  quizContainer.style.display = "none";
  errorMessageContainer.style.display = "block";
}

// TIMER FUNCTIONS
function startMainTimer() {
  MAIN_TIMER_INTERVAL = setInterval(updateMainTimer, 1000);
}

function updateMainTimer() {
  MAIN_TIMER_SECONDS++;
}

function stopMainTimer() {
  clearInterval(MAIN_TIMER_INTERVAL);
}

function startQuestionCountdown() {
  QUESTION_COUNTDOWN_INTERVAL = setInterval(updateQuestionCountdown, 1000);
}

function updateQuestionCountdown() {
  if (QUESTION_COUNTDOWN_SECONDS >= 0) {
    timerDiv.innerText = `Time: ${QUESTION_COUNTDOWN_SECONDS}`;
    QUESTION_COUNTDOWN_SECONDS--;
    if (QUESTION_COUNTDOWN_SECONDS == 4) {
      timerAudio.play();
    }
  } else {
    stopQuestionCountdown();
    playAudio("incorrect_answer.wav");
    timerDiv.innerText = "TIME OUT";

    answersArray.forEach((button) => {
      if (button.innerText == questionsArray[INDEX_OF_QUESTION].correctAnswer) {
        button.style.backgroundColor = "green";
      } else {
        button.style.backgroundColor = "red";
      }
    });

    setTimeout(() => {
      MAIN_TIMER_SECONDS -= 2;
      displayNextQuestion();
    }, 2000);
  }
}

function resetQuestionCountdown() {
  clearInterval(QUESTION_COUNTDOWN_INTERVAL);

  if (IS_CHALLENGER_MODE_SELECTED == true) {
    QUESTION_COUNTDOWN_SECONDS = 5;
  } else {
    QUESTION_COUNTDOWN_SECONDS = 10;
  }

  startQuestionCountdown();
}

function stopQuestionCountdown() {
  clearInterval(QUESTION_COUNTDOWN_INTERVAL);
}

// MANAGING PREVIOUS NICKNAMES
(function updateDatalistAndShowNicknames() {
  savedNicknames.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    nicknamesList.appendChild(option);
  });
})();

function saveNickname() {
  const inputValue = nicknameInput.value.trim();

  if (inputValue && !savedNicknames.includes(inputValue)) {
    savedNicknames.push(inputValue);
    localStorage.setItem("nickname", JSON.stringify(savedNicknames));
  }
}

// AUDIO SETUP
const timerAudio = new Audio("audio/timer_ticking.wav");

function playAudio(audioName) {
  let audio = new Audio(`audio/${audioName}`);
  audio.play();
}

//

startButton.addEventListener(
  "click",
  () => {
    playAudio("start_button_click.wav");
    startQuiz();
  },
  { once: true }
);

//Display the slider input value on screen
numberOfQuestionsInput.addEventListener("input", () => {
  numberOfQuestionsInputDisplay.innerText = numberOfQuestionsInput.value;
});
