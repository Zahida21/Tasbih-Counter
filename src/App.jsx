import { useEffect, useMemo, useState } from "react";
import { FiSliders, FiRotateCcw, FiChevronLeft } from "react-icons/fi";
import { MdVibration } from "react-icons/md";
import "./styles.css";

export default function App() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(1000);

  const [showSheet, setShowSheet] = useState(false);
  const [selected, setSelected] = useState(1000); // temp selection in sheet
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const [vibrateOnTarget, setVibrateOnTarget] = useState(true);
  const [didVibrateForThisTarget, setDidVibrateForThisTarget] = useState(false);

  const reachedTarget = useMemo(() => count >= target, [count, target]);

  useEffect(() => {
    // Reset “already vibrated” whenever target changes
    setDidVibrateForThisTarget(false);
  }, [target]);

  function vibrate(pattern = [150, 100, 200]) {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // silently ignore (desktop / unsupported browsers)
    }
  }

  function handleTap() {
    if (reachedTarget) return; // stop counting beyond target
    const next = count + 1;
    setCount(next);

    if (vibrateOnTarget && next === target && !didVibrateForThisTarget) {
      vibrate([180, 100, 280]);
      setDidVibrateForThisTarget(true);
    }
  }

  function handleReset() {
    setCount(0);
    setDidVibrateForThisTarget(false);
  }

  function openTargetSheet() {
    setSelected(target);
    setCustomMode(false);
    setCustomValue("");
    setShowSheet(true);
  }

  function applyTarget() {
    let newTarget;
    if (customMode) {
      const parsed = parseInt(customValue, 10);
      newTarget = Number.isFinite(parsed) && parsed > 0 ? parsed : 33;
    } else {
      newTarget = selected;
    }
    setTarget(newTarget);
    setCount(0);
    setDidVibrateForThisTarget(false);
    setShowSheet(false);
  }

  return (
    <div className="app">
      {/* Top bar */}
      <header className="topbar">
        <button className="back-btn" aria-label="Back" title="Back">
          <FiChevronLeft size={22} />
        </button>
        <h1 className="title">Tasbih Counter</h1>
        <div style={{ width: 22 }} />{/* spacer */}
      </header>

      {/* Actions row */}
      <div className="actions">
        <button
          className="icon-btn"
          onClick={openTargetSheet}
          aria-label="Set target"
          title="Set target"
        >
          <FiSliders size={22} />
        </button>

        <button
          className="icon-btn"
          onClick={handleReset}
          aria-label="Reset"
          title="Reset"
        >
          <FiRotateCcw size={22} />
        </button>

        <button
          className={`icon-btn ${vibrateOnTarget ? "active" : ""}`}
          onClick={() => setVibrateOnTarget((v) => !v)}
          aria-pressed={vibrateOnTarget}
          aria-label="Vibrate on target"
          title="Vibrate on target"
        >
          <MdVibration size={22} />
        </button>
      </div>

      {/* Target label */}
      <div className="target-wrap">
        <div className="target-icon" aria-hidden>🏁</div>
        <div className="target-title">TARGET</div>
        <div className="target-value">{target}</div>
      </div>

      {/* Tap circle */}
      <div className="tap-wrap">
        <button
          className={`tap-ring ${reachedTarget ? "done" : ""}`}
          onClick={handleTap}
          aria-label="Tap to count"
        >
          <div className="tap-inner">
            {reachedTarget ? (
              <span className="tap-text">Completed</span>
            ) : (
              <span className="tap-text">Tap Here</span>
            )}
            <div className="count">
              {count} / {target}
            </div>
          </div>
        </button>
      </div>

      {/* Target selection sheet */}
      {showSheet && (
        <>
          <div className="backdrop" onClick={() => setShowSheet(false)} />
          <div className="sheet" role="dialog" aria-modal="true">
            <div className="sheet-title">Select Amount</div>
            <div className="sheet-subtitle">
              Select how many times you’d like to count
            </div>

            <div className="grid">
              {[
                { label: "33", value: 33 },
                { label: "100", value: 100 },
                { label: "1000", value: 1000 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`pill ${!customMode && selected === opt.value ? "selected" : ""}`}
                  onClick={() => {
                    setCustomMode(false);
                    setSelected(opt.value);
                  }}
                >
                  {opt.label}
                </button>
              ))}

              <button
                className={`pill ${customMode ? "selected" : ""}`}
                onClick={() => setCustomMode(true)}
              >
                Custom
              </button>
            </div>

            {customMode && (
              <div className="custom-row">
                <input
                  className="custom-input"
                  type="number"
                  min="1"
                  placeholder="Enter a number"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                />
              </div>
            )}

            <button className="primary" onClick={applyTarget}>
              DONE
            </button>
          </div>
        </>
      )}

      {/* Footer note for vibration support */}
      <footer className="footnote">
        {typeof navigator !== "undefined" && "vibrate" in navigator
          ? "Vibration supported on this device."
          : "Note: Vibration works on most Android browsers over HTTPS."}
      </footer>
    </div>
  );
}
