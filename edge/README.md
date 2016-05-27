# Edge Framework


## Install

```bash
npm install
```

## Run

Start the edge server to accept the profile registration

```bash
node edge-server.js
```

## Demo

### edge device

under example there is an example of purifier with purifer.js & profile.json, run it with command:

```bash
node purifier.js
```

It will register in server and wait for command to set its speed

### virtual node

there are edge_red.js & edge_red.html for node-red, put the directory under node-red/nodes and inject below message to this node

```javascript
var msg = {
  edge: {
    service: "purifier",
    attr: "level",
    value: 2
  }
};
```

It will set purifier's level and adjust its speed
