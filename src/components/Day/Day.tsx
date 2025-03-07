import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import React, { useRef } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { css, cx } from '@emotion/css';
import { useStyles2, useTheme2 } from '@grafana/ui';
import { getStyles } from '../../styles';
import { CalendarEvent } from '../../types';
import { CalendarEntry } from '../CalendarEntry';

dayjs.extend(localizedFormat);

/**
 * Properties
 */
interface Props {
  day: dayjs.Dayjs;
  weekend: boolean;
  today: boolean;
  events: Array<CalendarEvent | undefined>;
  selected: boolean;
  onSelectionChange: (selected: boolean) => void;
  outsideInterval: boolean;
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
  onShowMore: () => void;
  onShowEvent: (event: CalendarEvent) => void;
  quickLinks: boolean;
}

/**
 * Day
 */
export const Day = ({
  day,
  weekend,
  today,
  events,
  selected,
  onSelectionChange,
  outsideInterval,
  onShowMore,
  onShowEvent,
  quickLinks,
}: Props) => {
  const theme = useTheme2().v1;
  const styles = useStyles2(getStyles);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const dateHeader = (
    <div className={styles.dateHeader.root}>
      <div className={styles.dateHeader.monthLabel}>{day.format('D') === '1' && day.format('MMM')}</div>
      <div
        className={cx(
          styles.dateHeader.dayLabel,
          {
            [css`
              color: ${theme.colors.textWeak};
            `]: weekend,
          },
          {
            [css`
              color: ${theme.colors.textFaint};
            `]: outsideInterval,
          },
          {
            [css`
              background: ${theme.palette.queryRed};
              color: ${theme.palette.black};
            `]: today,
          },
          {
            [css`
              background: ${theme.colors.textBlue};
              color: ${theme.palette.black};
            `]: selected,
          }
        )}
      >
        {day.format('D')}
      </div>
    </div>
  );

  const entries = events.map((event, i) => (
    <CalendarEntry
      key={i}
      event={event}
      day={day}
      outsideInterval={outsideInterval}
      summary={false}
      onClick={() => {
        if (event) {
          onShowEvent(event);
        }
      }}
      quickLinks={quickLinks}
    />
  ));

  return (
    <>
      <div
        ref={rootRef}
        className={cx(
          styles.root,
          { [styles.weekend]: weekend },
          { [styles.today]: today },
          { [styles.selected]: selected },
          { [styles.outsideInterval]: outsideInterval }
        )}
        onClick={(e) => {
          onSelectionChange(!selected);
        }}
      >
        {dateHeader}

        <AutoSizer disableWidth>
          {({ height }) => {
            // TODO: Can we compute this rather than having it hard-coded?
            const heightPerEntry = 17;

            const maxNumEvents = Math.max(Math.floor((height - 3 * heightPerEntry) / heightPerEntry), 0);

            return (
              <>
                {entries.filter((_, i) => i < maxNumEvents)}
                {entries.length - maxNumEvents > 0 && (
                  <>
                    <div onClick={onShowMore} className={styles.moreEntriesLabel}>{`${
                      entries.length - maxNumEvents
                    } more…`}</div>
                  </>
                )}
              </>
            );
          }}
        </AutoSizer>
      </div>
    </>
  );
};
