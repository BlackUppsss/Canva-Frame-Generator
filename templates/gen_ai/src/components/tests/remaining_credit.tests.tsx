import { TestAppI18nProvider } from "@canva/app-i18n-kit";
import { TestAppUiProvider } from "@canva/app-ui-kit";
import { getPlatformInfo, requestOpenExternalUrl } from "@canva/platform";
import type { RenderResult } from "@testing-library/react";
import { fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { RemainingCredits } from "../remaining_credits";
function renderInTestProvider(node: ReactNode): RenderResult {
    return render(<TestAppI18nProvider>
      <TestAppUiProvider>{node}</TestAppUiProvider>,
    </TestAppI18nProvider>);
}
describe("Remaining Credit Tests", () => {
    const mockRequestOpenExternalUrl = jest.mocked(requestOpenExternalUrl);
    const mockGetPlatformInfo = jest.mocked(getPlatformInfo);
    beforeEach(() => {
        jest.resetAllMocks();
        mockGetPlatformInfo.mockReturnValue({
            canAcceptPayments: true,
        });
    });
    it("should call requestOpenExternalUrl when the link is clicked", () => {
        expect(mockRequestOpenExternalUrl).not.toHaveBeenCalled();
        const result = renderInTestProvider(<RemainingCredits />);
        const purchaseMoreLink = result.getByRole("button");
        fireEvent.click(purchaseMoreLink);
        expect(mockRequestOpenExternalUrl).toHaveBeenCalled();
    });
});
