// components/VoiceSelector.jsx
import React from 'react';

const VoiceSelector = ({ voices, selectedVoice, setSelectedVoice }) => {
  return (
    <div className="voice-select">
      <label htmlFor="voiceSelect">Select Word Voice:</label>
      <select
        id="voiceSelect"
        value={selectedVoice?.name || ''}
        onChange={(e) => {
          const voice = voices.find(v => v.name === e.target.value);
          if (voice) {
            setSelectedVoice(voice);
          }
        }}
      >
        {voices.map((v, i) => (
          <option key={i} value={v.name}>
            {v.name} ({v.lang})
          </option>
        ))}
      </select>
    </div>
  );
};

export default VoiceSelector;
