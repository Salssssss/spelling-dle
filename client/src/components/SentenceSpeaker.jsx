import React from 'react';

const SentenceSpeaker = ({ sentence, word, primaryVoice, alternateVoice, label = "🔊 Hear Sentence" }) => {
  const speakMixed = () => {
    if (!sentence || !word) return;

    const lowerSentence = sentence.toLowerCase();
    const lowerWord = word.toLowerCase();
    const wordIndex = lowerSentence.indexOf(lowerWord);

    if (wordIndex === -1) {
      // fallback if word not found — just read sentence
      const fallback = new SpeechSynthesisUtterance(sentence);
      fallback.voice = alternateVoice;
      speechSynthesis.cancel();
      speechSynthesis.speak(fallback);
      return;
    }

    const before = sentence.slice(0, wordIndex);
    const mid = sentence.slice(wordIndex, wordIndex + word.length);
    const after = sentence.slice(wordIndex + word.length);

    const utterBefore = new SpeechSynthesisUtterance(before);
    utterBefore.voice = alternateVoice;

    const utterWord = new SpeechSynthesisUtterance(mid);
    utterWord.voice = primaryVoice;

    const utterAfter = new SpeechSynthesisUtterance(after);
    utterAfter.voice = alternateVoice;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterBefore);
    speechSynthesis.speak(utterWord);
    speechSynthesis.speak(utterAfter);
  };

  return (
    <button className="audio" onClick={speakMixed}>
      {label}
    </button>
  );
};

export default SentenceSpeaker;
