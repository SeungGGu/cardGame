document.addEventListener("DOMContentLoaded", () => {
  const difficultySelector = document.getElementById("difficulty"); // 난이도 선택기
  const startButton = document.getElementById("start-button"); // 게임 시작 버튼
  const resetButton = document.getElementById("restart-button"); // 게임 리셋 버튼
  const gameBoard = document.getElementById("game-board"); // 게임 보드
  const hint1Button = document.getElementById("hint1-button"); // 힌트 1 버튼
  const hint2Button = document.getElementById("hint2-button"); // 힌트 2 버튼

  let flipCount = 0;
  let score = 0; // 점수 변수 추가
  let timerInterval; // 타이머 변수 추가
  let elapsedTime = 0; // 경과 시간 변수 추가
  let isGameCompleted = false; // 게임 완료 여부 변수 추가
  let maxHint1Allowed = 0; // 힌트 1 최대 허용 횟수
  let maxHint2Allowed = 0; // 힌트 2 최대 허용 횟수
  let hintsRemaining; // 남은 힌트 수
  let cards = []; // 카드 배열
  let firstCard, secondCard; // 첫 번째 카드, 두 번째 카드
  let lockBoard = false; // 보드 잠금 상태
  let consecutiveMatches = 0; // 연속으로 맞춘 횟수
  let maxConsecutiveMatches = 0; // 최대 연속으로 맞춘 횟수
  let currentPlayer = 'player'; // 현재 플레이어 ('player' 또는 'computer')
  let matchedPairs = 0; // 매칭된 카드 쌍의 수

  let cardImages = []; // 카드 이미지 배열
  
  for (let i = 1; i <= 20; i++) {
    cardImages.push(`images/animal${i}.jpg`); // images 폴더에 있는 animal1.jpg ~ animal20.jpg까지 추가
  }

  // 난이도 설정
  let difficultySettings = {
    easy: { numCards: 20, hints: { hint1: 5, hint2: 3 }, columns: 5 },
    medium: { numCards: 20, hints: { hint1: 3, hint2: 0 }, columns: 5 },
    hard: { numCards: 40, hints: { hint1: 0, hint2: 0 }, columns: 10 },
  };

  // 게임 시작 함수
  function startGame() {
    const difficulty = difficultySelector.value; // 선택된 난이도
    const settings = difficultySettings[difficulty]; // 난이도 설정값
    hintsRemaining = settings.hints.hint1; // 힌트 1 횟수 설정
    maxHint1Allowed = settings.hints.hint1; // 힌트 1 최대 허용 횟수 설정
    maxHint2Allowed = settings.hints.hint2; // 힌트 2 최대 허용 횟수 설정
    elapsedTime = 0; // 경과 시간 초기화
    cards = generateCards(settings.numCards); // 카드 생성
    shuffle(cards); // 카드 섞기
    renderGameBoard(cards, settings.columns); // 게임 보드 렌더링
    resetBoard(); // 보드 상태 초기화
    updateHintsVisibility(); // 힌트 버튼 가시성 업데이트
    consecutiveMatches = 0; // 연속으로 맞춘 횟수 초기화
    currentPlayer = 'player'; // 게임 시작 시 플레이어 턴

    if (difficulty === "hard") {
      showAllCardsFor3Seconds();
    }

    startTimer(); // 타이머 시작

    // 게임 시작 시 남은 힌트 횟수 업데이트
    document.getElementById("hint1-count").textContent = `남은 횟수: ${maxHint1Allowed}`;
    document.getElementById("hint2-count").textContent = `남은 횟수: ${maxHint2Allowed}`;
  }

  function showAllCardsFor3Seconds() {
    const allCards = document.querySelectorAll(".card");
    allCards.forEach((card) => {
      card.classList.add("flipped");
    });

    setTimeout(() => {
      allCards.forEach((card) => {
        card.classList.remove("flipped");
      });
    }, 3000);
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      elapsedTime++;
      timerDisplay.textContent = elapsedTime;
    }, 1000);
  }

  function generateCards(num) {
    let cardPairs = [];
    for (let i = 0; i < num / 2; i++) {
      cardPairs.push(cardImages[i], cardImages[i]); // 각 카드 이미지의 쌍을 추가
    }
    return cardPairs;
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // 배열 요소 교환
    }
  }

  function renderGameBoard(cards, numColumns) {
    gameBoard.innerHTML = ""; // 보드 초기화
    gameBoard.style.gridTemplateColumns = `repeat(${numColumns}, 120px)`; // 보드 그리드 설정
    cards.forEach((src, index) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.index = index;

      const img = document.createElement("img");
      img.src = src;
      card.appendChild(img);

      card.addEventListener("click", () => flipCard(card)); // 카드 클릭 이벤트 추가
      gameBoard.appendChild(card);
    });
  }

  function flipCard(card) {
    if (lockBoard || card.classList.contains("flipped")) return; // 보드가 잠겨있거나 이미 뒤집힌 카드일 경우 리턴

    card.classList.add("flipped");
    flipCount++;
    document.getElementById("flip-count").textContent = `카드를 뒤집은 횟수: ${flipCount}`; // 카드 뒤집은 횟수 표시
    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    lockBoard = true;
    checkForMatch();
  }

  function checkForMatch() {
    let isMatch = firstCard.querySelector("img").src === secondCard.querySelector("img").src;

    if (isMatch) {
      score += 100; // 정답을 맞춘 경우 점수 추가
      matchedPairs++; // 매칭된 카드 쌍 수 증가
      const answerMessage = document.getElementById("answer-message");
      answerMessage.textContent = "정답!";
      document.getElementById("scoreDisplay").textContent = score; // 점수 표시 업데이트
      setTimeout(() => {
        answerMessage.textContent = ""; // 일정 시간 후 메시지를 지웁니다.
      }, 1000);
      disableCards(); // 매칭된 카드 비활성화
      consecutiveMatches++;
      if (consecutiveMatches > maxConsecutiveMatches) {
        maxConsecutiveMatches = consecutiveMatches;
      }
      document.getElementById("match-count").textContent = consecutiveMatches;
      if (currentPlayer === 'player') {
        playerTurn();
      } else {
        computerTurn();
      }
      checkGameCompletion(); // 게임 완료 체크
    } else {
      score -= 100; // 오답일 경우 100점 감점
      const answerMessage = document.getElementById("answer-message");
      answerMessage.textContent = "오답!";
      document.getElementById("scoreDisplay").textContent = score; // 점수 표시 업데이트
      setTimeout(() => {
        answerMessage.textContent = ""; // 일정 시간 후 메시지를 지웁니다.
      }, 1000);
      unflipCards(); // 뒤집기 취소
      consecutiveMatches = 0; // 연속으로 맞춘 횟수 초기화
      currentPlayer = currentPlayer === 'player' ? 'computer' : 'player'; // 턴 전환
      if (currentPlayer === 'computer') {
        setTimeout(computerTurn, 1500); // 컴퓨터 턴 시작
      }
    }
  }

  function disableCards() {
    firstCard.removeEventListener("click", flipCard); // 첫 번째 카드 이벤트 제거
    secondCard.removeEventListener("click", flipCard); // 두 번째 카드 이벤트 제거
    resetBoard(); // 보드 상태 초기화
  }

  function unflipCards() {
    setTimeout(() => {
      firstCard.classList.remove("flipped"); // 첫 번째 카드 뒤집기 취소
      secondCard.classList.remove("flipped"); // 두 번째 카드 뒤집기 취소
      resetBoard();
      if (currentPlayer === 'player') {
        playerTurn();
      } else {
        computerTurn();
      }
    }, 1500);
  }

  function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
  }

  function playerTurn() {
    updateHintsVisibility(); // 힌트 버튼 가시성 업데이트
    document.getElementById("current-player").textContent = "플레이어 턴";
  }

  function computerTurn() {
    document.getElementById("current-player").textContent = "컴퓨터 턴";
    let availableCards = Array.from(document.querySelectorAll(".card:not(.flipped)"));
    let randomIndex = Math.floor(Math.random() * availableCards.length);
    let selectedCard = availableCards[randomIndex];
    selectedCard.click();
    setTimeout(() => {
      randomIndex = Math.floor(Math.random() * availableCards.length);
      selectedCard = availableCards[randomIndex];
      selectedCard.click();
    }, 1000);
  }

  function useHint1() {
    if(flipCount >= 9){
        if (maxHint1Allowed > 0 && firstCard) {
            if (maxHint1Allowed > 0 && firstCard) {
              const firstCardIndex = parseInt(firstCard.dataset.index);
              const settings = difficultySettings[difficultySelector.value];
              const numColumns = settings.columns;
              const selectedRow = Math.floor(firstCardIndex / numColumns) + 1;
              const selectedImage = cards[firstCardIndex];
      
              let matchRow = null;
              for (let i = 0; i < cards.length; i++) {
                const currentRow = Math.floor(i / numColumns) + 1;
                const currentImage = cards[i];
                if (currentRow !== selectedRow && currentImage === selectedImage) {
                  matchRow = currentRow;
                  break;
                }
              }
      
              if (matchRow !== null) {
                alert(`같은 그림의 카드는 ${matchRow}행에 있습니다.`);
                score -= 300; // 힌트를 사용하여 맞출 경우 300점 감점
                document.getElementById("scoreDisplay").textContent = score;
                maxHint1Allowed--;
                document.getElementById("hint1-count").textContent = `남은 횟수: ${maxHint1Allowed}`;
                updateHintsVisibility();
              } else {
                alert(`같은 그림의 카드가 동일한 행에 있습니다.`);
              }
            } else {
              alert(`힌트를 모두 사용하셨습니다.`);
              hint1Button.disabled = true;
            }
          } else {
            alert(`카드를 뒤집은 후에 힌트를 사용할 수 있습니다.`);
          }
    } else {
      alert(`카드를 9번 뒤집은 이후에 힌트를 사용할 수 있습니다.`);
    }
  }

  function useHint2() {
    if (flipCount >= 9) {
      if (maxHint2Allowed > 0) {
        let unflippedCards = Array.from(document.querySelectorAll(".card:not(.flipped)"));
        let matchFound = false;
        for (let i = 0; i < unflippedCards.length - 1; i++) {
          for (let j = i + 1; j < unflippedCards.length; j++) {
            if (unflippedCards[i].querySelector("img").src === unflippedCards[j].querySelector("img").src) {
              unflippedCards[i].classList.add("hint-flip");
              unflippedCards[j].classList.add("hint-flip");
              setTimeout(() => {
                unflippedCards[i].classList.remove("hint-flip");
                unflippedCards[j].classList.remove("hint-flip");
              }, 1500);
              matchFound = true;
              break;
            }
          }
          if (matchFound) break;
        }
        score -= 300; // 힌트를 사용하여 맞출 경우 300점 감점
        document.getElementById("scoreDisplay").textContent = score;
        maxHint2Allowed--;
        document.getElementById("hint2-count").textContent = `남은 횟수: ${maxHint2Allowed}`;
        updateHintsVisibility();
      } else {
        alert(`힌트를 모두 사용하셨습니다.`);
        hint2Button.disabled = true;
      }
    } else {
      alert(`카드를 9번 뒤집은 이후에 힌트를 사용할 수 있습니다.`);
    }
  }

  function updateHintsVisibility() {
    hint1Button.disabled = maxHint1Allowed <= 0 || flipCount < 9;
    hint2Button.disabled = maxHint2Allowed <= 0 || flipCount < 9;
    console.log(`남은 힌트1: ${maxHint1Allowed}`);
    console.log(`남은 힌트2: ${maxHint2Allowed}`);
  }

  startButton.addEventListener("click", startGame);
  hint1Button.addEventListener("click", useHint1);
  hint2Button.addEventListener("click", useHint2);
  resetButton.addEventListener("click", () => {
    location.reload(); // 새로고침
  });

  function checkGameCompletion() {
    if (matchedPairs === (cards.length / 2)) {
      clearInterval(timerInterval); // 타이머 중지
      isGameCompleted = true; // 게임 완료 상태로 설정
      alert(`게임이 완료되었습니다! 총 경과 시간: ${elapsedTime}초`);
      location.reload(); // 새로고침
    }
  }
});
