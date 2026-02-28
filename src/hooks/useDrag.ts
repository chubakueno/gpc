import { useCallback, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
}

interface UseDragOptions {
  onDragStart?: (id: number) => void;
  onDragMove?: (id: number, pt: Point) => void;
  onDragEnd?: (sourceId: number, targetId: number | null) => void;
  hitTest?: (pt: Point, excludeId: number) => number | null;
}

interface UseDragReturn {
  dragSourceId: number | null;
  dragCurrentPt: Point | null;
  dragTargetId: number | null;
  isDragging: boolean;
  handleNodePointerDown: (id: number, e: React.PointerEvent<SVGElement>) => void;
  handleSvgPointerMove: (e: React.PointerEvent<SVGSVGElement>) => void;
  handleSvgPointerUp: (e: React.PointerEvent<SVGSVGElement>) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

function getSvgPoint(svg: SVGSVGElement, e: React.PointerEvent): Point {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: e.clientX, y: e.clientY };
  const svgPt = pt.matrixTransform(ctm.inverse());
  return { x: svgPt.x, y: svgPt.y };
}

export function useDrag(options: UseDragOptions = {}): UseDragReturn {
  const { onDragStart, onDragMove, onDragEnd, hitTest } = options;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragSourceId, setDragSourceId] = useState<number | null>(null);
  const [dragCurrentPt, setDragCurrentPt] = useState<Point | null>(null);
  const [dragTargetId, setDragTargetId] = useState<number | null>(null);
  const isDragging = dragSourceId !== null;
  const hasMoved = useRef(false);

  const handleNodePointerDown = useCallback(
    (id: number, e: React.PointerEvent<SVGElement>) => {
      e.stopPropagation();
      e.preventDefault();
      hasMoved.current = false;
      setDragSourceId(id);
      setDragTargetId(null);
      if (svgRef.current) {
        const pt = getSvgPoint(svgRef.current, e);
        setDragCurrentPt(pt);
        svgRef.current.setPointerCapture(e.pointerId);
      }
      onDragStart?.(id);
    },
    [onDragStart]
  );

  const handleSvgPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (dragSourceId === null || !svgRef.current) return;
      const pt = getSvgPoint(svgRef.current, e);
      setDragCurrentPt(pt);
      hasMoved.current = true;

      const target = hitTest ? hitTest(pt, dragSourceId) : null;
      setDragTargetId(target);
      onDragMove?.(dragSourceId, pt);
    },
    [dragSourceId, hitTest, onDragMove]
  );

  const handleSvgPointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (dragSourceId === null) return;
      if (svgRef.current) {
        try { svgRef.current.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      }
      const moved = hasMoved.current;
      const target = dragTargetId;
      setDragSourceId(null);
      setDragCurrentPt(null);
      setDragTargetId(null);
      hasMoved.current = false;

      if (moved) {
        onDragEnd?.(dragSourceId, target);
      } else {
        // Treat as a click (find operation)
        onDragEnd?.(dragSourceId, null);
      }
    },
    [dragSourceId, dragTargetId, onDragEnd]
  );

  return {
    dragSourceId,
    dragCurrentPt,
    dragTargetId,
    isDragging,
    handleNodePointerDown,
    handleSvgPointerMove,
    handleSvgPointerUp,
    svgRef,
  };
}
