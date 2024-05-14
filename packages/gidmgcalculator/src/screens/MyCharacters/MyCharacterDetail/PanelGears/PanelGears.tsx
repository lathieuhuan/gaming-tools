import { useState } from "react";
import { useMyCharacterDetailModalsCtrl } from "../MyCharacterDetailModalsProvider";
import { GearsOverview, GearsOverviewProps } from "./GearsOverview";
import { GearsDetail, GearsDetailProps } from "./GearsDetail";
import { GearsDetailType } from "./Gears.types";

type GearsDetailState = {
  active: boolean;
  type: GearsDetailType;
};

type RenderGearsOverview = (options?: Pick<GearsOverviewProps, "className" | "style">) => React.ReactNode;

type RenderGearsDetail = (options?: Pick<GearsDetailProps, "showCloseBtn">) => React.ReactNode;

interface PanelGearsProps {
  children: (props: {
    detailActive: boolean;
    renderGearsOverview: RenderGearsOverview;
    renderGearsDetail: RenderGearsDetail;
    closeDetail: () => void;
    removeDetail: () => void;
  }) => React.JSX.Element;
}
export function PanelGears(props: PanelGearsProps) {
  const modalCtrl = useMyCharacterDetailModalsCtrl();

  const [detail, setDetail] = useState<GearsDetailState>({
    active: false,
    type: -1,
  });

  const closeDetail = () => {
    setDetail({ active: false, type: detail.type });
  };

  const removeDetail = () => {
    setDetail({ active: false, type: -1 });
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
        onClickEmptyArtifact={modalCtrl.requestSwitchArtifact}
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
