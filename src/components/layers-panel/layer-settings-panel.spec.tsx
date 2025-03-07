import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../utils/testing-utils/render-with-theme";
import { LayerSettingsPanel } from "./layer-settings-panel";

// Mocked components
import { CloseButton } from "../close-button/close-button";
import { BuildingExplorer } from "./building-explorer";

jest.mock("../close-button/close-button");
jest.mock("./building-explorer");

const CloseButtonMock = CloseButton as unknown as jest.Mocked<any>;
const BuildingExplorerMock = BuildingExplorer as unknown as jest.Mocked<any>;

beforeAll(() => {
  CloseButtonMock.mockImplementation((props) => (
    <div {...props}>Close Button</div>
  ));
  BuildingExplorerMock.mockImplementation(() => <div>Building Explorer</div>);
});

const onUpdateSublayerVisibilityMock = jest.fn();
const onBackClick = jest.fn();
const onCloseClick = jest.fn();
const onBuildingExplorerOpened = jest.fn();

const callRender = (renderFunc, props = {}) => {
  return renderFunc(
    <LayerSettingsPanel
      sublayers={[]}
      onUpdateSublayerVisibility={onUpdateSublayerVisibilityMock}
      onBackClick={onBackClick}
      onCloseClick={onCloseClick}
      onBuildingExplorerOpened={onBuildingExplorerOpened}
      {...props}
    />
  );
};

describe("Layers Settings Panel", () => {
  it("Should render LayerSettingsPanel", () => {
    const { container } = callRender(renderWithTheme);
    expect(container).toBeInTheDocument();

    expect(screen.getByText("Layer settings"));

    const { onClick } = CloseButtonMock.mock.lastCall[0];

    act(() => {
      onClick();
    });

    expect(onCloseClick).toHaveBeenCalled();

    userEvent.click(screen.getByTestId("back-button-layers-panel"));
    expect(onBackClick).toHaveBeenCalled();

    expect(screen.getByText("Building Explorer"));
    const { onUpdateSublayerVisibility } =
      BuildingExplorerMock.mock.lastCall[0];

    act(() => {
      onUpdateSublayerVisibility();
    });

    expect(onUpdateSublayerVisibilityMock).toHaveBeenCalled();
  });
});
