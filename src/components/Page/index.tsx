import { usePDFPageContext, PDFPageContext } from "@/lib/pdf/page";
import { usePageViewport, useViewport } from "@/lib/viewport";
import { HTMLProps, ReactNode, useRef } from "react";
import { Primitive } from "../Primitive";

export const Page = ({
  children,
  pageNumber = 1,
  style,
  ...props
}: HTMLProps<HTMLDivElement> & {
  children: ReactNode;
  pageNumber?: number;
}) => {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const { ready, context } = usePDFPageContext(pageNumber);
  const { rotation } = useViewport();

  usePageViewport({ pageContainerRef, pageNumber });

  const rotationAbs = Math.abs(rotation);
  const isPortrait = rotationAbs === 0 || rotationAbs === 180;

  return (
    <PDFPageContext.Provider value={context}>
      <Primitive.div
        ref={pageContainerRef}
        style={{
          display: ready ? "block" : "none",
        }}
      >
        {ready && (
          <div
            style={
              {
                ...style,
                "--scale-factor": 1,
                "--scale-round-x": "1px",
                "--scale-round-y": "1px",
                "--total-scale-factor": 1,
                position: "relative",
                width: `${
                  isPortrait
                    ? context.pdfPageProxy.view[2] -
                      context.pdfPageProxy.view[0]
                    : context.pdfPageProxy.view[3] -
                      context.pdfPageProxy.view[1]
                }px`,
                height: `${
                  isPortrait
                    ? context.pdfPageProxy.view[3] -
                      context.pdfPageProxy.view[1]
                    : context.pdfPageProxy.view[2] -
                      context.pdfPageProxy.view[0]
                }px`,
              } as React.CSSProperties
            }
            {...props}
          >
            {children}
          </div>
        )}
      </Primitive.div>
    </PDFPageContext.Provider>
  );
};
