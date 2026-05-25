import type { RenderResult } from "@testing-library/react";
import { fireEvent, render } from "@testing-library/react";
import { TestAppUiProvider } from "@canva/app-ui-kit";
import { TestAppI18nProvider } from "@canva/app-i18n-kit";
import { App, CreditUsage } from "../app";
function renderInTestProvider(node: React.ReactNode): RenderResult {
    return render(<TestAppI18nProvider>
      <TestAppUiProvider>{node}</TestAppUiProvider>
    </TestAppI18nProvider>);
}
describe("app", () => {
    let requestOpenExternalUrl: jest.Mock;
    beforeEach(() => {
        requestOpenExternalUrl = jest.fn().mockResolvedValue({});
        jest.useFakeTimers({
            now: new Date("2024-09-25"),
        });
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    it("calls openExternalUrl onClick", async () => {
        const result = renderInTestProvider(<App requestOpenExternalUrl={requestOpenExternalUrl}/>);
        const galleryExternalLink = result.getByText(/gallery/);
        expect(galleryExternalLink.textContent).toContain("gallery");
        expect(requestOpenExternalUrl).not.toHaveBeenCalled();
        fireEvent.click(galleryExternalLink);
        expect(requestOpenExternalUrl).toHaveBeenCalledTimes(1);
    });
    it("Renders token counts consistently 🎉", () => {
        const resultToken0 = renderInTestProvider(<CreditUsage creditsCost={5} remainingCredits={50}/>);
        expect(resultToken0.container).toMatchSnapshot();
        const resultToken1 = renderInTestProvider(<CreditUsage creditsCost={1} remainingCredits={1}/>);
        expect(resultToken1.container).toMatchSnapshot();
        const resultToken10 = renderInTestProvider(<CreditUsage creditsCost={1} remainingCredits={0}/>);
        expect(resultToken10.container).toMatchSnapshot();
    });
});
