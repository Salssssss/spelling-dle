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
  const [letterResults, setLetterResults] = useState([]);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [alternateVoice, setAlternateVoice] = useState(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showNext, setShowNext] = useState(false);
  const inputRef = useRef(null);

  const currentWord = wordList[index];
  const score = results.filter(r => r === 'correct').length;
  const today = new Date(Date.now()).toISOString().split('T')[0]; 

  useEffect(() => {
    const loadVoices = () => {
      const updateVoices = () => {
        const all = speechSynthesis.getVoices();
        setVoices(all);
        if (!selectedVoice) setSelectedVoice(all.find(v => v.name.toLowerCase().includes('mark')) || all[0]);
        if (!alternateVoice) setAlternateVoice(all.find(v => v.name.toLowerCase().includes('female')) || all[0]);
      };
      speechSynthesis.onvoiceschanged = updateVoices;
      updateVoices();
    };
    loadVoices();
  }, []);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const res = await fetch(`/words/${today}.json`);
        if (!res.ok) throw new Error("Word list not found");
        const data = await res.json();
        setWordList(data);
        setResults(Array(data.length).fill(null));

        const saved = JSON.parse(localStorage.getItem('spellingGameResults'));
        if (saved?.date === today) {
          setResults(saved.results);
          setIndex(data.length);
          setAlreadyPlayed(true);
        }
      } catch (e) {
        console.error("❌ Failed to load words:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWords();
  }, [today]);

  useEffect(() => {
    if (currentWord) speak(currentWord.word);
    inputRef.current?.focus();
  }, [index]);

  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = selectedVoice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  };

  const handleSubmit = () => {
    const isCorrect = input.toLowerCase() === currentWord.word.toLowerCase();
    const updated = [...results];
    updated[index] = isCorrect ? 'correct' : 'incorrect';
    setResults(updated);
    setCorrect(isCorrect);
    setShowNext(true);

    const feedback = currentWord.word.split('').map((char, i) =>
      (input[i]?.toLowerCase() === char.toLowerCase() ? 'correct' : 'incorrect')
    );
    setLetterResults(feedback);
  };

  const handleNext = () => {
    setIndex(index + 1);
    setInput('');
    setCorrect(null);
    setLetterResults([]);
    setShowNext(false);
    if (index + 1 === wordList.length) {
      localStorage.setItem('spellingGameResults', JSON.stringify({ date: today, results }));
    }
  };

  const renderLetterRow = (letters, feedback = []) =>
    <div className="letter-row">
      {Array.from({ length: Math.max(letters.length, feedback.length) }).map((_, i) => (
        <span key={i} className={`letter-box ${feedback[i] || ''}`}>
          {letters[i] || '_'}
        </span>
      ))}
    </div>;

  if (isLoading) return <div className="game-container"><p>Loading...</p></div>;
  if (!wordList.length) return <div className="game-container"><p>No words found for today.</p></div>;

  return (
    <div className="app-wrapper">
      <div className="game-container">
        <h1>Spelling-dle</h1>
        {index < wordList.length && <p>Word {index + 1} of {wordList.length}</p>}

        {currentWord ? (
          <>
            {correct === null && (
              <>
                <p className="definition">“{currentWord.definition}”</p>
                <SentenceSpeaker
                  sentence={currentWord.sentence}
                  word={currentWord.word}
                  primaryVoice={selectedVoice}
                  alternateVoice={alternateVoice}
                />
                <input
                  className="text-input"
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Type your spelling..."
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
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
              </>
            )}
            {letterResults.length > 0 && (
              <div className="letter-feedback-rows">
                {renderLetterRow(input.split(''), letterResults)}
                {correct === false && renderLetterRow(currentWord.word.split(''), Array(currentWord.word.length).fill('correct'))}
              </div>
            )}
            {correct !== null && (
              <>
                <p className={correct ? "correct" : "incorrect"}>
                  {correct ? '✅ Correct!' : '❌ Incorrect.'}
                </p>
                {showNext && <button className="next" onClick={handleNext}>Next Word</button>}
              </>
            )}
          </>
        ) : (
          <div className="complete">
            <h2>🎉 Game Over!</h2>
            <p>Your Score: <strong>{score}</strong> / {wordList.length}</p>
            {alreadyPlayed && <p>You already played today's game.</p>}
            <button className="submit" onClick={async () => {
              try {
                await navigator.clipboard.writeText(`Spellingdle Score: ${score}/${wordList.length}`);
                alert("Copied to clipboard!");
              } catch {
                alert("Copy failed.");
              }
            }}>📋 Share Score</button>
          </div>
        )}
        <ProgressBar results={results} currentIndex={index} />
      </div>

      <a
        href="https://github.com/Salssssss/spelling-dle"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          textDecoration: 'none',
          color: '#555',
          fontSize: '30px'
        }}
      >
        GitHub ↗
      </a>
    </div>
  );
};

export default App;
