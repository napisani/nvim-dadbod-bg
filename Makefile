all:
	go build -o nvim-dadbod-bg .

manifest:
	./nvim-dadbod-bg -manifest nvim_dadbod_bg

clean:
	rm -f nvim-dadbod-bg nvim-dadbod-bg.log
