import { TestAppUiProvider } from "@canva/app-ui-kit";
import type { RenderResult } from "@testing-library/react";
import { fireEvent, render, within } from "@testing-library/react";
import { openColorSelector } from "@canva/asset";
import { features, requestOpenExternalUrl } from "@canva/platform";
import { API_URL, App, DOCS_URL, QUOTA_ERROR } from "../app";
import { addPage } from "@canva/design";
import { CanvaError } from "@canva/error";
function renderInTestProvider(node: React.ReactNode): RenderResult {
    return render(<TestAppUiProvider>{node}</TestAppUiProvider>);
}
describe("Example Tests", () => {
    const mockRequestOpenExternalUrl = jest.mocked(requestOpenExternalUrl);
    const mockIsSupported = jest.mocked(features.isSupported);
    const mockAddPage = jest.mocked(addPage);
    beforeEach(() => {
        jest.resetAllMocks();
        mockRequestOpenExternalUrl.mockResolvedValue({ status: "completed" });
        mockIsSupported.mockReturnValue(true);
    });
    it("should call `openColorSelector` when the swatch is clicked", () => {
        expect(openColorSelector).not.toHaveBeenCalled();
        const result = renderInTestProvider(<App />);
        const colorSelectorDiv = result.container.querySelector("#color-selector") as HTMLElement;
        const swatch = within(colorSelectorDiv).getByRole("button");
        expect(openColorSelector).not.toHaveBeenCalled();
        fireEvent.click(swatch);
        expect(openColorSelector).toHaveBeenCalled();
    });
    it("should call `requestOpenExternalUrl` when the button is clicked", () => {
        expect(mockRequestOpenExternalUrl).not.toHaveBeenCalled();
        const result = renderInTestProvider(<App />);
        const sdkButton = result.getByRole("button", {
            name: "Apps SDK",
        });
        expect(mockRequestOpenExternalUrl).not.toHaveBeenCalled();
        fireEvent.click(sdkButton);
        expect(mockRequestOpenExternalUrl).toHaveBeenCalled();
        expect(mockRequestOpenExternalUrl.mock.calls[0]?.[0]).toEqual({
            url: DOCS_URL,
        });
        const referenceButton = result.getByRole("button", {
            name: /Reference/,
        });
        fireEvent.click(referenceButton);
        expect(mockRequestOpenExternalUrl).toHaveBeenCalledTimes(2);
        expect(mockRequestOpenExternalUrl.mock.calls[1]?.[0]).toEqual({
            url: API_URL,
        });
    });
    it("should show a button when `addPage` is supported and call it when the button is clicked", () => {
        const result = renderInTestProvider(<App />);
        const addPageButton = result.getByRole("button", {
            name: "Add Page",
        });
        expect(addPageButton).toBeDefined();
        expect(addPage).not.toHaveBeenCalled();
        fireEvent.click(addPageButton);
        expect(addPage).toHaveBeenCalled();
    });
    it("should show a message when `addPage` is not supported", () => {
        mockIsSupported.mockReturnValue(false);
        const result = renderInTestProvider(<App />);
        const text = result.getByText(/Adding pages is not supported/);
        expect(text).toBeDefined();
        expect(() => result.getByRole("button", { name: "Add Page" })).toThrow();
    });
    it("should show an error message when `addPage` throws an error", async () => {
        mockAddPage.mockImplementationOnce(() => {
            throw new CanvaError({
                code: "quota_exceeded",
                message: "Quota exceeded",
            });
        });
        const result = renderInTestProvider(<App />);
        const addPageButton = result.getByRole("button", {
            name: "Add Page",
        });
        fireEvent.click(addPageButton);
        expect(mockAddPage).toHaveBeenCalled();
        const errorMessage = result.getByText(QUOTA_ERROR);
        expect(errorMessage).toBeDefined();
    });
});
