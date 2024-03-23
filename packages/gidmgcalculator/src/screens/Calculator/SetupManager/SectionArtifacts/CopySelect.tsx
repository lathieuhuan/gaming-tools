import { useDispatch, useSelector } from "@Store/hooks";
import { selectCalcSetupsById, selectSetupManageInfos, updateCalcSetup } from "@Store/calculator-slice";
import { CopySection, Option } from "../../components/CopySection";

export function CopySelect() {
  const dispatch = useDispatch();

  const setupManageInfos = useSelector(selectSetupManageInfos);
  const setupsById = useSelector(selectCalcSetupsById);

  const allArtifacts = setupManageInfos.map(({ ID }) => setupsById[ID].artifacts);
  const copyOptions = allArtifacts.reduce((results: Option[], artifacts, index) => {
    if (artifacts.some((artifact) => artifact !== null)) {
      results.push({
        label: setupManageInfos[index].name,
        value: setupManageInfos[index].ID,
      });
    }
    return results;
  }, []);

  const onClickCopyArtifacts = ({ value: sourceId }: Option) => {
    const { artifacts, artBuffCtrls } = setupsById[sourceId];
    let seedID = Date.now();

    dispatch(
      updateCalcSetup({
        artifacts: artifacts.map((artifact) =>
          artifact
            ? {
                ...artifact,
                ID: seedID++,
              }
            : null
        ),
        artBuffCtrls,
      })
    );
  };

  return copyOptions.length ? (
    <CopySection className="mb-4 px-4" options={copyOptions} onClickCopy={onClickCopyArtifacts} />
  ) : null;
}
