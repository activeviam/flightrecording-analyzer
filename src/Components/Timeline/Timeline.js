import React, { Component } from "react";
import "./Timeline.css";

/* TODO how to dilate time not to have long boxes taking a lot of spaces
 * We must only dilate time for periods where all entries are in similar
 * buckets. */

const placeRetrieval = (retrievals, state, entry) => {
  const { lines, last } = state;
  // Find the first one whose last is before entry start
  const candidates = last.filter(t => t <= entry.start);
  const idx =
    candidates.length > 0
      ? last.indexOf(Math.max(...candidates))
      : lines.length;
  if (lines[idx]) {
    lines[idx].push(entry);
  } else {
    lines[idx] = [entry];
  }
  last[idx] = entry.end;
  return state;

  // TODO may be smart to have a way to distribute 0ms on different lines
};

const computeLines = ({ retrievals }) => {
  const result = retrievals
    .filter(r => r.timingInfo.startTime && r.timingInfo.elapsedTime)
    .map(r =>
      r.timingInfo.startTime.map((time, i) => ({
        id: r.retrId,
        partition: i,
        start: time,
        end: r.timingInfo.elapsedTime[i] + time
      }))
    )
    .flat()
    .sort((a, b) => {
      return a.start - b.start;
    })
    .reduce(placeRetrieval.bind(null, retrievals), {
      lines: [],
      last: []
    });

  return result.lines;
};

const boxHeight = 25;
const boxMargin = 5;
const widthFactor = 5;

// Logic for a factor of 5
const Box = ({ rowIdx, entry, retrieval }) => {
  const key = `${entry.id}-${entry.partition}`;
  if (entry.start < entry.end) {
    const x = (entry.start + 1) * widthFactor - 1;
    const w = (entry.end - entry.start - 1) * widthFactor + 2;
    return (
      <rect
        key={key}
        className="timeline-box"
        x={10 + x}
        y={10 + rowIdx * (boxMargin + boxHeight)}
        width={w}
        height={boxHeight}
      />
    );
  }
  const x = entry.start * widthFactor + 2;
  const w = 1;
  return (
    <rect
      key={key}
      className="timeline-box"
      x={10 + x}
      y={10 + rowIdx * (boxMargin + boxHeight)}
      width={w}
      height={boxHeight}
    />
  );
};

const Row = ({ row, idx, retrievals }) => {
  const boxes = row.map(entry =>
    Box({ rowIdx: idx, entry, retrieval: retrievals[entry.id] })
  );
  return <g className="timeline-row">{boxes}</g>;
};

const margin = 10;
const Rows = ({ rows, retrievals }) => {
  const height = 2 * margin + rows.length * (boxHeight + boxMargin) - boxMargin;
  const width =
    2 * margin +
    widthFactor *
      Math.max(...rows.map(row => row[row.length - 1]).map(entry => entry.end));
  return (
    <div className="timeline-rows">
      <svg width={width} height={height}>
        {rows.map((row, idx) => Row({ row, idx, retrievals }))}
      </svg>
    </div>
  );
};

class Timeline extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lines: []
    };
  }

  componentWillMount() {
    this.setState({ lines: computeLines(this.props.plan) });
  }

  static getDerivedStateFromProps(newProps) {
    return { lines: computeLines(newProps.plan) };
  }

  render() {
    return (
      <>
        <p>This is the timeline</p>
        <Rows rows={this.state.lines} retrievals={this.props.plan.retrievals} />
        <ul>
          {this.state.lines.map((line, i) => {
            return <li key={i}>{JSON.stringify(line)}</li>;
          })}
        </ul>
      </>
    );
  }
}

export default Timeline;
