import { useEffect, useRef, useState } from "react";
import ReactSpeedometer from "react-d3-speedometer";

const NEEDLE_DURATION = 900;

function easeQuadInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function SpeedGauge({
  value,
  max,
  poorMax,
  fairMax,
  unit = "Mbps",
}) {
  const displayValue =
    value === null || value === undefined ? 0 : Number(value.toFixed(2));

  const [resetKey, setResetKey] = useState(0);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const wasSet = prevValueRef.current !== null && prevValueRef.current !== undefined;
    const isNowNull = value === null || value === undefined;
    if (isNowNull && wasSet) {
      setResetKey((k) => k + 1);
    }
    prevValueRef.current = value;
  }, [value]);


  const [animatedValue, setAnimatedValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    if (displayValue === 0) {
      setAnimatedValue(0);
      return;
    }

    const from = 0;
    const to = displayValue;
    let start;

    const step = (timestamp) => {
      if (start === undefined) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / NEEDLE_DURATION, 1);
      setAnimatedValue(from + (to - from) * easeQuadInOut(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [displayValue, resetKey]);

  return (
    <div className="flex flex-col items-center">
      <ReactSpeedometer
        key={resetKey}
        value={displayValue}
        minValue={0}
        maxValue={max}
        width={250}
        height={150}
        fluidWidth={false}
        customSegmentStops={[0, poorMax, fairMax, max]}
        segmentColors={[
          "#22d3ee", 
          "#3b82f6", 
          "#22c55e", 
        ]}
        ringWidth={22}
        needleHeightRatio={0.72}
        needleColor="#22e6b8"
        needleTransitionDuration={NEEDLE_DURATION}
        needleTransition="easeQuadInOut"
        currentValueText={`${animatedValue.toFixed(2)} ${unit}`}
        valueTextFontSize="22px"
        textColor="#ffffff"
        labelFontSize="0px"
        customSegmentLabels={[]}
        paddingVertical={6}
      />
    </div>
  );
}