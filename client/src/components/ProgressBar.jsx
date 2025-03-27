import React from 'react';

const ProgressBar = ({ results, currentIndex }) => {
  return (
    <div className="progress-bar">
      {results.map((result, i) => (
        <div
          key={i}
          className={`step ${i === currentIndex ? 'active' : ''} ${result === 'correct' ? 'correct' : ''} ${result === 'incorrect' ? 'incorrect' : ''}`}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
