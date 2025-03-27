import React from 'react';

const VoiceSelector = ({ voices, selectedVoice, setSelectedVoice }) => {
  return (
    <div className="voice-select">
      <label htmlFor="voiceSelect">TTS Voice:</label>
      <select
        id="voiceSelect"
        onChange={(e) => {
          const voice = voices.find(v => v.name === e.target.value);
          setSelectedVoice(voice);
        }}
        value={selectedVoice?.name || ''}
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
