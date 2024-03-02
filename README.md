# nvim-dadbod-beer-goggles (nvim-dadbod-bg)
> is it me or is is that DB looking pretty good? 

### Intro

Dadbod Beer Goggles is an addon/utility to be used with [vim-dadbod](https://github.com/tpope/vim-dadbod). Dadbod is a Vim plugin for interacting with databases. 
Dadbod Beer Goggles is a remote neovim plugin that uses a webserver to display the results of a query in a browser. Beer Goggles can be used in conjunction with [vim-dadbod-ui](https://github.com/kristijanhusak/vim-dadbod-ui) as their features are complementary.

### Screenshots
![MongoDB example](/examples/mongo_example.png?raw=true "MongoDB example")
![Mysql example](/examples/mysql_example.png?raw=true "MySQL example")

### Why

Sometimes it can be hard to view the results of a query in a terminal. The results can be too wide, too long, or just too much to look at. 
Dadbod Beer Goggles allows you to view the results of a query in a browser where you can easily scroll, filter and visualize the results with extra tooling. 


### How it works

Dadbod Beer Goggles is a remote plugin that uses a webserver to display the results of a query in a browser. The plugin uses [neovim's remote plugin feature](https://neovim.io/doc/user/remote_plugin.html). 
Dadbod Beer Goggles listens for the `DBExecutePost` AutoCommand event and sends the results of the query to a webserver. 
The webserver then displays the results in a browser. The webserver is written in Golang and uses Gorilla websockets to communicate with the browser. Embedded in the webserver is a React app that displays the results of the query. 

### Install

```lua
-- Packer
use {
    'napisani/nvim-dadbod-bg',
    run = './install.sh',
    config = function()
    -- (optional) the default port is 4546
    -- (optional) the log file will be created in the system's temp directory 
      vim.cmd([[
        let g:nvim_dadbod_bg_port = '4546'
        leg g:nvim_dadbod_bg_log_file = '/tmp/nvim-dadbod-bg.log'
      ]])
    end
}

-- vim-plug
Plug 'napisani/nvim-dadbod-bg', { 'do': './install.sh' }

-- Lazy.nvim
{
    'napisani/nvim-dadbod-bg',
    build = './install.sh',
    -- (optional) the default port is 4546
    -- (optional) the log file will be created in the system's temp directory 
    config = function()
      vim.cmd([[
        let g:nvim_dadbod_bg_port = '4546'
        leg g:nvim_dadbod_bg_log_file = '/tmp/nvim-dadbod-bg.log'
      ]])
    end
}

```

### Usage

1. After installing the plugin, start by opening neovim 
2. Connect to the database using vim-dadbod or vim-dadbod-ui
3. Run a query as you normally would with vim-dadbod or vim-dadbod-ui 
4. open a browser and navigate to `http://localhost:4546` (or whatever port you set `g:nvim_dadbod_bg_port` to) 
5. You should see the results of your query in the browser. As you run more queries, the results will update in the browser.


### Development

This plugin consists of three parts: 
1. the neovim plugin, primarily written in Vimscript 
2. the webserver, written in Golang
3. the webapp app, written in TypeScript/React


In order to easily develop this plugin you can start the webserver with a pre-existing query results file by running the following command in the root of the project:

```bash
# build the entire project
make

# create your sql query results file 
cat <<EOF > /tmp/query_results.json
my_db> [
  {
    "id": 1,
    "name": "John",
    "age": 30
  },
  {
    "id": 2,
    "name": "Jane",
    "age": 25
  }
]
EOF

# start the webserver with a pre-existing query results file
NVIM_DBBG_FILE=/tmp/query_results.json ./nvim-dadbod-bg 

# ^ the above command will start the backend server and print the 
# name of the log file that the server is writing to.
# in another terminal you can tail the log for additional information

# start the frontend app 
cd webapp
npm run dev

# open your browser and navigate to http://localhost:5173

# make changes to the webapp and see the changes in the browser
```

### Bring-Your-Own-UI
> Cool idea, but your UI kinda sucks...

That's fine! Write your own friggin UI why don't ya!

You can configure this plugin to use your own custom UI by setting the `g:nvim_dadbod_bg_ui` variable to the path of your custom UI.
The path is relative to where `nvim-dadbod-bg` is installed (IE: `~/.local/share/nvim/site/pack/packer/start/nvim-dadbod-bg`) or an absolute path.

The `g:nvim_dadbod_bg_ui` variable should point to a directory that contains an `index.html` (and any other necessary web assets), typically a `dist` directory produced by the `production` build of your custom UI application.

Here is an example of configuring `nvim-dadbod-bg` to use a custom UI:

```lua
-- Packer
use {
    'napisani/nvim-dadbod-bg',
    run = './install.sh',
    config = function()
      vim.cmd([[
        let g:nvim_dadbod_bg_ui_root_dir = '/home/user/my-awesome-dadbod-ui/dist'
      ]])
    end
}
```

### API Specification
When writing your own UI, you can use the following API to communicate with the backend server. The backend server will doing the parsing of the query results and sending the parsed results to the frontend. Here is the current specification of the API:

##### GET /ws
    - opens a websocket connection to the server
    - the server will send a `notification` message to the client when the query results have been updated. Indicates that the client should request the query results again.
    - if a websocket message is set to the server with the following content, the websocket will return the query results to the client:
```json
{
    "action": "QUERY_RESULTS"
}
```

#### notification websocket messages 
when new query results are available, the server will send a notification message to the client. The message will be in the following format:
```json
{
    "parsedAt": "number", // the epoch time in seconds that the query results were parsed
}
```
The contents of this message does not contain the actual query results. The client should request the query results again by making an http request (described below)  or by sending a websocket message to the server (described above)


##### GET /raw-query-results
    - returns the query results in the following format:
```json
{
    "type": "string", // json or dbout
    "parsedAt": "number", // the epoch time in seconds that the query results were parsed
    "content": "string" // a string representation of the raw query results
}

```

##### GET /typed-query-results
    - returns the parsed query results in the following format:
```json
{
    "type": "string", // json or dbout
    "parsedAt": "number", // the epoch time in seconds that the query results were parsed
    "content": [
        {
            "prefix": "string" // the prefix of the query results. This is mainly for mongodb results that have a prefix of "my_db> " in the results
            "type": "string" // the type of the query results "json" or "dbout"
            "content": "object" // string or map of columnName to value 
            "header": [
                {
                    "name": "string" // the name of the field/column header 
                    "inferredType": "string" // the inferred type (based on the ability to parse the field/column for the given result set)
                    // values include "string", "number", "boolean", "date", "boolean", "object"
                }

            ] 
        },
        ...
    ] 
}
```

### Contributing

Contributions are welcome! If you find any issues or have any suggestions, please open an issue or submit a pull request.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
```

