# nvim-dadbod-exts
Examples of using the nvim [go client](https://github.com/neovim/go-client) and documentation for the client.

This file, the code, and the comments in the code are intended to help those who are interested in using Go to write
plugins for Neovim. Please do not take this document as absolute fact. I have done my best to document what I have
discovered by experimentation and reading the code, but it is very likely at least a few things I write here aren't 100%
accurate (**very** likely). I accept patches to the documentation and to the example code. My hope is to make this
document as accurate and as useful as possible.

## Disclaimer(s)
* This is not intended to be a complete guide to all things [go-client](https://github.com/neovim/go-client). The api
provided by go-client is very large. Just have a look at the godoc for 'nvim' -- it's huge! 
* I show what I have learned. Particularly the stuff that struck me as non-obvious.
* If you want more examples or there is not an example of something you are interested in please feel free to do one of two things:
    1. Submit a bug report for this repository. If I can get to it, I will. 
    1. Figure it out yourself and submit a patch to this repository.

## Assumptions
* You are a Go programmer and have basic knowledge of Go modules and the Go programming language 
* You have a recent Go and Neovim installed
* You are basically familiar with Neovim project layout and installation of plugins

## Build & Install
You can clone the repository into the same place you place all your plugins. Lets assume this location is 
~/.config/nvim/pack/git-plugins/start. You will need to substitute wherever it is you install Vim plugins.

Clone the repository to where you install plugins:

```
cd ~/.config/nvim/pack/git-plugins/start
git clone https://github.com/WhoIsSethDaniel/nvim-dadbod-exts
```

At this point if you start Neovim you will get some errors upon start. You will need to finish building and installing
the project before you can start Neovim without receiving errors.

Now you need to build the 'host'. In Neovim terms the 'host' is the program that will be talking to Neovim via
the msgpack RPC mechanism (see :help [msgpack-rpc](https://neovim.io/doc/user/api.html#msgpack-rpc) for more info). You don't actually need to know anything about the
msgpack protocol. If you want to learn more you can start [here](https://msgpack.org/index.html).

First you need to download the one dependency (go-client). From within the nvim-dadbod-exts directory run:

```
go mod download
```

To build the project simply run make in the project directory.

```
make
```

This should build the 'nvim-dadbod-ext' program. This is the 'host' that will be talking to Neovim. By default
the host talks to Neovim over stdout/stdin. 

To verify the 'host' works as expected you should run:

```
./nvim-dadbod-ext -h
```

The output should be something like this:

```
Usage of ./nvim-dadbod-ext:
  -location .vim file
        Manifest is automatically written to .vim file
  -manifest host
        Write plugin manifest for host to stdout
```

You should copy the 'nvim-dadbod-ext' to somewhere in your path. Any time you rebuild the host you will need to
copy the new build to the same location. 

The host is now installed. When you start Neovim there should no longer be any errors.

## Code

### plugin/nvim-go-client.vim
This is the glue code that ties the Go 'host' to Neovim. This code registers the host, eventually starts the host, and
details what the host can do.

The code at the very bottom of the file that starts with 'call remote#host#RegisterPlugin' is copied and pasted from
running:

```
./nvim-dadbod-ext -manifest nvim_dadbod_ext
```

The output looks something like this (but may be different if I've added or removed code since I last copied this text):

```vim
call remote#host#RegisterPlugin('nvim_dadbod_ext', '0', [
\ {'type': 'autocmd', 'name': 'BufAdd', 'sync': 0, 'opts': {'eval': '{''Cwd'': getcwd()}', 'group': 'ExmplNvGoClientGrp', 'pattern'
: '*'}},
\ {'type': 'autocmd', 'name': 'BufEnter', 'sync': 0, 'opts': {'group': 'ExmplNvGoClientGrp', 'pattern': '*'}},
\ {'type': 'command', 'name': 'ExCmd', 'sync': 0, 'opts': {'bang': '', 'eval': '[getcwd(),bufname()]', 'nargs': '?'}},
\ {'type': 'function', 'name': 'GetVV', 'sync': 1, 'opts': {}},
\ {'type': 'function', 'name': 'ShowFirst', 'sync': 1, 'opts': {}},
\ {'type': 'function', 'name': 'ShowThings', 'sync': 1, 'opts': {'eval': '[getcwd(),argc()]'}},
\ {'type': 'function', 'name': 'TurnOffEvents', 'sync': 0, 'opts': {}},
\ {'type': 'function', 'name': 'TurnOnEvents', 'sync': 0, 'opts': {}},
\ {'type': 'function', 'name': 'Upper', 'sync': 1, 'opts': {}},
\ {'type': 'function', 'name': 'UpperCwd', 'sync': 1, 'opts': {'eval': 'getcwd()'}},
\ ])
```

This generated code will be called the 'manifest' within this document. 

In other languages, such as Python, this step is somewhat automatic: you just run :UpdateRemotePlugins. For now the
Go client does not hook into this mechanism so you have to generate the manifest manually and paste it into your
Vim code.

The code just above the manifest registers a Vim function that starts the host job. 

```vim
call remote#host#Register('nvim_dadbod_ext', 'x', function('s:Start_example_nvim_go_client'))
```

It does this by calling remote#host#Register(). The first argument to this function is the name of the host as given to
the -manifest argument above. e.g. nvim_dadbod_ext. The second argument, as best I can tell, can safely be
ignored. The third argument gives a function reference to a Vim function that starts the job. In this case that function
is s:Start_example_nvim_go_client().

```vim
function! s:panic(ch, data, ...) abort
    echom a:data
endfunction

function! s:Start_example_nvim_go_client(host) abort
    return jobstart(['nvim-dadbod-ext'], {
        \ 'rpc': v:true, 
        \ 'on_stderr': function('s:panic')
        \ })
endfunction
```

The function you register as the initiator of the host takes a single argument: the name of the host. In the example in
this code that argument is ignored. The key part of that function is the use of 'jobstart'. You can see :help
[jobstart()](https://neovim.io/doc/user/eval.html#jobstart()) for more information. The first argument to 'jobstart' is
the name of the program we built earlier with 'make'. e.g. nvim-dadbod-ext. The 'rpc' argument is probably the
most important since this tells Neovim that you want this program to use the msgpack RPC mechanism to communicate with
Neovim. The 'on_error' argument is important because it allows easier debugging of what is happening when things go
wrong. Some errors get reported to stderr and all this code does is make sure that that error gets printed to messages.
See :help [:messages](https://neovim.io/doc/user/message.html#:messages) for more information about messages. Without
the on_error section, and the function it calls, you will not see many of the errors that occur when the msgpack
encoding/decoding fails.

### Read the godoc

See especially 'go doc -all nvim/plugin'. It has some details that are important such as the signature required for the
function arguments for the various Handler methods. Details about the fields in public structs, etc.... It's worthwhile
to read it. Some of what it talks about are discussed in this document.

Also see 'go doc -all nvim'. It's a much larger document. You do not need to be intimately familiar with it to get 
started with go-plugin work, but it would be good to be vaguely familiar with the capabilities of the API.

### main.go
The go-plugin code uses the default Go logger. So the first few lines in the example code's main() function do just
this:

```go
  // create a log to log to right away. It will help with debugging
  l, _ := os.Create("nvim-dadbod-ext.log")
  log.SetOutput(l)
```

This is pretty straightforward. Create a file to log to and set the output to log to that file. The
go-plugin code doesn't perform a lot of logging so I have found this mostly useful for debugging my
own code when using go-plugin. 

The rest of the code in main creates new functions, commands, and autocommands via Go. 

**A slight tangent to editorialize**
> I'm not certain that there is great advantage in creating your own commands and autocommands via Go. It's more
> cumbersome than creating them via Vimscript. The real advantage of using go-plugin is to create Vim functions that are
> written in Go. You can then call them from your Vimscript created autocommands and commands. Your Go functions can
> perform computationally intensive tasks much faster than Vimscript and can be called as if they were native functions. 

Regardless of what I said above these examples show you how to create commands and autocommands using Go.

The code in main calls plugin.Main().

```go
  plugin.Main(func(p *plugin.Plugin) error {
    ...
  }
```

This method does a number of things. It creates the basic flags (-manifest and -location) using the flag package and
runs the passed in anonymous function. The anonymous function is expected to have code that creates handlers for
commands, autocommands, and functions. After the anonymous function is run Main runs nvim.Serve(). This starts your plugin
waiting to send and receive to and from Neovim. The Serve() method blocks forever.

As you get more comfortable with using go-plugin you may not want to continue to use Main(). Main() seems more like a
convenience function that does the bare minimum a good host should do. The only problem with not using the Main() method
is that it uses several useful helper functions to help write out the manifest. Unfortunately neither of these helper methods
are exported. So you either have to write new ones or copy and paste the ones in the source to your code. See
go-plugin/nvim/plugin/main.go to view the code for Main(). Also see go-plugin/nvim/plugin/plugin.go (or 'go doc -all
nvim/plugin') to view the Manifest() method. This method returns the manifest as a byte slice. 

#### Commands
The first thing the anonymous function does is use p.HandleCommand() to create a new command:

```go
  p.HandleCommand(&plugin.CommandOptions{Name: "ExCmd", NArgs: "?", Bang: true, Eval: "[getcwd(),bufname()]"},
      func(args []string, bang bool, eval *cmdEvalExample) {
          log.Print("called command ExCmd")
          exCmd(p, args, bang, eval)
      })
```

p.HandleCommand() takes two arguments. The first is a pointer to a plugin.CommandOptions struct and the second
is a function that implements the functionality for the new command.

**A Note About the p.HandleCommand Function Return Value**
> The second argument to p.HandleCommand (or p.HandleAutocmd or p.HandleFunction, as we'll see later) requires a very
> specific return value. The return value **must** be one of the following:
> 1. no return value:  func m() {}
> 2. returns an error:  func m() (error) {}
> 3. returns a type and an error:  func m() ([]string, error) {}
>
> This is enforced by go-client. If you ever see an error in :messages that looks like "msgpack/rpc: handler return 
> must be (), (error) or (valueType, error)" it means the return signature you have for your function is wrong.

**A Second Note About the p.HandleCommand Function Return Value**
> If you looked closely at the manifest generated earlier you may have noticed a field named 'sync'. It is a boolean
> field and some of the commands in the manifest have sync set to 0 and some have sync set to 1. This field tells Vim
> whether to run the command synchronously or asynchronously. The go-client code determines how to set this field 
> automatically by looking for a return value from the function you pass to p.HandleCommand (or p.HandleAutocmd or
> p.HandleFunction). If there is **no** return value then sync will be set to 0. Otherwise it is set to 1.

The plugin.CommandOptions record has many fields, all of which correspond directly to the arguments you can pass to
:command within Neovim (see :help [:command](https://neovim.io/doc/user/map.html#:command) for more info). You can look
at the fields in the record by looking at the godoc (go doc -all nvim/plugin). A quick listing of the fields in the struct
are: Name, NArgs, Range, Count, Addr, Bang, Register, Eval, Bar, Complete. This example doesn't cover every option, but
should help you figure out how to use those options should you need them.

For this example the plugin.CommandOptions struct assigns a name of 'ExCmd' to the command, specifies that the number
of arguments is 0 or 1 (that's what the "?" means), says that a bang ("!") is allowed, and has an eval section.

The name is the name a user will use from Neovim to call the command. So, in this case, we have defined a command
with the name of ExCmd. So, from Neovim, you can use :ExCmd. Give it a try. Fire up Neovim and run 

```
:ExCmd! hi
```

Nothing much will happen since the command only logs to the log file. So feel free to quit Neovim and look at the 
log file that was created in the same directory. It will probably look something like this:

```
Just entered a buffer
called command ExCmd
  Args to exCmd:
    arg1: hi
    bang: %!s(bool=true)
    cwd: /home/seth
    buffer: 
```

You can see that it logged your use of :ExCmd, logged the argument you gave it ("hi"), logged that you used a bang,
and also current directory and a buffer name (in this case the buffer name was empty because the buffer had no name).

If we look closer at the second argument to p.HandleCommand():

```go
  func(args []string, bang bool, eval *cmdEvalExample) {
      log.Print("called command ExCmd")
      exCmd(p, args, bang, eval)
  })
```

we can see that the code is using an anonymous function to handle the arguments, log the use of 'ExCmd', and also 
call another function. The anonymous function is useful because it creates a closure that can be used to pass 
the plugin object to the exCmd function. But before we get to that let's talk about the arguments to the anonymous
function.

The first argument is 'args' and it is typed as a slice of strings. This is where the arguments to :ExCmd get placed.
So, when you ran :ExCmd earlier you passed "hi". This is an argument and it was passed in to this function as the
first element in the args slice.

The second argument is 'bang' and it is typed as a bool. It simply lets us know if an exclamation point was given when
:ExCmd is called. Above, when you typed :ExCmd!, you used a bang. So in that case bang would have been true.

The third argument is 'eval' and it is a pointer to a struct. That struct is defined in commands.go and looks like:

```go
  type cmdEvalExample struct {
      Cwd     string `msgpack:",array"`
      Bufname string
  }
```

The fields in the struct match up with the expression given in the 'Eval' field for plugin.CommandOptions. Notice that
the 'Eval' field is vimscript surrounded by quotes. The vimscript is a list with two fields, each field being the result
of an expression. The first expression is getcwd() and the second expression is bufname(). Note the field tag in the
cmdEvalExample struct definition. This works hand-in-hand with what is in Eval.

How does go-plugin map the defined fields in plugin.CommandOptions to the arguments in the function? It appears to
assume that the function will take the argument in the order they are defined in the plugin.CommandOptions struct. 
The order of the definition in the struct is Name, NArgs, Range, Count, Addr, Bang, Register, Eval, Bar, Complete. So
if you define Name, NArgs, Range, Bang, Eval, and Bar the function signature will look like:

```go
func(args []string, range string, bang bool, eval *struct, bar bool)
```

I haven't tried every possible combination but this seems to be the case. This is one part of the go-plugin code I 
haven't examined thoroughly yet.

#### Autocommands
The example code creates two new autocommands. It does this using p.HandleAutocmd like so:

```go
  p.HandleAutocmd(&plugin.AutocmdOptions{Event: "BufEnter", Group: "ExmplNvGoClientGrp", Pattern: "*"},
      func() {
          log.Print("Just entered a buffer")
          [...]
      })
  p.HandleAutocmd(&plugin.AutocmdOptions{Event: "BufAdd", Group: "ExmplNvGoClientGrp", Pattern: "*", Eval: "*"},
      func(eval *autocmdEvalExample) {
          log.Printf("buffer has cwd: %s", eval.Cwd)
      })
```

It's very similar to how commands are defined. Instead of calling p.HandleCommand it calls p.HandleAutocmd. Instead
of filling in a plugin.CommandOptions struct it fills in a plugin.AutocmdOptions struct (you can see the fields in
go-plugin/nvim/plugin/plugin.go). There are fewer fields for defining autocommands, but, like commands, they matchup
exactly with what you would use if you were defining the autocommand in vimscript. The fields available are:
Event, Group, Pattern, Nested, Eval. For more details on how autocommands are defined in vimscript see :help
[autocommand](https://neovim.io/doc/user/autocmd.html#autocommand).

My experimentation showed that if you define more than one autocommand in the same Event the manifest will be screwed
up. So two (or more) autocommands in event "BufEnter" seemed to cause a problem. However if one autocommand was in 
event "BufEnter,BufLeave" and the other was in "BufEnter" there were no problems. This brings up something that I 
don't show in the example code: the Event field can list more than one event. This maps exactly to how autocommands are
defined in vimscript, but may not be obvious from the examples I have provided.

The first autocommand created is very simple:

```go
  p.HandleAutocmd(&plugin.AutocmdOptions{Event: "BufEnter", Group: "ExmplNvGoClientGrp", Pattern: "*"},
      func() {
          log.Print("Just entered a buffer")
          [...]
      })
```

This will simply log that a buffer was entered into whenever that event is fired by Neovim. In fact, we have already
seen this autocommand in action. If you go back and look at the log file from when you ran ExCmd you will see a line
that says:

```
Just entered a buffer
```

That log entry was created by this autocommand.

The Group field is the same as the group you would use in a vimscript autocommand definition. The Pattern field is 
the same as the pattern you would pass to :autocommand in Neovim. i.e. it can be "\*.go" if you only want the autocommand
to work for Go files.

The second autocommand definition is:

```go
  p.HandleAutocmd(&plugin.AutocmdOptions{Event: "BufAdd", Group: "ExmplNvGoClientGrp", Pattern: "*", Eval: "*"},
      func(eval *autocmdEvalExample) {
          log.Printf("buffer has cwd: %s", eval.Cwd)
      })
```

This definition includes an Eval section and also has an argument that is passed to the anonymous function. The Eval,
and how it works, is very similar to what was described above for the definition of the command. However, in this case,
the Eval is simply an asterisk. What does this mean? Let's look at the definition for the autocmdEvalExample struct:

```go
type autocmdEvalExample struct {
	Cwd string `eval:"getcwd()"`
}
```

The field tag is now different. It now describes, directly, that the value of the given expression should be stored 
in the field. So, above, the value of the "getcwd()" vimscript expression should be stored in the Cwd field. You can
have multiple fields and each one can have different expressions. This is what the asterisk means in the Eval field
above. Here is an example of a struct with multiple fields, each field with its own expression:

```go
type multiExprExample struct {
    Cwd string `eval:"getcwd()"`
    Name string `eval:"bufname()"`
    Id int `eval:"bufnr()"`
}
```

You can see the result from the second autocommand if you fire up Neovim and create a new buffer. You can then look
at the log file and see an entry that looks like:

```
Just entered a buffer
buffer has cwd: /home/seth
Just entered a buffer
```

#### Functions
The example code creates five new functions. It does this using p.HandleFunction like so:

```go
  p.HandleFunction(&plugin.FunctionOptions{Name: "Upper"},
      func(args []string) (string, error) {
          log.Print("calling Upper")
          return upper(p, args[0]), nil
      })
  p.HandleFunction(&plugin.FunctionOptions{Name: "UpperCwd", Eval: "getcwd()"},
      func(args []string, dir string) (string, error) {
          log.Print("calling UpperCwd")
          return upper(p, dir), nil
      })
  p.HandleFunction(&plugin.FunctionOptions{Name: "ShowThings", Eval: "[getcwd(),argc()]"},
      func(args []string, eval *someArgs) ([]string, error) {
          log.Print("calling ShowThings")
          return returnArgs(p, eval)
      })
  p.HandleFunction(&plugin.FunctionOptions{Name: "GetVV"},
      func(args []string) ([]string, error) {
          log.Print("calling GetVV")
          return getvv(p, args[0])
      })
  p.HandleFunction(&plugin.FunctionOptions{Name: "ShowFirst"},
      func(args []string) (string, error) {
          log.Print("calling ShowFirst")
          return showfirst(p), nil
      })
```

At this point, if you have read the previous sections, it should be obvious what is going on. As it turns out, defining
functions is the simplest of the bunch. There are only two fields: Name and Eval (see the definition of
plugin.FunctionOptions in go-plugin/nvim/plugin/plugin.go). In this section I won't talk so much about Eval or the
definition of the functions. Instead there are a few things the functions do that may be interesting.

I continue to to use an anonymous function to wrap the code I want to use for the function. In this section we will
finally see a particularly good use for this: the ability of our code to use the plugin object.

The code above defines five new functions: Upper, UpperCwd, ShowThings, GetVV, and ShowFirst. The Go functions that each
of these functions call is in functions.go in the example code.

The "Upper" function simply takes a single string as argument, converts it to upper case and returns it. Feel free to
try it from within Neovim:

```
:echo Upper("this is now upper case")
```

Also, look at the log and notice the log entry:

```
calling Upper
```

Feel free to also run UpperCwd and ShowThings. Look at the code, see what each one does, and then run it.

#### Completion Functions

The example code will now create a command completion function. First it creates a simple command named 'CompleteThis'.
It fills in the 'Complete' field with the exact same thing you'd use if you were defining it via Vimscript. (see :help
[command-complete](https://neovim.io/doc/user/map.html#:command-completion-customlist) for more information) It names a function
called 'CompleteThisC' which is defined using Go.

```go
  p.HandleCommand(&plugin.CommandOptions{Name: "CompleteThis", NArgs: "?", Complete: "customlist,CompleteThisC"},
          func() {
                  log.Print("called command CompleteThis")
          })
  p.HandleFunction(&plugin.FunctionOptions{Name: "CompleteThisC"},
          func(c *nvim.CommandCompletionArgs) ([]string, error) {
                  log.Print("called CompleteThisC")
                  log.Printf("  arg lead: %s", c.ArgLead)
                  log.Printf("  cmdline: %s", c.CmdLine)
                  log.Printf("  cursorposstring: %d", c.CursorPosString)
                  return []string{"abc", "def", "ghi", "jkl"}, nil
          })
```

Note that the anonymous function takes a single argument with a type of \*nvim.CommandCompletionArgs. The CommandCompletionArgs
struct defines exactly what gets passed in to a typical Vimscript completion function and this is all documented in
:help [command-complete](https://neovim.io/doc/user/map.html#:command-complete).

For a customlist function you simply return a slice of strings with the completion items. In the example above the 
return value was hardcoded.

To see the completion in action simply startup Neovim, type ':CompleteThis ' (note the space at the end) and hit \<tab\>.
You should see a little box pop up and display the completion elements. If you examine the log it will say something
like:

```
Just entered a buffer
called CompleteThisC
  arg lead: 
  cmdline: CompleteThis 
  cursorposstring: 13
```

#### NVim API

##### Retrieving Vim Variables

The 'GetVV' function does something a little interesting. It uses the nvim API provided by go-plugin. The nvim API is
pretty large, but you can look at it using go doc:

```
go doc -all nvim
```

GetVV uses the VVar() method to retrieve whatever v: variable you wish to retrieve (for more information on v: variables
have a look at :help [vim-variable](https://neovim.io/doc/user/eval.html#vim-variable)). Perhaps the simplest one is
v:oldfiles. So let's use GetVV to retrieve v:oldfiles. Fire up Neovim and run:

```
:echo GetVV("oldfiles")
```

It should print out a fairly large Vim list. Each element in the list should be a path to a file that you have edited in
Neovim (somewhat) recently.

If we look at the code for GetVV:

```go
func getvv(p *plugin.Plugin, name string) ([]string, error) {
	var result []string
	p.Nvim.VVar(name, &result)
	return result, nil
}
```

You can see that we use the plugin object. The plugin object has an Nvim object stashed in it and we use that to call
the VVar() method. The API for some of these methods is odd and may not be what you are expecting. It is definitely not
what I would have expected. The last argument to VVar() (per the VVar signature) is a pointer to interface{}. The
go-plugin restricts this to a pointer to either a slice or a map.

##### Reading the Current Buffer

The ShowFirst function retrieves the first line of the current buffer and prints it out. This demonstrates that your Go
programs have access to the open buffers. So, first, try it out by bringing up Neovim and running:

```
:echo ShowFirst()
```

You may want to type something in the empty buffer first. Or bring up a file with content on the first line. Otherwise
you'll just get a blank line when running ShowFirst().

The code used for ShowFirst is:

```go
func showfirst(p *plugin.Plugin) string {
	br := nvim.NewBufferReader(p.Nvim, 0)
	r := bufio.NewReader(br)
	line, _ := r.ReadString('\n')
	return line
}
```

We once again use the plugin object. In this case we use it to create a new buffer reader object. See the go doc for the
nvim api for more information about the arguments to NewBufferReader(). Once we have the new buffer reader object it is
converted to a bufio.Reader and we can grab the first line of the buffer and return it. Pretty simple!

##### Subscribing to Special Events

You can subscribe to special events that Neovim emits and you can attach a function that is called when those events are
emitted. It's similar to autocommands, but the events are different and are called with arguments. See :help 
[api-buffer-updates](https://neovim.io/doc/user/api.html#api-buffer-updates) for more information. (There are also the
ui-events which is not covered here but which works in a similar manner. See :help [ui-events](https://neovim.io/doc/user/ui.html#ui-events) for more information.)

The below code attaches to two of the events and logs when they occur along with the arguments that are passed to it.
To see the logging you must first subscribe to the event stream for the current buffer. This is performed by one of the
newly defined functions: TurnOnEvents.

```go
  p.Handle("nvim_buf_lines_event",
          func(e ...interface{}) {
                  log.Printf("triggered buf lines event %#v", e)
          })
  p.Handle("nvim_buf_changedtick_event",
          func(e ...interface{}) {
                  log.Printf("triggered changed tick event %#v", e)
          })
  // these functions are used to demo the turning off/on of
  // buffer events
  p.HandleFunction(&plugin.FunctionOptions{Name: "TurnOffEvents"},
          func() {
                  log.Print("calling TurnOffEvents")
                  buffer, _ := p.Nvim.CurrentBuffer()
                  p.Nvim.DetachBuffer(buffer)
          })
  p.HandleFunction(&plugin.FunctionOptions{Name: "TurnOnEvents"},
          func() {
                  log.Print("calling TurnOnEvents")
                  buffer, _ := p.Nvim.CurrentBuffer()
                  p.Nvim.AttachBuffer(buffer, false, map[string]interface{}{})
          })
```

To see this in action it is best to be tailing the log file in a separate terminal. So once you start Vim you should
tail the log file:

```
tail -f nvim-dadbod-ext.log
```

Back in your Vim session you can type all you want but nothing will appear in the log file. However, once you run

```
:call TurnOnEvents()
```

you will see a new log line for every character you type. This will be true **only** in the buffer you are currently
in. If you switch buffers you no longer see anything in the log. However, if you switch back to the previous buffer
you will again see logging. This is because TurnOnEvents has subscribed to events emitted by one specific buffer.
If you run TurnOnEvents in another buffer you will start to see logging for that buffer also. That is, you will be
subscribed to two different buffers sending events.

You can also turn off the stream of events:

```
:call TurnOffEvents()
```

Notice the call to p.Nvim.AttachBuffer(). This is what starts the events flowing back to us. Without both calling
Handle() and AttachBuffer() the callbacks will never be called.

Also notice that we used another nvim API call: CurrentBuffer(). This does what you'd probably expect, it returns
an identifier for the currently active buffer. This is the first argument to each of DetachBuffer() and AttachBuffer().

The output may look something like this (after turning events on, I typed "hi there" in an empty buffer, then quit):

```
[...]
triggered changed tick event []interface {}{1, 2}
triggered buf lines event []interface {}{1, 3, 0, 1, []interface {}{"h"}, false}
triggered buf lines event []interface {}{1, 4, 0, 1, []interface {}{"hi"}, false}
triggered buf lines event []interface {}{1, 5, 0, 1, []interface {}{"hi "}, false}
triggered buf lines event []interface {}{1, 6, 0, 1, []interface {}{"hi t"}, false}
triggered buf lines event []interface {}{1, 7, 0, 1, []interface {}{"hi th"}, false}
triggered buf lines event []interface {}{1, 8, 0, 1, []interface {}{"hi the"}, false}
triggered buf lines event []interface {}{1, 9, 0, 1, []interface {}{"hi ther"}, false}
triggered buf lines event []interface {}{1, 10, 0, 1, []interface {}{"hi there"}, false}
triggered buf lines event []interface {}{1, 11, 0, 1, []interface {}{"hi there", ""}, false}
```

That's a lot of output, but it is sending an event every time a key is pressed. Notice the tick event near the
top.
