# nvim-dadbod-beer-goggles (nvim-dadbod-bg)
> is it me or is is that DB looking pretty good? 

### Intro

Dadbod Beer Goggles is an addon/utility to be used with [vim-dadbod](https://github.com/tpope/vim-dadbod). Dadbod is a Vim plugin for interacting with databases. 
Dadbod Beer Goggles is a remote neovim plugin that uses a webserver to display the results of a query in a browser. Beer Goggles can be used in conjunction with [vim-dadbod-ui](https://github.com/kristijanhusak/vim-dadbod-ui) as their features are complementary.

### Screenshots
![MongoDB example](/examples/mongo_example.png?raw=true "MongoDB example")

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
    -- (optional) the default port is 4546
    config = function()
      vim.cmd([[
        let g:nvim_dadbod_bg_port = '4546'
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
    config = function()
      vim.cmd([[
        let g:nvim_dadbod_bg_port = '4546'
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

### Contributing

Contributions are welcome! If you find any issues or have any suggestions, please open an issue or submit a pull request.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
```

