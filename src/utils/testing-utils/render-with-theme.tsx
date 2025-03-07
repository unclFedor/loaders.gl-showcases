import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { Provider } from "react-redux";
import { type AppStore } from "../../redux/store";

const theme = {
  colors: {
    mainColor: "#000000",
    fontColor: "#000001",
    secondaryFontColor: "#000002",
    mainCanvasColor: "#000003",
    mainHiglightColor: "#000004",
    mainHiglightColorInverted: "#000005",
    mainDimColor: "#000006",
    mainDimColorInverted: "#000007",
    accentColor: "#000008",
    iconInactiveColor: "#000009",
    buttonIconColor: "#000010",
    buttonDimIconColor: "#000011",
    buttonDimColor: "#000002",
    mapControlPanelColor: "#000012",
    mapControlExpanderColor: "#000013",
    mapControlExpanderDimColor: "#000014",
  },
};

/**
 * Workaround function to wrap testing component into theme provider to avoid errors with missing theme colors.
 * @param children
 */
export const renderWithTheme = (
  children: React.ReactNode,
  renderFunc = render
) => {
  return renderFunc(<ThemeProvider theme={theme}>{children}</ThemeProvider>);
};

export function renderWithThemeProviders(
  ui: React.ReactElement,
  store: AppStore
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper }) };
}
