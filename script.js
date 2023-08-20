const area = document.querySelector(".area");
const areaBoxes = document.querySelectorAll(".area-box");
const WORD_URL = "https://words.dev-apis.com/word-of-the-day";
const POST_URL = "https://words.dev-apis.com/validate-word";
const max = areaBoxes.length;
const ANSWER_LENGTH = 5;

let counterX = 0;
let letterBox = [];
let deleteMax = 0;
let winState = false;

function init() {
  document.querySelector("body").addEventListener("keydown", wordleOperation);
}

init();

async function wordleOperation(event) {
  const key = event.key;
  if (
    (counterX === 0) |
      (counterX % ANSWER_LENGTH !== 0) |
      (letterBox.length === 0) &&
    isLetter(key)
  ) {
    placeLetter(counterX, key);
  } else if (isActionKey(key) === 0) {
    if (!(deleteMax >= counterX)) {
      if (counterX > 0) {
        if (counterX % ANSWER_LENGTH === 0) {
          removeClass("invalid");
        }
        deleteLetter();
      }
    }
  } else if (isActionKey(key) === 1 && letterBox.length === ANSWER_LENGTH) {
    if (!winState) {
      const word = letterBox.join("").toLowerCase();
      const validStatus = await validateWord(word);
      const wordle = await getWord();

      if (validStatus) {
        if (isWordleEqual(word, wordle)) {
          addClass("correct");
          winState = true;
          addNotification("win");
        } else {
          compareTheWords(word, wordle);
          letterBox = [];
        }
        deleteMax = counterX;
        addNotification("lose", wordle);
      } else {
        addClass("invalid");
      }
    }
  }
}

async function getWord() {
  const promise = await fetch(WORD_URL);
  const processedResponse = await promise.json();
  return processedResponse.word;
}

async function validateWord(wordle) {
  const wordObj = {
    word: wordle,
  };

  const promise = await fetch(POST_URL, {
    method: "POST",
    body: JSON.stringify(wordObj),
  });

  const processedResponse = await promise.json();
  return processedResponse.validWord;
}

function placeLetter(counter, letter) {
  if (counter < max) {
    areaBoxes[counter].innerText = letter.toUpperCase();
    letterBox.push(letter.toUpperCase());
    counterX += 1;
  }
}

function isActionKey(key) {
  if (key === "Backspace") {
    return 0;
  } else if (key === "Enter") {
    return 1;
  }
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function addClass(cls) {
  for (let i = counterX - ANSWER_LENGTH; i < counterX; i++) {
    areaBoxes[i].classList.add(cls);
  }
}

function removeClass(cls) {
  for (let i = counterX - ANSWER_LENGTH; i < counterX; i++) {
    areaBoxes[i].classList.remove(cls);
  }
}

function deleteLetter() {
  areaBoxes[counterX - 1].innerText = "";
  letterBox.pop();
  counterX -= 1;
}

function isWordleEqual(word, wordle) {
  if (word === wordle) {
    return true;
  }
  return false;
}

function addNotification(gameCondition, wordle = "wordle") {
  const notification = document.querySelector(".notification");

  if (gameCondition.toLowerCase() === "lose") {
    if (counterX === 30 && winState === false) {
      notification.innerHTML = `<p>You Lose. The word is <b>${wordle}</b></p>`;
      notification.classList.add("lose");
    }
  } else if (gameCondition.toLowerCase() === "win") {
    notification.innerHTML = `<p>You win</p>`;
    notification.classList.add("win");
  }
}

function letterMap(word) {
  let map = {};
  let wordLen = word.length;

  for (let i = 0; i < wordLen; i++) {
    const letter = word[i];
    if (map[letter]) {
      map[letter] += 1;
    } else {
      map[letter] = 1;
    }
  }

  return map;
}

function compareTheWords(word, wordle) {
  let wordMap = letterMap(wordle);
  console.log(wordMap);

  for (let i = 0; i < ANSWER_LENGTH; i++) {
    if (word[i] === wordle[i]) {
      console.log(word[i], wordle[i]);
      areaBoxes[counterX - ANSWER_LENGTH + i].classList.add("correct");
      wordMap[word[i]] -= 1;
      console.log(wordMap);
    }
  }

  for (let i = 0; i < ANSWER_LENGTH; i++) {
    if (word[i] === wordle[i]) {
      //       do nothing. same as in previous for loop
    } else if (wordle.includes(word[i]) && wordMap[word[i]] > 0) {
      areaBoxes[counterX - ANSWER_LENGTH + i].classList.add("close");
      wordMap[word[i]] -= 1;
    } else {
      areaBoxes[counterX - ANSWER_LENGTH + i].classList.add("incorrect");
    }
  }
}
