import React, { useEffect, useRef, useState } from 'react';
import './styles.css';
import ProgressBar from './components/ProgressBar';
import SentenceSpeaker from './components/SentenceSpeaker';
import VoiceSelector from './components/VoiceSelector';


const App = () => {
  const [wordList, setWordList] = useState([]);
  const [results, setResults] = useState([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [letterResults, setLetterResults] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [alternateVoice, setAlternateVoice] = useState(null);


  const inputRef = useRef(null);

  const currentWord = wordList.length > 0 ? wordList[index] : null;
  const score = results.filter(r => r === 'correct').length;

  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  
  useEffect(() => {
    const loadVoices = () => {
      const tryLoad = () => {
        const allVoices = speechSynthesis.getVoices();
        if (allVoices.length > 0) {
          setVoices(allVoices);
  
          // Fallbacks if no voices are pre-selected
          if (!selectedVoice) {
            const mark = allVoices.find(v => v.name.toLowerCase().includes('mark'));
            setSelectedVoice(mark || allVoices[0]);
          }
  
          if (!alternateVoice) {
            const female = allVoices.find(v => v.name.toLowerCase().includes('female'));
            setAlternateVoice(female || allVoices[0]);
          }
        }
      };
  
      // Always listen to voiceschanged, even if voices already exist
      speechSynthesis.onvoiceschanged = tryLoad;
      tryLoad();
    };
  
    loadVoices();
  }, []);
  
  
  

  useEffect(() => {
    const fetchWords = async () => {
      const today = getTodayDateString();
      try {
        const response = await fetch(`/words/${today}.json`);
        if (!response.ok) throw new Error("Word list not found");
        const data = await response.json();
        setWordList(data);
        setResults(Array(data.length).fill(null));

        // Check if player already played today
        const saved = JSON.parse(localStorage.getItem('spellingGameResults'));
        if (saved?.date === today) {
          setResults(saved.results);
          setIndex(data.length); // jump to results
          setAlreadyPlayed(true);
        }
      } catch (err) {
        console.error("❌ Failed to load word list:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWords();
  }, []);

  useEffect(() => {
    if (currentWord) speak(currentWord.word);
    if (inputRef.current) inputRef.current.focus();
  }, [index]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const getShareMessage = () => {
    const emojiBoxes = results.map(r => {
      if (r === 'correct') return '🟩';
      if (r === 'incorrect') return '🟥';
      return '⬜';
    }).join('');
    return `Spellingdle Score: ${score}/${wordList.length}\n${emojiBoxes}`;
  };

  const handleShare = async () => {
    try {
      const message = getShareMessage();
      await navigator.clipboard.writeText(message);
      alert("Score copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Copy failed. Try manually.");
    }
  };

  const handleSubmit = () => {
    const isCorrect = input.toLowerCase() === currentWord.word.toLowerCase();
    const updatedResults = [...results];
    updatedResults[index] = isCorrect ? 'correct' : 'incorrect';
    setResults(updatedResults);
    setCorrect(isCorrect);
  
    // Letter-by-letter comparison
    const word = currentWord.word;
    const feedback = word.split('').map((char, i) => {
      const userChar = input[i] || '';
      return userChar.toLowerCase() === char.toLowerCase() ? 'correct' : 'incorrect';
    });
    setLetterResults(feedback);
  
    // After short delay, go to next word
    setTimeout(() => {
      setLetterResults([]);
      setInput('');
      setIndex(index + 1);
  
      if (index + 1 === wordList.length) {
        const today = getTodayDateString();
        localStorage.setItem('spellingGameResults', JSON.stringify({
          date: today,
          results: updatedResults
        }));
      }
    }, 2000); // 2s delay
  };
  

  if (isLoading) {
    return (
      <div className="app-wrapper">
        <div className="game-container">
          <p>Loading today's word list...</p>
        </div>
      </div>
    );
  }

  if (wordList.length === 0) {
    return (
      <div className="app-wrapper">
        <div className="game-container">
          <p>No word list found for today. Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <div className="game-container">
        <h1>Spelling-dle</h1>

        {index < wordList.length && (
          <p>Word {index + 1} of {wordList.length}</p>
        )}

        {currentWord ? (
          <>
            <p className="definition">“{currentWord.definition}”</p>
            <SentenceSpeaker
              sentence={currentWord.sentence}
              word={currentWord.word}
              primaryVoice={selectedVoice}      // Mark
              alternateVoice={alternateVoice}   // Zira/Female
            />

            <input
              className="text-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              placeholder="Type your spelling..."
              ref={inputRef}
            />
            <div className="button-group">
              <button className="submit" onClick={handleSubmit}>Submit</button>
              <button className="audio" onClick={() => speak(currentWord.word)}>🔊 Hear Word</button>
            </div>
            <VoiceSelector
              voices={voices}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
            />
            {letterResults.length > 0 && (
              <div className="letter-feedback">
                {currentWord.word.split('').map((char, i) => (
                  <span
                    key={i}
                    className={`letter-box ${letterResults[i]}`}
                  >
                    {input[i] || '_'}
                  </span>
                ))}
              </div>
            )}


            {correct === true && <p className="correct">✅ Correct!</p>}
            {correct === false && <p className="incorrect">❌ Incorrect.</p>}
          </>
        ) : (
          <div className="complete">
            <h2>🎉 Game Over!</h2>
            <p>Your Score: <strong>{score}</strong> / {wordList.length}</p>
            {alreadyPlayed && <p>You already played today's game.</p>}
            <button className="submit" onClick={handleShare}>📋 Share Score</button>
          </div>
        )}

        <ProgressBar results={results} currentIndex={index} />
      </div>
    </div>
  );
};

export default App;
