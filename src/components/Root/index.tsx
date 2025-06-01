import {
  usePDFDocumentParams,
  usePDFDocumentContext,
  PDFDocumentContext,
} from "@/lib/pdf/document";
import {
  useCreatePDFLinkService,
  PDFLinkServiceContext,
} from "@/lib/pdf/links";
import { useViewportContext, ViewportContext } from "@/lib/viewport";
import { forwardRef, HTMLProps } from "react";
import { Primitive } from "../Primitive";

export const Root = forwardRef(
  (
    {
      children,
      fileURL,
      loader,
      renderError,
      ...props
    }: Omit<HTMLProps<HTMLDivElement>, "children"> &
      usePDFDocumentParams & {
        loader?: React.ReactNode;
        renderError?: (error: unknown) => React.ReactNode;
        children: (
          error: unknown,
          ready: boolean,
          progress: number,
        ) => React.ReactNode;
      },
    ref,
  ) => {
    const { ready, progress, error, context, pdfDocumentProxy } =
      usePDFDocumentContext({
        fileURL,
      });
    const viewportContext = useViewportContext({});
    const linkService = useCreatePDFLinkService(
      pdfDocumentProxy,
      viewportContext,
    );

    return (
      <Primitive.div ref={ref} {...props}>
        <PDFDocumentContext.Provider value={context}>
          <ViewportContext.Provider value={viewportContext}>
            <PDFLinkServiceContext.Provider value={linkService}>
              {children(error, ready, progress)}
            </PDFLinkServiceContext.Provider>
          </ViewportContext.Provider>
        </PDFDocumentContext.Provider>
      </Primitive.div>
    );
  },
);
