import { fireEvent, render } from "@testing-library/react";
import { TestAppUiProvider } from "@canva/app-ui-kit";
import { App } from "../app";
describe("app", () => {
    let addElementAtPoint: jest.Mock;
    beforeEach(() => {
        addElementAtPoint = jest.fn();
    });
    it("calls addElementAtPoint onClick", async () => {
        const result = render(<TestAppUiProvider theme="dark">
        <App onClick={addElementAtPoint}/>
      </TestAppUiProvider>);
        const button = result.getByRole("button");
        expect(button.textContent).toEqual("Do something cool");
        expect(addElementAtPoint).not.toHaveBeenCalled();
        fireEvent.click(button);
        expect(addElementAtPoint).toHaveBeenCalledTimes(1);
    });
    it("Renders 🎉", () => {
        const result = render(<TestAppUiProvider theme="dark">
        <App onClick={addElementAtPoint}/>
      </TestAppUiProvider>);
        expect(result.container).toMatchSnapshot();
    });
});
