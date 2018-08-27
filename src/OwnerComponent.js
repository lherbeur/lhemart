import React, { Component } from 'react'

class Owner extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render() {
    return (
     
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <p><input type ="text" name="adminAddress" />
              <button>Add Admin</button>
              <button>Remove Admin</button>
              </p>
            </div>
          </div>
        </main>

      //render owner component here


    );
  }

}
