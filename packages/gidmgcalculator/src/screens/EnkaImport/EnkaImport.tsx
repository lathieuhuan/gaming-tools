import { ErrorBoundary } from "react-error-boundary";
import { useScreenWatcher } from "rond";

import { Container, MOBILE_SECTION_CLASS } from "./Container";
import { DataImportProvider } from "./DataImportProvider";
import { Error } from "./Error";
import { SaverProvider } from "./SaverProvider";
import { SectionCover } from "./SectionCover";
import { SectionDetail } from "./SectionDetail";
import { SectionResults } from "./SectionResults";

export function EnkaImport() {
  const isMobile = !useScreenWatcher("sm");

  return (
    <ErrorBoundary FallbackComponent={Error}>
      <Container isMobile={isMobile}>
        <DataImportProvider>
          <SectionCover className={isMobile ? MOBILE_SECTION_CLASS : "w-85"} />

          <SaverProvider>
            <SectionResults
              className={["h-full custom-scrollbar", isMobile && MOBILE_SECTION_CLASS]}
            />

            <SectionDetail className={["shrink-0", isMobile ? MOBILE_SECTION_CLASS : "w-80"]} />
          </SaverProvider>
        </DataImportProvider>
      </Container>
    </ErrorBoundary>
  );
}
