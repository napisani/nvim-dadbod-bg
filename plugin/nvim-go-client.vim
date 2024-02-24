if exists('g:loaded_example_nvim_go_client')
    finish
endif
let g:loaded_example_nvim_go_client = 1

" not every error the go-client runs into is logged. Some are printed
" to stderr.  This routine captures that and prints it to messages;
" makes it easier to debug issues with code using go-client.
" You can see all messages using :messages. See :help messages for more 
" information about messages.
function! s:panic(ch, data, ...) abort
    echom a:data
endfunction

" this launches the go program we have compiled. For the above s:panic
" to work you need to have the on_error key. The 'rpc' key is to let
" nvim know to communicate with the process via msgpack-rpc over stdout.
" See :h msgpack-rpc and :h jobstart() for more information.
function! s:Start_example_nvim_go_client(host) abort
    return jobstart(['nvim-dadbod-ext'], {
        \ 'rpc': v:true, 
        \ 'on_stderr': function('s:panic')
        \ })
endfunction

" these remote#host routines are in nvim/runtime/autoload/remote/host.vim in neovim. Where exactly
" this path is rooted is dependent on your nvim. e.g. in my setup the complete path is 
" /usr/share/nvim/runtime/autoload/remote/host.vim.
" You may want to read :help remote_plugin for more information.
call remote#host#Register('nvim_dadbod_ext', 'x', function('s:Start_example_nvim_go_client'))

" do not edit manually.
" the name for the 'host' you choose when running -manifest must match the
" name you use in the above call to remote#host#Register. e.g. in this case
" the 'host' name is 'nvim_dadbod_ext'.
call remote#host#RegisterPlugin('nvim_dadbod_ext', '0', [
\ {'type': 'autocmd', 'name': 'User', 'sync': 0, 'opts': {'eval': '{''Filename'': expand(''<amatch>:h'')}', 'group': 'ExmplNvGoClientGrp', 'pattern': '*DBExecutePost'}},
\ ])
