import { CSSProperties } from "react";
import { ClassValue } from "rond";

import { Card } from "../_components/Card";
import { CharacterOverview } from "../CharacterOverview";
import { FinalResult } from "../FinalResult";
import { Modifiers } from "../Modifiers";
import { SetupDirector } from "../SetupDirector";
import { SetupManager } from "../SetupManager";

type CardProps = {
  touched: boolean;
  className?: ClassValue;
  style?: CSSProperties;
};

export const OverviewCard = (props: CardProps) => (
  <Card className={["bg-dark-1", props.className]} style={props.style}>
    <CharacterOverview touched={props.touched} />
  </Card>
);

export const ModifiersCard = (props: CardProps) => (
  <Card className={["bg-dark-1", props.className]} style={props.style}>
    {props.touched && <Modifiers />}
  </Card>
);

export const SetupCard = (props: CardProps) => (
  <Card className={["bg-dark-3 relative", props.className]} style={props.style}>
    {props.touched && <SetupManager />}
    <SetupDirector />
  </Card>
);

export const ResultsCard = ({
  touched,
  className,
  style,
  CardComponent = Card,
}: CardProps & { CardComponent?: typeof Card }) => (
  <CardComponent className={["bg-dark-3", className]} style={style}>
    {touched && <FinalResult />}
  </CardComponent>
);
