import { useState } from "react";

import type { GearsDetailType } from "./Gears.types";
import { useActiveCharActions } from "../ActiveCharProvider";

import { GearsDetail, GearsDetailProps } from "./GearsDetail";
import { GearsOverview, GearsOverviewProps } from "./GearsOverview";

type GearsDetailState = {
  active: boolean;
  type: GearsDetailType;
};

type RenderGearsOverview = (
  options?: Pick<GearsOverviewProps, "className" | "style">
) => React.ReactNode;

type RenderGearsDetail = (options?: Pick<GearsDetailProps, "showCloseBtn">) => React.ReactNode;

type PanelGearsProps = {
  children: (props: {
    detailActive: boolean;
    renderGearsOverview: RenderGearsOverview;
    renderGearsDetail: RenderGearsDetail;
    closeDetail: () => void;
    removeDetail: () => void;
  }) => React.JSX.Element;
};

export function PanelGears(props: PanelGearsProps) {
  const actions = useActiveCharActions();

  const [detail, setDetail] = useState<GearsDetailState>({
    active: false,
    type: "",
  });

  const closeDetail = () => {
    setDetail({ active: false, type: detail.type });
  };

  const removeDetail = () => {
    setDetail({ active: false, type: "" });
  };

  const onClickDetail = (type: GearsDetailType) => {
    type === detail.type ? closeDetail() : setDetail({ active: true, type });
  };

  const renderGearsOverview: RenderGearsOverview = (props) => {
    return (
      <GearsOverview
        {...props}
        detailType={detail.type}
        onClickDetail={onClickDetail}
        onClickEmptyAtfSlot={(type) => {
          actions.requestSwitchArtifact({ isFilled: false, type });
        }}
      />
    );
  };

  const renderGearsDetail: RenderGearsDetail = (props) => {
    return <GearsDetail detailType={detail.type} {...props} onClose={closeDetail} />;
  };

  return props.children({
    detailActive: detail.active,
    renderGearsOverview,
    renderGearsDetail,
    closeDetail,
    removeDetail,
  });
}
