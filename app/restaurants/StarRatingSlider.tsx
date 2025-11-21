import { Star } from "lucide-react";
import { useRef, useState, useCallback } from "react";

type StarRatingSliderProps = {
  size: number;
  value?: number; // 0 ~ 5
  onChange?: (value: number) => void;
};

export function StarRatingSlider({
  size = 28,
  value,
  onChange,
}: StarRatingSliderProps) {
  const [internalValue, setInternalValue] = useState(value ?? 0);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const current = value ?? internalValue;

  const updateValueFromClientX = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const ratio = Math.min(
        Math.max((clientX - rect.left) / rect.width, 0),
        1
      ); // 0~1
      const raw = ratio * 5;
      const stepped = Math.round(raw * 2) / 2; // 0.5 단위

      setInternalValue(stepped);
      onChange?.(stepped);
    },
    [onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // 이게 있어야 밖으로 드래그해도 계속 move 이벤트가 들어옴
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateValueFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateValueFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={containerRef}
      className="inline-block relative text-3xl cursor-pointer select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="flex items-center gap-2 flex-row">
        {/* 회색 별 5개 (배경) */}
        <div className="text-slate-300">
          <div className="flex flex-row gap-0.25">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={size}
                strokeWidth={1.5}
                color="hsla(0, 0%, 25%, 0.5)"
              />
            ))}
          </div>
        </div>

        {/* 노란 별 5개 (앞 레이어, width로 잘라서 표시) */}
        <div
          className="absolute left-0 top-0 overflow-hidden"
          style={{ width: `${(current / 5) * 100}%` }}
        >
          <div className="flex flex-row text-yellow-400 w-max shrink-0 gap-0.25">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={size} strokeWidth={3} color="#ff853eff" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
