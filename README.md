# nvim-dadbod-beer-goggles

### intro

Dadbod Beer Goggles is an addon/utility to be used with [vim-dadbod](https://github.com/tpope/vim-dadbod). Dadbod is a Vim plugin for interacting with databases. Dadbod Beer Goggles is a remote neovim plugin that uses a webserver to display the results of a query in a browser. Beer Goggles can be used in conjunction with [vim-dadbod-ui](https://github.com/kristijanhusak/vim-dadbod-ui) as their features are complementary.


### how it works

Dadbod Beer Goggles is a remote plugin that uses a webserver to display the results of a query in a browser. The plugin is written in Lua and uses [neovim's remote plugin feature](https://neovim.io/doc/user/remote_plugin.html). Dadbod Beer Goggles listens for the `DBExecutePost` AutoCommand event and sends the results of the query to a webserver. The webserver then displays the results in a browser. The webserver is written in Golang and uses Gorilla websockets to communicate with the browser. Embedded in the webserver is a React app that displays the results of the query. 

### install

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
