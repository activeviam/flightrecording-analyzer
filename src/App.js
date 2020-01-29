import React, { Component } from "react";
import "./App.css";
import Graph from "./Graph/Graph";
import NavBar from "./NavBar";
import NodeDetail from "./Graph/NodeDetail";
import parseJson from "./helpers/jsonToD3Data";
import basic from "./samples/basic-query.json";
// import minimal from "./samples/minimal-query";
// import distributed from "./samples/distributed-query";

class App extends Component {
  constructor(props) {
    super(props);

    const data = parseJson(basic);
    const selectedNode = null;
    this.state = { data, selectedNode };
  }

  clickNode = id => {
    this.setState(prevState => {
      const selectedNode = id === prevState.selectedNode ? null : id;
      const { data } = prevState;
      data.nodes.forEach(node => {
        if (node.id === id) {
          node.isSelected = !node.isSelected;
        } else {
          node.isSelected = false;
        }
      });
      return { data, selectedNode };
    });
  };

  getDetail = () => {
    const nodeId = this.state.selectedNode;
    // Return the first retrieval with retrId === id of selected node
    return basic.data[0].retrievals.filter(node => node.retrId === nodeId)[0];
  };

  render() {
    return (
      <>
        <NavBar />
        <main role="main" className="container">
          <h1>Bootstrap starter template</h1>
          <div className="row">
            <div className="col-sm-8">
              <Graph data={this.state.data} clickNode={this.clickNode} />
            </div>
            <div className="col-sm-4">
              {this.state.selectedNode !== null && (
                <NodeDetail details={this.getDetail()} />
              )}
            </div>
          </div>
        </main>
      </>
    );
  }
}

export default App;
