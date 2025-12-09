import { cn, type ClassValue } from "rond";
import { CharacterOverview } from "../CharacterOverview";
import { FinalResult } from "../FinalResult";
import { Modifiers } from "../Modifiers";
import { SetupDirector } from "../SetupDirector";
import { SetupManager } from "../SetupManager";
import { Card, CLASS_NAME } from "./Card";
import { CSSProperties, ReactNode } from "react";

type GetCardsOptions = {
  touched: boolean;
  isModernUI?: boolean;
};

type RenderCardProps = {
  className?: ClassValue;
  style?: CSSProperties;
  placeholder?: ReactNode;
};

// TODO move Card inside each component
export const getCards = ({ touched, isModernUI }: GetCardsOptions) => {
  return {
    Overview: (props?: RenderCardProps) => (
      <Card className={cn("p-4", props?.className)} style={props?.style} dark={1}>
        <CharacterOverview touched={touched} />
      </Card>
    ),
    Modifiers: (props?: RenderCardProps) => (
      <Card className={cn("p-4", props?.className)} style={props?.style} dark={1}>
        {touched ? <Modifiers /> : props?.placeholder}
      </Card>
    ),
    Setup: (props?: RenderCardProps) => (
      <Card className={cn("p-4 relative", props?.className)} style={props?.style} dark={3}>
        {touched ? <SetupManager isModernUI={isModernUI} /> : props?.placeholder}
        <SetupDirector className={CLASS_NAME} />
      </Card>
    ),
    Results: (props?: RenderCardProps) => (
      <Card className={cn("p-4", props?.className)} style={props?.style} dark={3}>
        {touched ? <FinalResult /> : props?.placeholder}
      </Card>
    ),
  };
};
