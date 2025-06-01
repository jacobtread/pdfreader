import { HTMLProps } from "react";
import { Primitive } from "../Primitive";
import { useViewport } from "@/lib/viewport";

export const RotateClockwise = ({ ...props }: HTMLProps<HTMLButtonElement>) => {
  const { setRotation } = useViewport();

  return (
    <Primitive.button
      {...props}
      onClick={(e: any) => {
        props.onClick && props.onClick(e);
        setRotation((rotation) => Number((rotation + 90) % 360));
      }}
    />
  );
};

export const RotateAnticlockwise = ({
  ...props
}: HTMLProps<HTMLButtonElement>) => {
  const { setRotation } = useViewport();

  return (
    <Primitive.button
      {...props}
      onClick={(e: any) => {
        props.onClick && props.onClick(e);
        setRotation((rotation) => Number((rotation - 90) % 360));
      }}
    />
  );
};
