import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useRef } from "react";

import { useDPR, useViewport, useVisibility } from "@/lib/viewport";

import { usePDFPage } from "../page";

export const useCanvasLayer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pdfPageProxy } = usePDFPage();
  const dpr = useDPR();
  const { visible } = useVisibility({ elementRef: canvasRef });
  const { zoom: bouncyZoom, rotation } = useViewport();
  const zoom = useDebounce(bouncyZoom, 100);
  const debouncedVisible = useDebounce(visible, 100);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const viewport = pdfPageProxy.getViewport({ scale: 1, rotation });
    const canvas = canvasRef.current;
    const outputScale = debouncedVisible ? dpr * zoom : 0.5;

    canvas.height = viewport.height * outputScale;
    canvas.width = viewport.width * outputScale;

    canvas.style.height = `${viewport.height}px`;
    canvas.style.width = `${viewport.width}px`;

    const canvasContext = canvas.getContext("2d")!;
    const transform =
      outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

    const renderingTask = pdfPageProxy.render({
      canvasContext: canvasContext,
      viewport,
      transform,
    });

    renderingTask.promise.catch((error) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.name === "RenderingCancelledException") {
        return;
      }

      throw error;
    });

    return () => {
      void renderingTask.cancel();
    };
  }, [pdfPageProxy, canvasRef.current, dpr, debouncedVisible, zoom, rotation]);

  return {
    canvasRef,
  };
};
