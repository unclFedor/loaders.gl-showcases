// TODO Add export type to index file in loaders.gl
import type {
  StatisticsInfo,
  StatsInfo,
  Histogram,
  ValueCount,
} from "@loaders.gl/i3s";

import { useEffect, useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";

import { ToggleSwitch } from "../../toogle-switch/toggle-switch";
import { LoadingSpinner } from "../../loading-spinner/loading-spinner";
import { HistogramChart } from "../histogram";
import { ColorValueItem } from "./color-value-item";

import LayersIcon from "../../../../public/icons/layers.svg";
import { ExpandIcon } from "../../expand-icon/expand-icon";
import { CollapseDirection, ExpandState, ArrowDirection } from "../../../types";
import { useExpand } from "../../../utils/hooks/use-expand";
import { calculateAverageValue } from "../../../utils/calculate-average-value";
import { COLORS_BY_ATTRIBUTE } from "../../../constants/colors";
import { capitalize } from "../../../utils/format/capitalize";
import {
  selectColorsByAttribute,
  setColorsByAttrubute,
} from "../../../redux/slices/colors-by-attribute-slice";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  getAttributeStatsInfo,
  selectStatisitcsMap,
} from "../../../redux/slices/attribute-stats-map-slice";

type VisibilityProps = {
  visible: boolean;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: transparent;
  color: ${({ theme }) => theme.colors.fontColor};
  overflow-y: auto;
  width: calc(100% - 32px);
  padding: 0 16px;
`;

const AttributeTitle = styled.div`
  font-weight: 700;
  font-size: 16px;
  line-height: 19px;
`;

const TilesetData = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-top: 26px;
`;

const TilesetName = styled.div`
  margin-left: 8px;
`;

const Statistics = styled.div`
  margin-top: 19px;
  display: grid;
  grid-template-columns: 1fr 2fr;
`;

const Statistic = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;

  :nth-child(even) {
    opacity: 0.8;
    margin-left: 10px;
  }
`;

const HistograpPanel = styled.div`
  display: flex;
  flex-direction: column;
`;

const HistogramTitle = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SplitLine = styled.div`
  margin: 24px 0 28px 0;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.mainHiglightColor};
`;

const AttributeColorize = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 36px;
`;

const ColorizeTitle = styled.div`
  font-weight: 700;
`;

const ValueCountContainer = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  align-items: center;
`;

const ValueCountItem = styled.div`
  margin-bottom: 5px;
`;

const SpinnerContainer = styled.div<VisibilityProps>`
  position: absolute;
  left: calc(50% - 22px);
  top: 70px;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;

const FadeContainer = styled.section`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-bottom: 18px;
`;

const Fade = styled.div`
  width: 295px;
  height: 25px;
  background: linear-gradient(
    90deg,
    ${COLORS_BY_ATTRIBUTE.min.hex} 0%,
    #0e73f2 100%,
    ${COLORS_BY_ATTRIBUTE.max.hex} 100%
  );
  border-radius: 2px;
`;

const ColorizeValuesList = styled.div`
  display: flex;
  justify-content: space-between;
  align-content: center;
  margin-bottom: 36px;
`;

const HISTOGRAM = "histogram";
const MOST_FREQUENT_VALUES = "mostFrequentValues";
const COLORIZE_BY_ATTRIBUTE = "Colorize by Attribute";
const COLORIZE_BY_MULTIPLY = "Multiply Colors";
const VALUE_TITLE = "Value";
const COUNT_TITLE = "Count";
const MODE_MULTIPLY = "multiply";
const MODE_REPLACE = "replace";

type AttributeStatsProps = {
  attributeName: string;
  statisticsInfo: StatisticsInfo;
  tilesetName: string;
  tilesetBasePath: string;
};

