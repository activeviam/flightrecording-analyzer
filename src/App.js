import React, { Component } from "react";
import "./App.css";
import Input from "./Input/Input";
import Graph from "./Graph/Graph";
import NavBar from "./NavBar";
import parseJson from "./helpers/jsonToD3Data";
import { parseV1, convertToV2 } from "./helpers/v1tov2";

// QUERY JSON IMPORTS
// import json from "./samples/basic-query.json";
// import json from "./samples/distributed-query.json";
// import json from "./samples/minimal-query.json";
// import json from "./samples/larger-distributed-query.json";
// import json from "./samples/larger-distribution-query2.json";

class App extends Component {
  constructor(props) {
    super(props);

    // To display graph from imported json
    // const data = parseJson(json);
    // const defaultPage = "graph";

    // To copy/paste graph;
    const data = null;
    const defaultPage = "input";
    this.state = {
      router: defaultPage,
      allQueries: data,
      currentQueryId: 0,
      selectedNodeId: null,
      restartGraph: false
    };
  }

  passInput = async (mode, type, input) => {
    let data = null;
    if (mode === "json") {
      const json = JSON.parse(input);
      data = parseJson(json, type);
    } else if (mode === "v1") {
      const v1Structure = await parseV1(input, () => {});
      data = parseJson({ data: convertToV2(v1Structure) });
    }
    this.setState({
      allQueries: data,
      currentQueryId: 0,
      router: "graph"
    });
  };

  changeGraph = childId => {
    this.clickNode(this.state.selectedNodeId); // Easy way to un-click the current clicked node to prevent bug
    this.setState({ currentQueryId: childId, restartGraph: true });
  };

  clickNode = id => {
    this.setState(prevState => {
      const selectedNodeId = id === prevState.selectedNodeId ? null : id;
      const { allQueries, currentQueryId } = prevState;
      allQueries[currentQueryId].nodes.forEach(node => {
        if (node.id === id) {
          node.isSelected = !node.isSelected;
        } else {
          node.isSelected = false;
        }
      });
      return { selectedNodeId };
    });
  };

  render() {
    const { allQueries, currentQueryId, restartGraph, router } = this.state;
    let currentNodes = [];
    let currentLinks = [];
    if (allQueries !== null) {
      const currentQuery = allQueries[currentQueryId];
      currentNodes = currentQuery.nodes;
      currentLinks = currentQuery.links;
    }
    return (
      <>
        <NavBar navigate={dir => this.setState({ router: dir })} dataIsEmpty />
        <main role="main" className="container-fluid px-0">
          {router === "input" && <Input passInput={this.passInput} />}
          {router === "graph" && !restartGraph && (
            <Graph
              className="my-0"
              nodes={currentNodes}
              links={currentLinks}
              clickNode={this.clickNode}
              restart={() => this.setState({ restartGraph: false })}
              changeGraph={this.changeGraph}
            />
          )}
          {router === "timeline" && <></>}
        </main>
      </>
    );
  }
}

export default App;
