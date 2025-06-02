import {
  getDocument,
  GlobalWorkerOptions,
  OnProgressParameters,
  PDFDocumentProxy,
} from "pdfjs-dist";
// @ts-expect-error Vite Worker
import PDFWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url&inline";
import {
  DocumentInitParameters,
  RefProxy,
  TypedArray,
} from "pdfjs-dist/types/src/display/api";
import { createContext, useContext, useEffect, useState } from "react";

/**
 * General setup for pdf.js
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
GlobalWorkerOptions.workerSrc = PDFWorker;

/**
 * Load a document
 */
export interface usePDFDocumentParams {
  /**
   * The URL of the PDF file to load.
   */
  fileURL: FileURL;
}

export type FileURL =
  | string
  | URL
  | TypedArray
  | ArrayBuffer
  | DocumentInitParameters;

export const usePDFDocumentContext = ({ fileURL }: usePDFDocumentParams) => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [progress, setProgress] = useState(0);
  const [pdfDocumentProxy, setPdfDocumentProxy] =
    useState<PDFDocumentProxy | null>(null);

  useEffect(() => {
    setReady(false);
    setProgress(0);

    const loadingTask = getDocument(fileURL);

    loadingTask.onProgress = (progressEvent: OnProgressParameters) => {
      // Added to dedupe state updates when the file is fully loaded
      if (progressEvent.loaded === progressEvent.total) {
        return;
      }

      setProgress(progressEvent.loaded / progressEvent.total);
    };

    loadingTask.promise.then(
      (proxy) => {
        setPdfDocumentProxy(proxy);
        setProgress(1);
        setReady(true);
        setError(null);
      },
      (error) => {
        setProgress(0);
        setReady(false);
        setError(error);
      },
    );

    return () => {
      void loadingTask.destroy();
    };
  }, [fileURL]);

  return {
    context: {
      pdfDocumentProxy,
      async getDestinationPage(dest: string | unknown[] | Promise<unknown[]>) {
        if (!pdfDocumentProxy) return;
        let explicitDest: unknown[] | null;

        if (typeof dest === "string") {
          explicitDest = await pdfDocumentProxy.getDestination(dest);
        } else if (Array.isArray(dest)) {
          explicitDest = dest;
        } else {
          explicitDest = await dest;
        }

        if (!explicitDest) {
          return;
        }

        const explicitRef = explicitDest[0] as RefProxy;

        const page = await pdfDocumentProxy.getPageIndex(explicitRef);

        return page;
      },
      ready,
      error,
    } satisfies PDFDocumentContextType,
    ready,
    progress,
    error,
    pdfDocumentProxy,
  };
};

export interface PDFDocumentContextType {
  pdfDocumentProxy: PDFDocumentProxy | null;
  getDestinationPage: (
    dest: string | unknown[] | Promise<unknown[]>,
  ) => Promise<number | undefined>;
  ready: boolean;
  error: unknown;
}

export const defaultPDFDocumentContext: PDFDocumentContextType = {
  pdfDocumentProxy: null,
  getDestinationPage: async () => {
    return undefined;
  },
  ready: false,
  error: null,
} satisfies PDFDocumentContextType;

export const PDFDocumentContext = createContext(defaultPDFDocumentContext);

export const usePDFDocument = () => {
  return useContext(PDFDocumentContext);
};