export const AttributeStats = ({
  attributeName,
  statisticsInfo,
  tilesetName,
  tilesetBasePath,
}: AttributeStatsProps) => {
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState<StatsInfo | null>(null);
  const [histogramData, setHistogramData] = useState<Histogram | null>(null);
  const [expandState, expand] = useExpand(ExpandState.expanded);

  const colorsByAttribute = useAppSelector(selectColorsByAttribute);
  const statsMap = useAppSelector(selectStatisitcsMap);
  const dispatch = useAppDispatch();

  /**
   * Handle base uri and statistic uri
   * @param statisticUrl
   * @param baseUri
   * @returns
   */
  const resolveUrl = (statisticUrl: string, tilesetUrl: string): string => {
    const statUrl = new URL(statisticUrl, `${tilesetUrl}/`);
    return decodeURI(statUrl.toString());
  };

  useEffect(() => {
    setIsLoading(true);
    const statAttributeUrl = resolveUrl(statisticsInfo.href, tilesetBasePath);
    if (statsMap[statAttributeUrl] !== undefined) {
      setStatistics(statsMap[statAttributeUrl]);
      setIsLoading(false);
    } else {
      dispatch(getAttributeStatsInfo(statAttributeUrl));
    }
  }, [attributeName, statsMap]);

  const renderStatisticRows = () => {
    const statisticsRows: JSX.Element[] = [];

    for (const statName in statistics) {
      const statValue = statistics[statName];

      switch (statName) {
        case HISTOGRAM:
          setHistogramData(statValue);
          break;

        case MOST_FREQUENT_VALUES: {
          statisticsRows.push(
            <Statistic key={statName}>{capitalize(statName)}</Statistic>
          );
          const frequentValues = renderMostFrequentValuesStats(statValue);
          statisticsRows.push(
            <Statistic key={`${statName}-${statValue}`}>
              {frequentValues}
            </Statistic>
          );
          break;
        }

        default: {
          statisticsRows.push(
            <Statistic key={statName}>{capitalize(statName)}</Statistic>
          );
          statisticsRows.push(
            <Statistic key={`${statName}-${statValue}`}>{statValue}</Statistic>
          );
        }
      }
    }

    return statisticsRows;
  };

  const renderMostFrequentValuesStats = (frequentValues: ValueCount[]) => {
    const valueCountRows: JSX.Element[] = [
      <ValueCountContainer key={"most-frequetn-values-title"}>
        <ValueCountItem>{VALUE_TITLE}</ValueCountItem>
        <ValueCountItem>{COUNT_TITLE}</ValueCountItem>
      </ValueCountContainer>,
    ];

    for (const item of frequentValues) {
      valueCountRows.push(
        <ValueCountContainer key={item.value}>
          <ValueCountItem>{item.value}</ValueCountItem>
          <ValueCountItem>{item.count}</ValueCountItem>
        </ValueCountContainer>
      );
    }

    return valueCountRows;
  };

  const handleColorizeByAttributeClick = () => {
    if (
      !colorsByAttribute ||
      colorsByAttribute.attributeName !== attributeName
    ) {
      if (!statistics || !("min" in statistics) || !("max" in statistics)) {
        dispatch(setColorsByAttrubute(null));
      } else {
        dispatch(
          setColorsByAttrubute({
            attributeName,
            minValue: statistics.min || 0,
            maxValue: statistics.max || 0,
            minColor: COLORS_BY_ATTRIBUTE.min.rgba,
            maxColor: COLORS_BY_ATTRIBUTE.max.rgba,
            mode: MODE_REPLACE,
          })
        );
      }
    } else {
      dispatch(setColorsByAttrubute(null));
    }
  };

  const handleColorizeByMultiplyingClick = () => {
    if (
      colorsByAttribute &&
      colorsByAttribute.attributeName === attributeName
    ) {
      let newMode = MODE_REPLACE;
      if (colorsByAttribute?.mode === MODE_REPLACE) {
        newMode = MODE_MULTIPLY;
      }
      dispatch(
        setColorsByAttrubute({
          attributeName,
          minValue: statistics?.min || 0,
          maxValue: statistics?.max || 0,
          minColor: COLORS_BY_ATTRIBUTE.min.rgba,
          maxColor: COLORS_BY_ATTRIBUTE.max.rgba,
          mode: newMode,
        })
      );
    }
  };

  const statisticRows = useMemo(() => renderStatisticRows(), [statistics]);

  return (
    <>
      <SpinnerContainer visible={isLoading}>
        <LoadingSpinner />
      </SpinnerContainer>
      {!isLoading && (
        <Container>
          <AttributeTitle>{attributeName}</AttributeTitle>
          <TilesetData>
            <LayersIcon
              data-testid="statistics-layers-icon"
              fill={theme.colors.fontColor}
            />
            <TilesetName>{tilesetName}</TilesetName>
          </TilesetData>
          <Statistics>{statisticRows}</Statistics>
          {histogramData && (
            <>
              <HistograpPanel>
                <HistogramTitle>
                  Histogram
                  <ExpandIcon
                    expandState={expandState}
                    collapseDirection={CollapseDirection.bottom}
                    onClick={expand}
                  />
                </HistogramTitle>
                {expandState === ExpandState.expanded && (
                  <HistogramChart
                    attributeName={attributeName}
                    histogramData={histogramData}
                  />
                )}
              </HistograpPanel>
              {expandState === ExpandState.expanded && (
                <SplitLine data-testid="histogram-split-line" />
              )}
            </>
          )}
          {typeof statistics?.min === "number" && statistics.max && (
            <>
              <AttributeColorize role="colorizeByAttribute">
                <ColorizeTitle>{COLORIZE_BY_ATTRIBUTE}</ColorizeTitle>
                <ToggleSwitch
                  id={"colorize-by-attribute"}
                  checked={colorsByAttribute?.attributeName === attributeName}
                  onChange={handleColorizeByAttributeClick}
                />
              </AttributeColorize>
              <AttributeColorize role="colorizeByAttributeMode">
                <ColorizeTitle>{COLORIZE_BY_MULTIPLY}</ColorizeTitle>
                <ToggleSwitch
                  id={"colorize-by-attribute-mode"}
                  checked={
                    colorsByAttribute?.attributeName === attributeName &&
                    colorsByAttribute?.mode === MODE_MULTIPLY
                  }
                  onChange={handleColorizeByMultiplyingClick}
                />
              </AttributeColorize>
              {colorsByAttribute?.attributeName === attributeName && (
                <>
                  <FadeContainer data-testid="colorsByAttributeFadeContainer">
                    <Fade />
                  </FadeContainer>
                  <ColorizeValuesList>
                    <ColorValueItem
                      arrowVisibility={true}
                      arrowDirection={ArrowDirection.left}
                      colorValue={statistics.min}
                    />
                    <ColorValueItem
                      arrowVisibility={false}
                      colorValue={calculateAverageValue(
                        statistics.min,
                        statistics.max
                      )}
                    />
                    <ColorValueItem
                      arrowVisibility={true}
                      arrowDirection={ArrowDirection.right}
                      colorValue={statistics.max}
                    />
                  </ColorizeValuesList>
                </>
              )}
            </>
          )}
        </Container>
      )}
    </>
  );
};
