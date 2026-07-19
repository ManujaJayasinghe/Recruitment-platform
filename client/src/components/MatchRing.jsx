const MatchRing = ({ score, size = 48, strokeWidth = 4 }) => {
  // Normalize score to 0-100
  const normalizedScore = Math.min(Math.max(score || 0, 0), 100);
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedScore / 100) * circumference;
  
  // Interpolate color from primary (low) to accent (high)
  const getStrokeColor = (score) => {
    if (score >= 80) return '#C08A2E'; // accent
    if (score >= 50) return '#14532D'; // primary
    return '#14532D'; // primary for low scores
  };
  
  return (
    <div className="inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E4E0"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor(normalizedScore)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease',
          }}
        />
      </svg>
      
      {/* Percentage text */}
      <div
        className="absolute numeric text-sm font-semibold"
        style={{ color: '#12181B' }}
      >
        {Math.round(normalizedScore)}%
      </div>
    </div>
  );
};

export default MatchRing;
