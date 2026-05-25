import { useFeatureSupport } from "@canva/app-hooks";
import { TestAppI18nProvider } from "@canva/app-i18n-kit";
import { TestAppUiProvider } from "@canva/app-ui-kit";
import { addElementAtCursor, addElementAtPoint } from "@canva/design";
import type { Feature } from "@canva/platform";
import { requestOpenExternalUrl } from "@canva/platform";
import { fireEvent, render } from "@testing-library/react";
import type { RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";
import { App, DOCS_URL } from "../app";
function renderInTestProvider(node: ReactNode): RenderResult {
    return render(<TestAppI18nProvider>
      <TestAppUiProvider>{node}</TestAppUiProvider>,
    </TestAppI18nProvider>);
}
jest.mock("@canva/app-hooks");
describe("Hello World Tests", () => {
    const mockIsSupported = jest.fn();
    const mockUseFeatureSupport = jest.mocked(useFeatureSupport);
    const mockRequestOpenExternalUrl = jest.mocked(requestOpenExternalUrl);
    beforeEach(() => {
        jest.resetAllMocks();
        mockIsSupported.mockImplementation((fn: Feature) => fn === addElementAtPoint);
        mockUseFeatureSupport.mockReturnValue(mockIsSupported);
        mockRequestOpenExternalUrl.mockResolvedValue({ status: "completed" });
    });
    it("should add a text element when the button is clicked", () => {
        expect(mockUseFeatureSupport).not.toHaveBeenCalled();
        expect(addElementAtPoint).not.toHaveBeenCalled();
        const result = renderInTestProvider(<App />);
        expect(mockUseFeatureSupport).toHaveBeenCalled();
        expect(addElementAtPoint).not.toHaveBeenCalled();
        const doSomethingCoolBtn = result.getByRole("button", {
            name: "Do something cool",
        });
        fireEvent.click(doSomethingCoolBtn);
        expect(mockIsSupported).toHaveBeenCalledWith(addElementAtPoint);
        expect(mockIsSupported).not.toHaveBeenCalledWith(addElementAtCursor);
        expect(addElementAtPoint).toHaveBeenCalled();
    });
    it("should call `requestOpenExternalUrl` when the button is clicked", () => {
        expect(mockRequestOpenExternalUrl).not.toHaveBeenCalled();
        const result = renderInTestProvider(<App />);
        const sdkButton = result.getByRole("button", {
            name: "Open Canva Apps SDK docs",
        });
        expect(mockRequestOpenExternalUrl).not.toHaveBeenCalled();
        fireEvent.click(sdkButton);
        expect(mockRequestOpenExternalUrl).toHaveBeenCalled();
        expect(mockRequestOpenExternalUrl.mock.calls[0]?.[0]).toEqual({
            url: DOCS_URL,
        });
    });
    it("should have a consistent snapshot", () => {
        const result = renderInTestProvider(<App />);
        expect(result.container).toMatchSnapshot();
    });
});
